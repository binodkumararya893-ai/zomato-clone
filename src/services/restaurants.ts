/**
 * Restaurant + menu data access.
 * UI components seedha Firestore nahi touch karte — sab yahan se.
 */
import {
  collection,
  getDocs,
  getDoc,
  doc,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Cuisines, MenuItem, Restaurant } from '@/types'

function docToRestaurant(snapId: string, data: Record<string, unknown>): Restaurant {
  return {
    id: snapId,
    name: String(data.name ?? ''),
    slug: String(data.slug ?? snapId),
    imageUrl: String(data.imageUrl ?? ''),
    cuisines: Array.isArray(data.cuisines) ? (data.cuisines as Cuisines[]) : [],
    rating: Number(data.rating ?? 0),
    ratingCount: Number(data.ratingCount ?? 0),
    priceForTwo: Number(data.priceForTwo ?? 0),
    deliveryTimeMinutes: Number(data.deliveryTimeMinutes ?? 30),
    location: {
      area: String((data.location as { area?: string } | undefined)?.area ?? ''),
      city: String((data.location as { city?: string } | undefined)?.city ?? ''),
    },
    isVegOnly: Boolean(data.isVegOnly),
    offer: data.offer ? String(data.offer) : undefined,
    createdAt: data.createdAt,
  }
}

function docToMenuItem(snapId: string, data: Record<string, unknown>): MenuItem {
  return {
    id: snapId,
    restaurantId: String(data.restaurantId ?? ''),
    name: String(data.name ?? ''),
    description: String(data.description ?? ''),
    imageUrl: String(data.imageUrl ?? ''),
    price: Number(data.price ?? 0),
    isVeg: Boolean(data.isVeg),
    isPopular: Boolean(data.isPopular),
    category: String(data.category ?? 'Recommended'),
  }
}

export async function fetchRestaurants(limitCount = 30): Promise<Restaurant[]> {
  const snap = await getDocs(
    query(collection(db, 'restaurants'), orderBy('rating', 'desc'), limit(limitCount)),
  )
  return snap.docs.map((doc) => docToRestaurant(doc.id, doc.data()))
}

export async function fetchRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const snap = await getDocs(query(collection(db, 'restaurants'), where('slug', '==', slug), limit(1)))
  const doc = snap.docs[0]
  return doc ? docToRestaurant(doc.id, doc.data()) : null
}

export async function fetchRestaurantById(id: string): Promise<Restaurant | null> {
  const snap = await getDoc(doc(db, 'restaurants', id))
  return snap.exists() ? docToRestaurant(snap.id, snap.data()) : null
}

export async function fetchMenu(restaurantId: string): Promise<MenuItem[]> {
  const snap = await getDocs(
    query(
      collection(db, 'restaurants', restaurantId, 'menu'),
      orderBy('isPopular', 'desc'),
    ),
  )
  return snap.docs.map((doc) => docToMenuItem(doc.id, doc.data()))
}