interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  compact?: boolean
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center
        ${compact ? 'py-8 px-4' : 'py-16 px-6'}
      `}
    >
      {icon && (
        <div
          className={`
            flex items-center justify-center
            rounded-2xl bg-gray-100
            ${compact ? 'w-12 h-12 mb-4' : 'w-16 h-16 mb-6'}
          `}
        >
          <span className={`text-gray-400 ${compact ? 'scale-75' : ''}`}>{icon}</span>
        </div>
      )}
      <h3
        className={`font-semibold text-gray-900 ${compact ? 'text-base' : 'text-lg'}`}
      >
        {title}
      </h3>
      {description && (
        <p
          className={`
            text-gray-500 max-w-sm
            ${compact ? 'text-sm mt-1' : 'text-base mt-2'}
          `}
        >
          {description}
        </p>
      )}
      {action && <div className={compact ? 'mt-4' : 'mt-6'}>{action}</div>}
    </div>
  )
}

// Illustration-based empty state for major sections
export function EmptyStateIllustrated({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {/* Abstract illustration */}
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-gray-100 rounded-2xl" />
        <div className="absolute -top-2 -right-2 w-12 h-12 bg-hs-red-100 rounded-xl" />
        <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-gray-200 rounded-lg" />
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500 max-w-md mb-6">{description}</p>
      {action}
    </div>
  )
}
