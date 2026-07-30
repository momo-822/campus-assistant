import { post, get, setToken, clearToken, formatTime, type ApiResponse } from './request'

// ========== 类型定义 ==========

export interface LoginParams {
  username: string
  password: string
}

export interface RegisterParams {
  username: string
  email: string
  password: string
}

export interface UserInfo {
  id: number
  name: string
  studentId: string
  avatar: string
  email: string
}

// ========== 后端原始响应类型 ==========

interface BackendUser {
  id: number
  username: string
  nickname: string
  email: string | null
  avatar: string | null
  created_at: string
  token?: string
}

/** 后端用户 → 前端用户 */
function mapUser(u: BackendUser): UserInfo {
  return {
    id: u.id,
    name: u.nickname || u.username,
    studentId: '2024****',
    avatar: u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.nickname || u.username)}`,
    email: u.email || '',
  }
}

// ========== 接口 ==========

/** 登录 */
export async function login(params: LoginParams): Promise<ApiResponse<UserInfo>> {
  const res = await post<BackendUser>('/auth/login', params)
  if (res.success && res.data) {
    setToken(res.data.token!)
    return { success: true, data: mapUser(res.data), message: res.message }
  }
  return res as ApiResponse<UserInfo>
}

/** 注册 */
export async function register(params: RegisterParams): Promise<ApiResponse<null>> {
  const res = await post<BackendUser>('/auth/register', params)
  if (res.success && res.data) {
    setToken(res.data.token!)
    return { success: true, data: null, message: res.message }
  }
  return res as ApiResponse<null>
}

/** 获取当前用户信息 */
export async function getCurrentUser(): Promise<ApiResponse<UserInfo | null>> {
  const token = localStorage.getItem('campus_auth_token')
  if (!token) return { success: true, data: null }

  const res = await get<BackendUser>('/auth/profile')
  if (res.success && res.data) {
    return { success: true, data: mapUser(res.data) }
  }
  return { success: true, data: null }
}

/** 退出登录 */
export async function logout(): Promise<ApiResponse<null>> {
  clearToken()
  return { success: true, data: null, message: '已退出登录' }
}

/** 更新个人信息（后端暂未实现，本地模拟） */
export async function updateProfile(data: Partial<UserInfo>): Promise<ApiResponse<UserInfo>> {
  const current = await getCurrentUser()
  const merged = { ...current.data, ...data } as UserInfo
  return { success: true, data: merged, message: '更新成功' }
}