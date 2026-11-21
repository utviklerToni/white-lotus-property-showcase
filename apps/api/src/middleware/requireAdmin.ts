// Shared-secret check for admin routes. A placeholder, not real authentication (PLAN section 7).
import { timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';
import { config } from '../config';
import { HttpError } from '../errors';

const expected = Buffer.from(config.ADMIN_KEY);

export const requireAdmin: RequestHandler = (req, _res, next) => {
  const given = Buffer.from(req.get('x-admin-key') ?? '');
  // timingSafeEqual throws if lengths differ, so compare lengths first.
  // The comparison itself takes the same time whether the first or last byte is wrong.
  const ok = given.length === expected.length && timingSafeEqual(given, expected);
  next(ok ? undefined : new HttpError(401, 'Admin key missing or invalid'));
};
