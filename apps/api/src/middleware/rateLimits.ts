// Per-IP rate limits. Made by a function so each app instance gets its own counters.
// In dev every request arrives via the Vite proxy (one IP), so these act as one shared limit.
import { rateLimit } from 'express-rate-limit';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export function createRateLimiters() {
  return {
    // Every /api request.
    api: rateLimit({
      windowMs: FIFTEEN_MINUTES,
      limit: 300,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: { error: 'Too many requests, please try again later' },
    }),
    // Public inquiry form: stops spam floods.
    inquiry: rateLimit({
      windowMs: FIFTEEN_MINUTES,
      limit: 5,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: { error: 'Too many inquiries, please try again later' },
    }),
  };
}
