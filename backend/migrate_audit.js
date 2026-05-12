const Database = require('better-sqlite3');
const db = new Database('./data/nlg_arcade.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    time TEXT,
    user TEXT,
    action_type TEXT,
    description TEXT,
    amount REAL,
    related_to TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );
`);
console.log('Created audit_logs table.');
