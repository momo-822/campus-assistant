const express = require('express')
const { body } = require('express-validator')
const router = express.Router()
const authController = require('../controllers/authController')
const { validate } = require('../middleware/validate')
const { requiredAuth } = require('../middleware/auth')

// POST /api/auth/register — 注册
router.post(
  '/register',
  [
    body('username').trim().notEmpty().withMessage('用户名不能为空'),
    body('password').isLength({ min: 6 }).withMessage('密码至少6位'),
    body('email').optional().isEmail().withMessage('邮箱格式不正确'),
  ],
  validate,
  authController.register
)

// POST /api/auth/login — 登录
router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空'),
  ],
  validate,
  authController.login
)

// GET /api/auth/profile — 获取个人信息
router.get('/profile', requiredAuth, authController.getProfile)

module.exports = router