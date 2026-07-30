import { useState, useEffect } from 'react'

interface PublishFormProps {
  /** 分类列表 */
  categories: string[]
  /** 提交回调 */
  onSubmit: (data: PublishFormData) => Promise<void>
  /** 是否正在提交 */
  submitting?: boolean
  /** AI 生成描述回调 */
  onGenerateDescription?: (data: { title: string; category: string; price: string; originalPrice: string }) => Promise<void>
  /** 是否正在生成描述 */
  generating?: boolean
}

export interface PublishFormData {
  title: string
  price: string
  originalPrice: string
  category: string
  description: string
  user: string
}

export default function PublishForm({ categories, onSubmit, submitting = false, onGenerateDescription, generating = false }: PublishFormProps) {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [original, setOriginal] = useState('')
  const [category, setCategory] = useState(categories[0] || '教材')
  const [desc, setDesc] = useState('')
  const [user, setUser] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 监听 AI 生成描述事件
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail) {
        setDesc(customEvent.detail)
      }
    }
    window.addEventListener('ai-description', handler)
    return () => window.removeEventListener('ai-description', handler)
  }, [])

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = '请输入商品标题'
    if (!price || isNaN(Number(price)) || Number(price) <= 0) errs.price = '请输入有效价格'
    if (!user.trim()) errs.user = '请输入你的昵称'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    await onSubmit({ title, price, original, category, description: desc, user })
    // 重置表单
    setTitle('')
    setPrice('')
    setOriginal('')
    setCategory(categories[0] || '教材')
    setDesc('')
    setUser('')
    setErrors({})
  }

  const filterCategories = categories.filter((c) => c !== '全部')

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">发布闲置商品</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 商品标题 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">商品标题 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((prev) => ({ ...prev, title: '' })) }}
              placeholder="例如：高等数学第七版"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors ${
                errors.title ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* 分类 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">分类</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
            >
              {filterCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* 售价 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">售价（元）*</label>
            <input
              type="number"
              value={price}
              onChange={(e) => { setPrice(e.target.value); setErrors((prev) => ({ ...prev, price: '' })) }}
              placeholder="例如：15"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors ${
                errors.price ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
          </div>

          {/* 原价 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">原价（元，可选）</label>
            <input
              type="number"
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              placeholder="例如：49"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* 商品描述 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs text-gray-500">商品描述</label>
            {onGenerateDescription && (
              <button
                type="button"
                onClick={() => onGenerateDescription({ title, category, price, originalPrice: original })}
                disabled={generating || !title.trim() || !price}
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
            placeholder="描述商品成色、使用情况等..."
            rows={3}
            maxLength={500}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{desc.length}/500</p>
        </div>

        {/* 昵称 */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">你的昵称 *</label>
          <input
            type="text"
            value={user}
            onChange={(e) => { setUser(e.target.value); setErrors((prev) => ({ ...prev, user: '' })) }}
            placeholder="例如：学长"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors ${
              errors.user ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.user && <p className="text-xs text-red-500 mt-1">{errors.user}</p>}
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