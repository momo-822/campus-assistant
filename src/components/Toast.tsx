import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error'
  visible: boolean
  onClose: () => void
}

let toastTimer: ReturnType<typeof setTimeout> | null = null

export function showToast(
  message: string,
  type: 'success' | 'error' = 'success',
  duration = 10000
) {
  const event = new CustomEvent('toast-show', { detail: { message, type, duration } })
  window.dispatchEvent(event)
}

export default function Toast() {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('')
  const [type, setType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    const handler = (e: Event) => {
      const { message: msg, type: t, duration } = (e as CustomEvent).detail
      setMessage(msg)
      setType(t || 'success')

      // 清除之前的定时器
      if (toastTimer) clearTimeout(toastTimer)

      setVisible(true)
      toastTimer = setTimeout(() => {
        setVisible(false)
      }, duration || 2500)
    }

    window.addEventListener('toast-show', handler)
    return () => {
      window.removeEventListener('toast-show', handler)
      if (toastTimer) clearTimeout(toastTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-fade-in-down">
      <div
        className={`px-6 py-3 rounded-2xl shadow-xl text-sm font-medium flex items-center gap-2.5 backdrop-blur-sm ${
          type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}
      >
        <span className="text-lg">{type === 'success' ? '✅' : '❌'}</span>
        <span>{message}</span>
      </div>
    </div>
  )
}