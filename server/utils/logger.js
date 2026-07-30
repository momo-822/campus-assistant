/**
 * 简易日志工具
 */

const LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 }
const PREFIX = { DEBUG: '🔍', INFO: 'ℹ️', WARN: '⚠️', ERROR: '❌' }

function timestamp() {
  return new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
}

function log(level, message, data = null) {
  const prefix = PREFIX[level] || ''
  const line = `[${timestamp()}] ${prefix} [${level}] ${message}`
  console.log(line)
  if (data !== null) {
    console.log(typeof data === 'string' ? data : JSON.stringify(data, null, 2))
  }
}

const logger = {
  debug: (msg, data) => log('DEBUG', msg, data),
  info: (msg, data) => log('INFO', msg, data),
  warn: (msg, data) => log('WARN', msg, data),
  error: (msg, data) => log('ERROR', msg, data),
}

module.exports = logger