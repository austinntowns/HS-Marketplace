import type { ListingDetail } from '@/lib/listing-detail'

interface FinancialsGridProps {
  listing: ListingDetail
}

function formatPrice(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

interface MetricCardProps {
  label: string
  value: string
  subLabel?: string
}

function MetricCard({ label, value, subLabel }: MetricCardProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subLabel && <p className="text-xs text-gray-400 mt-1">{subLabel}</p>}
    </div>
  )
}

export function FinancialsGrid({ listing }: FinancialsGridProps) {
  // Calculate total TTM revenue across salon locations
  const totalTtmRevenue = listing.locations
    .filter(loc => loc.ttmRevenue != null)
    .reduce((sum, loc) => sum + (loc.ttmRevenue ?? 0), 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard
          label="Asking Price"
          value={formatPrice(listing.askingPrice)}
        />
        <MetricCard
          label="TTM Profit"
          value={formatPrice(listing.ttmProfit)}
          subLabel="Trailing 12 months"
        />
        {totalTtmRevenue > 0 && (
          <MetricCard
            label="TTM Revenue"
            value={formatPrice(totalTtmRevenue)}
            subLabel="Trailing 12 months"
          />
        )}
      </div>

      {/* Assets included */}
      {(listing.inventoryIncluded || listing.laserIncluded || listing.otherAssets) && (
        <div className="border border-gray-200 rounded-xl p-4 bg-white">
          <p className="text-sm text-gray-500 mb-2">Included Assets</p>
          <ul className="space-y-1 text-gray-700 text-sm">
            {listing.inventoryIncluded && (
              <li className="flex items-center gap-2">
                <span className="text-green-600">&#10003;</span> Inventory
              </li>
            )}
            {listing.laserIncluded && (
              <li className="flex items-center gap-2">
                <span className="text-green-600">&#10003;</span> Laser device
              </li>
            )}
            {listing.otherAssets && (
              <li className="flex items-center gap-2">
                <span className="text-green-600">&#10003;</span> {listing.otherAssets}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
