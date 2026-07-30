const response = require('../utils/response')
const logger = require('../utils/logger')

/** 全局错误处理中间件 */
function errorHandler(err, req, res, _next) {
  logger.error('未捕获错误', err)

  const statusCode = err.statusCode || 500
  const message = err.expose ? err.message : '服务器内部错误，请稍后重试'

  res.status(statusCode).json(
    statusCode === 500 ? response.serverError(message) : { success: false, code: statusCode, message }
  )
}

/** 404 处理中间件 */
function notFoundHandler(req, res) {
  res.status(404).json(response.notFound(`接口 ${req.method} ${req.originalUrl} 不存在`))
}

module.exports = { errorHandler, notFoundHandler }