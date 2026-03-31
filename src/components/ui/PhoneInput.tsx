'use client'

import { useState, useEffect, forwardRef } from 'react'
import { formatPhone, parsePhone } from '@/lib/input-utils'

interface PhoneInputProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  id?: string
  name?: string
  disabled?: boolean
  className?: string
  error?: boolean
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput({ value = '', onChange, placeholder = "(555) 555-5555", id, name, disabled, className, error }, ref) {
    const [displayValue, setDisplayValue] = useState(() => formatPhone(value))

    // Sync display value when external value changes
    useEffect(() => {
      setDisplayValue(formatPhone(value))
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value
      const formatted = formatPhone(input)
      setDisplayValue(formatted)
      onChange(parsePhone(input))
    }

    return (
      <input
        ref={ref}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        id={id}
        name={name}
        value={displayValue}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`
          w-full px-3 py-2
          border rounded-lg
          min-h-[48px]
          focus:ring-2 focus:ring-hs-red-500 focus:border-hs-red-500
          disabled:bg-gray-50 disabled:text-gray-500
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className || ''}
        `}
      />
    )
  }
)
