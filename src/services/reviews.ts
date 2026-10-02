/**
 * Reviews & ratings.
 *
 * Aggregate rating restaurant document me store hota hai (taaki listing page
 * par ek hi read se rating aa jaye). Aggregate, reviews subcollection se
 * recompute hota hai — isliye manually badli rating kabhi drift nahi karti.
 */
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Review } from '@/types'

function docToReview(snapId: string, data: Record<string, unknown>): Review {
  return {
    id: snapId,
    restaurantId: String(data.restaurantId ?? ''),
    userId: String(data.userId ?? ''),
    userName: String(data.userName ?? 'Guest'),
    rating: Number(data.rating ?? 0),
    comment: String(data.comment ?? ''),
    createdAt: data.createdAt,
  }
}

export async function fetchReviews(restaurantId: string, limitCount = 20): Promise<Review[]> {
  const snap = await getDocs(
    query(
      collection(db, 'restaurants', restaurantId, 'reviews'),
      orderBy('createdAt', 'desc'),
      limit(limitCount),
    ),
  )
  return snap.docs.map((d) => docToReview(d.id, d.data()))
}

/** Average + count recompute karke restaurant doc update karta hai. */
async function syncAggregate(restaurantId: string) {
  const reviewsSnap = await getDocs(collection(db, 'restaurants', restaurantId, 'reviews'))
  const ratings = reviewsSnap.docs.map((d) => Number(d.data().rating ?? 0))

  const ratingCount = ratings.length
  const average =
    ratingCount === 0 ? 0 : Math.round((ratings.reduce((a, b) => a + b, 0) / ratingCount) * 10) / 10

  await updateDoc(doc(db, 'restaurants', restaurantId), {
    rating: average,
    ratingCount,
  })
}

/**
 * Ek user ka ek review per restaurant (document ID = userId).
 * Naya review ya update — dono same call se.
 */
export async function upsertReview(input: {
  restaurantId: string
  userId: string
  userName: string
  rating: number
  comment: string
}): Promise<void> {
  if (input.rating < 1 || input.rating > 5) {
    throw new Error('Rating 1 se 5 ke beech honi chahiye.')
  }

  await setDoc(doc(db, 'restaurants', input.restaurantId, 'reviews', input.userId), {
    restaurantId: input.restaurantId,
    userId: input.userId,
    userName: input.userName,
    rating: input.rating,
    comment: input.comment.trim(),
    createdAt: serverTimestamp(),
  })

  await syncAggregate(input.restaurantId)
}

export async function deleteReview(restaurantId: string, userId: string): Promise<void> {
  await deleteDoc(doc(db, 'restaurants', restaurantId, 'reviews', userId))
  await syncAggregate(restaurantId)
}

export async function getMyReview(restaurantId: string, userId: string): Promise<Review | null> {
  const snap = await getDoc(doc(db, 'restaurants', restaurantId, 'reviews', userId))
  return snap.exists() ? docToReview(snap.id, snap.data()) : null
}