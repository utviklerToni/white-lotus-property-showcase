// SQL for inquiries. All values are $n parameters.
import type { Inquiry, InquiryData } from '@white-lotus/shared';
import { pool } from './pool';

type CreatedInquiry = Pick<Inquiry, 'id' | 'property_id' | 'created_at'>;

export async function propertyExists(id: number): Promise<boolean> {
  const { rowCount } = await pool.query('SELECT 1 FROM properties WHERE id = $1', [id]);
  return rowCount === 1;
}

/** Returns only id + timestamps: the caller doesn't need its own personal data echoed back. */
export async function createInquiry(
  propertyId: number,
  data: InquiryData,
): Promise<CreatedInquiry> {
  const { rows } = await pool.query<CreatedInquiry>(
    `INSERT INTO inquiries (property_id, name, email, phone, message)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, property_id, created_at`,
    [propertyId, data.name, data.email, data.phone, data.message],
  );
  return rows[0] as CreatedInquiry; // RETURNING always gives the new row
}

/** Admin list: newest first, with the property name, capped at 200 rows. */
export async function listInquiries(): Promise<Inquiry[]> {
  const { rows } = await pool.query<Inquiry>(
    `SELECT i.id, i.property_id, p.name AS property_name,
            i.name, i.email, i.phone, i.message, i.created_at
       FROM inquiries i
       JOIN properties p ON p.id = i.property_id
      ORDER BY i.created_at DESC, i.id DESC
      LIMIT 200`,
  );
  return rows;
}
