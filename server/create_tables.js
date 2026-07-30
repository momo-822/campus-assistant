/**
 * 数据库建表脚本
 * 独立运行，不依赖后端服务器
 * 运行: node create_tables.js
 */
const path = require('path')
const Database = require('better-sqlite3')
const fs = require('fs')

const DB_DIR = path.join(__dirname, 'data')
const DB_PATH = path.join(DB_DIR, 'campus.db')

// 确保 data 目录存在
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
  console.log('📁 已创建 data 目录')
}

// 判断数据库是否已存在
const isNew = !fs.existsSync(DB_PATH)
const db = new Database(DB_PATH)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

console.log(isNew ? '🆕 创建新数据库...' : '📂 打开已有数据库...')
console.log(`📁 数据库路径: ${DB_PATH}`)
console.log('')

// ========== 建表 ==========

const schema = `
-- ========================================
-- 1. 用户表
-- ========================================
CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  username    TEXT UNIQUE NOT NULL,          -- 用户名（登录用）
  email       TEXT UNIQUE,                   -- 邮箱
  password    TEXT NOT NULL,                 -- 加密后的密码
  nickname    TEXT,                          -- 昵称
  avatar      TEXT,                          -- 头像 URL
  created_at  TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at  TEXT DEFAULT (datetime('now', 'localtime'))
);

-- ========================================
-- 2. 食堂表
-- ========================================
CREATE TABLE IF NOT EXISTS canteens (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,                 -- 食堂名称
  type        TEXT,                          -- 类型（中餐/清真/特色）
  hours       TEXT,                          -- 营业时间
  created_at  TEXT DEFAULT (datetime('now', 'localtime'))
);

-- ========================================
-- 3. 评价表
-- ========================================
CREATE TABLE IF NOT EXISTS reviews (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  canteen_id  INTEGER NOT NULL,             -- 所属食堂
  user        TEXT NOT NULL,                 -- 评价人
  rating      INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),  -- 评分 1-5
  content     TEXT NOT NULL,                 -- 评价内容
  likes       INTEGER DEFAULT 0,            -- 点赞数
  created_at  TEXT DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (canteen_id) REFERENCES canteens(id) ON DELETE CASCADE
);

-- ========================================
-- 4. 二手商品表
-- ========================================
CREATE TABLE IF NOT EXISTS trade_items (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  title         TEXT NOT NULL,               -- 商品标题
  category      TEXT NOT NULL,               -- 分类
  price         REAL NOT NULL,               -- 售价
  original_price REAL,                       -- 原价
  description   TEXT,                        -- 商品描述
  user          TEXT NOT NULL,               -- 卖家
  contact       TEXT,                        -- 联系方式
  status        TEXT DEFAULT 'active' CHECK(status IN ('active', 'sold', 'deleted')),
  created_at    TEXT DEFAULT (datetime('now', 'localtime'))
);

-- ========================================
-- 5. 失物招领表
-- ========================================
CREATE TABLE IF NOT EXISTS lost_found (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  type        TEXT NOT NULL CHECK(type IN ('lost', 'found')),  -- lost=寻物, found=招领
  title       TEXT NOT NULL,                 -- 标题
  description TEXT,                          -- 详细描述
  location    TEXT,                          -- 丢失/捡到地点
  contact     TEXT NOT NULL,                 -- 联系方式
  user        TEXT NOT NULL,                 -- 发布人
  status      TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'resolved')),
  created_at  TEXT DEFAULT (datetime('now', 'localtime'))
);

-- ========================================
-- 6. 课表
-- ========================================
CREATE TABLE IF NOT EXISTS schedules (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER,                       -- 关联用户（可选）
  course_name TEXT NOT NULL,                 -- 课程名称
  teacher     TEXT,                          -- 授课教师
  classroom   TEXT,                          -- 教室
  day_of_week INTEGER NOT NULL CHECK(day_of_week >= 1 AND day_of_week <= 7),  -- 星期几
  start_time  TEXT NOT NULL,                 -- 开始时间
  end_time    TEXT NOT NULL,                 -- 结束时间
  weeks       TEXT,                          -- 上课周次
  created_at  TEXT DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ========================================
-- 7. 收藏表
-- ========================================
CREATE TABLE IF NOT EXISTS favorites (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER,                       -- 用户
  target_type TEXT NOT NULL CHECK(target_type IN ('trade', 'review', 'lost_found')),  -- 收藏类型
  target_id   INTEGER NOT NULL,              -- 收藏目标 ID
  created_at  TEXT DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ========================================
-- 8. 作业表
-- ========================================
CREATE TABLE IF NOT EXISTS homework (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER,                       -- 关联用户
  course_name TEXT NOT NULL,                 -- 课程名称
  title       TEXT NOT NULL,                 -- 作业标题
  description TEXT,                          -- 作业描述
  deadline    TEXT,                          -- 截止日期
  status      TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'submitted', 'graded')),
  created_at  TEXT DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`

console.log('🏗️  开始创建数据库表...\n')

// 执行建表 SQL
db.exec(schema)

// 查询并显示所有表
const tables = db.prepare(`
  SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
`).all()

console.log('✅ 建表完成！')
console.log('')
console.log('📊 数据库中的表:')
console.log('━'.repeat(50))

tables.forEach((t, i) => {
  const count = db.prepare(`SELECT COUNT(*) as cnt FROM \`${t.name}\``).get()
  console.log(`  ${i + 1}. ${t.name.padEnd(16)} ${count.cnt} 条记录`)
})

console.log('━'.repeat(50))
console.log('')
console.log('📋 各表字段结构:')
console.log('')

tables.forEach((t, i) => {
  const columns = db.prepare(`PRAGMA table_info(\`${t.name}\`)`).all()
  console.log(`  ${i + 1}. ${t.name}`)
  columns.forEach((c) => {
    const pk = c.pk ? '🔑' : '  '
    const nn = c.notnull ? 'NOT NULL' : 'nullable'
    const def = c.dflt_value ? `default ${c.dflt_value}` : ''
    console.log(`     ${pk} ${c.name.padEnd(18)} ${c.type.padEnd(10)} ${nn.padEnd(10)} ${def}`)
  })
  console.log('')
})

db.close()
console.log('🎉 数据库建表完成！')