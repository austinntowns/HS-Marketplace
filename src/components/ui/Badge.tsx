type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'outline'
type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-hs-red-100 text-hs-red-800',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  error: 'bg-hs-red-100 text-hs-red-800',
  info: 'bg-sky-100 text-sky-800',
  outline: 'bg-white text-gray-700 border border-gray-300',
}

const dotColorStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-500',
  primary: 'bg-hs-red-600',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-hs-red-500',
  info: 'bg-sky-500',
  outline: 'bg-gray-500',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
}

const dotSizeStyles: Record<BadgeSize, string> = {
  sm: 'h-1.5 w-1.5',
  md: 'h-1.5 w-1.5',
  lg: 'h-2 w-2',
}

export function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  children,
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        font-semibold rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `
        .trim()
        .replace(/\s+/g, ' ')}
    >
      {dot && (
        <span
          className={`
            rounded-full flex-shrink-0
            ${dotColorStyles[variant]}
            ${dotSizeStyles[size]}
          `
            .trim()
            .replace(/\s+/g, ' ')}
        />
      )}
      {children}
    </span>
  )
}

// Numeric badge for counts
export function BadgeCount({
  count,
  max = 99,
  variant = 'primary',
  className = '',
}: {
  count: number
  max?: number
  variant?: 'primary' | 'default'
  className?: string
}) {
  const displayCount = count > max ? `${max}+` : count.toString()
  const bgColor = variant === 'primary' ? 'bg-hs-red-600' : 'bg-gray-600'

  return (
    <span
      className={`
        inline-flex items-center justify-center
        min-w-5 h-5 px-1.5
        text-xs font-bold text-white
        rounded-full
        ${bgColor}
        ${className}
      `
        .trim()
        .replace(/\s+/g, ' ')}
    >
      {displayCount}
    </span>
  )
}
