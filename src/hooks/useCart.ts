import { createContext, useContext } from 'react'
import type { CartLine } from '@/types'

export interface CartContextValue {
  lines: CartLine[]
  restaurantId: string | null
  restaurantName: string | null
  itemCount: number
  subtotal: number
  addItem: (line: Omit<CartLine, 'quantity'>, quantity?: number) => void
  setQuantity: (itemId: string, quantity: number) => void
  removeItem: (itemId: string) => void
  clearCart: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}