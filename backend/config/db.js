const { Pool } = require('pg');
const { AsyncLocalStorage } = require('async_hooks');
const { DATABASE_URL } = require('./env');

const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(DATABASE_URL);

const pool = new Pool({
  connectionString: DATABASE_URL,
  // Neon always requires TLS. Only a database on this machine may skip it.
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: 10,
  keepAlive: true,
  idleTimeoutMillis: 30_000,
  // Neon scales to zero when idle; the first connection has to wait for it to wake.
  connectionTimeoutMillis: 20_000,
});

const txStorage = new AsyncLocalStorage();

// A sleeping Neon endpoint drops pooled sockets, so the first query after an
// idle spell can fail on a connection that was already dead. Those are safe to
// retry: the query never reached the server.
const WAKEABLE = new Set([
  'ECONNRESET', 'ETIMEDOUT', 'EPIPE', 'ENOTFOUND', 'EHOSTUNREACH',
  '57P01', // admin_shutdown
  '57P03', // cannot_connect_now — still booting
  '08006', // connection_failure
  '08003', // connection_does_not_exist
]);

const isWakeable = (err) =>
  WAKEABLE.has(err?.code) || /terminated unexpectedly|Connection terminated/i.test(err?.message || '');

async function runQuery(client, sql, params) {
  try {
    return await client.query(sql, params);
  } catch (err) {
    // Never retry inside a transaction: the whole transaction is already void.
    if (client !== pool || !isWakeable(err)) throw err;
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    return client.query(sql, params);
  }
}

function toPostgresParams(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

function fixSqliteSyntax(sql) {
  return sql
    .replace(/datetime\('now',\s*'localtime'\)/gi, 'NOW()')
    .replace(/datetime\('now'\)/gi, 'NOW()')
    .replace(/date\('now',\s*'localtime'\)/gi, 'CURRENT_DATE')
    .replace(/date\('now'\)/gi, 'CURRENT_DATE')
    .replace(/strftime\('%Y-%m',\s*date\)/gi, "TO_CHAR(date::date, 'YYYY-MM')")
    .replace(/strftime\('%Y-%m',\s*([a-zA-Z_."]+)\)/gi, (_, col) => `TO_CHAR(${col.trim()}::date, 'YYYY-MM')`)
    .replace(/INSERT OR IGNORE INTO/gi, 'INSERT INTO')
    .replace(/INSERT OR REPLACE INTO/gi, 'INSERT INTO');
}

function convertSql(sql) {
  return toPostgresParams(fixSqliteSyntax(sql));
}

function getClient() {
  return txStorage.getStore() || pool;
}

function flattenParams(params) {
  return params.flat().map(p => (p === undefined ? null : p));
}

const db = {
  prepare(sql) {
    const pgSql = convertSql(sql);

    return {
      async get(...params) {
        const flat = flattenParams(params);
        const result = await runQuery(getClient(), pgSql, flat.length ? flat : undefined);
        return result.rows[0] || null;
      },

      async all(...params) {
        const flat = flattenParams(params);
        const result = await runQuery(getClient(), pgSql, flat.length ? flat : undefined);
        return result.rows;
      },

      async run(...params) {
        let finalSql = pgSql;
        if (/^\s*INSERT\s/i.test(finalSql) && !/RETURNING/i.test(finalSql)) {
          finalSql += ' RETURNING id';
        }
        const flat = flattenParams(params);
        const result = await runQuery(getClient(), finalSql, flat.length ? flat : undefined);
        return {
          lastInsertRowid: result.rows[0]?.id || null,
          changes: result.rowCount || 0,
        };
      },
    };
  },

  transaction(fn) {
    return async function (...args) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await txStorage.run(client, () => fn(...args));
        await client.query('COMMIT');
        return result;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    };
  },

  async exec(sql) {
    await runQuery(getClient(), sql);
  },

  pragma() {},
};

// An idle Neon endpoint closes its sockets. pg reports that on the pool, and
// without this listener the unhandled 'error' event would take the process down.
pool.on('error', (err) => {
  if (isWakeable(err)) return;
  console.error('Unexpected database pool error:', err.message);
});

pool.connect()
  .then(client => {
    console.log('✅ PostgreSQL connected successfully');
    client.release();
  })
  .catch(err => {
    console.error('❌ PostgreSQL connection failed:', err.message);
  });

module.exports = db;
