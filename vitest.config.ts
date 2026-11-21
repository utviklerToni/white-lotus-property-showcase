// One `npm test` runs every workspace that has tests. Each project has its own config.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['apps/api', 'packages/shared'],
  },
});
