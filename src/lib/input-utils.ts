/**
 * Input formatting utilities for user-friendly form inputs
 */

/**
 * Format a number as currency (e.g., 1234567 -> "1,234,567")
 */
export function formatCurrency(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === '') return ''
  const num = typeof value === 'string' ? value.replace(/[^0-9]/g, '') : String(value)
  if (!num) return ''
  return Number(num).toLocaleString('en-US')
}

/**
 * Parse a formatted currency string back to a number
 */
export function parseCurrency(value: string): number | undefined {
  const num = value.replace(/[^0-9]/g, '')
  if (!num) return undefined
  return Number(num)
}

/**
 * Format phone number as (XXX) XXX-XXXX
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length === 0) return ''
  if (digits.length <= 3) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

/**
 * Parse formatted phone back to digits only
 */
export function parsePhone(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10)
}

/**
 * Prevent scroll from changing number input values
 * Use as onWheel handler: onWheel={preventScrollChange}
 */
export function preventScrollChange(e: React.WheelEvent<HTMLInputElement>) {
  e.currentTarget.blur()
}
