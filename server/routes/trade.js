const express = require('express')
const { body, param } = require('express-validator')
const router = express.Router()
const tradeController = require('../controllers/tradeController')
const { validate } = require('../middleware/validate')

// GET /api/trade — 获取商品列表（支持分类筛选）
router.get('/', tradeController.getItems)

// GET /api/trade/categories — 获取分类列表
router.get('/categories', tradeController.getCategories)

// GET /api/trade/search — 搜索商品
router.get('/search', tradeController.searchItems)

// GET /api/trade/:id — 获取单个商品详情
router.get(
  '/:id',
  [param('id').isInt().withMessage('商品ID必须是整数')],
  validate,
  tradeController.getItemById
)

// POST /api/trade — 发布商品
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('商品标题不能为空'),
    body('category').trim().notEmpty().withMessage('分类不能为空'),
    body('price').isFloat({ min: 0.01 }).withMessage('价格必须大于0'),
    body('user').trim().notEmpty().withMessage('用户不能为空'),
  ],
  validate,
  tradeController.addItem
)

// PUT /api/trade/:id — 编辑商品
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('商品ID必须是整数'),
    body('user').trim().notEmpty().withMessage('用户名不能为空'),
    body('title').optional().trim().notEmpty().withMessage('商品标题不能为空'),
    body('category').optional().trim().notEmpty().withMessage('分类不能为空'),
    body('price').optional().isFloat({ min: 0.01 }).withMessage('价格必须大于0'),
  ],
  validate,
  tradeController.updateItem
)

// POST /api/trade/generate-description — AI 商品描述生成
router.post(
  '/generate-description',
  [
    body('title').trim().notEmpty().withMessage('商品标题不能为空'),
    body('category').trim().notEmpty().withMessage('分类不能为空'),
    body('price').isFloat({ min: 0.01 }).withMessage('价格必须大于0'),
  ],
  validate,
  tradeController.generateDescription
)

// DELETE /api/trade/:id — 删除商品
router.delete('/:id', tradeController.deleteItem)

module.exports = router