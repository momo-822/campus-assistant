import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSearch } from '../context/SearchContext'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { path: '/', label: '首页' },
  { path: '/schedule', label: '课表' },
  { path: '/canteen', label: '食堂' },
  { path: '/trade', label: '二手' },
  { path: '/lost-found', label: '失物招领' },
  { path: '/profile', label: '个人中心' },
]

export default function Navbar() {
  const location = useLocation()
  const { query, setQuery } = useSearch()
  const { user, isAuthenticated } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-pink-600 border-b border-pink-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-white shrink-0" onClick={() => setMenuOpen(false)}>
            广西民族大学校园助手
          </Link>

          {/* 桌面端导航链接 */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors text-sm ${
                  location.pathname === link.path
                    ? 'text-white font-medium'
                    : 'text-pink-200 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="搜索..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-28 sm:w-48 px-3 py-1.5 rounded-lg bg-pink-500 text-white placeholder-pink-200 text-sm border border-pink-400 focus:outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300 transition-colors"
              />
            </div>

            {/* 桌面端用户状态 */}
            <div className="hidden sm:block">
              {isAuthenticated && user ? (
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 bg-pink-500 hover:bg-pink-400 rounded-full transition-colors"
                >
                  <span className="text-white text-sm font-medium truncate max-w-[80px]">
                    {user.name}
                  </span>
                </Link>
              ) : (
                <Link
                  to="/auth"
                  className="px-4 py-2 bg-white text-pink-900 rounded-full text-sm font-medium hover:bg-pink-50 transition-colors shadow-sm"
                >
                  登录
                </Link>
              )}
            </div>

            {/* 移动端汉堡菜单按钮 */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-white hover:bg-pink-700 rounded-lg transition-colors"
              aria-label="菜单"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 移动端下拉菜单 */}
      {menuOpen && (
        <div className="md:hidden bg-pink-600 border-t border-pink-700">
          <div className="max-w-6xl mx-auto px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  location.pathname === link.path
                    ? 'bg-pink-700 text-white font-medium'
                    : 'text-pink-200 hover:bg-pink-700 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && user ? (
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-sm text-pink-200 hover:bg-pink-700 hover:text-white transition-colors border-t border-pink-700 mt-2 pt-3"
              >
                👤 {user.name}
              </Link>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-sm text-pink-200 hover:bg-pink-700 hover:text-white transition-colors"
              >
                登录
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}