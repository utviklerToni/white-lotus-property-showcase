// Runs before each API test file, before the test file imports app.ts / config.ts.
// Points the app at the test database and never lets tests touch dev data.
import { afterAll, beforeAll } from 'vitest';
import { testDatabaseUrl } from './testDbUrl';

process.env.DATABASE_URL = testDatabaseUrl();
// Fixed key for tests, so they don't depend on the developer's .env value.
process.env.ADMIN_KEY = 'test-admin-key-0123456789';
process.env.WEB_ORIGIN ??= 'http://localhost:5173';

// Dynamic import: a static import would be hoisted above the lines that set the env.
beforeAll(async () => {
  const { pool } = await import('../../src/db/pool');
  await pool.query('TRUNCATE inquiries, properties RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  const { pool } = await import('../../src/db/pool');
  await pool.end();
});
