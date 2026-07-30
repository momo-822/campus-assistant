const express = require('express')
const { body } = require('express-validator')
const router = express.Router()
const favoriteController = require('../controllers/favoriteController')
const { validate } = require('../middleware/validate')

// GET /api/favorite — 获取收藏列表
router.get('/', favoriteController.getFavorites)

// POST /api/favorite — 添加收藏
router.post(
  '/',
  [
    body('target_type').isIn(['trade', 'review', 'lost_found']).withMessage('收藏类型不正确'),
    body('target_id').isInt().withMessage('目标ID必须是整数'),
  ],
  validate,
  favoriteController.addFavorite
)

// DELETE /api/favorite — 取消收藏
router.delete('/', favoriteController.removeFavorite)

module.exports = router