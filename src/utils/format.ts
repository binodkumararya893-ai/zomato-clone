/** Pure formatting / money helpers — no React, no Firebase. */

export const DELIVERY_FEE = 39
export const TAX_RATE = 0.05
export const FREE_DELIVERY_ABOVE = 499

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCount(count: number): string {
  if (count >= 1000) {
    const thousands = count / 1000
    return `${thousands >= 10 ? Math.round(thousands) : thousands.toFixed(1)}K`
  }
  return String(count)
}

export function orderTotals(subtotal: number) {
  // Empty cart pe delivery fee nahi lagti, warna ₹39 ka phantom total dikhta hai.
  const deliveryFee =
    subtotal <= 0 || subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE
  const taxes = Math.round(subtotal * TAX_RATE)
  return { subtotal, deliveryFee, taxes, total: subtotal + deliveryFee + taxes }
}

/** Firestore Timestamp | Date | number | undefined -> Date | null */
export function toDate(value: unknown): Date | null {
  if (value == null) return null
  if (value instanceof Date) return value
  if (typeof value === 'number') return new Date(value)
  if (typeof value === 'object' && 'toDate' in value) {
    const candidate = (value as { toDate: () => Date }).toDate
    return typeof candidate === 'function' ? candidate.call(value) : null
  }
  return null
}

export function formatDate(value: unknown): string {
  const date = toDate(value)
  if (!date) return ''
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}