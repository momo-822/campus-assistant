import { get, post, put, del, formatTime, maybeError, type ApiResponse } from './request'
import { categories as defaultCategories, type TradeItem } from '../mock'

// ========== 类型定义 ==========

export interface AddItemParams {
  title: string
  price: string
  originalPrice?: string
  category: string
  description: string
  user: string
}

export interface UpdateItemParams {
  user: string
  title?: string
  price?: string
  originalPrice?: string
  category?: string
  description?: string
}

// ========== 后端原始响应类型 ==========

interface BackendItem {
  id: number
  title: string
  category: string
  price: number
  original_price: number | null
  description: string | null
  user: string
  status: string
  created_at: string
}

/** 后端商品 → 前端商品 */
function mapItem(item: BackendItem): TradeItem {
  return {
    id: item.id,
    title: item.title,
    price: String(item.price),
    originalPrice: String(item.original_price ?? item.price),
    category: item.category,
    user: item.user,
    description: item.description || '',
    time: formatTime(item.created_at),
  }
}

// ========== 接口 ==========

/** 获取商品列表 */
export async function getItems(): Promise<ApiResponse<TradeItem[]>> {
  maybeError()
  const res = await get<BackendItem[]>('/trade')
  if (res.success && res.data) {
    return { success: true, data: res.data.map(mapItem) }
  }
  return { success: false, message: res.message }
}

/** 按分类筛选商品 */
export async function getItemsByCategory(category: string): Promise<ApiResponse<TradeItem[]>> {
  maybeError()
  const res = await get<BackendItem[]>('/trade', { category: category === '全部' ? undefined : category })
  if (res.success && res.data) {
    return { success: true, data: res.data.map(mapItem) }
  }
  return { success: false, message: res.message }
}

/** 搜索商品 */
export async function searchItems(keyword: string): Promise<ApiResponse<TradeItem[]>> {
  maybeError()
  const res = await get<BackendItem[]>('/trade/search', { q: keyword })
  if (res.success && res.data) {
    return { success: true, data: res.data.map(mapItem) }
  }
  return { success: false, message: res.message }
}

/** 发布商品 */
export async function addItem(params: AddItemParams): Promise<ApiResponse<TradeItem[]>> {
  const res = await post<BackendItem[]>('/trade', {
    title: params.title,
    category: params.category,
    price: Number(params.price),
    originalPrice: params.originalPrice ? Number(params.originalPrice) : undefined,
    description: params.description,
    user: params.user,
  })
  if (res.success && res.data) {
    return { success: true, data: res.data.map(mapItem), message: res.message }
  }
  return { success: false, message: res.message }
}

/** 获取单个商品详情 */
export async function getItemDetail(id: number): Promise<ApiResponse<TradeItem>> {
  maybeError()
  const res = await get<BackendItem>(`/trade/${id}`)
  if (res.success && res.data) {
    return { success: true, data: mapItem(res.data) }
  }
  return { success: false, message: res.message }
}

/** 编辑商品 */
export async function updateItem(id: number, params: UpdateItemParams): Promise<ApiResponse<TradeItem[]>> {
  const body: Record<string, unknown> = { user: params.user }
  if (params.title !== undefined) body.title = params.title
  if (params.category !== undefined) body.category = params.category
  if (params.price !== undefined) body.price = Number(params.price)
  if (params.originalPrice !== undefined) body.originalPrice = params.originalPrice ? Number(params.originalPrice) : null
  if (params.description !== undefined) body.description = params.description

  const res = await put<BackendItem[]>(`/trade/${id}`, body)
  if (res.success && res.data) {
    return { success: true, data: res.data.map(mapItem), message: res.message }
  }
  return { success: false, message: res.message }
}

/** 删除商品 */
export async function deleteItem(id: number, user?: string): Promise<ApiResponse<TradeItem[]>> {
  const res = await del<BackendItem[]>(`/trade/${id}`, { user: user || '匿名' })
  if (res.success && res.data) {
    return { success: true, data: res.data.map(mapItem), message: res.message }
  }
  return { success: false, message: res.message }
}

/** AI 生成商品描述 */
export interface GenerateDescriptionParams {
  title: string
  category: string
  price: string
  originalPrice?: string
}

export interface GeneratedDescription {
  description: string
  title: string
  category: string
  price: number
  original_price: number | null
  generated_at: string
}

export async function generateDescription(params: GenerateDescriptionParams): Promise<ApiResponse<GeneratedDescription>> {
  const res = await post<GeneratedDescription>('/trade/generate-description', {
    title: params.title,
    category: params.category,
    price: Number(params.price),
    originalPrice: params.originalPrice ? Number(params.originalPrice) : undefined,
  })
  return res
}

/** 获取分类列表 */
export async function getCategories(): Promise<ApiResponse<string[]>> {
  maybeError()
  const res = await get<string[]>('/trade/categories')
  if (res.success && res.data) {
    return { success: true, data: res.data }
  }
  return { success: true, data: defaultCategories }
}