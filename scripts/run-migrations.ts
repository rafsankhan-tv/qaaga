/**
 * Automated migration runner for production PostgreSQL.
 * Applies 001, 002, and 003 safe migrations idempotently.
 */
import fs from 'fs';
import path from 'path';
import { dbService } from '../src/db/database.ts';

const MIGRATION_FILES = [
  'src/db/migrations/001_indexes_and_optimizations.sql',
  'src/db/migrations/002_idempotency_keys.sql',
  'src/db/migrations/003_phase1_persistence.sql',
];

export async function runProductionMigrations(): Promise<boolean> {
  console.log('=== QAAGA PRODUCTION MIGRATION RUNNER ===');
  
  const health = await dbService.checkHealth();
  if (health.status !== 'healthy') {
    console.error('Migration aborted: PostgreSQL database is not reachable.', health);
    return false;
  }

  for (const relPath of MIGRATION_FILES) {
    const fullPath = path.resolve(process.cwd(), relPath);
    if (!fs.existsSync(fullPath)) {
      console.error(`Migration file not found: ${fullPath}`);
      return false;
    }

    console.log(`Executing migration: ${relPath}...`);
    const sqlContent = fs.readFileSync(fullPath, 'utf8');

    try {
      await dbService.query(sqlContent);
      console.log(`✓ Completed: ${relPath}`);
    } catch (err: any) {
      console.error(`✗ Migration failed on ${relPath}:`, err.message);
      return false;
    }
  }

  console.log('All production migrations executed successfully.\n');
  return true;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runProductionMigrations()
    .then((ok) => process.exit(ok ? 0 : 1))
    .catch((err) => {
      console.error('Fatal migration error:', err);
      process.exit(1);
    });
}
