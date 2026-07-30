/**
 * 统一响应格式工具
 */

/** 成功响应 */
function success(data = null, message = '操作成功') {
  return { success: true, code: 200, message, data }
}

/** 创建成功（201） */
function created(data = null, message = '创建成功') {
  return { success: true, code: 201, message, data }
}

/** 请求错误（400） */
function badRequest(message = '请求参数错误', errors = null) {
  return { success: false, code: 400, message, errors }
}

/** 未授权（401） */
function unauthorized(message = '未登录或登录已过期') {
  return { success: false, code: 401, message }
}

/** 禁止访问（403） */
function forbidden(message = '无权限访问') {
  return { success: false, code: 403, message }
}

/** 资源未找到（404） */
function notFound(message = '资源未找到') {
  return { success: false, code: 404, message }
}

/** 服务器错误（500） */
function serverError(message = '服务器内部错误') {
  return { success: false, code: 500, message }
}

/** 分页数据 */
function paginated(list, total, page, pageSize) {
  return {
    success: true,
    code: 200,
    data: {
      list,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    },
  }
}

module.exports = {
  success,
  created,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  serverError,
  paginated,
}