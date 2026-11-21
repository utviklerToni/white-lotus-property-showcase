// Thin fetch wrapper. Every non-2xx response becomes an ApiError with the API's
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

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      ...rest,
      headers: { ...(body !== undefined && { 'content-type': 'application/json' }), ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (err) {
    // A cancelled query (filters changed) must stay an AbortError for TanStack Query.
    if (options.signal?.aborted) throw err;
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.');
  }

  if (res.status === 204) return undefined as T;
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const shape = (data ?? {}) as { error?: unknown; fields?: Record<string, string> };
    const message =
      typeof shape.error === 'string' ? shape.error : `Request failed (${res.status})`;
    throw new ApiError(res.status, message, shape.fields);
  }
  return data as T;
}
