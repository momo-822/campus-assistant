import { get, post, put, del, formatTime, maybeError, type ApiResponse } from './request'
import { canteens as defaultCanteens, type Review, type CanteenInfo } from '../mock'

// ========== 类型定义 ==========

export { type CanteenInfo } from '../mock'

export interface AddReviewParams {
  canteenId: number
  content: string
  rating: number
  user: string
}

/** 分页数据格式 */
export interface PaginatedData<T> {
  list: T
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

/** 食堂统计数据 */
export interface CanteenStats {
  id: number
  name: string
  type: string
  hours: string
  avg_rating: number
  review_count: number
}

/** AI 评价总结 */
export interface ReviewSummary {
  total_reviews: number
  avg_rating: number
  rating_distribution: Record<'1' | '2' | '3' | '4' | '5', number>
  rating_bars: Array<{ rating: number; count: number; percent: number }>
  sentiment: { positive: number; neutral: number; negative: number }
  common_keywords: string[]
  summary_text: string
  generated_at: string
}

/** 食堂详情（含统计） */
export interface CanteenDetail extends CanteenInfo {
  avg_rating: number
  review_count: number
}

// ========== 后端原始响应类型 ==========

interface BackendCanteen {
  id: number
  name: string
  type: string
  hours: string
}

interface BackendReview {
  id: number
  canteen_id: number
  user: string
  rating: number
  content: string
  likes: number
  created_at: string
  canteen_name?: string // 搜索时附带
}

/** 后端评价 → 前端评价 */
function mapReview(r: BackendReview): Review {
  return {
    id: r.id,
    canteenId: r.canteen_id,
    user: r.user,
    rating: r.rating,
    content: r.content,
    likes: r.likes,
    time: formatTime(r.created_at),
    canteenName: r.canteen_name,
  }
}

// ========== 接口 ==========

/** 获取食堂列表 */
export async function getCanteens(): Promise<ApiResponse<CanteenInfo[]>> {
  const res = await get<BackendCanteen[]>('/canteen')
  if (res.success && res.data) {
    return { success: true, data: res.data }
  }
  return { success: true, data: defaultCanteens }
}

/** 获取食堂统计数据 */
export async function getCanteenStats(): Promise<ApiResponse<CanteenStats[]>> {
  const res = await get<CanteenStats[]>('/canteen/stats')
  if (res.success && res.data) {
    return { success: true, data: res.data }
  }
  return { success: false, message: res.message }
}

/** 获取 AI 评价总结 */
export async function getReviewSummary(canteenId: number): Promise<ApiResponse<ReviewSummary>> {
  maybeError()
  const res = await get<ReviewSummary>('/canteen/reviews/summary', { canteenId })
  if (res.success && res.data) {
    return { success: true, data: res.data }
  }
  return { success: false, message: res.message }
}

/** 获取单个食堂详情 */
export async function getCanteenDetail(id: number): Promise<ApiResponse<CanteenDetail>> {
  const res = await get<CanteenDetail>(`/canteen/${id}`)
  if (res.success && res.data) {
    const d = res.data
    return {
      success: true,
      data: {
        id: d.id,
        name: d.name,
        type: d.type,
        hours: d.hours,
        avg_rating: d.avg_rating,
        review_count: d.review_count,
      },
    }
  }
  return { success: false, message: res.message }
}

/** 分页获取评价 */
export async function getReviewsByCanteen(
  canteenId: number,
  page = 1,
  pageSize = 10
): Promise<ApiResponse<Review[]> & { total?: number; totalPages?: number }> {
  maybeError()
  const res = await get<PaginatedData<BackendReview[]>>('/canteen/reviews', { canteenId, page, pageSize })
  if (res.success && res.data) {
    return {
      success: true,
      data: res.data.list.map(mapReview),
      total: res.data.pagination.total,
      totalPages: res.data.pagination.totalPages,
    }
  }
  return { success: false, message: res.message }
}

/** 搜索评价（分页） */
export async function searchReviews(
  keyword: string,
  page = 1,
  pageSize = 10
): Promise<ApiResponse<Review[]> & { total?: number; totalPages?: number }> {
  maybeError()
  const res = await get<PaginatedData<BackendReview[]>>('/canteen/reviews/search', { q: keyword, page, pageSize })
  if (res.success && res.data) {
    return {
      success: true,
      data: res.data.list.map(mapReview),
      total: res.data.pagination.total,
      totalPages: res.data.pagination.totalPages,
    }
  }
  return { success: false, message: res.message }
}

/** 新增评价 */
export async function addReview(params: AddReviewParams): Promise<ApiResponse<Review[]>> {
  const res = await post<BackendReview[]>('/canteen/reviews', {
    canteenId: params.canteenId,
    rating: params.rating,
    content: params.content,
    user: params.user,
  })
  if (res.success && res.data) {
    return { success: true, data: res.data.map(mapReview), message: res.message }
  }
  return { success: false, message: res.message }
}

/** 点赞评价 */
export async function likeReview(id: number): Promise<ApiResponse<Review[]>> {
  const res = await post<BackendReview[]>(`/canteen/reviews/${id}/like`)
  if (res.success && res.data) {
    return { success: true, data: res.data.map(mapReview) }
  }
  return { success: false, message: res.message }
}

/** 编辑评价（可部分更新评分/内容） */
export async function updateReview(
  id: number,
  params: { user: string; rating?: number; content?: string }
): Promise<ApiResponse<Review[]>> {
  const res = await put<BackendReview[]>(`/canteen/reviews/${id}`, params)
  if (res.success && res.data) {
    return { success: true, data: res.data.map(mapReview), message: res.message }
  }
  return { success: false, message: res.message }
}

/** 删除评价 */
export async function deleteReview(id: number, user?: string): Promise<ApiResponse<Review[]>> {
  const body = user ? { user } : undefined
  const res = await del<BackendReview[]>(`/canteen/reviews/${id}`, body as Record<string, string | number | undefined>)
  if (res.success && res.data) {
    return { success: true, data: res.data.map(mapReview), message: res.message }
  }
  return { success: false, message: res.message }
}