/**
 * ============================================================
 * MOVE EMBEDDED IMAGES OUT OF THE DATABASE
 * ============================================================
 *   node scripts/migrate-images-to-imagekit.js
 *
 * Older admin builds saved uploads as base64 data URIs straight
 * into the image columns, so a single product could carry ~900 KB
 * of text that every catalog response had to send. This uploads
 * each one to ImageKit and replaces the column with the URL.
 *
 * Safe to re-run: rows already holding a normal URL are skipped.
 * ============================================================
 */

const { Pool } = require('pg');
const ImageKit = require('imagekit');
const {
  DATABASE_URL,
  IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_URL_ENDPOINT,
} = require('../config/env');

const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(DATABASE_URL);
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  connectionTimeoutMillis: 30_000,
});

const imagekit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT,
});

/** Tables and the image columns they keep. */
const TARGETS = [
  { table: 'products', columns: ['image_url', 'image_url2', 'image_url3'], label: 'name' },
  { table: 'locations', columns: ['image_url'], label: 'name' },
  { table: 'sponsorship_gallery', columns: ['image_url'], label: 'description' },
];

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
const slug = (s) => String(s || 'image').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'image';

(async () => {
  console.log('\nMoving embedded images to ImageKit\n');

  let moved = 0;
  let freed = 0;

  for (const { table, columns, label } of TARGETS) {
    const { rows } = await pool.query(
      `SELECT id, ${label} AS label, ${columns.join(', ')} FROM ${table}`
    );

    for (const row of rows) {
      for (const column of columns) {
        const value = row[column];
        if (!value || !value.startsWith('data:image')) continue;

        const match = value.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
        if (!match) {
          console.log(`  ${table}#${row.id} ${column}: unrecognised data URI, left alone`);
          continue;
        }

        const [, mime, b64] = match;
        const buffer = Buffer.from(b64, 'base64');
        const ext = mime.split('/')[1].replace('jpeg', 'jpg');
        const fileName = `${slug(row.label)}-${row.id}-${column}.${ext}`;

        try {
          const uploaded = await imagekit.upload({
            file: buffer,
            fileName,
            folder: '/nlg',
            useUniqueFileName: true,
          });
          await pool.query(`UPDATE ${table} SET ${column} = $1 WHERE id = $2`, [uploaded.url, row.id]);
          console.log(`  ${table}#${row.id} ${column}  ${kb(value.length)} -> ${uploaded.url}`);
          moved += 1;
          freed += value.length;
        } catch (err) {
          console.log(`  ${table}#${row.id} ${column}  FAILED: ${err.message}`);
        }
      }
    }
  }

  console.log('\n──────────────────────────────');
  console.log(`  images moved: ${moved}`);
  console.log(`  text removed from the database: ${kb(freed)}`);
  console.log('──────────────────────────────\n');

  await pool.end();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
