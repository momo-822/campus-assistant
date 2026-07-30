const { getDb } = require('../config/db')
const response = require('../utils/response')

/** GET /api/homework?userId= */
exports.getHomework = (req, res, next) => {
  try {
    const db = getDb()
    const userId = req.query.userId || null

    let homework
    if (userId) {
      homework = db.prepare(
        'SELECT * FROM homework WHERE user_id = ? ORDER BY created_at DESC'
      ).all(userId)
    } else {
      homework = db.prepare('SELECT * FROM homework ORDER BY created_at DESC').all()
    }

    res.json(response.success(homework))
  } catch (err) {
    next(err)
  }
}

/** POST /api/homework */
exports.addHomework = (req, res, next) => {
  try {
    const db = getDb()
    const { user_id, course_name, title, description, deadline } = req.body

    db.prepare(
      'INSERT INTO homework (user_id, course_name, title, description, deadline) VALUES (?, ?, ?, ?, ?)'
    ).run(user_id || null, course_name, title, description || null, deadline || null)

    const homework = db.prepare('SELECT * FROM homework ORDER BY created_at DESC').all()
    res.status(201).json(response.created(homework, '作业添加成功'))
  } catch (err) {
    next(err)
  }
}

/** PUT /api/homework/:id */
exports.updateHomework = (req, res, next) => {
  try {
    const db = getDb()
    const { id } = req.params
    const { status, description, deadline } = req.body

    const item = db.prepare('SELECT * FROM homework WHERE id = ?').get(id)
    if (!item) {
      return res.status(404).json(response.notFound('作业不存在'))
    }

    const updates = []
    const params = []

    if (status) { updates.push('status = ?'); params.push(status) }
    if (description !== undefined) { updates.push('description = ?'); params.push(description) }
    if (deadline !== undefined) { updates.push('deadline = ?'); params.push(deadline) }

    if (updates.length > 0) {
      params.push(id)
      db.prepare(`UPDATE homework SET ${updates.join(', ')} WHERE id = ?`).run(...params)
    }

    const homework = db.prepare('SELECT * FROM homework ORDER BY created_at DESC').all()
    res.json(response.success(homework, '更新成功'))
  } catch (err) {
    next(err)
  }
}

/** DELETE /api/homework/:id */
exports.deleteHomework = (req, res, next) => {
  try {
    const db = getDb()
    const { id } = req.params

    const item = db.prepare('SELECT * FROM homework WHERE id = ?').get(id)
    if (!item) {
      return res.status(404).json(response.notFound('作业不存在'))
    }

    db.prepare('DELETE FROM homework WHERE id = ?').run(id)

    const homework = db.prepare('SELECT * FROM homework ORDER BY created_at DESC').all()
    res.json(response.success(homework, '删除成功'))
  } catch (err) {
    next(err)
  }
}