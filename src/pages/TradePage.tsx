import { useEffect, useState } from 'react'
import { useSearch } from '../context/SearchContext'
import { categories as defaultCategories, type TradeItem } from '../mock'
import StarRating from '../components/StarRating'
import SkeletonCard from '../components/SkeletonCard'
import { showToast } from '../components/Toast'
import {
  getItemsByCategory,
  searchItems,
  addItem,
  deleteItem,
  updateItem,
  getCategories,
  generateDescription,
  setForceApiError,
} from '../api'
import type { PublishFormData } from '../components/PublishForm'
import PublishForm from '../components/PublishForm'

export default function TradePage() {
  const { query } = useSearch()

  const [itemList, setItemList] = useState<TradeItem[]>([])
  const [categoryList, setCategoryList] = useState<string[]>(defaultCategories)
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [formVisible, setFormVisible] = useState(false)

  // 编辑弹窗状态
  const [editingItem, setEditingItem] = useState<TradeItem | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    price: '',
    originalPrice: '',
    category: '',
    description: '',
    user: '',
  })
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [deleteUser, setDeleteUser] = useState('')

  // 检查 URL 参数：?error=true 触发错误模拟
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('error') === 'true') {
      setForceApiError(true)
    } else {
      setForceApiError(false)
    }
  }, [])

  // 加载数据
  const loadItems = async () => {
    setError(null)
    if (query.trim()) {
      setLoading(true)
      try {
        const res = await searchItems(query)
        if (res.data) setItemList(res.data)
      } catch (e: any) {
        setError(e.message || '加载失败')
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(true)
      try {
        const res = await getItemsByCategory(selectedCategory)
        if (res.data) setItemList(res.data)
      } catch (e: any) {
        setError(e.message || '加载失败')
      } finally {
        setLoading(false)
      }
    }
  }

  // 初始化
  useEffect(() => {
    getCategories().then((res) => {
      if (res.data) setCategoryList(res.data)
    }).catch(() => {})
  }, [])

  // 加载数据（受搜索和分类影响）
  useEffect(() => {
    loadItems()
  }, [query, selectedCategory])

  // 发布商品
  const handlePublish = async (data: PublishFormData) => {
    setSubmitting(true)
    const res = await addItem({
      title: data.title,
      price: data.price,
      originalPrice: data.originalPrice || undefined,
      category: data.category,
      description: data.description,
      user: data.user,
    })
    setSubmitting(false)
    if (res.success && res.data) {
      setItemList(res.data)
      setFormVisible(false)
      showToast('发布成功！', 'success')
    }
  }

  // AI 生成商品描述
  const handleGenerateDescription = async (data: { title: string; category: string; price: string; originalPrice: string }) => {
    if (!data.title.trim() || !data.price) {
      showToast('请先填写商品标题和价格', 'error')
      return
    }
    setGenerating(true)
    const res = await generateDescription({
      title: data.title,
      category: data.category,
      price: data.price,
      originalPrice: data.originalPrice || undefined,
    })
    setGenerating(false)
    if (res.success && res.data) {
      // 通过自定义事件通知 PublishForm 更新描述
      window.dispatchEvent(new CustomEvent('ai-description', { detail: res.data.description }))
      showToast('AI 描述已生成，请查看下方文本框', 'success')
    } else {
      showToast(res.message || '生成失败，请重试', 'error')
    }
  }

  // 删除商品
  const handleDelete = async (id: number) => {
    if (!deleteUser.trim()) {
      showToast('请先输入你的昵称以确认身份', 'error')
      return
    }
    const res = await deleteItem(id, deleteUser.trim())
    if (res.data) {
      setItemList(res.data)
      setDeleteConfirmId(null)
      setDeleteUser('')
      showToast('删除成功！', 'success')
    } else {
      showToast(res.message || '删除失败，请确认昵称是否正确', 'error')
    }
  }

  // 打开编辑弹窗
  const openEdit = (item: TradeItem) => {
    setEditingItem(item)
    setEditForm({
      title: item.title,
      price: item.price,
      originalPrice: item.originalPrice,
      category: item.category,
      description: item.description,
      user: item.user,
    })
    setEditErrors({})
  }

  // 提交编辑
  const handleEditSubmit = async () => {
    if (!editingItem) return

    // 校验
    const errs: Record<string, string> = {}
    if (!editForm.title.trim()) errs.title = '请输入商品标题'
    if (!editForm.price || isNaN(Number(editForm.price)) || Number(editForm.price) <= 0) errs.price = '请输入有效价格'
    if (!editForm.user.trim()) errs.user = '请输入你的昵称'
    setEditErrors(errs)
    if (Object.keys(errs).length > 0) return

    setEditSubmitting(true)
    const res = await updateItem(editingItem.id, {
      user: editForm.user.trim(),
      title: editForm.title.trim(),
      price: editForm.price,
      originalPrice: editForm.originalPrice || undefined,
      category: editForm.category,
      description: editForm.description.trim(),
    })
    setEditSubmitting(false)

    if (res.success && res.data) {
      setItemList(res.data)
      setEditingItem(null)
      showToast('编辑成功！', 'success')
    } else {
      showToast(res.message || '编辑失败，请确认昵称是否正确', 'error')
    }
  }

  // 分类图标
  const categoryIcons: Record<string, string> = {
    '全部': '📦',
    '教材': '📚',
    '电子产品': '💻',
    '生活用品': '🏠',
    '其他': '🎯',
  }

  const filterCategories = categoryList.filter((c) => c !== '全部')

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* 标题区域 */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">二手交易</h1>
          <button
            onClick={() => setFormVisible(!formVisible)}
            className="px-4 py-2 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700 transition-colors flex items-center gap-1.5"
          >
            <span>＋</span>
            <span>{formVisible ? '收起' : '发布'}</span>
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          {loading ? '加载中...' : error ? '加载失败' : query ? `搜索 "${query}" 的结果` : '发现同学们的闲置好物'}
        </p>

        {/* 分类筛选 Tabs（仅在成功且无搜索时显示） */}
        {!query && !error && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categoryList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-pink-300 hover:text-pink-700'
                }`}
              >
                <span>{categoryIcons[cat] || '📦'}</span>
                <span>{cat}</span>
              </button>
            ))}
          </div>
        )}

        {/* 发布商品表单（独立组件） */}
        {formVisible && (
          <PublishForm
            categories={categoryList}
            onSubmit={handlePublish}
            submitting={submitting}
            onGenerateDescription={handleGenerateDescription}
            generating={generating}
          />
        )}

        {/* Loading 状态：骨架屏 + 加载动画 */}
        {loading && (
          <>
            <div className="flex items-center justify-center mb-4">
              <div className="w-6 h-6 border-2 border-pink-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-400 ml-3">加载中...</span>
            </div>
            <SkeletonCard count={6} layout="grid" showImage={true} />
          </>
        )}

        {/* Error 状态：错误提示 + 重试按钮 */}
        {!loading && error && (
          <div className="text-center py-16 bg-white rounded-2xl border border-red-100">
            <p className="text-5xl mb-4">😵</p>
            <p className="text-base font-medium text-gray-900 mb-2">加载失败</p>
            <p className="text-sm text-gray-500 mb-6">{error}</p>
            <button
              onClick={loadItems}
              className="px-6 py-2.5 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700 transition-colors shadow-md hover:shadow-lg"
            >
              🔄 重新加载
            </button>
          </div>
        )}

        {/* Success 状态：数据正常展示 */}
        {!loading && !error && itemList.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {itemList.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* 商品头图占位 */}
                <div className="h-32 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                  <span className="text-4xl opacity-60">
                    {item.category === '教材' ? '📚' : item.category === '电子产品' ? '💻' : item.category === '生活用品' ? '🏠' : '🎯'}
                  </span>
                </div>

                <div className="p-5">
                  {/* 标签行 */}
                  <div className="flex items-start justify-between mb-2">
                    <span className="px-2.5 py-0.5 bg-pink-50 text-pink-700 rounded-full text-xs font-medium">
                      {item.category}
                    </span>
                    <span className="text-xs text-gray-400">{item.time}</span>
                  </div>

                  {/* 标题 */}
                  <h3 className="text-base font-semibold text-gray-900 mb-1">{item.title}</h3>

                  {/* 描述（可展开） */}
                  <p className={`text-xs text-gray-500 mb-3 transition-all ${
                    expandedId === item.id ? '' : 'line-clamp-2'
                  }`}>
                    {item.description}
                  </p>
                  {item.description.length > 20 && (
                    <button
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      className="text-xs text-pink-600 hover:text-pink-700 mb-2 block"
                    >
                      {expandedId === item.id ? '收起' : '查看详情'}
                    </button>
                  )}

                  {/* 价格和卖家 */}
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <span className="text-xl font-bold text-red-500">¥{item.price}</span>
                      <span className="text-xs text-gray-400 line-through ml-2">¥{item.originalPrice}</span>
                    </div>
                    <span className="text-xs text-gray-400">👤 {item.user}</span>
                  </div>

                  {/* 信誉和操作 */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">卖家信誉</span>
                      <StarRating rating={4} size="sm" />
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEdit(item)}
                        className="text-xs text-blue-400 hover:text-blue-600 transition-colors"
                      >
                        ✏️ 编辑
                      </button>
                      <button
                        onClick={() => {
                          setDeleteConfirmId(item.id)
                          setDeleteUser('')
                        }}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                      >
                        🗑️ 删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 空数据状态 */}
        {!loading && !error && itemList.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-4xl mb-3">{query ? '🔍' : '📦'}</p>
            <p className="text-sm text-gray-400">
              {query ? '未找到相关商品' : `还没有商品，快来发布第一件闲置吧！`}
            </p>
            {!query && (
              <button
                onClick={() => setFormVisible(true)}
                className="mt-3 px-4 py-2 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700 transition-colors"
              >
                发布商品
              </button>
            )}
          </div>
        )}
      </div>

      {/* ========== 编辑弹窗 ========== */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setEditingItem(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900">编辑商品</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* 商品标题 */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">商品标题 *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => { setEditForm((p) => ({ ...p, title: e.target.value })); setEditErrors((p) => ({ ...p, title: '' })) }}
                  placeholder="例如：高等数学第七版"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors ${
                    editErrors.title ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {editErrors.title && <p className="text-xs text-red-500 mt-1">{editErrors.title}</p>}
              </div>

              {/* 分类 */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">分类</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                >
                  {filterCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* 价格行 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">售价（元）*</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => { setEditForm((p) => ({ ...p, price: e.target.value })); setEditErrors((p) => ({ ...p, price: '' })) }}
                    placeholder="例如：15"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors ${
                      editErrors.price ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {editErrors.price && <p className="text-xs text-red-500 mt-1">{editErrors.price}</p>}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">原价（元，可选）</label>
                  <input
                    type="number"
                    value={editForm.originalPrice}
                    onChange={(e) => setEditForm((p) => ({ ...p, originalPrice: e.target.value }))}
                    placeholder="例如：49"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              {/* 描述 */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">商品描述</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value.slice(0, 200) }))}
                  placeholder="描述商品成色、使用情况等..."
                  rows={3}
                  maxLength={200}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{editForm.description.length}/200</p>
              </div>

              {/* 昵称（用于身份验证） */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">你的昵称 *（用于验证身份）</label>
                <input
                  type="text"
                  value={editForm.user}
                  onChange={(e) => { setEditForm((p) => ({ ...p, user: e.target.value })); setEditErrors((p) => ({ ...p, user: '' })) }}
                  placeholder="输入发布时使用的昵称"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors ${
                    editErrors.user ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {editErrors.user && <p className="text-xs text-red-500 mt-1">{editErrors.user}</p>}
              </div>

              {/* 按钮 */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleEditSubmit}
                  disabled={editSubmitting}
                  className="flex-1 px-4 py-2.5 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700 transition-colors disabled:opacity-60"
                >
                  {editSubmitting ? '保存中...' : '保存修改'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== 删除确认弹窗 ========== */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-5">
              <p className="text-4xl mb-3">⚠️</p>
              <h3 className="text-base font-semibold text-gray-900 mb-1">确认删除</h3>
              <p className="text-xs text-gray-500">请输入你的昵称以确认身份</p>
            </div>

            <input
              type="text"
              value={deleteUser}
              onChange={(e) => setDeleteUser(e.target.value)}
              placeholder="输入发布时使用的昵称"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}