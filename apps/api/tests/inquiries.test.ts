import { describe, expect, it } from 'vitest';
import type { Inquiry } from '@white-lotus/shared';
import { ADMIN, api, createProperty, validInquiry } from './helpers';

describe('POST /api/properties/:id/inquiries', () => {
  it('returns 404 for a property that does not exist', async () => {
    const res = await api.post('/api/properties/999999/inquiries').send(validInquiry());
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Property not found' });
  });

  it('rejects an invalid body with field errors', async () => {
    const property = await createProperty();
    const res = await api
      .post(`/api/properties/${property.id}/inquiries`)
      .send(validInquiry({ email: 'not-an-email', phone: '12345' }));
    expect(res.status).toBe(400);
    expect(res.body.fields).toMatchObject({
      email: 'Enter a valid email address',
      phone: 'Phone must have 10 to 15 digits',
    });
  });

  it('stores a valid inquiry and shows it in the admin list', async () => {
    const property = await createProperty({ name: 'Banyan Court Villa' });
    const res = await api
      .post(`/api/properties/${property.id}/inquiries`)
      .send(validInquiry({ email: '  asha.nair@example.com ' }));
    expect(res.status).toBe(201);
    // Only ids and the timestamp come back, not the buyer's personal data.
    expect(Object.keys(res.body).sort()).toEqual(['created_at', 'id', 'property_id']);

    const list = await api.get('/api/inquiries').set(ADMIN);
    expect(list.status).toBe(200);
    const inquiry = (list.body as Inquiry[]).find((row) => row.id === res.body.id);
    expect(inquiry).toMatchObject({
      property_id: property.id,
      property_name: 'Banyan Court Villa',
      email: 'asha.nair@example.com', // trimmed by the shared schema
    });
  });
});

describe('GET /api/inquiries', () => {
  it('returns 401 without the admin key', async () => {
    const res = await api.get('/api/inquiries');
    expect(res.status).toBe(401);
  });

  it('returns 401 with a wrong admin key', async () => {
    const res = await api.get('/api/inquiries').set('x-admin-key', 'wrong-key-wrong-key');
    expect(res.status).toBe(401);
  });
});
