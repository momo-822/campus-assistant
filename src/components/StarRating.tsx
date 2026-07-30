interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
}

const sizeMap = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
}: StarRatingProps) {
  const stars = Array.from({ length: maxRating }, (_, i) => i + 1)

  return (
    <div className={`flex items-center gap-0.5 ${interactive ? 'cursor-pointer' : ''}`}>
      {stars.map((star) => {
        const filled = star <= rating
        const half = !filled && star - 0.5 <= rating

        return (
          <span
            key={star}
            className={`${sizeMap[size]} transition-colors ${
              interactive ? 'hover:scale-110' : ''
            }`}
            style={{ color: filled || half ? '#f59e0b' : '#d1d5db' }}
            onClick={() => {
              if (interactive && onChange) {
                onChange(star === rating ? star - 1 : star)
              }
            }}
            role={interactive ? 'button' : undefined}
            aria-label={`${star} 星`}
          >
            {filled ? '★' : half ? '★' : '☆'}
          </span>
        )
      })}
    </div>
  )
}