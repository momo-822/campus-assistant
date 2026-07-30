const express = require('express')
const { body, param } = require('express-validator')
const router = express.Router()
const lostFoundController = require('../controllers/lostFoundController')
const { validate } = require('../middleware/validate')

// GET /api/lost-found — 获取失物招领列表
router.get('/', lostFoundController.getItems)

// GET /api/lost-found/stats — 获取统计数据
router.get('/stats', lostFoundController.getStats)

// GET /api/lost-found/smart-match — 智能匹配推荐（必须放在 /:id 之前）
router.get('/smart-match', lostFoundController.smartMatch)

// POST /api/lost-found/generate-description — AI 描述生成（必须放在 /:id 之前）
router.post(
  '/generate-description',
  [
    body('type').isIn(['lost', 'found']).withMessage('类型必须是 lost 或 found'),
    body('title').trim().notEmpty().withMessage('标题不能为空'),
  ],
  validate,
  lostFoundController.generateDescription
)

// GET /api/lost-found/:id — 获取单个详情
router.get(
  '/:id',
  [param('id').isInt().withMessage('ID必须是整数')],
  validate,
  lostFoundController.getItemById
)

// POST /api/lost-found — 发布失物/招领
router.post(
  '/',
  [
    body('type').isIn(['lost', 'found']).withMessage('类型必须是 lost 或 found'),
    body('title').trim().notEmpty().withMessage('标题不能为空'),
    body('contact').trim().notEmpty().withMessage('联系方式不能为空'),
    body('user').trim().notEmpty().withMessage('用户不能为空'),
  ],
  validate,
  lostFoundController.addItem
)

// PUT /api/lost-found/:id/resolve — 标记完成
router.put('/:id/resolve', lostFoundController.resolveItem)

// PUT /api/lost-found/:id — 编辑帖子
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('ID必须是整数'),
    body('user').trim().notEmpty().withMessage('用户名不能为空'),
    body('title').optional().trim().notEmpty().withMessage('标题不能为空'),
    body('contact').optional().trim().notEmpty().withMessage('联系方式不能为空'),
  ],
  validate,
  lostFoundController.updateItem
)

// DELETE /api/lost-found/:id — 删除
router.delete('/:id', lostFoundController.deleteItem)

module.exports = router