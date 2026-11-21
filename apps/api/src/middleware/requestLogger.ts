// One line per request: method, path, status, duration.
// Never the body or query string: they can hold buyers' personal data.
import type { RequestHandler } from 'express';

export const requestLogger: RequestHandler = (req, res, next) => {
  const start = performance.now();
  res.on('finish', () => {
    const path = req.originalUrl.split('?')[0];
    const ms = Math.round(performance.now() - start);
    console.log(`${req.method} ${path} ${res.statusCode} ${ms}ms`);
  });
  next();
};
