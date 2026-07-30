const Database = require('better-sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, '..', 'data', 'campus.db')
console.log('DB path:', dbPath)

const db = new Database(dbPath)

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
console.log('Tables:', tables.map(t => t.name).join(', '))

tables.forEach(t => {
  const count = db.prepare(`SELECT COUNT(*) as c FROM ${t.name}`).get().c
  console.log(`  ${t.name}: ${count} rows`)
})

db.close()