import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const MIGRATION_LOCK_ID = 72841026;
const migrationsDirectory = fileURLToPath(new URL('../../migrations/', import.meta.url));

async function migrate() {
  const client = await pool.connect();
  let lockAcquired = false;

  try {
    await client.query('SELECT pg_advisory_lock($1)', [MIGRATION_LOCK_ID]);
    lockAcquired = true;

    await client.query(
      'CREATE TABLE IF NOT EXISTS schema_migrations ('
      + 'filename varchar(255) PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())',
    );

    const files = (await readdir(migrationsDirectory))
      .filter((name) => /^\d+_[a-z0-9_-]+\.sql$/i.test(name))
      .sort();

    for (const filename of files) {
      const alreadyApplied = await client.query(
        'SELECT 1 FROM schema_migrations WHERE filename = $1',
        [filename],
      );
      if (alreadyApplied.rowCount > 0) {
        console.log('Skipped migration ' + filename);
        continue;
      }

      const sql = await readFile(new URL('../../migrations/' + filename, import.meta.url), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
        await client.query('COMMIT');
        console.log('Applied migration ' + filename);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
  } finally {
    if (lockAcquired) {
      await client.query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK_ID]);
    }
    client.release();
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error('Database migration failed:', error.message);
  process.exitCode = 1;
});
