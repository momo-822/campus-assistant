import { useEffect, useState } from 'react'
import { useSearch } from '../context/SearchContext'
import { canteens as defaultCanteens, type Review } from '../mock'
import StarRating from '../components/StarRating'
import ReviewForm from '../components/ReviewForm'
import SkeletonCard from '../components/SkeletonCard'
import type { ReviewFormData } from '../components/ReviewForm'
import { showToast } from '../components/Toast'
import {
  getCanteens,
  getCanteenStats,
  getReviewsByCanteen,
  searchReviews,
  addReview,
  likeReview,
  updateReview,
  deleteReview,
  getReviewSummary,
  setForceApiError,
  type CanteenInfo,
  type CanteenStats,
  type ReviewSummary,
} from '../api'

export default function CanteenPage() {
  const { query } = useSearch()

  const [canteenList, setCanteenList] = useState<CanteenInfo[]>(defaultCanteens)
  const [canteenStats, setCanteenStats] = useState<CanteenStats[]>([])
  const [selectedId, setSelectedId] = useState<number>(1)
  const [reviewList, setReviewList] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formVisible, setFormVisible] = useState(false)

  // AI 总结状态
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  // 分页状态
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)

  // 编辑状态
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editRating, setEditRating] = useState(0)
  const [editContent, setEditContent] = useState('')
  const [editUser, setEditUser] = useState('')
  const [editUpdating, setEditUpdating] = useState(false)

  // 删除确认状态
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteUser, setDeleteUser] = useState('')
  const [deleteUpdating, setDeleteUpdating] = useState(false)

  // 检查 URL 参数：?error=true 触发错误模拟
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setForceApiError(params.get('error') === 'true')
  }, [])

  // 加载食堂列表 + 统计数据
  const refreshStats = () => {
    getCanteenStats().then((res) => {
      if (res.data) setCanteenStats(res.data)
    }).catch(() => {})
  }

  useEffect(() => {
    getCanteens().then((res) => {
      if (res.data) setCanteenList(res.data)
    }).catch(() => {})
    refreshStats()
  }, [])

  // 加载评价（支持分页）
  const loadReviews = async (pageNum = 1, append = false) => {
    setError(null)
    if (append) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }

    try {
      let res
      if (query.trim()) {
        res = await searchReviews(query, pageNum, 10)
      } else {
        res = await getReviewsByCanteen(selectedId, pageNum, 10)
      }

      if (res.data) {
        if (append) {
          setReviewList((prev) => [...prev, ...res.data])
        } else {
          setReviewList(res.data)
        }
        setTotalPages(res.totalPages || 1)
        setPage(pageNum)
      }
    } catch (e: any) {
      setError(e.message || '加载失败')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // 加载 AI 评价总结
  const loadSummary = async () => {
    if (query.trim()) {
      setReviewSummary(null)
      return
    }
    setSummaryLoading(true)
    try {
      const res = await getReviewSummary(selectedId)
      if (res.data) {
        setReviewSummary(res.data)
      }
    } catch {
      // 静默失败，不影响主流程
    } finally {
      setSummaryLoading(false)
    }
  }

  // 当搜索词或选中食堂变化时，重置到第一页
  useEffect(() => {
    setPage(1)
    setTotalPages(1)
    setEditingId(null)
    setDeletingId(null)
    loadReviews(1)
    loadSummary()
  }, [query, selectedId])

  const selectedCanteen = canteenList.find((c) => c.id === selectedId)
  const selectedStats = canteenStats.find((s) => s.id === selectedId)

  // 食堂图标（根据名称动态映射）
  const getCanteenIcon = (name: string): string => {
    if (name.includes('东区')) return '🍚'
    if (name.includes('西区')) return '🍜'
    if (name.includes('民族')) return '🥟'
    if (name.includes('清真')) return '🥗'
    if (name.includes('教职工')) return '🍽️'
    return '🍽️'
  }

  // 刷新所有数据（评价 + 统计 + AI 总结）
  const refreshAll = () => {
    refreshStats()
    loadSummary()
  }

  // 发布评价
  const handleSubmitReview = async (data: ReviewFormData) => {
    setSubmitting(true)
    const res = await addReview({
      canteenId: selectedId,
      content: data.content,
      rating: data.rating,
      user: data.user,
    })
    setSubmitting(false)
    if (res.success && res.data) {
      setReviewList(res.data)
      setFormVisible(false)
      setPage(1)
      setTotalPages(1)
      refreshAll()
      showToast('评价发布成功！', 'success')
    }
  }

  // 点赞
  const handleLike = async (id: number) => {
    const res = await likeReview(id)
    if (res.data) { setReviewList(res.data); refreshAll() }
  }

  // 开始编辑
  const startEdit = (review: Review) => {
    setEditingId(review.id)
    setEditRating(review.rating)
    setEditContent(review.content)
    setEditUser(review.user)
    setDeletingId(null)
  }

  // 取消编辑
  const cancelEdit = () => {
    setEditingId(null)
    setEditRating(0)
    setEditContent('')
    setEditUser('')
  }

  // 提交编辑
  const handleUpdate = async () => {
    if (!editContent.trim()) {
      showToast('评价内容不能为空', 'error')
      return
    }
    if (editRating < 1) {
      showToast('请给个评分', 'error')
      return
    }
    setEditUpdating(true)
    const res = await updateReview(editingId!, {
      user: editUser,
      rating: editRating,
      content: editContent.trim(),
    })
    setEditUpdating(false)
    if (res.success && res.data) {
      setReviewList(res.data)
      cancelEdit()
      refreshAll()
      showToast('评价更新成功！', 'success')
    } else {
      showToast(res.message || '更新失败', 'error')
    }
  }

  // 确认删除
  const confirmDelete = (review: Review) => {
    setDeletingId(review.id)
    setDeleteUser(review.user)
    setEditingId(null)
  }

  // 取消删除
  const cancelDelete = () => {
    setDeletingId(null)
    setDeleteUser('')
  }

  // 执行删除
  const handleDelete = async () => {
    setDeleteUpdating(true)
    const res = await deleteReview(deletingId!, deleteUser)
    setDeleteUpdating(false)
    if (res.success && res.data) {
      setReviewList(res.data)
      cancelDelete()
      refreshAll()
      showToast('评价已删除', 'success')
    } else {
      showToast(res.message || '删除失败', 'error')
    }
  }

  // 加载更多
  const handleLoadMore = () => {
    if (!loadingMore && page < totalPages) {
      loadReviews(page + 1, true)
    }
  }

  const hasMore = page < totalPages

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">食堂点评</h1>
        <p className="text-sm text-gray-500 mb-6">
          {loading ? '加载中...' : error ? '加载失败' : query ? `搜索 "${query}" 的结果` : '看看同学们对食堂的评价吧'}
        </p>

        {/* 食堂 Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {canteenList.map((c) => {
            const stat = canteenStats.find((s) => s.id === c.id)
            return (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedId(c.id)
                  setFormVisible(false)
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedId === c.id
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-pink-300 hover:text-pink-700'
                }`}
              >
                <span className="text-lg">{getCanteenIcon(c.name)}</span>
                <span>{c.name}</span>
                {stat && (
                  <span className={`text-xs ml-1 ${selectedId === c.id ? 'text-pink-200' : 'text-gray-400'}`}>
                    {stat.avg_rating}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* 当前食堂概况 */}
        {selectedCanteen && !query && !error && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{getCanteenIcon(selectedCanteen.name)}</span>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedCanteen.name}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedCanteen.type} · 营业时间 {selectedCanteen.hours}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-pink-700">
                    {selectedStats ? selectedStats.avg_rating : '-'}
                  </p>
                  <p className="text-xs text-gray-400">综合评分</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-pink-700">
                    {selectedStats ? selectedStats.review_count : reviewList.length}
                  </p>
                  <p className="text-xs text-gray-400">评价数</p>
                </div>
                <button
                  onClick={() => setFormVisible(!formVisible)}
                  className="px-4 py-2 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700 transition-colors"
                >
                  {formVisible ? '收起' : '写评价'}
                </button>
              </div>
            </div>

            {/* 发布评价表单 */}
            {formVisible && (
              <ReviewForm onSubmit={handleSubmitReview} submitting={submitting} />
            )}
          </div>
        )}

        {/* AI 评价总结 */}
        {!query && !error && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
            {/* 头部 */}
            <div className="bg-gradient-to-r from-pink-600 to-pink-500 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                <span className="text-white font-semibold text-sm">AI 评价总结</span>
              </div>
              {reviewSummary && (
                <button
                  onClick={loadSummary}
                  disabled={summaryLoading}
                  className="text-xs text-pink-200 hover:text-white transition-colors flex items-center gap-1 disabled:opacity-50"
                  title="重新生成"
                >
                  <span className={`inline-block ${summaryLoading ? 'animate-spin' : ''}`}>🔄</span>
                  <span>刷新</span>
                </button>
              )}
            </div>

            {/* 内容 */}
            <div className="px-5 py-4">
              {/* Loading */}
              {summaryLoading && !reviewSummary && (
                <div className="flex items-center gap-3 py-4">
                  <div className="w-5 h-5 border-2 border-pink-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-400">AI 正在分析评价数据...</span>
                </div>
              )}

              {/* 有数据 */}
              {reviewSummary && reviewSummary.total_reviews > 0 && (
                <div className="space-y-4">
                  {/* 总结文本 */}
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-100">
                    <p className="text-sm text-gray-700 leading-relaxed">{reviewSummary.summary_text}</p>
                  </div>

                  {/* 评分分布 */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">评分分布</p>
                    <div className="space-y-1.5">
                      {reviewSummary.rating_bars.map((bar) => (
                        <div key={bar.rating} className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-6 text-right shrink-0">{bar.rating}星</span>
                          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                bar.rating >= 4 ? 'bg-green-400' : bar.rating >= 3 ? 'bg-yellow-400' : 'bg-red-400'
                              }`}
                              style={{ width: `${bar.percent}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-10 text-right shrink-0">{bar.count}条</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 关键词标签 */}
                  {reviewSummary.common_keywords.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">高频关键词</p>
                      <div className="flex flex-wrap gap-1.5">
                        {reviewSummary.common_keywords.map((word) => {
                          const isPositive = ['好吃','美味','不错','很棒','推荐','正宗','实惠','丰富','新鲜','给力','满意','喜欢','赞','好喝','值得','划算','卫生','干净','精致','可口','浓郁','份量足','量大','便宜','好评','优秀','过瘾','爽','香','绝'].includes(word)
                          const isNegative = ['难吃','一般','差','不好','失望','贵','油腻','咸','淡','少','慢','差劲','不行','太差','糟糕','不新鲜','不干净'].includes(word)
                          return (
                            <span
                              key={word}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                                isPositive
                                  ? 'bg-green-100 text-green-700'
                                  : isNegative
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}
                            >
                              {word}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* 时间戳 */}
                  <p className="text-xs text-gray-400 text-right">
                    分析于 {new Date(reviewSummary.generated_at).toLocaleString('zh-CN')}
                  </p>
                </div>
              )}

              {/* 无评价 */}
              {reviewSummary && reviewSummary.total_reviews === 0 && (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-400">暂无评价数据可供分析</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 评价列表 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            {error ? '加载失败' : query ? '搜索结果' : '最新评价'}
            {!query && !error && (
              <span className="text-sm font-normal text-gray-400 ml-2">
                ({selectedStats ? selectedStats.review_count : reviewList.length} 条)
              </span>
            )}
          </h2>

          {/* Loading 状态 */}
          {loading && (
            <>
              <div className="flex items-center justify-center mb-4">
                <div className="w-6 h-6 border-2 border-pink-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-400 ml-3">加载中...</span>
              </div>
              <SkeletonCard count={3} layout="list" showImage={false} />
            </>
          )}

          {/* Error 状态 */}
          {!loading && error && (
            <div className="text-center py-16 bg-white rounded-2xl border border-red-100">
              <p className="text-5xl mb-4">😵</p>
              <p className="text-base font-medium text-gray-900 mb-2">加载失败</p>
              <p className="text-sm text-gray-500 mb-6">{error}</p>
              <button
                onClick={() => loadReviews(1)}
                className="px-6 py-2.5 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700 transition-colors shadow-md hover:shadow-lg"
              >
                🔄 重新加载
              </button>
            </div>
          )}

          {/* Success 状态 */}
          {!loading && !error && reviewList.length > 0 && (
            <>
              <div className="space-y-3">
                {reviewList.map((r) => (
                  <div key={r.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    {/* 头部：用户信息 + 时间 + 操作按钮 */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900">{r.user}</span>
                        <StarRating rating={r.rating} size="sm" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{r.time}</span>
                        {/* 编辑按钮 */}
                        {editingId !== r.id && deletingId !== r.id && (
                          <>
                            <button
                              onClick={() => startEdit(r)}
                              className="text-xs text-gray-400 hover:text-blue-500 transition-colors p-1"
                              title="编辑评价"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => confirmDelete(r)}
                              className="text-xs text-gray-400 hover:text-red-500 transition-colors p-1"
                              title="删除评价"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 搜索结果显示所属食堂 */}
                    {r.canteenName && query && (
                      <p className="text-xs text-pink-500 mb-1">📍 {r.canteenName}</p>
                    )}

                    {/* 编辑模式：内联编辑表单 */}
                    {editingId === r.id ? (
                      <div className="border-2 border-pink-200 rounded-xl p-4 bg-pink-50/50 mb-3">
                        <p className="text-xs text-pink-600 font-medium mb-3">✏️ 编辑评价</p>
                        <div className="space-y-3">
                          {/* 评分 */}
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">评分：</span>
                            <StarRating
                              rating={editRating}
                              size="md"
                              interactive
                              onChange={(v) => setEditRating(v)}
                            />
                            <span className="text-sm text-gray-400">
                              {editRating > 0 ? `${editRating} 分` : '点击评分'}
                            </span>
                          </div>
                          {/* 内容 */}
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value.slice(0, 200))}
                            rows={3}
                            maxLength={200}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                          />
                          <p className="text-xs text-gray-400 text-right -mt-2">{editContent.length}/200</p>
                          {/* 操作按钮 */}
                          <div className="flex gap-2">
                            <button
                              onClick={handleUpdate}
                              disabled={editUpdating}
                              className="px-4 py-2 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700 transition-colors disabled:opacity-60"
                            >
                              {editUpdating ? '保存中...' : '保存修改'}
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={editUpdating}
                              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* 正常显示内容 */
                      <>
                        <p className="text-sm text-gray-700 leading-relaxed mb-3">{r.content}</p>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => handleLike(r.id)}
                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-pink-600 transition-colors"
                          >
                            <span className="text-base">👍</span>
                            <span>有帮助 ({r.likes})</span>
                          </button>
                        </div>
                      </>
                    )}

                    {/* 删除确认弹窗 */}
                    {deletingId === r.id && (
                      <div className="border-2 border-red-200 rounded-xl p-4 bg-red-50/50 mt-3">
                        <p className="text-sm text-red-700 font-medium mb-2">⚠️ 确认删除这条评价？</p>
                        <p className="text-xs text-red-500 mb-3">删除后不可恢复</p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleDelete}
                            disabled={deleteUpdating}
                            className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60"
                          >
                            {deleteUpdating ? '删除中...' : '确认删除'}
                          </button>
                          <button
                            onClick={cancelDelete}
                            disabled={deleteUpdating}
                            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 分页：加载更多 */}
              {hasMore && (
                <div className="text-center mt-6">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 bg-white border border-pink-200 text-pink-600 rounded-xl text-sm font-medium hover:bg-pink-50 hover:border-pink-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-pink-600 border-t-transparent rounded-full animate-spin" />
                        加载中...
                      </span>
                    ) : (
                      `加载更多（${page}/${totalPages}）`
                    )}
                  </button>
                </div>
              )}
            </>
          )}

          {/* 空数据状态 */}
          {!loading && !error && reviewList.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <p className="text-4xl mb-3">{query ? '🔍' : '📝'}</p>
              <p className="text-sm text-gray-400">
                {query ? '未找到相关评价' : '还没有评价，快来写第一条吧！'}
              </p>
              {!query && (
                <button
                  onClick={() => setFormVisible(true)}
                  className="mt-3 px-4 py-2 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700 transition-colors"
                >
                  写评价
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}