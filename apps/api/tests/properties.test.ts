import { describe, expect, it } from 'vitest';
import type { Property, PropertyInput } from '@white-lotus/shared';
import { ADMIN, api, createProperty, validProperty } from './helpers';

describe('POST /api/properties validation', () => {
  it('rejects a negative price with a field error', async () => {
    const res = await api
      .post('/api/properties')
      .set(ADMIN)
      .send(validProperty({ price: -5 }));
    expect(res.status).toBe(400);
    // Checking `fields` matters: without Zod, the DB CHECK would still give 400 but no field.
    expect(res.body.fields.price).toBe('Price must be a positive number');
  });

  it('rejects a missing name', async () => {
    const body: Partial<PropertyInput> = validProperty();
    delete body.name;
    const res = await api.post('/api/properties').set(ADMIN).send(body);
    expect(res.status).toBe(400);
    expect(res.body.fields.name).toBe('Name is required');
  });

  it('rejects an unknown field such as id (.strict())', async () => {
    const res = await api
      .post('/api/properties')
      .set(ADMIN)
      .send({ ...validProperty(), id: 99 });
    expect(res.status).toBe(400);
    expect(res.body.fields.id).toBe('Unknown field');
  });
});

describe('GET /api/properties', () => {
  it('rejects an invalid sort with 400', async () => {
    const res = await api.get('/api/properties?sort=DROP%20TABLE');
    expect(res.status).toBe(400);
    expect(res.body.fields.sort).toBeDefined();
  });

  it('filters by location and minBedrooms, and sorts by price', async () => {
    await createProperty({ name: 'Hebbal 3', location: 'Hebbal', bedrooms: 3 });
    await createProperty({ name: 'WF 5', location: 'Whitefield', bedrooms: 5, price: 90_000_000 });
    await createProperty({ name: 'WF 4', location: 'Whitefield', bedrooms: 4, price: 70_000_000 });
    await createProperty({ name: 'WF 2', location: 'Whitefield', bedrooms: 2, price: 40_000_000 });

    const res = await api.get('/api/properties?location=Whitefield&minBedrooms=3&sort=price_asc');
    expect(res.status).toBe(200);
    expect(res.body.map((p: Property) => p.name)).toEqual(['WF 4', 'WF 5']);
  });
});

describe('GET /api/properties/:id', () => {
  it('rejects a non-numeric id with 400', async () => {
    const res = await api.get('/api/properties/abc');
    expect(res.status).toBe(400);
    expect(res.body.fields.id).toBeDefined();
  });

  it('returns 404 for an unknown id', async () => {
    const res = await api.get('/api/properties/999999');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Property not found' });
  });
});

describe('admin key on write routes', () => {
  const keys = [
    ['no key', {}],
    ['a wrong key', { 'x-admin-key': 'wrong-key-wrong-key' }],
  ] as const;

  it.each(keys)('POST with %s → 401', async (_label, headers) => {
    const res = await api.post('/api/properties').set(headers).send(validProperty());
    expect(res.status).toBe(401);
  });

  it.each(keys)('PUT with %s → 401', async (_label, headers) => {
    const property = await createProperty();
    const res = await api
      .put(`/api/properties/${property.id}`)
      .set(headers)
      .send(validProperty({ name: 'Hacked' }));
    expect(res.status).toBe(401);
    const after = await api.get(`/api/properties/${property.id}`);
    expect(after.body.name).toBe('Test Villa');
  });

  it.each(keys)('DELETE with %s → 401 and the property survives', async (_label, headers) => {
    const property = await createProperty();
    const res = await api.delete(`/api/properties/${property.id}`).set(headers);
    expect(res.status).toBe(401);
    const after = await api.get(`/api/properties/${property.id}`);
    expect(after.status).toBe(200);
  });
});

describe('happy path', () => {
  it('create → read → update → delete', async () => {
    const created = await api
      .post('/api/properties')
      .set(ADMIN)
      .send(validProperty({ details: '  ' }));
    expect(created.status).toBe(201);
    const property = created.body as Property;
    expect(property).toMatchObject({ name: 'Test Villa', price: 50_000_000, details: null });
    expect(typeof property.created_at).toBe('string');

    const read = await api.get(`/api/properties/${property.id}`);
    expect(read.status).toBe(200);
    expect(read.body).toEqual(property);

    // Timestamps have ms precision; wait so the update can't land in the same millisecond.
    await new Promise((resolve) => setTimeout(resolve, 20));
    const updated = await api
      .put(`/api/properties/${property.id}`)
      .set(ADMIN)
      .send(validProperty({ status: 'sold', price: 55_000_000 }));
    expect(updated.status).toBe(200);
    expect(updated.body).toMatchObject({ status: 'sold', price: 55_000_000 });
    expect(updated.body.created_at).toBe(property.created_at);
    expect(updated.body.updated_at).not.toBe(property.updated_at);

    const deleted = await api.delete(`/api/properties/${property.id}`).set(ADMIN);
    expect(deleted.status).toBe(204);
    const gone = await api.get(`/api/properties/${property.id}`);
    expect(gone.status).toBe(404);
  });
});
