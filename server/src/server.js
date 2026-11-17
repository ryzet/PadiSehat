import { app } from './app.js';
import { config } from './config.js';
import { pool } from './db/pool.js';

let server;

try {
  await pool.query('SELECT 1');
  server = app.listen(config.port, () => {
    console.log('PadiSehat API listening on port ' + config.port);
  });
} catch (error) {
  console.error('API startup failed:', error.message);
  await pool.end();
  process.exitCode = 1;
}

async function shutdown(signal) {
  console.log(signal + ' received. Shutting down API.');
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await pool.end();
}

process.on('SIGINT', () => { void shutdown('SIGINT'); });
process.on('SIGTERM', () => { void shutdown('SIGTERM'); });
