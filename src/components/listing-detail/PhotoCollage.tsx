import Image from 'next/image'

interface Photo {
  id: string
  url: string
}

interface PhotoCollageProps {
  photos: Photo[]
  onShowAll: () => void
  onPhotoClick?: (index: number) => void
}

export function PhotoCollage({ photos, onShowAll, onPhotoClick }: PhotoCollageProps) {
  if (photos.length === 0) {
    return (
      <div className="h-[300px] md:h-[500px] rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
        <p className="text-gray-400">No photos available</p>
      </div>
    )
  }

  const primary = photos[0]
  const secondary = photos.slice(1, 5) // up to 4 additional photos

  // If only 1 photo, show it full-width
  if (photos.length === 1) {
    return (
      <div className="relative h-[300px] md:h-[500px] rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => onPhotoClick?.(0)}
          className="absolute inset-0 w-full h-full cursor-pointer focus-visible:ring-2 focus-visible:ring-hs-red-500 focus-visible:ring-inset"
          aria-label="View photo fullscreen"
        >
          <Image
            src={primary.url}
            alt="Listing photo"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1152px"
            priority
          />
        </button>
        <button
          onClick={onShowAll}
          className="absolute bottom-4 right-4 bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-hs-red-500 focus-visible:ring-offset-2 min-h-[44px]"
        >
          Show all photos
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-[250px] md:h-[500px] rounded-xl overflow-hidden">
        {/* Large left photo spans 2 columns and 2 rows — single photo on mobile */}
        <button
          type="button"
          onClick={() => onPhotoClick?.(0)}
          className="md:col-span-2 md:row-span-2 relative cursor-pointer group/photo focus-visible:ring-2 focus-visible:ring-hs-red-500 focus-visible:ring-inset"
          aria-label="View primary photo fullscreen"
        >
          <Image
            src={primary.url}
            alt="Primary listing photo"
            fill
            className="object-cover group-hover/photo:scale-[1.02] transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 576px"
            priority
          />
        </button>

        {/* Up to 4 smaller photos in 2x2 grid on right — hidden on mobile */}
        {secondary.map((photo, i) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => onPhotoClick?.(i + 1)}
            className="relative cursor-pointer group/photo hidden md:block focus-visible:ring-2 focus-visible:ring-hs-red-500 focus-visible:ring-inset"
            aria-label={`View photo ${i + 2} fullscreen`}
          >
            <Image
              src={photo.url}
              alt={`Listing photo ${i + 2}`}
              fill
              className="object-cover group-hover/photo:scale-[1.03] transition-transform duration-300"
              sizes="(max-width: 768px) 25vw, 288px"
            />
            {/* Dim overlay on last photo if there are more */}
            {i === 3 && photos.length > 5 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                <span className="text-white font-semibold text-lg">+{photos.length - 5}</span>
              </div>
            )}
          </button>
        ))}

        {/* Fill remaining slots with gray placeholders if fewer than 5 photos */}
        {Array.from({ length: Math.max(0, 4 - secondary.length) }).map((_, i) => (
          <div key={`placeholder-${i}`} className="bg-gray-100 hidden md:block" />
        ))}
      </div>

      <button
        onClick={onShowAll}
        className="absolute bottom-4 right-4 bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-hs-red-500 focus-visible:ring-offset-2 min-h-[44px]"
      >
        Show all photos
      </button>
    </div>
  )
}
