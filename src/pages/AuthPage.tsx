import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFormValidation } from '../hooks/useFormValidation'
import RegisterForm from '../components/RegisterForm'
import type { RegisterFormData } from '../components/RegisterForm'
import { useAuth } from '../context/AuthContext'
import { showToast } from '../components/Toast'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  // 登录表单
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const loginValidation = useFormValidation({
    username: [{ required: true, message: '请输入用户名' }],
    password: [{ required: true, message: '请输入密码' }, { minLength: 6, message: '密码不能少于6位' }],
  })

  // 注册表单（使用独立组件 RegisterForm）

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginValidation.validateAll(loginForm)) return
    setSubmitting(true)
    const res = await login(loginForm)
    setSubmitting(false)
    if (res.success) {
      showToast('登录成功！', 'success')
      navigate('/profile')
    } else {
      showToast(res.message || '登录失败', 'error')
    }
  }

  const handleRegisterSubmit = async (data: RegisterFormData) => {
    setSubmitting(true)
    const res = await register(data)
    setSubmitting(false)
    if (res.success) {
      showToast(res.message || '注册成功！', 'success')
      setIsLogin(true)
    } else {
      showToast(res.message || '注册失败', 'error')
    }
  }

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors ${
      hasError
        ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-pink-500'
    }`

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-16 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-md p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{isLogin ? '登录' : '注册'}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {isLogin ? '欢迎回到广西民族大学校园助手' : '加入校园助手，发现更多精彩'}
            </p>
          </div>

          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => {
                    setLoginForm({ ...loginForm, username: e.target.value })
                    loginValidation.validateField('username', e.target.value)
                  }}
                  onBlur={() => loginValidation.handleBlur('username', loginForm.username)}
                  placeholder="请输入用户名"
                  className={inputClass(!!loginValidation.errors.username && loginValidation.touched.username)}
                />
                {loginValidation.errors.username && loginValidation.touched.username && (
                  <p className="text-xs text-red-500 mt-1">{loginValidation.errors.username}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => {
                    setLoginForm({ ...loginForm, password: e.target.value })
                    loginValidation.validateField('password', e.target.value)
                  }}
                  onBlur={() => loginValidation.handleBlur('password', loginForm.password)}
                  placeholder="请输入密码"
                  className={inputClass(!!loginValidation.errors.password && loginValidation.touched.password)}
                />
                {loginValidation.errors.password && loginValidation.touched.password && (
                  <p className="text-xs text-red-500 mt-1">{loginValidation.errors.password}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700 transition-colors disabled:opacity-60"
              >
                {submitting ? '登录中...' : '登录'}
              </button>
            </form>
          ) : (
            <RegisterForm
              onSubmit={handleRegisterSubmit}
              submitting={submitting}
            />
          )}

          <div className="text-center mt-6">
            <span className="text-sm text-gray-500">{isLogin ? '还没有账号？' : '已有账号？'}</span>
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                loginValidation.clearErrors()
              }}
              className="text-sm text-pink-600 hover:text-pink-700 ml-1 font-medium"
            >
              {isLogin ? '立即注册' : '去登录'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}