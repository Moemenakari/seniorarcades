const Database = require('better-sqlite3');
const db = new Database('./data/nlg_arcade.db');
db.exec('PRAGMA foreign_keys = OFF;');
db.exec(`
  DROP TABLE IF EXISTS debts_new;
  CREATE TABLE IF NOT EXISTS debts_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    partner_name TEXT NOT NULL,
    partner_real_name TEXT,
    amount REAL NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('debt_to_partner','payment_to_partner')),
    related_expense_id INTEGER,
    related_event_id INTEGER,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','cleared')),
    created_at TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (related_expense_id) REFERENCES expenses(id),
    FOREIGN KEY (related_event_id) REFERENCES events(id)
  );
  INSERT INTO debts_new (id, partner_name, amount, type, related_expense_id, related_event_id, status, created_at)
  SELECT id, partner_name, amount, type, related_expense_id, related_event_id, status, created_at FROM debts;
  DROP TABLE debts;
  ALTER TABLE debts_new RENAME TO debts;
`);
db.exec('PRAGMA foreign_keys = ON;');
console.log('Migrated debts table.');
