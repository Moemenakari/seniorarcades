/**
 * ============================================================
 * CREATE OR UPDATE AN ADMIN ACCOUNT
 * ============================================================
 *   node scripts/create-admin.js
 *
 * Asks for the details interactively so no password is ever
 * written into a source file, a migration or your shell history.
 * Re-running it for an existing phone number updates that
 * account's password and role instead of creating a duplicate.
 * ============================================================
 */

const readline = require('readline');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { DATABASE_URL } = require('../config/env');

const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(DATABASE_URL);
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  connectionTimeoutMillis: 30_000,
});

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (question) => new Promise((resolve) => rl.question(question, (a) => resolve(a.trim())));

/** Same as ask(), but the typed characters are not echoed. */
const askHidden = (question) =>
  new Promise((resolve) => {
    const onData = (char) => {
      if (['\n', '\r', '\u0004'].includes(char.toString())) {
        process.stdin.removeListener('data', onData);
      } else {
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(question + '*'.repeat(rl.line.length));
      }
    };
    process.stdin.on('data', onData);
    rl.question(question, (a) => {
      process.stdin.removeListener('data', onData);
      process.stdout.write('\n');
      resolve(a.trim());
    });
  });

(async () => {
  console.log('\n═══ Create / update an admin account ═══\n');

  try {
    await pool.query('SELECT 1');
  } catch (err) {
    console.error(`❌ Cannot reach the database: ${err.message}`);
    console.error('   Check DATABASE_URL in backend/.env\n');
    rl.close();
    await pool.end();
    process.exit(1);
  }

  const name = await ask('Full name          : ');
  if (!name) return fail('Name cannot be empty.');

  const phone = await ask('Phone (login id)   : ');
  if (!phone) return fail('Phone cannot be empty.');

  const role = (await ask('Role [super/admin] : ')).toLowerCase();
  if (!['super', 'admin'].includes(role)) return fail('Role must be "super" or "admin".');

  const password = await askHidden('Password           : ');
  if (password.length < 8) return fail('Use at least 8 characters.');

  const confirm = await askHidden('Confirm password   : ');
  if (password !== confirm) return fail('Passwords do not match.');

  const hash = await bcrypt.hash(password, 10);
  const existing = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);

  if (existing.rows.length) {
    await pool.query(
      'UPDATE users SET name = $1, password_hash = $2, role = $3 WHERE phone = $4',
      [name, hash, role, phone]
    );
    console.log(`\n✅ Updated existing account for ${phone} — role: ${role}`);
  } else {
    const email = `${phone.replace(/\D/g, '') || Date.now()}@phone.local`;
    await pool.query(
      'INSERT INTO users (name, email, password_hash, phone, role) VALUES ($1, $2, $3, $4, $5)',
      [name, email, hash, phone, role]
    );
    console.log(`\n✅ Created admin ${name} (${phone}) — role: ${role}`);
  }

  console.log('   Sign in at the admin panel with this phone number and password.\n');
  rl.close();
  await pool.end();

  async function fail(message) {
    console.error(`\n❌ ${message}\n`);
    rl.close();
    await pool.end();
    process.exit(1);
  }
})();
