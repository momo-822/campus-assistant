const Database = require('better-sqlite3')
const path = require('path')

const DB_PATH = path.join(__dirname, '..', 'data', 'campus.db')

let db = null

/** 获取数据库实例（单例） */
function getDb() {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    initTables()
  }
  return db
}

/** 初始化数据库表 */
function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      password TEXT NOT NULL,
      nickname TEXT,
      avatar TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS canteens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT,
      hours TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      canteen_id INTEGER NOT NULL,
      user TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      content TEXT NOT NULL,
      likes INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (canteen_id) REFERENCES canteens(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS trade_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      original_price REAL,
      description TEXT,
      user TEXT NOT NULL,
      contact TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'sold', 'deleted')),
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS lost_found (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('lost', 'found')),
      title TEXT NOT NULL,
      description TEXT,
      location TEXT,
      contact TEXT NOT NULL,
      user TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'resolved')),
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      course_name TEXT NOT NULL,
      teacher TEXT,
      classroom TEXT,
      day_of_week INTEGER NOT NULL CHECK(day_of_week >= 1 AND day_of_week <= 7),
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      weeks TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      target_type TEXT NOT NULL CHECK(target_type IN ('trade', 'review', 'lost_found')),
      target_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS homework (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      course_name TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      deadline TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'submitted', 'graded')),
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)
}

module.exports = { getDb }