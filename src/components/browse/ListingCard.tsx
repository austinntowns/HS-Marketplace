import Image from "next/image"
import Link from "next/link"
import type { ListingCard as ListingCardType } from "@/lib/listings-query"

const TYPE_LABELS: Record<string, string> = {
  suite: "Suite",
  flagship: "Flagship",
  territory: "Territory",
  bundle: "Bundle",
}

const TYPE_COLORS: Record<string, string> = {
  suite: "bg-pink-100 text-pink-800",
  flagship: "bg-purple-100 text-purple-800",
  territory: "bg-blue-100 text-blue-800",
  bundle: "bg-amber-100 text-amber-800",
}

interface ListingCardProps {
  listing: ListingCardType
  isHovered?: boolean
  onHover?: (id: string | null) => void
}

function formatPrice(cents: number): string {
  const dollars = cents / 100
  if (dollars >= 1_000_000) {
    return `$${(dollars / 1_000_000).toFixed(1)}M`
  }
  if (dollars >= 1_000) {
    return `$${(dollars / 1_000).toFixed(0)}k`
  }
  return `$${dollars.toLocaleString()}`
}

export function ListingCard({ listing, isHovered, onHover }: ListingCardProps) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className={`group block rounded-xl overflow-hidden border bg-white transition-all hover:shadow-md ${
        isHovered ? "ring-2 ring-pink-500 shadow-md" : "border-gray-200"
      }`}
      onMouseEnter={() => onHover?.(listing.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-pink-100 to-pink-200 overflow-hidden">
        {listing.primaryPhotoUrl ? (
          <Image
            src={listing.primaryPhotoUrl}
            alt={listing.locationName ?? "Listing photo"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-pink-300 text-4xl font-bold">HS</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-lg font-semibold text-gray-900">
              {formatPrice(listing.askingPrice)}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {[listing.city, listing.state].filter(Boolean).join(", ") || "Location not specified"}
            </p>
            {listing.locationName && (
              <p className="text-xs text-gray-400 truncate mt-0.5">{listing.locationName}</p>
            )}
          </div>
          <span
            className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${
              TYPE_COLORS[listing.type] ?? "bg-gray-100 text-gray-700"
            }`}
          >
            {TYPE_LABELS[listing.type] ?? listing.type}
          </span>
        </div>
      </div>
    </Link>
  )
}
