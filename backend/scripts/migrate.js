/**
 * ============================================================
 * DATABASE MIGRATION — run once against a fresh database
 * ============================================================
 *   node scripts/migrate.js
 *
 * Applies backend/schema.sql (every statement is IF NOT EXISTS,
 * so running it twice is harmless) and reports what the database
 * looked like before and after.
 * ============================================================
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { DATABASE_URL } = require('../config/env');

const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(DATABASE_URL);

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  connectionTimeoutMillis: 30_000,
});

const listTables = async () => {
  const { rows } = await pool.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
     ORDER BY table_name`
  );
  return rows.map((r) => r.table_name);
};

(async () => {
  const host = (() => {
    try { return new URL(DATABASE_URL).host; } catch { return 'unknown host'; }
  })();

  console.log(`\n🔌 Connecting to ${host} ...`);

  try {
    await pool.query('SELECT 1');
    console.log('✅ Connected.\n');
  } catch (err) {
    console.error(`❌ Could not connect: ${err.message}\n`);
    console.error('   Check DATABASE_URL in backend/.env');
    await pool.end();
    process.exit(1);
  }

  const before = await listTables();
  console.log(before.length ? `Tables already present: ${before.length}` : 'Database is empty.');

  const schemaPath = path.join(__dirname, '..', 'schema.sql');
  console.log(`\n📜 Applying ${path.relative(process.cwd(), schemaPath)} ...`);

  try {
    await pool.query(fs.readFileSync(schemaPath, 'utf8'));
  } catch (err) {
    console.error(`\n❌ Migration failed: ${err.message}\n`);
    await pool.end();
    process.exit(1);
  }

  const after = await listTables();
  const created = after.filter((t) => !before.includes(t));

  console.log('\n──────────────────────────────────────');
  console.log(`   Created:  ${created.length}`);
  created.forEach((t) => console.log(`      + ${t}`));
  if (before.length) {
    console.log(`   Already existed: ${before.length}`);
    before.forEach((t) => console.log(`      · ${t}`));
  }
  console.log(`   Total now: ${after.length}`);
  console.log('──────────────────────────────────────');

  console.log('\n✅ Migration complete.');
  console.log('   Next: create your admin account with  node scripts/create-admin.js\n');

  await pool.end();
})();
