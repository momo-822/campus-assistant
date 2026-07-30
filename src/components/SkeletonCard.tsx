interface SkeletonCardProps {
  /** 卡片数量 */
  count?: number
  /** 布局：grid（网格）或 list（列表） */
  layout?: 'grid' | 'list'
  /** 是否显示图片占位 */
  showImage?: boolean
}

/** 单个骨架卡片 */
function SkeletonItem({ showImage }: { showImage: boolean }) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      {showImage && (
        <div className="h-32 bg-gradient-to-br from-pink-100 to-purple-100" />
      )}
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 w-16 bg-gray-200 rounded-full" />
          <div className="h-3 w-12 bg-gray-200 rounded" />
        </div>
        <div className="h-5 w-3/4 bg-gray-200 rounded" />
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-2/3 bg-gray-200 rounded" />
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <div className="h-3 w-14 bg-gray-200 rounded" />
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-3 w-3 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
          <div className="h-3 w-8 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  )
}

/** 评论骨架卡片 */
function SkeletonReviewItem() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-4 w-12 bg-gray-200 rounded" />
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-3 w-3 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
        <div className="h-3 w-16 bg-gray-200 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-5/6 bg-gray-200 rounded" />
      </div>
      <div className="h-3 w-20 bg-gray-200 rounded mt-3" />
    </div>
  )
}

export default function SkeletonCard({ count = 6, layout = 'grid', showImage = true }: SkeletonCardProps) {
  if (layout === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonReviewItem key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonItem key={i} showImage={showImage} />
      ))}
    </div>
  )
}