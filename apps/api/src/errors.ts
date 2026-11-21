// An error with an HTTP status. Routes throw it; errorHandler turns it into { error, fields? }.
export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly error: string,
    readonly fields?: Record<string, string>,
  ) {
    super(error);
  }
}

export const notFound = (what: string) => new HttpError(404, `${what} not found`);
