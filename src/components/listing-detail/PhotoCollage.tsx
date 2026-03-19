import Image from 'next/image'

interface Photo {
  id: string
  url: string
}

interface PhotoCollageProps {
  photos: Photo[]
  onShowAll: () => void
}

export function PhotoCollage({ photos, onShowAll }: PhotoCollageProps) {
  if (photos.length === 0) {
    return (
      <div className="h-[400px] md:h-[500px] rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
        <p className="text-gray-400">No photos available</p>
      </div>
    )
  }

  const primary = photos[0]
  const secondary = photos.slice(1, 5) // up to 4 additional photos

  // If only 1 photo, show it full-width
  if (photos.length === 1) {
    return (
      <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden">
        <Image
          src={primary.url}
          alt="Listing photo"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1152px"
          priority
        />
        <button
          onClick={onShowAll}
          className="absolute bottom-4 right-4 bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          Show all photos
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] md:h-[500px] rounded-xl overflow-hidden">
        {/* Large left photo spans 2 columns and 2 rows */}
        <div className="col-span-2 row-span-2 relative">
          <Image
            src={primary.url}
            alt="Primary listing photo"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 576px"
            priority
          />
        </div>

        {/* Up to 4 smaller photos in 2x2 grid on right */}
        {secondary.map((photo, i) => (
          <div key={photo.id} className="relative">
            <Image
              src={photo.url}
              alt={`Listing photo ${i + 2}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 25vw, 288px"
            />
            {/* Dim overlay on last photo if there are more */}
            {i === 3 && photos.length > 5 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">+{photos.length - 5}</span>
              </div>
            )}
          </div>
        ))}

        {/* Fill remaining slots with gray placeholders if fewer than 5 photos */}
        {Array.from({ length: Math.max(0, 4 - secondary.length) }).map((_, i) => (
          <div key={`placeholder-${i}`} className="bg-gray-100" />
        ))}
      </div>

      <button
        onClick={onShowAll}
        className="absolute bottom-4 right-4 bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
      >
        Show all photos
      </button>
    </div>
  )
}
