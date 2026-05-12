const Database = require('better-sqlite3');
const db = new Database('./data/nlg_arcade.db');
db.exec('PRAGMA foreign_keys = OFF;');
db.exec(`
  DROP TABLE IF EXISTS payments_new;
  CREATE TABLE IF NOT EXISTS payments_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    debt_id INTEGER,
    event_id INTEGER,
    amount REAL NOT NULL,
    paid_to TEXT NOT NULL,
    paid_to_real_name TEXT,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (debt_id) REFERENCES debts(id),
    FOREIGN KEY (event_id) REFERENCES events(id)
  );
  INSERT INTO payments_new (id, debt_id, event_id, amount, paid_to, description, created_at)
  SELECT id, debt_id, event_id, amount, paid_to, description, created_at FROM payments;
  DROP TABLE payments;
  ALTER TABLE payments_new RENAME TO payments;
`);
db.exec('PRAGMA foreign_keys = ON;');
console.log('Migrated payments table.');
