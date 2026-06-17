const { Pool } = require('pg');
const { AsyncLocalStorage } = require('async_hooks');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
});

const txStorage = new AsyncLocalStorage();

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
        const result = await getClient().query(pgSql, flat.length ? flat : undefined);
        return result.rows[0] || null;
      },

      async all(...params) {
        const flat = flattenParams(params);
        const result = await getClient().query(pgSql, flat.length ? flat : undefined);
        return result.rows;
      },

      async run(...params) {
        let finalSql = pgSql;
        if (/^\s*INSERT\s/i.test(finalSql) && !/RETURNING/i.test(finalSql)) {
          finalSql += ' RETURNING id';
        }
        const flat = flattenParams(params);
        const result = await getClient().query(finalSql, flat.length ? flat : undefined);
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
    await pool.query(sql);
  },

  pragma() {},
};

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
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
