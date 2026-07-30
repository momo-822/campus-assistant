const { getDb } = require('../config/db')
const response = require('../utils/response')

/** GET /api/favorite?userId=&targetType= */
exports.getFavorites = (req, res, next) => {
  try {
    const db = getDb()
    const { userId, targetType } = req.query

    let favorites
    if (targetType) {
      favorites = db.prepare(
        'SELECT * FROM favorites WHERE user_id = ? AND target_type = ? ORDER BY created_at DESC'
      ).all(userId || null, targetType)
    } else {
      favorites = db.prepare(
        'SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC'
      ).all(userId || null)
    }

    res.json(response.success(favorites))
  } catch (err) {
    next(err)
  }
}

/** POST /api/favorite */
exports.addFavorite = (req, res, next) => {
  try {
    const db = getDb()
    const { user_id, target_type, target_id } = req.body

    // 检查是否已收藏
    const existing = db.prepare(
      'SELECT id FROM favorites WHERE user_id = ? AND target_type = ? AND target_id = ?'
    ).get(user_id || null, target_type, target_id)

    if (existing) {
      return res.status(400).json(response.badRequest('已收藏'))
    }

    db.prepare(
      'INSERT INTO favorites (user_id, target_type, target_id) VALUES (?, ?, ?)'
    ).run(user_id || null, target_type, target_id)

    const favorites = db.prepare(
      'SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC'
    ).all(user_id || null)

    res.status(201).json(response.created(favorites, '收藏成功'))
  } catch (err) {
    next(err)
  }
}

/** DELETE /api/favorite?userId=&targetType=&targetId= */
exports.removeFavorite = (req, res, next) => {
  try {
    const db = getDb()
    const { userId, targetType, targetId } = req.query

    db.prepare(
      'DELETE FROM favorites WHERE user_id = ? AND target_type = ? AND target_id = ?'
    ).run(userId || null, targetType, targetId)

    const favorites = db.prepare(
      'SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC'
    ).all(userId || null)

    res.json(response.success(favorites, '取消收藏'))
  } catch (err) {
    next(err)
  }
}