import { useEffect, useState, useCallback, useRef } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastDetail {
  message: string
  type: ToastType
  duration: number
}

let toastTimer: ReturnType<typeof setTimeout> | null = null

export function showToast(
  message: string,
  type: ToastType = 'success',
  duration = 10000
) {
  const event = new CustomEvent<ToastDetail>('toast-show', { detail: { message, type, duration } })
  window.dispatchEvent(event)
}

const typeConfig: Record<ToastType, { icon: string; bg: string; border: string; text: string }> = {
  success: {
    icon: '✅',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
  },
  error: {
    icon: '❌',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
  },
  info: {
    icon: 'ℹ️',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
  },
  warning: {
    icon: '⚠️',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
  },
}

export default function Toast() {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [message, setMessage] = useState('')
  const [type, setType] = useState<ToastType>('success')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hide = useCallback(() => {
    setExiting(true)
    setTimeout(() => {
      setVisible(false)
      setExiting(false)
    }, 250)
  }, [])

  const handleClose = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    hide()
  }, [hide])

  useEffect(() => {
    const handler = (e: Event) => {
      const { message: msg, type: t, duration } = (e as CustomEvent<ToastDetail>).detail
      setMessage(msg)
      setType(t || 'success')

      // 清除之前的定时器
      if (toastTimer) clearTimeout(toastTimer)
      if (timerRef.current) clearTimeout(timerRef.current)
      setExiting(false)
      setVisible(true)

      toastTimer = setTimeout(() => {
        hide()
      }, duration || 2500)
    }

    window.addEventListener('toast-show', handler)
    return () => {
      window.removeEventListener('toast-show', handler)
      if (toastTimer) clearTimeout(toastTimer)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [hide])

  if (!visible) return null

  const config = typeConfig[type]

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50">
      <div
        onClick={handleClose}
        className={`px-6 py-3 rounded-2xl shadow-xl text-sm font-medium flex items-center gap-2.5 backdrop-blur-sm cursor-pointer select-none
          ${config.bg} ${config.text} ${config.border} border
          ${exiting ? 'animate-fade-out-up' : 'animate-fade-in-down'}`}
      >
        <span className="text-lg">{config.icon}</span>
        <span>{message}</span>
        <button
          onClick={(e) => { e.stopPropagation(); handleClose() }}
          className="ml-2 p-0.5 rounded-full hover:bg-black/5 transition-colors"
          aria-label="关闭"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}