import pg from 'pg';
import { config } from '../config';

// pg returns BIGINT (int8, OID 20) as a string because it can exceed 2^53.
// Our only BIGINT is price in rupees (≤ ₹15 Cr ≈ 1.5e8), far below that, so parse it to a number.
pg.types.setTypeParser(pg.types.builtins.INT8, (value) => Number(value));

export const pool = new pg.Pool({ connectionString: config.DATABASE_URL });

// An idle client erroring (e.g. DB restart) must not crash the process.
pool.on('error', (err) => {
  console.error('Postgres pool error:', err.message);
});
