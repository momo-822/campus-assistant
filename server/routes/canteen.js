const express = require('express')
const { body, param, query } = require('express-validator')
const router = express.Router()
const canteenController = require('../controllers/canteenController')
const { validate } = require('../middleware/validate')

// 注意路由顺序：具体路由在前，参数路由在后

// GET /api/canteen — 获取食堂列表
router.get('/', canteenController.getCanteens)

// GET /api/canteen/stats — 获取食堂统计数据
router.get('/stats', canteenController.getCanteenStats)

// GET /api/canteen/reviews/search — 搜索评价（必须放在 /reviews 之前，/reviews/:id 之前）
router.get(
  '/reviews/search',
  [query('q').optional().trim()],
  validate,
  canteenController.searchReviews
)

// GET /api/canteen/reviews — 获取评价列表
router.get(
  '/reviews',
  [query('canteenId').optional().isInt().withMessage('食堂ID必须是整数')],
  validate,
  canteenController.getReviews
)

// POST /api/canteen/reviews — 添加评价
router.post(
  '/reviews',
  [
    body('canteenId').isInt().withMessage('食堂ID必须是整数'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('评分必须在1-5之间'),
    body('content').trim().notEmpty().withMessage('评价内容不能为空'),
    body('user').trim().notEmpty().withMessage('用户名不能为空'),
  ],
  validate,
  canteenController.addReview
)

// POST /api/canteen/reviews/:id/like — 点赞评价
router.post(
  '/reviews/:id/like',
  [param('id').isInt().withMessage('评价ID必须是整数')],
  validate,
  canteenController.likeReview
)

// PUT /api/canteen/reviews/:id — 编辑评价
router.put(
  '/reviews/:id',
  [
    param('id').isInt().withMessage('评价ID必须是整数'),
    body('user').trim().notEmpty().withMessage('用户名不能为空'),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('评分必须在1-5之间'),
    body('content').optional().trim().notEmpty().withMessage('评价内容不能为空'),
  ],
  validate,
  canteenController.updateReview
)

// DELETE /api/canteen/reviews/:id — 删除评价
router.delete(
  '/reviews/:id',
  [
    param('id').isInt().withMessage('评价ID必须是整数'),
    body('user').optional().trim(),
  ],
  validate,
  canteenController.deleteReview
)

// GET /api/canteen/reviews/summary?canteenId= — AI 评价总结
router.get(
  '/reviews/summary',
  [query('canteenId').optional().isInt().withMessage('食堂ID必须是整数')],
  validate,
  canteenController.getReviewSummary
)

// GET /api/canteen/:id — 获取单个食堂详情（参数路由放最后）
router.get(
  '/:id',
  [param('id').isInt().withMessage('食堂ID必须是整数')],
  validate,
  canteenController.getCanteenById
)

module.exports = router