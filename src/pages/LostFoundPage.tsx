import { useEffect, useState } from 'react'
import { useSearch } from '../context/SearchContext'
import type { LostFoundPost } from '../mock'
import LostFoundForm from '../components/LostFoundForm'
import type { LostFoundFormData } from '../components/LostFoundForm'
import { showToast } from '../components/Toast'
import {
  getPostsByType,
  searchPosts,
  addPost,
  updatePost,
  updatePostStatus,
  deletePost,
  generateLostFoundDescription,
  smartMatch,
  type AddPostParams,
  type SmartMatchItem,
  type SmartMatchResult,
} from '../api'

type FilterType = 'all' | 'lost' | 'found'

export default function LostFoundPage() {
  const { query } = useSearch()

  const [postList, setPostList] = useState<LostFoundPost[]>([])
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [generating, setGenerating] = useState(false)

  // 发布表单
  const [formVisible, setFormVisible] = useState(false)

  // 智能匹配推荐
  const [smartMatchResult, setSmartMatchResult] = useState<SmartMatchResult | null>(null)
  const [smartMatchLoading, setSmartMatchLoading] = useState(false)

  // 编辑弹窗状态
  const [editingPost, setEditingPost] = useState<LostFoundPost | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    location: '',
    contact: '',
    user: '',
  })
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})
  const [editSubmitting, setEditSubmitting] = useState(false)

  // 删除确认
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [deleteUser, setDeleteUser] = useState('')

  // 加载数据
  const loadPosts = () => {
    if (query.trim()) {
      setLoading(true)
      searchPosts(query).then((res) => {
        if (res.data) setPostList(res.data)
        setLoading(false)
      })
    } else {
      setLoading(true)
      getPostsByType(filterType as 'lost' | 'found' | 'all').then((res) => {
        if (res.data) setPostList(res.data)
        setLoading(false)
      })
    }
  }

  useEffect(() => {
    loadPosts()
  }, [query, filterType])

  // 发布帖子
  const handleSubmit = async (data: LostFoundFormData) => {
    setSubmitting(true)
    const res = await addPost({
      type: data.type,
      title: data.title,
      description: data.description,
      location: data.location,
      user: data.user,
      contact: data.contact,
    } as AddPostParams)
    setSubmitting(false)
    if (res.success && res.data) {
      setPostList(res.data)
      setFormVisible(false)
      setSmartMatchResult(null)
      showToast('发布成功！', 'success')
    }
  }

  // AI 生成失物/招领描述
  const handleGenerateDescription = async (data: { type: 'lost' | 'found'; title: string; location: string }) => {
    if (!data.title.trim()) {
      showToast('请先填写标题', 'error')
      return
    }
    setGenerating(true)
    const res = await generateLostFoundDescription({
      type: data.type,
      title: data.title,
      location: data.location || undefined,
    })
    setGenerating(false)
    if (res.success && res.data) {
      window.dispatchEvent(new CustomEvent('ai-lf-description', { detail: res.data.description }))
      showToast('AI 描述已生成，请查看下方文本框', 'success')
      // 生成描述后自动触发智能匹配
      handleSmartMatch({ type: data.type, title: data.title, location: data.location })
    } else {
      showToast(res.message || '生成失败，请重试', 'error')
    }
  }

  // 智能匹配推荐
  const handleSmartMatch = async (data: { type: 'lost' | 'found'; title: string; description?: string; location?: string }) => {
    if (!data.title.trim()) return
    setSmartMatchLoading(true)
    const res = await smartMatch({
      type: data.type,
      title: data.title,
      description: data.description,
      location: data.location,
    })
    setSmartMatchLoading(false)
    if (res.success && res.data) {
      setSmartMatchResult(res.data)
    }
  }

  // 打开编辑弹窗
  const openEdit = (post: LostFoundPost) => {
    setEditingPost(post)
    setEditForm({
      title: post.title,
      description: post.description,
      location: post.location,
      contact: post.contact,
      user: post.user,
    })
    setEditErrors({})
  }

  // 提交编辑
  const handleEditSubmit = async () => {
    if (!editingPost) return

    const errs: Record<string, string> = {}
    if (!editForm.title.trim()) errs.title = '标题不能为空'
    if (!editForm.contact.trim()) errs.contact = '联系方式不能为空'
    if (!editForm.user.trim()) errs.user = '请输入你的昵称'
    setEditErrors(errs)
    if (Object.keys(errs).length > 0) return

    setEditSubmitting(true)
    const res = await updatePost(editingPost.id, {
      user: editForm.user.trim(),
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      location: editForm.location.trim(),
      contact: editForm.contact.trim(),
    })
    setEditSubmitting(false)

    if (res.success && res.data) {
      setPostList(res.data)
      setEditingPost(null)
      showToast('编辑成功！', 'success')
    } else {
      showToast(res.message || '编辑失败，请确认昵称是否正确', 'error')
    }
  }

  // 删除帖子
  const handleDelete = async (id: number) => {
    if (!deleteUser.trim()) {
      showToast('请先输入你的昵称以确认身份', 'error')
      return
    }
    const res = await deletePost(id, deleteUser.trim())
    if (res.data) {
      setPostList(res.data)
      setDeleteConfirmId(null)
      setDeleteUser('')
      showToast('删除成功！', 'success')
    } else {
      showToast(res.message || '删除失败，请确认昵称是否正确', 'error')
    }
  }

  // 类型标签样式
  const typeBadge = (type: 'lost' | 'found') => ({
    bg: type === 'lost' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600',
    label: type === 'lost' ? '寻物' : '招领',
  })

  // 状态标签样式
  const statusBadge = (status: string) => {
    switch (status) {
      case '进行中': return 'bg-yellow-50 text-yellow-600'
      case '已找回': return 'bg-blue-50 text-blue-600'
      case '已归还': return 'bg-green-50 text-green-600'
      default: return 'bg-gray-50 text-gray-500'
    }
  }

  // 筛选 tab 配置
  const filterTabs: { key: FilterType; label: string; icon: string }[] = [
    { key: 'all', label: '全部', icon: '📋' },
    { key: 'lost', label: '寻物', icon: '🔍' },
    { key: 'found', label: '招领', icon: '🤝' },
  ]

  // 统计
  const stats = {
    total: postList.length,
    lost: postList.filter((p) => p.type === 'lost').length,
    found: postList.filter((p) => p.type === 'found').length,
    resolved: postList.filter((p) => p.status === '已找回' || p.status === '已归还').length,
  }

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* 标题区域 */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">失物招领</h1>
          <button
            onClick={() => setFormVisible(!formVisible)}
            className="px-4 py-2 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700 transition-colors flex items-center gap-1.5"
          >
            <span>＋</span>
            <span>{formVisible ? '收起' : '发布'}</span>
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          {loading ? '加载中...' : query ? `搜索 "${query}" 的结果` : '帮助丢失的物品找到主人'}
        </p>

        {/* 统计卡片 */}
        {!query && (
          <div className="flex gap-3 mb-4">
            {[
              { label: '全部', value: stats.total, color: 'text-gray-900' },
              { label: '寻物', value: stats.lost, color: 'text-red-600' },
              { label: '招领', value: stats.found, color: 'text-green-600' },
              { label: '已完成', value: stats.resolved, color: 'text-blue-600' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 flex-1 text-center">
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* 筛选 Tabs */}
        {!query && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterType(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  filterType === tab.key
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-pink-300 hover:text-pink-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* 发布表单（独立组件） */}
        {formVisible && (
          <LostFoundForm
            onSubmit={handleSubmit}
            submitting={submitting}
            onGenerateDescription={handleGenerateDescription}
            generating={generating}
          />
        )}

        {/* 智能匹配推荐 */}
        {formVisible && smartMatchResult && smartMatchResult.matches.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🧠</span>
              <h3 className="text-sm font-semibold text-gray-900">智能匹配推荐</h3>
              <span className="text-xs text-gray-400">
                基于你填写的标题，发现 {smartMatchResult.matches.length} 条可能相关的
                {smartMatchResult.source_type === 'lost' ? '招领' : '寻物'}信息
              </span>
            </div>
            <div className="space-y-3">
              {smartMatchResult.matches.map((match) => (
                <div key={match.id} className="bg-white rounded-xl p-4 border border-purple-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        match.type === 'lost' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {match.type === 'lost' ? '寻物' : '招领'}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">{match.title}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full font-medium">
                      匹配度 {match.score}%
                    </span>
                  </div>
                  {match.match_reasons.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {match.match_reasons.map((reason, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full">
                          {reason}
                        </span>
                      ))}
                    </div>
                  )}
                  {match.location && (
                    <p className="text-xs text-gray-400">📍 {match.location}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 帖子列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-pink-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-400 ml-3">加载中...</span>
          </div>
        ) : postList.length > 0 ? (
          <div className="space-y-4">
            {postList.map((post) => {
              const tb = typeBadge(post.type)
              return (
                <div key={post.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  {/* 顶部标签行 */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${tb.bg}`}>
                        {tb.label}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge(post.status)}`}>
                        {post.status}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{post.time}</span>
                  </div>

                  {/* 标题 */}
                  <h3 className="text-base font-semibold text-gray-900 mb-1">{post.title}</h3>

                  {/* 描述 */}
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">{post.description}</p>

                  {/* 信息行 */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mb-3">
                    <span>📍 {post.location}</span>
                    <span>👤 {post.user}</span>
                    <span>📞 {post.contact}</span>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                    {(post.status === '进行中') && (
                      <button
                        onClick={() => {
                          const newStatus = post.type === 'lost' ? '已找回' : '已归还'
                          if (window.confirm(`确认标记为「${newStatus}」？`)) {
                            updatePostStatus(post.id, newStatus as '已找回' | '已归还').then((res) => {
                              if (res.data) setPostList(res.data)
                            })
                          }
                        }}
                        className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        ✓ 标记完成
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(post)}
                      className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      ✏️ 编辑
                    </button>
                    <button
                      onClick={() => {
                        setDeleteConfirmId(post.id)
                        setDeleteUser('')
                      }}
                      className="text-xs px-3 py-1.5 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      🗑️ 删除
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-4xl mb-3">{query ? '🔍' : '📋'}</p>
            <p className="text-sm text-gray-400">
              {query ? '未找到相关记录' : '还没有任何记录'}
            </p>
            {!query && (
              <button
                onClick={() => setFormVisible(true)}
                className="mt-3 px-4 py-2 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700 transition-colors"
              >
                发布信息
              </button>
            )}
          </div>
        )}
      </div>

      {/* ========== 编辑弹窗 ========== */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setEditingPost(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900">编辑帖子</h3>
              <button
                onClick={() => setEditingPost(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* 标题 */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">标题 *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => { setEditForm((p) => ({ ...p, title: e.target.value })); setEditErrors((p) => ({ ...p, title: '' })) }}
                  placeholder="例如：蓝色水杯"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors ${
                    editErrors.title ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {editErrors.title && <p className="text-xs text-red-500 mt-1">{editErrors.title}</p>}
              </div>

              {/* 地点 */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">地点</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm((p) => ({ ...p, location: e.target.value }))}
                  placeholder="例如：第二食堂"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {/* 描述 */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">详细描述</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="描述物品特征、丢失/捡到时间等..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                />
              </div>

              {/* 联系方式 */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">联系方式 *</label>
                <input
                  type="text"
                  value={editForm.contact}
                  onChange={(e) => { setEditForm((p) => ({ ...p, contact: e.target.value })); setEditErrors((p) => ({ ...p, contact: '' })) }}
                  placeholder="微信/电话/QQ"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors ${
                    editErrors.contact ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {editErrors.contact && <p className="text-xs text-red-500 mt-1">{editErrors.contact}</p>}
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
                  onClick={() => setEditingPost(null)}
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