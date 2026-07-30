const express = require('express')
const { body } = require('express-validator')
const router = express.Router()
const scheduleController = require('../controllers/scheduleController')
const { validate } = require('../middleware/validate')

// GET /api/schedule — 获取课表
router.get('/', scheduleController.getSchedules)

// POST /api/schedule — 添加课程
router.post(
  '/',
  [
    body('course_name').trim().notEmpty().withMessage('课程名称不能为空'),
    body('day_of_week').isInt({ min: 1, max: 7 }).withMessage('星期必须在1-7之间'),
    body('start_time').notEmpty().withMessage('开始时间不能为空'),
    body('end_time').notEmpty().withMessage('结束时间不能为空'),
  ],
  validate,
  scheduleController.addSchedule
)

// DELETE /api/schedule/:id — 删除课程
router.delete('/:id', scheduleController.deleteSchedule)

module.exports = router