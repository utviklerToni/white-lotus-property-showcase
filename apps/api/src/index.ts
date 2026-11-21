import { createApp } from './app';
import { config } from './config';
import { pool } from './db/pool';

const server = createApp().listen(config.PORT, (err) => {
  if (err) throw err; // e.g. port already in use
  console.log(`API listening on http://localhost:${config.PORT}`);
});

// Finish open requests, then close DB connections, then exit.
function shutdown() {
  server.close(() => {
    pool.end().finally(() => process.exit(0));
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
