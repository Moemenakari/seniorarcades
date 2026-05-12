const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, 'data', 'nlg_arcade.db');
const db = new Database(dbPath);

console.log('Resetting Finance Database...');
db.pragma('foreign_keys = OFF');
db.exec('DELETE FROM payments;');
db.exec('DELETE FROM debts;');
db.exec('DELETE FROM expenses;');
db.exec('DELETE FROM income;');
db.exec('DELETE FROM audit_logs;');
db.exec('DELETE FROM finance_logs;');
db.pragma('foreign_keys = ON');
console.log('Finance Data Cleared successfully!');
