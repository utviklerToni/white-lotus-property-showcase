import pg from 'pg';
import { config } from '../config';

// pg returns BIGINT (int8, OID 20) as a string because it can exceed 2^53.
// Our only BIGINT is price in rupees (≤ ₹15 Cr ≈ 1.5e8), far below that, so parse it to a number.
pg.types.setTypeParser(pg.types.builtins.INT8, (value) => Number(value));

// pg returns TIMESTAMPTZ (OID 1184) as a Date; the shared types promise ISO strings.
// Reuse pg's own strict parser (not `new Date(text)`, which guesses at non-ISO formats),
// then format as ISO 8601 UTC, e.g. "2026-11-21T10:54:14.898Z". Microseconds are cut to ms.
const parseTimestamptz = pg.types.getTypeParser(pg.types.builtins.TIMESTAMPTZ);
pg.types.setTypeParser(pg.types.builtins.TIMESTAMPTZ, (value) =>
  (parseTimestamptz(value) as Date).toISOString(),
);

export const pool = new pg.Pool({ connectionString: config.DATABASE_URL });

// An idle client erroring (e.g. DB restart) must not crash the process.
pool.on('error', (err) => {
  console.error('Postgres pool error:', err.message);
});
