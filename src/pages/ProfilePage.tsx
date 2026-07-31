import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockItems, mockPosts } from '../mock'
import StarRating from '../components/StarRating'
import FavoriteButton from '../components/FavoriteButton'
import { useFavorites } from '../context/FavoritesContext'
import { useAuth } from '../context/AuthContext'
import { showToast } from '../components/Toast'

type Tab = 'info' | 'favorite-items' | 'favorite-posts'

/** 根据用户名生成首字母头像颜色 */
function getInitialColor(name: string): string {
  const colors = [
    'bg-pink-500', 'bg-purple-500', 'bg-indigo-500', 'bg-blue-500',
    'bg-teal-500', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500',
    'bg-red-500', 'bg-rose-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

/** 获取首字母 */
function getInitials(name: string): string {
  return name.slice(0, 2).toUpperCase()
}

/** 退出确认弹窗 */
function ConfirmModal({
  open,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      {/* 弹窗 */}
      <div className="relative bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full mx-4 animate-fade-in-down">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            {cancelText || '取消'}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
          >
            {confirmText || '确认'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('info')
  const { user, isAuthenticated, logout, loading } = useAuth()
  const { favoriteItems, favoritePosts, toggleItem, togglePost } = useFavorites()
  const [avatarError, setAvatarError] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      showToast('已退出登录', 'success')
      navigate('/')
    } catch {
      showToast('退出登录失败', 'error')
    } finally {
      setLoggingOut(false)
      setShowLogoutModal(false)
    }
  }

  const favoritedItems = mockItems.filter((item) => favoriteItems.includes(item.id))
  const favoritedPosts = mockPosts.filter((post) => favoritePosts.includes(post.id))

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'info', label: '个人信息' },
    { key: 'favorite-items', label: '收藏商品', count: favoriteItems.length },
    { key: 'favorite-posts', label: '收藏帖子', count: favoritePosts.length },
  ]

  // 未登录状态
  if (!loading && !isAuthenticated) {
    return (
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">个人中心</h1>
          <p className="text-sm text-gray-500 mb-8">管理你的个人信息和收藏</p>
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <p className="text-5xl mb-4">🔒</p>
            <p className="text-base font-medium text-gray-900 mb-2">请先登录</p>
            <p className="text-sm text-gray-500 mb-6">登录后即可查看个人信息和收藏</p>
            <button
              onClick={() => navigate('/auth')}
              className="px-6 py-2.5 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700 transition-colors"
            >
              去登录
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 加载中
  if (loading) {
    return (
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-pink-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-400 ml-3">加载中...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">个人中心</h1>
        <p className="text-sm text-gray-500 mb-8">管理你的个人信息和收藏</p>

        {/* 退出确认弹窗 */}
        <ConfirmModal
          open={showLogoutModal}
          title="确认退出"
          message="退出登录后需要重新登录才能使用完整功能，确定要退出吗？"
          confirmText={loggingOut ? '退出中...' : '确认退出'}
          cancelText="取消"
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />

        <div className="flex gap-1 mb-8 bg-gray-100 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-pink-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-pink-100 text-pink-700 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'info' && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-6 mb-8">
              {user && (
                <>
                  {/* 头像：优先显示图片，加载失败显示首字母 */}
                  {!avatarError ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-20 h-20 rounded-full object-cover bg-pink-100"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-xl font-bold ${getInitialColor(user.name)}`}
                    >
                      {getInitials(user.name)}
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">{user.studentId}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </>
              )}
              <button
                onClick={() => setShowLogoutModal(true)}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
              >
                退出登录
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-pink-50 rounded-2xl p-4">
                <p className="text-2xl font-bold text-pink-700">{favoriteItems.length}</p>
                <p className="text-xs text-gray-500 mt-1">收藏商品</p>
              </div>
              <div className="bg-pink-50 rounded-2xl p-4">
                <p className="text-2xl font-bold text-pink-700">{favoritePosts.length}</p>
                <p className="text-xs text-gray-500 mt-1">收藏帖子</p>
              </div>
              <div className="bg-pink-50 rounded-2xl p-4">
                <p className="text-2xl font-bold text-pink-700">{mockItems.length}</p>
                <p className="text-xs text-gray-500 mt-1">在售商品</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'favorite-items' && (
          <div>
            {favoritedItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoritedItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 relative">
                    <div className="absolute top-3 right-3">
                      <FavoriteButton isFavorited={true} onToggle={() => toggleItem(item.id)} size="md" />
                    </div>
                    <span className="inline-block px-2.5 py-0.5 bg-pink-50 text-pink-700 rounded-full text-xs font-medium mb-3">
                      {item.category}
                    </span>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-500 mb-3">{item.description}</p>
                    <div className="flex items-end justify-between">
                      <span className="text-lg font-bold text-red-500">¥{item.price}</span>
                      <span className="text-xs text-gray-400">{item.user}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2">
                      <span className="text-xs text-gray-400">卖家信誉</span>
                      <StarRating rating={4} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
                <p className="text-4xl mb-3">💔</p>
                <p className="text-sm text-gray-400">还没有收藏商品</p>
                <p className="text-xs text-gray-300 mt-1">去二手交易页面发现心仪好物吧</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorite-posts' && (
          <div>
            {favoritedPosts.length > 0 ? (
              <div className="space-y-4">
                {favoritedPosts.map((post) => (
                  <div key={post.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative">
                    <div className="absolute top-5 right-5">
                      <FavoriteButton isFavorited={true} onToggle={() => togglePost(post.id)} size="md" />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        post.type === 'lost' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {post.type === 'lost' ? '寻物' : '招领'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        post.status === '进行中' ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-50 text-gray-500'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">{post.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{post.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>📍 {post.location}</span>
                      <span>👤 {post.user}</span>
                      <span>📞 {post.contact}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-sm text-gray-400">还没有收藏帖子</p>
                <p className="text-xs text-gray-300 mt-1">去失物招领页面关注感兴趣的帖子吧</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}