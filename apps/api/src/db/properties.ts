// SQL for properties. Every value goes in as a $n parameter; the only SQL text that varies
// comes from the fixed maps and column lists below, never from user input.
import type { Property, PropertyData, PropertyListQuery, SortOption } from '@white-lotus/shared';
import { pool } from './pool';

// created_at / updated_at arrive as ISO strings (type parser in pool.ts), matching `Property`.
const COLUMNS =
  'id, name, location, price, size_sqft, bedrooms, description, details, image_url, status, created_at, updated_at';

// Sort whitelist: allowed value → ORDER BY clause. id breaks ties so the order is stable.
const ORDER_BY: Record<SortOption, string> = {
  price_asc: 'price ASC, id ASC',
  price_desc: 'price DESC, id DESC',
  newest: 'created_at DESC, id DESC',
  size_desc: 'size_sqft DESC, id DESC',
};

// The only columns a client can write. Order here = order of $1..$9.
const WRITABLE = [
  'name',
  'location',
  'price',
  'size_sqft',
  'bedrooms',
  'description',
  'details',
  'image_url',
  'status',
] as const;

const valuesOf = (data: PropertyData) => WRITABLE.map((column) => data[column]);

export async function listProperties(query: PropertyListQuery): Promise<Property[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];

  // Each filter adds a fixed fragment; its value goes in `values` and is referenced by number.
  if (query.location !== undefined) {
    values.push(query.location);
    conditions.push(`location = $${values.length}`);
  }
  if (query.minBedrooms !== undefined) {
    values.push(query.minBedrooms);
    conditions.push(`bedrooms >= $${values.length}`);
  }
  if (query.status !== undefined) {
    values.push(query.status);
    conditions.push(`status = $${values.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `SELECT ${COLUMNS} FROM properties ${where} ORDER BY ${ORDER_BY[query.sort]}`;
  const { rows } = await pool.query<Property>(sql, values);
  return rows;
}

export async function getProperty(id: number): Promise<Property | null> {
  const { rows } = await pool.query<Property>(`SELECT ${COLUMNS} FROM properties WHERE id = $1`, [
    id,
  ]);
  return rows[0] ?? null;
}

export async function createProperty(data: PropertyData): Promise<Property> {
  const placeholders = WRITABLE.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await pool.query<Property>(
    `INSERT INTO properties (${WRITABLE.join(', ')}) VALUES (${placeholders}) RETURNING ${COLUMNS}`,
    valuesOf(data),
  );
  return rows[0] as Property; // INSERT ... RETURNING always returns the new row
}

/** Full replace. Returns null if the id doesn't exist. */
export async function updateProperty(id: number, data: PropertyData): Promise<Property | null> {
  const assignments = WRITABLE.map((column, i) => `${column} = $${i + 1}`).join(', ');
  const { rows } = await pool.query<Property>(
    `UPDATE properties SET ${assignments}, updated_at = now()
     WHERE id = $${WRITABLE.length + 1} RETURNING ${COLUMNS}`,
    [...valuesOf(data), id],
  );
  return rows[0] ?? null;
}

/** Returns false if the id doesn't exist. Its inquiries go too (ON DELETE CASCADE). */
export async function deleteProperty(id: number): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM properties WHERE id = $1', [id]);
  return rowCount === 1;
}

export async function listLocations(): Promise<string[]> {
  const { rows } = await pool.query<{ location: string }>(
    'SELECT DISTINCT location FROM properties ORDER BY location',
  );
  return rows.map((row) => row.location);
}
