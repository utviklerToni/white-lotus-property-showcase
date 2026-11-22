import axios from 'axios';
import { clearAdminKey, getAdminKey } from './adminKey';

// The app's one HTTP client (D77). Every failure becomes an ApiError with the API's
// `{ error, fields? }` shape, so pages and forms handle one error type.
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Lets a request mark itself as an admin call (read by the interceptors below).
declare module 'axios' {
  interface AxiosRequestConfig {
    admin?: boolean;
  }
}

// 15 s: room for a slow mobile connection, but a hung request still ends in a clear error.
export const api = axios.create({ baseURL: '/api', timeout: 15_000 });

// Admin calls carry the stored key. Public calls never send it.
api.interceptors.request.use((config) => {
  const key = getAdminKey();
  if (config.admin && key) config.headers.set('x-admin-key', key);
  return config;
});

// A 401 on an admin call means the stored key is wrong: forget it, and the key prompt returns.
api.interceptors.response.use(undefined, (error: unknown) => {
  if (axios.isAxiosError(error) && error.config?.admin && error.response?.status === 401) {
    clearAdminKey(true);
  }
  return Promise.reject(error);
});

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Send the admin key (x-admin-key); a 401 clears it. */
  admin?: boolean;
};

type ErrorBody = { error?: unknown; fields?: Record<string, string> };

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, ...rest } = options;
  try {
    // axios sends `data` as JSON and sets the content-type for us.
    const res = await api.request<T>({ url: path, data: body, ...rest });
    // 204 No Content: axios gives an empty string; callers expect undefined.
    return res.status === 204 ? (undefined as T) : res.data;
  } catch (err) {
    throw toApiError(err);
  }
}

function toApiError(err: unknown): unknown {
  // A cancelled query (filters changed) must stay a cancellation for TanStack Query.
  if (axios.isCancel(err)) return err;
  // Not an HTTP error (a bug in our code): let it surface unchanged.
  if (!axios.isAxiosError<ErrorBody>(err)) return err;

  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
    return new ApiError(0, 'The server took too long to respond. Please try again.');
  }
  if (!err.response) {
    return new ApiError(0, 'Could not reach the server. Check your connection and try again.');
  }
  const { status, data } = err.response;
  const message = typeof data?.error === 'string' ? data.error : `Request failed (${status})`;
  return new ApiError(status, message, data?.fields);
}
