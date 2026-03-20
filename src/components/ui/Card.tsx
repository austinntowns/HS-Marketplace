import { forwardRef } from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'elevated' | 'outline'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  children: React.ReactNode
}

const variantStyles = {
  default: 'bg-white border border-gray-200',
  interactive: `
    bg-white border border-gray-200
    hover:border-gray-300 hover:shadow-lg
    cursor-pointer
    transition-all duration-200
  `,
  elevated: 'bg-white shadow-lg border border-gray-100',
  outline: 'bg-transparent border-2 border-gray-900',
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { variant = 'default', padding = 'md', hover, className = '', children, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-xl
          ${variantStyles[variant]}
          ${paddingStyles[padding]}
          ${hover ? 'hover-lift' : ''}
          ${className}
        `
          .trim()
          .replace(/\s+/g, ' ')}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Card sub-components for structured layouts
export function CardHeader({
  className = '',
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={`mb-4 ${className}`}>{children}</div>
}

export function CardTitle({
  as: Component = 'h3',
  className = '',
  children,
}: {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  className?: string
  children: React.ReactNode
}) {
  return (
    <Component
      className={`font-semibold text-gray-900 tracking-tight ${className}`}
    >
      {children}
    </Component>
  )
}

export function CardDescription({
  className = '',
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <p className={`text-sm text-gray-500 mt-1 ${className}`}>{children}</p>
}

export function CardContent({
  className = '',
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={className}>{children}</div>
}

export function CardFooter({
  className = '',
  children,
  noBorder,
}: {
  className?: string
  children: React.ReactNode
  noBorder?: boolean
}) {
  return (
    <div
      className={`
        mt-4 pt-4
        ${noBorder ? '' : 'border-t border-gray-100'}
        ${className}
      `
        .trim()
        .replace(/\s+/g, ' ')}
    >
      {children}
    </div>
  )
}

// Featured card variant with accent border
export function CardFeatured({
  padding = 'md',
  className = '',
  children,
  ...props
}: Omit<CardProps, 'variant'>) {
  return (
    <div
      className={`
        relative bg-white rounded-xl
        border-2 border-hs-red-600
        shadow-lg
        ${paddingStyles[padding]}
        ${className}
      `
        .trim()
        .replace(/\s+/g, ' ')}
      {...props}
    >
      <div className="absolute -top-3 left-4">
        <span className="inline-flex items-center px-3 py-1 bg-hs-red-600 text-white text-xs font-bold rounded-full uppercase tracking-wide">
          Featured
        </span>
      </div>
      {children}
    </div>
  )
}
