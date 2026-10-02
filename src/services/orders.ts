/**
 * Orders + user profile data access.
 */
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { friendlyFirebaseError } from '@/utils/errors'
import type { Order, OrderStatus, UserProfile, UserRole } from '@/types'

export async function ensureUserProfile(
  uid: string,
  data: { email: string; displayName: string; photoURL: string | null },
): Promise<UserProfile> {
  const userRef = doc(db, 'users', uid)
  const snap = await getDoc(userRef)

  if (!snap.exists()) {
    const profile: UserProfile = {
      uid,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      role: 'customer',
      createdAt: serverTimestamp(),
    }
    await setDoc(userRef, profile)
    return profile
  }

  const existing = snap.data()
  const role = (existing.role as UserRole) ?? 'customer'
  return {
    uid,
    email: (existing.email as string) ?? data.email,
    displayName: (existing.displayName as string) ?? data.displayName,
    photoURL: (existing.photoURL as string) ?? data.photoURL,
    role,
    createdAt: existing.createdAt,
  }
}

function docToOrder(snapId: string, data: Record<string, unknown>): Order {
  return {
    id: snapId,
    userId: String(data.userId ?? ''),
    restaurantId: String(data.restaurantId ?? ''),
    restaurantName: String(data.restaurantName ?? ''),
    items: Array.isArray(data.items) ? (data.items as Order['items']) : [],
    address: data.address as Order['address'],
    subtotal: Number(data.subtotal ?? 0),
    deliveryFee: Number(data.deliveryFee ?? 0),
    taxes: Number(data.taxes ?? 0),
    total: Number(data.total ?? 0),
    status: (data.status as OrderStatus) ?? 'placed',
    paymentMethod: (data.paymentMethod as Order['paymentMethod']) ?? 'cod',
    paymentStatus: (data.paymentStatus as Order['paymentStatus']) ?? 'pending',
    createdAt: data.createdAt,
  }
}

/**
 * Order create karte waqt totals server-calculated mat karte —
 * rules ensure karte hain ki userId apna hi bheje. Price UI ka hai.
 */
export async function placeOrder(
  order: Omit<Order, 'id' | 'status' | 'createdAt' | 'paymentStatus'>,
  paymentStatus: Order['paymentStatus'] = 'pending',
): Promise<string> {
  const ref = await addDoc(collection(db, 'orders'), {
    ...order,
    status: 'placed',
    paymentStatus,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function fetchUserOrders(uid: string, limitCount = 20): Promise<Order[]> {
  const snap = await getDocs(
    query(collection(db, 'orders'), where('userId', '==', uid), orderBy('createdAt', 'desc'), limit(limitCount)),
  )
  return snap.docs.map((d) => docToOrder(d.id, d.data()))
}

/**
 * Live orders — restaurant status change kare to UI apne aap update ho jata hai.
 * Returns an unsubscribe function.
 */
export function subscribeUserOrders(
  uid: string,
  onData: (orders: Order[]) => void,
  onError: (message: string) => void,
  limitCount = 20,
): () => void {
  return onSnapshot(
    query(
      collection(db, 'orders'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(limitCount),
    ),
    (snap) => onData(snap.docs.map((d) => docToOrder(d.id, d.data()))),
    (error) => onError(friendlyFirebaseError(error)),
  )
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), { status })
}