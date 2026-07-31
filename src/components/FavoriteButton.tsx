import { useAuth } from '../context/AuthContext'
import { showToast } from './Toast'

interface FavoriteButtonProps {
  isFavorited: boolean
  onToggle: () => void
  size?: 'sm' | 'md'
}

/** 空心爱心 SVG */
function HeartOutline({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  )
}

/** 实心爱心 SVG */
function HeartSolid({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  )
}

export default function FavoriteButton({ isFavorited, onToggle, size = 'md' }: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth()
  const sizeClass = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!isAuthenticated) {
      showToast('请先登录再收藏', 'warning')
      return
    }

    onToggle()
    showToast(isFavorited ? '已取消收藏' : '已收藏', 'success')
  }

  return (
    <button
      onClick={handleClick}
      className={`${sizeClass} transition-all duration-200 ${
        isFavorited
          ? 'text-red-500 scale-100 hover:scale-110'
          : 'text-gray-300 hover:text-red-400 hover:scale-110'
      }`}
      aria-label={isFavorited ? '取消收藏' : '收藏'}
    >
      {isFavorited ? (
        <HeartSolid className={`${sizeClass} ${isFavorited ? 'animate-like-pop' : ''}`} />
      ) : (
        <HeartOutline className={sizeClass} />
      )}
    </button>
  )
}