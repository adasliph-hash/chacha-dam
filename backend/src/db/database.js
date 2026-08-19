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

  CREATE TABLE IF NOT EXISTS telegram_users (
    telegram_id TEXT PRIMARY KEY,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    first_seen TEXT NOT NULL,
    last_seen TEXT NOT NULL,
    visit_count INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS visit_log (
    telegram_id TEXT NOT NULL,
    visit_date TEXT NOT NULL,
    visit_count INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (telegram_id, visit_date)
  );

  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    id_number TEXT NOT NULL UNIQUE,
    phone_number TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

// Safe migration: add phone_number column if it doesn't exist yet
try {
  db.exec('ALTER TABLE telegram_users ADD COLUMN phone_number TEXT');
} catch (e) {
  // Column already exists — ignore
}

console.log('✅ Database connected:', dbPath);

module.exports = db;