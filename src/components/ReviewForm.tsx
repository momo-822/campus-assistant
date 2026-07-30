import { useState } from 'react'
import StarRating from './StarRating'

interface ReviewFormProps {
  /** 提交回调 */
  onSubmit: (data: ReviewFormData) => Promise<void>
  /** 是否正在提交 */
  submitting?: boolean
}

export interface ReviewFormData {
  rating: number
  content: string
  user: string
}

export default function ReviewForm({ onSubmit, submitting = false }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')
  const [user, setUser] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (rating < 1) errs.rating = '请给个评分吧'
    if (!content.trim()) errs.content = '请输入评价内容'
    if (!user.trim()) errs.user = '请输入你的昵称'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    await onSubmit({ rating, content, user })
    // 重置表单
    setRating(0)
    setContent('')
    setUser('')
    setErrors({})
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">发布评价</h3>
      <div className="space-y-4">
        {/* 评分 */}
        <div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">评分：</span>
            <StarRating
              rating={rating}
              size="lg"
              interactive
              onChange={(v) => { setRating(v); setErrors((prev) => ({ ...prev, rating: '' })) }}
            />
            <span className="text-sm text-gray-400">
              {rating > 0 ? `${rating} 分` : '点击评分'}
            </span>
          </div>
          {errors.rating && <p className="text-xs text-red-500 mt-1 ml-12">{errors.rating}</p>}
        </div>

        {/* 昵称 */}
        <div>
          <input
            type="text"
            value={user}
            onChange={(e) => { setUser(e.target.value); setErrors((prev) => ({ ...prev, user: '' })) }}
            placeholder="你的昵称"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors ${
              errors.user ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.user && <p className="text-xs text-red-500 mt-1">{errors.user}</p>}
        </div>

        {/* 评价内容 */}
        <div>
          <textarea
            value={content}
            onChange={(e) => { setContent(e.target.value.slice(0, 200)); setErrors((prev) => ({ ...prev, content: '' })) }}
            placeholder="说说你对这个食堂的评价..."
            rows={3}
            maxLength={200}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none transition-colors ${
              errors.content ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
          <p className="text-xs text-gray-400 text-right mt-1">{content.length}/200</p>
        </div>

        {/* 提交按钮 */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2.5 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700 transition-colors disabled:opacity-60"
        >
          {submitting ? '发布中...' : '发布评价'}
        </button>
      </div>
    </div>
  )
}