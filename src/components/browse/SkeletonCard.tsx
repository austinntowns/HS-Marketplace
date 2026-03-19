export function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">
      {/* Photo placeholder */}
      <div className="aspect-[4/3] bg-gray-200 animate-pulse" />

      {/* Content placeholder */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-24" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
          </div>
          <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse shrink-0" />
        </div>
      </div>
    </div>
  )
}
