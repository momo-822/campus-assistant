const { validationResult } = require('express-validator')
const response = require('../utils/response')

/**
 * 验证中间件 — 校验 express-validator 规则结果
 * 用法：router.post('/path', [body('name').notEmpty()], validate, controller)
 */
function validate(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const msgs = errors.array().map((e) => ({ field: e.path, message: e.msg }))
    return res.status(400).json(response.badRequest('请求参数校验失败', msgs))
  }
  next()
}

module.exports = { validate }