import { Router } from 'express';
import { listLocations } from '../db/properties';

export const locationsRouter = Router();

// Distinct locations for the filter dropdown. Own path so it can't clash with /properties/:id.
locationsRouter.get('/locations', async (_req, res) => {
  res.json(await listLocations());
});
