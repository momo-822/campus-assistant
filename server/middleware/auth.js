const jwt = require('jsonwebtoken')
const response = require('../utils/response')
const logger = require('../utils/logger')

const JWT_SECRET = process.env.JWT_SECRET || 'campus-assistant-secret-key-2026'
const JWT_EXPIRES_IN = '7d'

/** 生成 JWT Token */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

/** 验证 JWT Token（可选 — 不强制要求登录） */
function optionalAuth(req, res, next) {
  const header = req.headers.authorization
  if (header && header.startsWith('Bearer ')) {
    try {
      const token = header.slice(7)
      req.user = jwt.verify(token, JWT_SECRET)
    } catch {
      req.user = null
    }
  }
  req.user = req.user || null
  next()
}

/** 验证 JWT Token（必需 — 未登录返回 401） */
function requiredAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json(response.unauthorized())
  }
  try {
    const token = header.slice(7)
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch (err) {
    logger.warn('JWT 验证失败', err.name, err.message)
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json(response.unauthorized('登录已过期，请重新登录'))
    }
    return res.status(401).json(response.unauthorized('登录凭证无效，请重新登录'))
  }
}

module.exports = { generateToken, optionalAuth, requiredAuth, JWT_SECRET }