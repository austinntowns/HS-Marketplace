import type { ListingStatus } from '@/lib/listings/types'

const STATUS_CONFIG: Record<
  ListingStatus,
  { label: string; bgClass: string; textClass: string; dotClass: string }
> = {
  draft: {
    label: 'Draft',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-700',
    dotClass: 'bg-gray-500',
  },
  pending: {
    label: 'Pending Review',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-800',
    dotClass: 'bg-amber-500',
  },
  active: {
    label: 'Active',
    bgClass: 'bg-emerald-100',
    textClass: 'text-emerald-800',
    dotClass: 'bg-emerald-500',
  },
  rejected: {
    label: 'Rejected',
    bgClass: 'bg-red-100',
    textClass: 'text-red-800',
    dotClass: 'bg-red-500',
  },
  sold: {
    label: 'Sold',
    bgClass: 'bg-sky-100',
    textClass: 'text-sky-800',
    dotClass: 'bg-sky-500',
  },
  delisted: {
    label: 'Delisted',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-600',
    dotClass: 'bg-gray-400',
  },
}

interface StatusBadgeProps {
  status: ListingStatus
  size?: 'sm' | 'md'
  showDot?: boolean
}

export function StatusBadge({ status, size = 'sm', showDot = true }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
  const dotSize = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2'

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        rounded-full font-semibold
        ${config.bgClass} ${config.textClass}
        ${sizeClasses}
      `
        .trim()
        .replace(/\s+/g, ' ')}
    >
      {showDot && (
        <span className={`rounded-full flex-shrink-0 ${config.dotClass} ${dotSize}`} />
      )}
      {config.label}
    </span>
  )
}
