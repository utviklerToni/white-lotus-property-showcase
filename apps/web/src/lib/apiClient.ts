import axios from 'axios';

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

// 15 s: room for a slow mobile connection, but a hung request still ends in a clear error.
export const api = axios.create({ baseURL: '/api', timeout: 15_000 });

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
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
