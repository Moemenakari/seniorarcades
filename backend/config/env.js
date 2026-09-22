/**
 * ============================================================
 * ENVIRONMENT VALIDATION
 * ============================================================
 * Loads .env and verifies every secret the app needs is present.
 * There are deliberately no fallback values: a missing secret
 * stops the process instead of silently running on a known
 * default that anyone could guess.
 * ============================================================
 */

require('dotenv').config();

const REQUIRED = {
  DATABASE_URL: 'PostgreSQL connection string (Neon).',
  JWT_SECRET: 'Signing key for session tokens. Use a long random string.',
  IMAGEKIT_PUBLIC_KEY: 'ImageKit public key (image uploads).',
  IMAGEKIT_PRIVATE_KEY: 'ImageKit private key (image uploads).',
  IMAGEKIT_URL_ENDPOINT: 'ImageKit URL endpoint, e.g. https://ik.imagekit.io/yourid',
};

const missing = Object.keys(REQUIRED).filter((key) => !String(process.env[key] || '').trim());

if (missing.length) {
  console.error('\n❌ Cannot start: required environment variables are missing.\n');
  missing.forEach((key) => console.error(`   ${key}  —  ${REQUIRED[key]}`));
  console.error('\n   Local:      set them in backend/.env  (see backend/.env.example)');
  console.error('   Production: set them in the Render dashboard → Environment\n');
  process.exit(1);
}

module.exports = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,
};
