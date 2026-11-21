import { Router } from 'express';
import {
  idParamSchema,
  propertyInputSchema,
  propertyListQuerySchema,
  type IdParam,
  type PropertyData,
  type PropertyListQuery,
} from '@white-lotus/shared';
import {
  createProperty,
  deleteProperty,
  getProperty,
  listProperties,
  updateProperty,
} from '../db/properties';
import { notFound } from '../errors';
import { requireAdmin } from '../middleware/requireAdmin';
import { validate, validated } from '../middleware/validate';

export const propertiesRouter = Router();

// Public: list with filters + sort.
propertiesRouter.get(
  '/properties',
  validate({ query: propertyListQuerySchema }),
  async (_req, res) => {
    res.json(await listProperties(validated<PropertyListQuery>(res, 'query')));
  },
);

// Public: one property.
propertiesRouter.get('/properties/:id', validate({ params: idParamSchema }), async (_req, res) => {
  const { id } = validated<IdParam>(res, 'params');
  const property = await getProperty(id);
  if (!property) throw notFound('Property');
  res.json(property);
});

// Admin routes: requireAdmin runs first, so callers without the key never see validation details.
propertiesRouter.post(
  '/properties',
  requireAdmin,
  validate({ body: propertyInputSchema }),
  async (_req, res) => {
    const property = await createProperty(validated<PropertyData>(res, 'body'));
    res.status(201).json(property);
  },
);

propertiesRouter.put(
  '/properties/:id',
  requireAdmin,
  validate({ params: idParamSchema, body: propertyInputSchema }),
  async (_req, res) => {
    const { id } = validated<IdParam>(res, 'params');
    const property = await updateProperty(id, validated<PropertyData>(res, 'body'));
    if (!property) throw notFound('Property');
    res.json(property);
  },
);

propertiesRouter.delete(
  '/properties/:id',
  requireAdmin,
  validate({ params: idParamSchema }),
  async (_req, res) => {
    const { id } = validated<IdParam>(res, 'params');
    if (!(await deleteProperty(id))) throw notFound('Property');
    res.status(204).end();
  },
);
