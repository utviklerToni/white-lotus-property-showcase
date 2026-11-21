import { Router } from 'express';
import {
  idParamSchema,
  inquiryInputSchema,
  type IdParam,
  type InquiryData,
} from '@white-lotus/shared';
import { createInquiry, listInquiries, propertyExists } from '../db/inquiries';
import { notFound } from '../errors';
import { requireAdmin } from '../middleware/requireAdmin';
import { validate, validated } from '../middleware/validate';

export const inquiriesRouter = Router();

// Public: a buyer submits an inquiry. Rate-limited in app.ts (5 per 15 min per IP).
inquiriesRouter.post(
  '/properties/:id/inquiries',
  validate({ params: idParamSchema, body: inquiryInputSchema }),
  async (_req, res) => {
    const { id } = validated<IdParam>(res, 'params');
    // Explicit check gives a clear 404. The FK (23503 → 404) is the backstop if the
    // property is deleted between this check and the insert.
    if (!(await propertyExists(id))) throw notFound('Property');
    const inquiry = await createInquiry(id, validated<InquiryData>(res, 'body'));
    res.status(201).json(inquiry);
  },
);

// Admin: all inquiries with their property name. Holds personal data, so the key is required.
inquiriesRouter.get('/inquiries', requireAdmin, async (_req, res) => {
  res.json(await listInquiries());
});
