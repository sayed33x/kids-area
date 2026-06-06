const path = require('path')
const { app } = require('electron')

let db

function getDb() { return db }

function setupDatabase() {
  const Database = require('better-sqlite3')
  const dbPath = app.isPackaged
    ? path.join(app.getPath('userData'), 'kidsarea.db')
    : path.join(__dirname, '../kidsarea.db')

  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  db.exec(`
    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      password TEXT NOT NULL,
      permissions TEXT DEFAULT '{}',
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS prices_normal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      half_hour REAL DEFAULT 0,
      hour1 REAL DEFAULT 0,
      hour2 REAL DEFAULT 0,
      hour3 REAL DEFAULT 0,
      extra_hour REAL DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS prices_siblings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      num_children INTEGER NOT NULL,
      hour1 REAL DEFAULT 0,
      hour2 REAL DEFAULT 0,
      hour3 REAL DEFAULT 0,
      extra_hour REAL DEFAULT 0,
      extra_fee REAL DEFAULT 0,
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS prices_packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      hours INTEGER NOT NULL,
      price REAL NOT NULL,
      extra_hour_price REAL DEFAULT 0,
      extra_fee REAL DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS prices_recharge (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hours INTEGER NOT NULL,
      price REAL NOT NULL,
      extra_hour_price REAL DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      child_name TEXT NOT NULL,
      guardian_name TEXT NOT NULL,
      guardian_phone TEXT,
      booking_type TEXT NOT NULL,
      num_children INTEGER DEFAULT 1,
      package_id INTEGER,
      recharge_id INTEGER,
      price_per_unit REAL DEFAULT 0,
      total_price REAL DEFAULT 0,
      duration_minutes INTEGER DEFAULT 60,
      check_in TEXT NOT NULL,
      expected_out TEXT,
      check_out TEXT,
      status TEXT DEFAULT 'active',
      staff_id INTEGER,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      amount REAL DEFAULT 0,
      description TEXT,
      staff_id INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT DEFAULT 'general',
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER,
      items TEXT NOT NULL,
      total REAL DEFAULT 0,
      staff_id INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT DEFAULT 'general',
      amount REAL NOT NULL,
      description TEXT,
      staff_id INTEGER,
      date TEXT DEFAULT (date('now')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    INSERT OR IGNORE INTO staff (id, name, password, permissions)
    VALUES (1, 'Admin', 'admin123', '{"all":true}');

    INSERT OR IGNORE INTO products (name, price, category) VALUES
      ('بيبسي', 10, 'drinks'),
      ('ساي', 15, 'drinks'),
      ('قهوة', 40, 'hot');

    INSERT OR IGNORE INTO prices_normal (id, half_hour, hour1, hour2, hour3, extra_hour)
    VALUES (1, 70, 100, 80, 75, 70);
  `)

  console.log('✅ Database ready:', dbPath)
}

module.exports = { setupDatabase, getDb }
