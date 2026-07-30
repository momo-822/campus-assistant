import { get, post, del, type ApiResponse } from './request'

// ========== 类型定义 ==========

export interface FavoriteData {
  itemIds: number[]
  postIds: number[]
}

// ========== 后端原始响应类型 ==========

interface BackendFavorite {
  id: number
  target_type: 'trade' | 'review' | 'lost_found'
  target_id: number
}

// ========== 接口 ==========

/** 获取收藏列表 */
export async function getFavorites(userId = 1): Promise<ApiResponse<FavoriteData>> {
  const res = await get<BackendFavorite[]>('/favorite', { userId })
  if (res.success && res.data) {
    const data: FavoriteData = { itemIds: [], postIds: [] }
    res.data.forEach((f) => {
      if (f.target_type === 'trade') data.itemIds.push(f.target_id)
      if (f.target_type === 'lost_found') data.postIds.push(f.target_id)
    })
    return { success: true, data }
  }
  return { success: true, data: { itemIds: [], postIds: [] } }
}

/** 收藏/取消收藏商品 */
export async function toggleFavoriteItem(id: number, userId = 1): Promise<ApiResponse<FavoriteData>> {
  // 先查是否已收藏
  const getRes = await get<BackendFavorite[]>('/favorite', { userId, targetType: 'trade' })
  const existing = getRes.data?.find((f) => f.target_id === id)

  if (existing) {
    // 取消收藏
    const res = await del<BackendFavorite[]>('/favorite', { userId, targetType: 'trade', targetId: id })
    if (res.success && res.data) {
      const data: FavoriteData = { itemIds: [], postIds: [] }
      res.data.forEach((f) => {
        if (f.target_type === 'trade') data.itemIds.push(f.target_id)
        if (f.target_type === 'lost_found') data.postIds.push(f.target_id)
      })
      return { success: true, data, message: '已取消收藏' }
    }
    return { success: false, message: '操作失败' }
  }

  // 添加收藏
  const res = await post<BackendFavorite[]>('/favorite', { user_id: userId, target_type: 'trade', target_id: id })
  if (res.success && res.data) {
    const data: FavoriteData = { itemIds: [], postIds: [] }
    res.data.forEach((f) => {
      if (f.target_type === 'trade') data.itemIds.push(f.target_id)
      if (f.target_type === 'lost_found') data.postIds.push(f.target_id)
    })
    return { success: true, data, message: '已收藏' }
  }
  // 如果已收藏（后端返回 400），当作切换
  if (res.message === '已收藏') {
    return toggleFavoriteItem(id, userId)
  }
  return { success: false, message: '操作失败' }
}

/** 收藏/取消收藏帖子 */
export async function toggleFavoritePost(id: number, userId = 1): Promise<ApiResponse<FavoriteData>> {
  const getRes = await get<BackendFavorite[]>('/favorite', { userId, targetType: 'lost_found' })
  const existing = getRes.data?.find((f) => f.target_id === id)

  if (existing) {
    const res = await del<BackendFavorite[]>('/favorite', { userId, targetType: 'lost_found', targetId: id })
    if (res.success && res.data) {
      const data: FavoriteData = { itemIds: [], postIds: [] }
      res.data.forEach((f) => {
        if (f.target_type === 'trade') data.itemIds.push(f.target_id)
        if (f.target_type === 'lost_found') data.postIds.push(f.target_id)
      })
      return { success: true, data, message: '已取消收藏' }
    }
    return { success: false, message: '操作失败' }
  }

  const res = await post<BackendFavorite[]>('/favorite', { user_id: userId, target_type: 'lost_found', target_id: id })
  if (res.success && res.data) {
    const data: FavoriteData = { itemIds: [], postIds: [] }
    res.data.forEach((f) => {
      if (f.target_type === 'trade') data.itemIds.push(f.target_id)
      if (f.target_type === 'lost_found') data.postIds.push(f.target_id)
    })
    return { success: true, data, message: '已收藏' }
  }
  if (res.message === '已收藏') {
    return toggleFavoritePost(id, userId)
  }
  return { success: false, message: '操作失败' }
}

/** 获取收藏商品ID列表 */
export async function getFavoriteItemIds(userId = 1): Promise<ApiResponse<number[]>> {
  const res = await get<BackendFavorite[]>('/favorite', { userId, targetType: 'trade' })
  if (res.success && res.data) {
    return { success: true, data: res.data.map((f) => f.target_id) }
  }
  return { success: true, data: [] }
}

/** 获取收藏帖子ID列表 */
export async function getFavoritePostIds(userId = 1): Promise<ApiResponse<number[]>> {
  const res = await get<BackendFavorite[]>('/favorite', { userId, targetType: 'lost_found' })
  if (res.success && res.data) {
    return { success: true, data: res.data.map((f) => f.target_id) }
  }
  return { success: true, data: [] }
}