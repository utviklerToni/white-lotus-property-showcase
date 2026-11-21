// Runs migrations/*.sql in filename order. Each file runs once, in its own transaction,
// and is recorded in schema_migrations. `--test` targets DATABASE_URL_TEST instead of DATABASE_URL.
import { readdir, readFile } from 'node:fs/promises';
import pg from 'pg';

const envName = process.argv.includes('--test') ? 'DATABASE_URL_TEST' : 'DATABASE_URL';
const connectionString = process.env[envName];
if (!connectionString) {
  console.error(`${envName} is not set. Copy .env.example to .env.`);
  process.exit(1);
}

const migrationsDir = new URL('../migrations/', import.meta.url);
const client = new pg.Client({ connectionString });
await client.connect();

try {
  // Log the database name only, never the full URL (it holds the password).
  console.log(`Migrating ${new URL(connectionString).pathname.slice(1)}`);

  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename   TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
  const { rows } = await client.query<{ filename: string }>(
    'SELECT filename FROM schema_migrations',
  );
  const applied = new Set(rows.map((row) => row.filename));

  // Zero-padded prefixes (001_, 002_) make plain string sort the right order.
  const files = (await readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  skip  ${file}`);
      continue;
    }
    const sql = await readFile(new URL(file, migrationsDir), 'utf8');
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`  apply ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw new Error(`Migration ${file} failed`, { cause: err });
    }
  }
} finally {
  await client.end();
}
