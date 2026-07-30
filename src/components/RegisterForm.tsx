import { useState } from 'react'
import { useFormValidation } from '../hooks/useFormValidation'

interface RegisterFormProps {
  /** 提交回调 */
  onSubmit: (data: RegisterFormData) => Promise<void>
  /** 是否正在提交 */
  submitting?: boolean
}

export interface RegisterFormData {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export default function RegisterForm({ onSubmit, submitting = false }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const validation = useFormValidation({
    username: [
      { required: true, message: '请输入用户名' },
      { minLength: 2, message: '用户名至少2个字符' },
    ],
    email: [
      { required: true, message: '请输入邮箱' },
      { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' },
    ],
    password: [
      { required: true, message: '请输入密码' },
      { minLength: 6, message: '密码不能少于6位' },
    ],
    confirmPassword: [
      { required: true, message: '请确认密码' },
      { custom: (value) => (value !== formData.password ? '两次密码不一致' : null) },
    ],
  })

  const handleSubmit = async () => {
    if (!validation.validateAll(formData)) return
    await onSubmit(formData)
    // 重置表单
    setFormData({ username: '', email: '', password: '', confirmPassword: '' })
    validation.clearErrors()
  }

  const inputClass = (field: string) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors ${
      validation.errors[field] && validation.touched[field]
        ? 'border-red-400 bg-red-50'
        : 'border-gray-300'
    }`

  return (
    <div className="space-y-4">
      {/* 用户名 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => {
            setFormData({ ...formData, username: e.target.value })
            validation.validateField('username', e.target.value)
          }}
          onBlur={() => validation.handleBlur('username', formData.username)}
          placeholder="请输入用户名"
          className={inputClass('username')}
        />
        {validation.errors.username && validation.touched.username && (
          <p className="text-xs text-red-500 mt-1">{validation.errors.username}</p>
        )}
      </div>

      {/* 邮箱 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value })
            validation.validateField('email', e.target.value)
          }}
          onBlur={() => validation.handleBlur('email', formData.email)}
          placeholder="请输入邮箱地址"
          className={inputClass('email')}
        />
        {validation.errors.email && validation.touched.email && (
          <p className="text-xs text-red-500 mt-1">{validation.errors.email}</p>
        )}
      </div>

      {/* 密码 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => {
            setFormData({ ...formData, password: e.target.value })
            validation.validateField('password', e.target.value)
          }}
          onBlur={() => validation.handleBlur('password', formData.password)}
          placeholder="至少6位密码"
          className={inputClass('password')}
        />
        {validation.errors.password && validation.touched.password && (
          <p className="text-xs text-red-500 mt-1">{validation.errors.password}</p>
        )}
      </div>

      {/* 确认密码 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => {
            setFormData({ ...formData, confirmPassword: e.target.value })
            validation.validateField('confirmPassword', e.target.value)
          }}
          onBlur={() => validation.handleBlur('confirmPassword', formData.confirmPassword)}
          placeholder="再次输入密码"
          className={inputClass('confirmPassword')}
        />
        {validation.errors.confirmPassword && validation.touched.confirmPassword && (
          <p className="text-xs text-red-500 mt-1">{validation.errors.confirmPassword}</p>
        )}
      </div>

      {/* 提交按钮 */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-2.5 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700 transition-colors disabled:opacity-60"
      >
        {submitting ? '注册中...' : '注册'}
      </button>
    </div>
  )
}