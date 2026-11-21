import { Router } from 'express';
import { pool } from '../db/pool';

export const healthRouter = Router();

// 200 when the API and the database both answer; 503 when the database doesn't.
healthRouter.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ error: 'Database unavailable' });
  }
});
