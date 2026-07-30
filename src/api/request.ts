// ========== API 基础封装 ==========

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

// ========== JWT Token 管理 ==========

const TOKEN_KEY = 'campus_auth_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// ========== 统一响应格式 ==========

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  total?: number
}

// ========== HTTP 请求封装 ==========

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  params?: Record<string, string | number | undefined>
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { method = 'GET', body, params } = options

  // 构建 URL
  let url = `${BASE_URL}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val))
      }
    })
    const qs = searchParams.toString()
    if (qs) url += `?${qs}`
  }

  // 构建请求头
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // 发送请求
  let res: Response
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (e: any) {
    return { success: false, message: '网络连接失败，请检查服务器是否启动' }
  }

  // 解析响应
  const json = await res.json().catch(() => ({ success: false, message: '服务器返回格式异常' }))

  if (!res.ok) {
    return {
      success: false,
      message: json.message || `请求失败 (${res.status})`,
      data: json.errors || undefined,
    }
  }

  // 后端返回格式：{ success, code, message, data }
  return {
    success: json.success !== false,
    data: json.data ?? undefined,
    message: json.message,
  }
}

// ========== 便捷方法 ==========

export function get<T>(endpoint: string, params?: Record<string, string | number | undefined>) {
  return request<T>(endpoint, { method: 'GET', params })
}

export function post<T>(endpoint: string, body?: unknown) {
  return request<T>(endpoint, { method: 'POST', body })
}

export function put<T>(endpoint: string, body?: unknown) {
  return request<T>(endpoint, { method: 'PUT', body })
}

export function del<T>(endpoint: string, paramsOrBody?: Record<string, string | number | undefined> | unknown) {
  return request<T>(endpoint, { method: 'DELETE', body: paramsOrBody })
}

// ========== 工具函数 ==========

/** 将 ISO 时间字符串转为相对时间（如"10分钟前"） */
export function formatTime(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr.replace(' ', 'T') + '+08:00').getTime()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}天前`
  return dateStr.slice(0, 10)
}

// ========== 错误模拟开关（用于作业展示） ==========

let _forceApiError = false

export function setForceApiError(val: boolean) {
  _forceApiError = val
}

export function getForceApiError() {
  return _forceApiError
}

export function maybeError(message = '服务器开小差了，请稍后重试'): boolean {
  if (_forceApiError) {
    throw new Error(message)
  }
  return false
}