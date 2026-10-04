/**
 * Domain types — single source of truth for Firestore documents.
 */

export type UserRole = 'customer' | 'admin'

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL: string | null
  role: UserRole
  createdAt: unknown
}

export type Cuisines = (typeof CUISINES)[number]

export const CUISINES = [
  'Pizza',
  'Burger',
  'Biryani',
  'Chinese',
  'South Indian',
  'Desserts',
  'North Indian',
  'Seafood',
] as const

export type PriceRange = 1 | 2 | 3 | 4

export interface Restaurant {
  id: string
  name: string
  slug: string
  imageUrl: string
  cuisines: Cuisines[]
  rating: number
  ratingCount: number
  priceForTwo: number
  deliveryTimeMinutes: number
  location: { area: string; city: string }
  isVegOnly: boolean
  offer?: string
  createdAt: unknown
}

export interface MenuItem {
  id: string
  restaurantId: string
  name: string
  description: string
  imageUrl: string
  price: number
  isVeg: boolean
  isPopular: boolean
  category: string
}

export interface CartLine {
  restaurantId: string
  restaurantName: string
  itemId: string
  itemName: string
  imageUrl: string
  price: number
  quantity: number
}

export type OrderStatus = 'placed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled'

export interface OrderAddress {
  label: string
  line1: string
  line2?: string
  city: string
  pincode: string
  phone: string
}

export interface OrderItem {
  itemId: string
  name: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  userId: string
  restaurantId: string
  restaurantName: string
  items: OrderItem[]
  address: OrderAddress
  subtotal: number
  deliveryFee: number
  taxes: number
  total: number
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  createdAt: unknown
}

/**
 * Denormalized sales counter — `itemSales/{restaurantId}__{itemId}`.
 * Orders private hone ki wajah se "most sold" aggregate nahi padh sakte,
 * isliye har order place karte waqt count alag collection me increment hota hai.
 */
export interface SoldItem {
  id: string
  restaurantId: string
  restaurantSlug: string
  restaurantName: string
  itemId: string
  itemName: string
  imageUrl: string
  price: number
  soldCount: number
}

export type PaymentMethod = 'cod' | 'razorpay'

export type PaymentStatus = 'pending' | 'paid' | 'failed'

export interface Review {
  id: string
  restaurantId: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: unknown
}

/** Serializable shape stored under `users/{uid}/carts/{cartId}`. */
export interface StoredCart {
  restaurantId: string | null
  lines: CartLine[]
  updatedAt: unknown
}