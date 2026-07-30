const express = require('express')
const { body } = require('express-validator')
const router = express.Router()
const homeworkController = require('../controllers/homeworkController')
const { validate } = require('../middleware/validate')

// GET /api/homework — 获取作业列表
router.get('/', homeworkController.getHomework)

// POST /api/homework — 添加作业
router.post(
  '/',
  [
    body('course_name').trim().notEmpty().withMessage('课程名称不能为空'),
    body('title').trim().notEmpty().withMessage('作业标题不能为空'),
  ],
  validate,
  homeworkController.addHomework
)

// PUT /api/homework/:id — 更新作业状态
router.put('/:id', homeworkController.updateHomework)

// DELETE /api/homework/:id — 删除作业
router.delete('/:id', homeworkController.deleteHomework)

module.exports = router