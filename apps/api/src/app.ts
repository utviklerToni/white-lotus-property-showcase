// Builds the Express app without starting a server, so tests can import it.
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { HttpError } from './errors';
import { errorHandler } from './middleware/errorHandler';
import { createRateLimiters } from './middleware/rateLimits';
import { requestLogger } from './middleware/requestLogger';
import { healthRouter } from './routes/health';
import { inquiriesRouter } from './routes/inquiries';
import { locationsRouter } from './routes/locations';
import { propertiesRouter } from './routes/properties';

type AppOptions = {
  /** Off in tests, so repeated requests don't hit the limits. */
  rateLimit?: boolean;
};

export function createApp({ rateLimit = true }: AppOptions = {}) {
  const app = express();

  // Caddy runs on the same host and sets X-Forwarded-For; trust only a loopback proxy
  // so rate limits key on the real visitor IP and the header can't be spoofed from outside.
  app.set('trust proxy', 'loopback');

  // First, so even rejected requests (bad JSON, rate-limited) get logged.
  app.use(requestLogger);
  app.use(helmet());
  app.use(cors({ origin: config.WEB_ORIGIN }));

  // Before body parsing, so limited requests cost as little as possible.
  if (rateLimit) {
    const limiters = createRateLimiters();
    app.use('/api', limiters.api);
    app.post('/api/properties/:id/inquiries', limiters.inquiry);
  }

  app.use(express.json({ limit: '100kb' }));

  app.use('/api', healthRouter, propertiesRouter, locationsRouter, inquiriesRouter);

  // Unknown route: same JSON error shape as everything else.
  app.use((_req, _res, next) => next(new HttpError(404, 'Route not found')));
  app.use(errorHandler);

  return app;
}
