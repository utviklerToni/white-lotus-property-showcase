// The one place errors become responses. Shape is always { error, fields? }; no stack traces.
import type { ErrorRequestHandler } from 'express';
import { HttpError } from '../errors';

// Postgres error codes we can explain to the client. Everything else is a generic 500.
const PG_ERRORS: Record<string, { status: number; error: string }> = {
  '22P02': { status: 400, error: 'Invalid input value' }, // invalid_text_representation
  '23514': { status: 400, error: 'Value breaks a database rule' }, // check_violation
  '23503': { status: 404, error: 'Related record not found' }, // foreign_key_violation
};

// body-parser (express.json) error types.
const BODY_ERRORS: Record<string, { status: number; error: string }> = {
  'entity.parse.failed': { status: 400, error: 'Request body is not valid JSON' },
  'entity.too.large': { status: 413, error: 'Request body is too large' },
};

// Reads a string property from an unknown error without using `any`.
const stringProp = (err: unknown, key: string): string | undefined => {
  if (typeof err !== 'object' || err === null) return undefined;
  const value = (err as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : undefined;
};

export const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, next) => {
  // Response already started (e.g. streaming): let Express close the connection.
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof HttpError) {
    res
      .status(err.status)
      .json(err.fields ? { error: err.error, fields: err.fields } : { error: err.error });
    return;
  }

  const known =
    BODY_ERRORS[stringProp(err, 'type') ?? ''] ?? PG_ERRORS[stringProp(err, 'code') ?? ''];
  if (known) {
    res.status(known.status).json({ error: known.error });
    return;
  }

  // Unexpected: full detail in the server log only.
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
};
