import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'api',
    include: ['tests/**/*.test.ts'],
    // Migrates white_lotus_test once before any test runs.
    globalSetup: ['tests/setup/globalSetup.ts'],
    // Runs before each test file: points the app at the test DB and resets it.
    setupFiles: ['tests/setup/env.ts'],
    // All files share one test database, so run them one at a time.
    fileParallelism: false,
  },
});
