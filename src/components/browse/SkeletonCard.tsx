export function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
      {/* Photo placeholder with badge */}
      <div className="relative aspect-[4/3] bg-gray-200 animate-pulse">
        {/* Type badge skeleton */}
        <div className="absolute top-3 left-3">
          <div className="h-6 w-16 bg-gray-300/60 rounded-lg" />
        </div>
        {/* Gradient overlay to match real card */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-gray-300/30 to-transparent" />
      </div>

      {/* Content placeholder */}
      <div className="p-4 space-y-3">
        {/* Price */}
        <div className="h-6 bg-gray-200 rounded-md animate-pulse w-28" />

        {/* Location */}
        <div className="space-y-1.5">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-36" />
          <div className="h-3 bg-gray-100 rounded animate-pulse w-44" />
        </div>

        {/* Footer divider + view details */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="h-3 bg-gray-100 rounded animate-pulse w-20" />
          <div className="h-4 w-4 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}
