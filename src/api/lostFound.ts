import { get, post, put, del, formatTime, type ApiResponse } from './request'
import type { LostFoundPost } from '../mock'

// ========== 类型定义 ==========

export interface AddPostParams {
  type: 'lost' | 'found'
  title: string
  description: string
  location: string
  user: string
  contact: string
}

export interface UpdatePostParams {
  user: string
  title?: string
  description?: string
  location?: string
  contact?: string
}

// ========== 后端原始响应类型 ==========

interface BackendPost {
  id: number
  type: 'lost' | 'found'
  title: string
  description: string | null
  location: string | null
  contact: string
  user: string
  status: 'pending' | 'resolved'
  created_at: string
}

/** 后端状态 → 前端状态 */
const STATUS_MAP: Record<string, '进行中' | '已找回' | '已归还'> = {
  pending: '进行中',
  resolved: '已找回',
}

/** 后端帖子 → 前端帖子 */
function mapPost(p: BackendPost): LostFoundPost {
  return {
    id: p.id,
    type: p.type,
    title: p.title,
    description: p.description || '',
    location: p.location || '',
    user: p.user,
    contact: p.contact,
    time: formatTime(p.created_at),
    status: STATUS_MAP[p.status] || '进行中',
  }
}

// ========== 接口 ==========

/** 获取帖子列表 */
export async function getPosts(): Promise<ApiResponse<LostFoundPost[]>> {
  const res = await get<BackendPost[]>('/lost-found')
  if (res.success && res.data) {
    return { success: true, data: res.data.map(mapPost) }
  }
  return { success: false, message: res.message }
}

/** 按类型筛选 */
export async function getPostsByType(type: 'lost' | 'found' | 'all'): Promise<ApiResponse<LostFoundPost[]>> {
  const res = await get<BackendPost[]>('/lost-found', { type: type === 'all' ? undefined : type })
  if (res.success && res.data) {
    return { success: true, data: res.data.map(mapPost) }
  }
  return { success: false, message: res.message }
}

/** 搜索帖子（本地过滤） */
export async function searchPosts(keyword: string): Promise<ApiResponse<LostFoundPost[]>> {
  const res = await get<BackendPost[]>('/lost-found')
  if (res.success && res.data) {
    const filtered = res.data.filter(
      (p) =>
        p.title.includes(keyword) ||
        (p.description || '').includes(keyword) ||
        (p.location || '').includes(keyword) ||
        p.user.includes(keyword)
    )
    return { success: true, data: filtered.map(mapPost) }
  }
  return { success: false, message: res.message }
}

/** 发布帖子 */
export async function addPost(params: AddPostParams): Promise<ApiResponse<LostFoundPost[]>> {
  const res = await post<BackendPost[]>('/lost-found', params)
  if (res.success && res.data) {
    return { success: true, data: res.data.map(mapPost), message: res.message }
  }
  return { success: false, message: res.message }
}

/** 获取单个帖子详情 */
export async function getPostDetail(id: number): Promise<ApiResponse<LostFoundPost>> {
  const res = await get<BackendPost>(`/lost-found/${id}`)
  if (res.success && res.data) {
    return { success: true, data: mapPost(res.data) }
  }
  return { success: false, message: res.message }
}

/** 编辑帖子 */
export async function updatePost(id: number, params: UpdatePostParams): Promise<ApiResponse<LostFoundPost[]>> {
  const body: Record<string, unknown> = { user: params.user }
  if (params.title !== undefined) body.title = params.title
  if (params.description !== undefined) body.description = params.description
  if (params.location !== undefined) body.location = params.location
  if (params.contact !== undefined) body.contact = params.contact

  const res = await put<BackendPost[]>(`/lost-found/${id}`, body)
  if (res.success && res.data) {
    return { success: true, data: res.data.map(mapPost), message: res.message }
  }
  return { success: false, message: res.message }
}

/** 更新状态（已找回/已归还） */
export async function updatePostStatus(id: number, _status: '已找回' | '已归还'): Promise<ApiResponse<LostFoundPost[]>> {
  const res = await put<BackendPost[]>(`/lost-found/${id}/resolve`)
  if (res.success && res.data) {
    return { success: true, data: res.data.map(mapPost), message: res.message }
  }
  return { success: false, message: res.message }
}

/** AI 生成失物/招领描述 */
export interface GenerateLostFoundDescriptionParams {
  type: 'lost' | 'found'
  title: string
  location?: string
}

export interface GeneratedLostFoundDescription {
  description: string
  type: 'lost' | 'found'
  title: string
  location: string
  generated_at: string
}

export async function generateLostFoundDescription(params: GenerateLostFoundDescriptionParams): Promise<ApiResponse<GeneratedLostFoundDescription>> {
  const res = await post<GeneratedLostFoundDescription>('/lost-found/generate-description', {
    type: params.type,
    title: params.title,
    location: params.location || undefined,
  })
  return res
}

/** 智能匹配推荐 */
export interface SmartMatchItem {
  id: number
  type: 'lost' | 'found'
  title: string
  description: string | null
  location: string | null
  contact: string
  user: string
  score: number
  created_at: string
  match_reasons: string[]
}

export interface SmartMatchResult {
  source_type: 'lost' | 'found'
  target_type: 'lost' | 'found'
  total_candidates: number
  matches: SmartMatchItem[]
}

export async function smartMatch(params: { type: 'lost' | 'found'; title: string; description?: string; location?: string }): Promise<ApiResponse<SmartMatchResult>> {
  const query: Record<string, string> = { type: params.type, title: params.title }
  if (params.description) query.description = params.description
  if (params.location) query.location = params.location
  const res = await get<SmartMatchResult>('/lost-found/smart-match', query)
  return res
}

/** 删除帖子 */
export async function deletePost(id: number, user?: string): Promise<ApiResponse<LostFoundPost[]>> {
  const res = await del<BackendPost[]>(`/lost-found/${id}`, { user: user || '匿名' })
  if (res.success && res.data) {
    return { success: true, data: res.data.map(mapPost), message: res.message }
  }
  return { success: false, message: res.message }
}