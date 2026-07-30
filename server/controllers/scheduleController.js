const { getDb } = require('../config/db')
const response = require('../utils/response')

/** GET /api/schedule */
exports.getSchedules = (req, res, next) => {
  try {
    const db = getDb()
    const userId = req.query.userId || null

    let schedules
    if (userId) {
      schedules = db.prepare('SELECT * FROM schedules WHERE user_id = ? ORDER BY day_of_week, start_time').all(userId)
    } else {
      schedules = db.prepare('SELECT * FROM schedules ORDER BY day_of_week, start_time').all()
    }

    res.json(response.success(schedules))
  } catch (err) {
    next(err)
  }
}

/** POST /api/schedule */
exports.addSchedule = (req, res, next) => {
  try {
    const db = getDb()
    const { course_name, teacher, classroom, day_of_week, start_time, end_time, weeks, user_id } = req.body

    const result = db.prepare(
      'INSERT INTO schedules (user_id, course_name, teacher, classroom, day_of_week, start_time, end_time, weeks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(user_id || null, course_name, teacher || null, classroom || null, day_of_week, start_time, end_time, weeks || null)

    const schedules = db.prepare('SELECT * FROM schedules ORDER BY day_of_week, start_time').all()

    res.status(201).json(response.created(schedules, '课程添加成功'))
  } catch (err) {
    next(err)
  }
}

/** DELETE /api/schedule/:id */
exports.deleteSchedule = (req, res, next) => {
  try {
    const db = getDb()
    const { id } = req.params

    const item = db.prepare('SELECT * FROM schedules WHERE id = ?').get(id)
    if (!item) {
      return res.status(404).json(response.notFound('课程不存在'))
    }

    db.prepare('DELETE FROM schedules WHERE id = ?').run(id)

    const schedules = db.prepare('SELECT * FROM schedules ORDER BY day_of_week, start_time').all()
    res.json(response.success(schedules, '删除成功'))
  } catch (err) {
    next(err)
  }
}