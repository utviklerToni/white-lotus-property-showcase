// Loads seed/seed.sql into the dev database in one transaction.
// The SQL truncates first, so running it again gives the same data.
import { readFile } from 'node:fs/promises';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env.');
  process.exit(1);
}

const sql = await readFile(new URL('../seed/seed.sql', import.meta.url), 'utf8');
const client = new pg.Client({ connectionString });
await client.connect();

try {
  await client.query('BEGIN');
  await client.query(sql);
  await client.query('COMMIT');

  const { rows } = await client.query<{ properties: number; inquiries: number }>(
    `SELECT (SELECT count(*) FROM properties)::int AS properties,
            (SELECT count(*) FROM inquiries)::int  AS inquiries`,
  );
  console.log(`Seeded ${rows[0]?.properties} properties, ${rows[0]?.inquiries} inquiries`);
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
} finally {
  await client.end();
}
