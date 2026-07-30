const bcrypt = require('bcryptjs')
const { getDb } = require('../config/db')
const { generateToken } = require('../middleware/auth')
const response = require('../utils/response')
const logger = require('../utils/logger')

/** POST /api/auth/register */
exports.register = (req, res, next) => {
  try {
    const { username, password, email, nickname } = req.body
    const db = getDb()

    // 检查用户名是否已存在
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
    if (existing) {
      return res.status(400).json(response.badRequest('用户名已存在'))
    }

    // 加密密码
    const hashedPassword = bcrypt.hashSync(password, 10)

    const result = db.prepare(
      'INSERT INTO users (username, email, password, nickname) VALUES (?, ?, ?, ?)'
    ).run(username, email || null, hashedPassword, nickname || username)

    const token = generateToken({ id: result.lastInsertRowid, username })

    logger.info(`新用户注册: ${username}`)

    res.status(201).json(response.created({
      id: result.lastInsertRowid,
      username,
      nickname: nickname || username,
      token,
    }, '注册成功'))
  } catch (err) {
    next(err)
  }
}

/** POST /api/auth/login */
exports.login = (req, res, next) => {
  try {
    const { username, password } = req.body
    const db = getDb()

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
    if (!user) {
      return res.status(401).json(response.unauthorized('用户名或密码错误'))
    }

    const isValid = bcrypt.compareSync(password, user.password)
    if (!isValid) {
      return res.status(401).json(response.unauthorized('用户名或密码错误'))
    }

    const token = generateToken({ id: user.id, username: user.username })

    logger.info(`用户登录: ${username}`)

    res.json(response.success({
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      avatar: user.avatar,
      token,
    }, '登录成功'))
  } catch (err) {
    next(err)
  }
}

/** GET /api/auth/profile */
exports.getProfile = (req, res, next) => {
  try {
    const db = getDb()
    const user = db.prepare('SELECT id, username, email, nickname, avatar, created_at FROM users WHERE id = ?').get(req.user.id)

    if (!user) {
      return res.status(404).json(response.notFound('用户不存在'))
    }

    res.json(response.success(user))
  } catch (err) {
    next(err)
  }
}