interface FavoriteButtonProps {
  isFavorited: boolean
  onToggle: () => void
  size?: 'sm' | 'md'
}

export default function FavoriteButton({ isFavorited, onToggle, size = 'md' }: FavoriteButtonProps) {
  const sizeClass = size === 'sm' ? 'text-lg' : 'text-xl'

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      className={`${sizeClass} transition-all duration-200 hover:scale-110 ${
        isFavorited ? 'text-red-500' : 'text-gray-300 hover:text-red-400'
      }`}
      aria-label={isFavorited ? '取消收藏' : '收藏'}
    >
      {isFavorited ? '❤️' : '🤍'}
    </button>
  )
}