const Database = require('better-sqlite3');
const path = require('path');

// Database file location.
// On Railway, set DB_PATH to a path inside your mounted Volume (e.g. /data/chacha.db)
// so the database survives redeploys. Falls back to local file for dev.
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../chacha.db');

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS bills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT
  );

  CREATE TABLE IF NOT EXISTS bill_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id TEXT NOT NULL,
    no TEXT,
    description TEXT,
    ach REAL DEFAULT 0,
    inc REAL DEFAULT 0,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS cost_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS project_settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

console.log('✅ Database connected:', dbPath);

module.exports = db;