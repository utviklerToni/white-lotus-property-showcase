// Reads and checks the environment once at startup. A missing or bad value stops the server
// with a clear message instead of failing later on the first request.
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.url({ error: 'DATABASE_URL must be a URL, e.g. postgres://user:pass@host/db' }),
  PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z.url({ error: 'WEB_ORIGIN must be a URL, e.g. http://localhost:5173' }),
  ADMIN_KEY: z
    .string({ error: 'ADMIN_KEY is required' })
    .min(16, { error: 'ADMIN_KEY must be at least 16 characters' }),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // Print variable names and messages only, never the values (they hold secrets).
  const problems = parsed.error.issues.map(
    (issue) => `  ${issue.path.join('.')}: ${issue.message}`,
  );
  console.error(`Invalid environment (see .env.example):\n${problems.join('\n')}`);
  process.exit(1);
}

export const config = parsed.data;
