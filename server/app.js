require('dotenv').config()

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler')
const routes = require('./routes')
const logger = require('./utils/logger')

const app = express()
const PORT = process.env.PORT || 3001

// ─── 中间件 ─────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    // 允许所有 localhost 来源（开发环境）
    if (!origin || origin.startsWith('http://localhost')) {
      callback(null, true)
    } else {
      callback(null, true) // 生产环境请收紧此配置
    }
  },
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

// ─── 静态文件（可选） ──────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ─── 路由 ───────────────────────────────────────────────
app.use('/api', routes)

// ─── 健康检查 ──────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// ─── 错误处理 ──────────────────────────────────────────
app.use(notFoundHandler)
app.use(errorHandler)

// ─── 启动服务 ──────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`服务器已启动 → http://localhost:${PORT}`)
  logger.info(`健康检查 → http://localhost:${PORT}/health`)
  logger.info(`API 前缀 → http://localhost:${PORT}/api`)
})

module.exports = app