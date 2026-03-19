import type { ListingStatus } from '@/lib/listings/types'

const STATUS_CONFIG: Record<ListingStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
  pending: { label: 'Pending Review', className: 'bg-yellow-100 text-yellow-800' },
  active: { label: 'Active', className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
  sold: { label: 'Sold', className: 'bg-blue-100 text-blue-800' },
  delisted: { label: 'Delisted', className: 'bg-gray-100 text-gray-600' },
}

interface StatusBadgeProps {
  status: ListingStatus
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config.className} ${sizeClasses}`}>
      {config.label}
    </span>
  )
}
