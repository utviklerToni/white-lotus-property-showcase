// Runs Zod schemas on params / query / body. On failure: 400 { error: 'ValidationError', fields }.
// On success the parsed (trimmed, coerced, defaulted) values go in res.locals.validated, because
// Express 5 makes req.query read-only. Handlers read them with `validated()`.
import type { RequestHandler, Response } from 'express';
import type { z } from 'zod';
import { HttpError } from '../errors';

type Part = 'params' | 'query' | 'body';
type Schemas = Partial<Record<Part, z.ZodType>>;

export function validate(schemas: Schemas): RequestHandler {
  return (req, res, next) => {
    const fields: Record<string, string> = {};
    const parsed: Partial<Record<Part, unknown>> = {};

    for (const part of ['params', 'query', 'body'] as const) {
      const schema = schemas[part];
      if (!schema) continue;
      const result = schema.safeParse(req[part]);
      if (result.success) parsed[part] = result.data;
      else addFieldErrors(fields, result.error, part);
    }

    if (Object.keys(fields).length > 0) {
      next(new HttpError(400, 'ValidationError', fields));
      return;
    }
    res.locals.validated = parsed;
    next();
  };
}

/** Reads a value parsed by `validate()`. T must match the schema passed to validate for that part. */
export function validated<T>(res: Response, part: Part): T {
  return (res.locals.validated as Partial<Record<Part, unknown>>)[part] as T;
}

// One message per field (the first one wins).
function addFieldErrors(fields: Record<string, string>, error: z.ZodError, part: Part) {
  for (const issue of error.issues) {
    // .strict() reports unknown keys in `issue.keys` with an empty path, so name each key.
    if (issue.code === 'unrecognized_keys') {
      for (const key of issue.keys) fields[key] ??= 'Unknown field';
      continue;
    }
    // An empty path means the whole part is wrong (e.g. no JSON body): use the part name.
    const key = issue.path.join('.') || part;
    fields[key] ??= issue.message;
  }
}
