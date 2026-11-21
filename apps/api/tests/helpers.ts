// Shared test helpers. Imported by test files after setup/env.ts has pointed config at the test DB.
import request from 'supertest';
import type { InquiryInput, Property, PropertyInput } from '@white-lotus/shared';
import { createApp } from '../src/app';
import { config } from '../src/config';

// Rate limits off: tests send many requests from one IP.
export const api = request(createApp({ rateLimit: false }));

export const ADMIN = { 'x-admin-key': config.ADMIN_KEY };

export const validProperty = (overrides: Partial<PropertyInput> = {}): PropertyInput => ({
  name: 'Test Villa',
  location: 'Hebbal',
  price: 50_000_000,
  size_sqft: 3000,
  bedrooms: 3,
  description: 'A test listing.',
  details: 'Longer copy for the detail page.',
  image_url: 'https://images.example.com/villa.jpg',
  status: 'available',
  ...overrides,
});

export const validInquiry = (overrides: Partial<InquiryInput> = {}): InquiryInput => ({
  name: 'Asha Nair',
  email: 'asha.nair@example.com',
  phone: '+91 98450 12345',
  message: 'Is this home still available for a visit next week?',
  ...overrides,
});

/** Creates a property through the API (so it goes through the same rules) and returns it. */
export async function createProperty(overrides: Partial<PropertyInput> = {}): Promise<Property> {
  const res = await api.post('/api/properties').set(ADMIN).send(validProperty(overrides));
  if (res.status !== 201) throw new Error(`createProperty failed: ${res.status}`);
  return res.body as Property;
}
