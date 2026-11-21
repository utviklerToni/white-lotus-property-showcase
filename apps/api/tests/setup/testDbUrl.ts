// The one place that decides which database tests may use. Called before migrating and
// before each test file, so nothing (not even migrations) can run against the dev DB.
import { existsSync } from 'node:fs';

export function testDatabaseUrl(): string {
  const envFile = new URL('../../../../.env', import.meta.url);
  if (existsSync(envFile)) process.loadEnvFile(envFile);

  const url = process.env.DATABASE_URL_TEST;
  if (!url) throw new Error('DATABASE_URL_TEST is not set (see .env.example)');
  if (new URL(url).pathname !== '/white_lotus_test') {
    throw new Error('Refusing to run tests: DATABASE_URL_TEST must point at white_lotus_test');
  }
  return url;
}
