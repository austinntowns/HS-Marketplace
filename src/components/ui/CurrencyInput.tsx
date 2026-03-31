'use client'

import { useState, useEffect, forwardRef } from 'react'
import { formatCurrency, parseCurrency, preventScrollChange } from '@/lib/input-utils'

interface CurrencyInputProps {
  value?: number | null
  onChange: (value: number | undefined) => void
  placeholder?: string
  id?: string
  name?: string
  disabled?: boolean
  className?: string
  error?: boolean
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput({ value, onChange, placeholder = "0", id, name, disabled, className, error }, ref) {
    const [displayValue, setDisplayValue] = useState(() => formatCurrency(value))

    // Sync display value when external value changes
    useEffect(() => {
      setDisplayValue(formatCurrency(value))
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value
      // Only allow digits and commas
      const cleaned = input.replace(/[^0-9,]/g, '')
      const formatted = formatCurrency(cleaned)
      setDisplayValue(formatted)
      onChange(parseCurrency(cleaned))
    }

    const handleBlur = () => {
      // Re-format on blur to ensure consistent display
      setDisplayValue(formatCurrency(value))
    }

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none select-none">
          $
        </span>
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          id={id}
          name={name}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onWheel={preventScrollChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            w-full pl-7 pr-3 py-2
            border rounded-lg
            focus:ring-2 focus:ring-hs-red-500 focus:border-hs-red-500
            disabled:bg-gray-50 disabled:text-gray-500
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${className || ''}
          `}
        />
      </div>
    )
  }
)
