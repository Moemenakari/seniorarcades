const sqlite3 = require('better-sqlite3');
const db = sqlite3('C:/Users/moemen/Desktop/nlgarcades/backend/data/database.sqlite');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log(tables);
