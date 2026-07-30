import { useState, useEffect } from 'react'

interface LostFoundFormProps {
  /** 提交回调 */
  onSubmit: (data: LostFoundFormData) => Promise<void>
  /** 是否正在提交 */
  submitting?: boolean
  /** AI 生成描述回调 */
  onGenerateDescription?: (data: { type: 'lost' | 'found'; title: string; location: string }) => Promise<void>
  /** 是否正在生成描述 */
  generating?: boolean
}

export interface LostFoundFormData {
  type: 'lost' | 'found'
  title: string
  description: string
  location: string
  user: string
  contact: string
}

export default function LostFoundForm({ onSubmit, submitting = false, onGenerateDescription, generating = false }: LostFoundFormProps) {
  const [formType, setFormType] = useState<'lost' | 'found'>('lost')
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [location, setLocation] = useState('')
  const [user, setUser] = useState('')
  const [contact, setContact] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 监听 AI 生成描述事件
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail) {
        setDesc(customEvent.detail)
      }
    }
    window.addEventListener('ai-lf-description', handler)
    return () => window.removeEventListener('ai-lf-description', handler)
  }, [])

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = '请输入标题'
    if (!contact.trim()) errs.contact = '请输入联系方式'
    if (!user.trim()) errs.user = '请输入你的昵称'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    await onSubmit({ type: formType, title, description: desc, location, user, contact })
    // 重置表单
    setFormType('lost')
    setTitle('')
    setDesc('')
    setLocation('')
    setUser('')
    setContact('')
    setErrors({})
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">发布信息</h3>
      <div className="space-y-4">
        {/* 类型选择 */}
        <div className="flex gap-3">
          <button
            onClick={() => { setFormType('lost'); setErrors({}) }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              formType === 'lost'
                ? 'bg-red-50 text-red-700 border-2 border-red-200'
                : 'bg-gray-50 text-gray-500 border-2 border-transparent hover:border-gray-200'
            }`}
          >
            🔍 我在找东西
          </button>
          <button
            onClick={() => { setFormType('found'); setErrors({}) }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              formType === 'found'
                ? 'bg-green-50 text-green-700 border-2 border-green-200'
                : 'bg-gray-50 text-gray-500 border-2 border-transparent hover:border-gray-200'
            }`}
          >
            🤝 我捡到了东西
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 标题 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">标题 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((prev) => ({ ...prev, title: '' })) }}
              placeholder={formType === 'lost' ? '例如：蓝色水杯' : '例如：捡到校园卡'}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors ${
                errors.title ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>
          {/* 地点 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">地点</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="例如：第二食堂"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* 详细描述 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs text-gray-500">详细描述</label>
            {onGenerateDescription && (
              <button
                type="button"
                onClick={() => onGenerateDescription({ type: formType, title, location })}
                disabled={generating || !title.trim()}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
                  bg-gradient-to-r from-purple-500 to-pink-500 text-white
                  hover:from-purple-600 hover:to-pink-600
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    生成中...
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16l-6 4.8 2.4-7.2L2 9.2h7.6z" />
                    </svg>
                    AI 生成描述
                  </>
                )}
              </button>
            )}
          </div>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value.slice(0, 500))}
            placeholder="描述物品特征、丢失/捡到时间等..."
            rows={3}
            maxLength={500}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{desc.length}/500</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 昵称 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">你的昵称 *</label>
            <input
              type="text"
              value={user}
              onChange={(e) => { setUser(e.target.value); setErrors((prev) => ({ ...prev, user: '' })) }}
              placeholder="例如：小张"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors ${
                errors.user ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.user && <p className="text-xs text-red-500 mt-1">{errors.user}</p>}
          </div>
          {/* 联系方式 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">联系方式 *</label>
            <input
              type="text"
              value={contact}
              onChange={(e) => { setContact(e.target.value); setErrors((prev) => ({ ...prev, contact: '' })) }}
              placeholder="微信/电话/QQ"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors ${
                errors.contact ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.contact && <p className="text-xs text-red-500 mt-1">{errors.contact}</p>}
          </div>
        </div>

        {/* 提交按钮 */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2.5 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700 transition-colors disabled:opacity-60"
        >
          {submitting ? '发布中...' : '确认发布'}
        </button>
      </div>
    </div>
  )
}