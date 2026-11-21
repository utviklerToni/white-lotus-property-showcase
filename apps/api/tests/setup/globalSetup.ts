// Runs once before all API tests: brings white_lotus_test up to the latest migration.
// Reuses the real migrate script, so tests run against exactly the schema the app uses.
import { execSync } from 'node:child_process';
import { testDatabaseUrl } from './testDbUrl';

export default function setup() {
  // Check first: the migrate script would otherwise migrate whatever DATABASE_URL_TEST says.
  const url = testDatabaseUrl();
  execSync('npm run db:migrate:test --silent', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL_TEST: url },
  });
}
