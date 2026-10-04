/**
 * Most-sold items — denormalized counters.
 *
 * `orders` collection rules me private hai (user sirf apne orders padh sakta
 * hai), to leaderboard ke liye saare orders aggregate karna allowed nahi.
 * Isliye har order place karte waqt `itemSales` me per-item counter increment
 * hota hai. Document ID deterministic hai — `restaurantId__itemId` — to
 * dobara order karne par naya document nahi banta, wahi counter badhta hai.
 *
 * Counter update atomic hai (`increment`), isliye do users ek saath order
 * karein to bhi total me koi race-condition lost update nahi hota.
 */
import {
  collection,
  doc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { fetchRestaurantById } from '@/services/restaurants'
import type { CartLine, SoldItem } from '@/types'

/** Deterministic doc ID — restaurant aur item dono ke naam se. */
function saleDocId(restaurantId: string, itemId: string): string {
  return `${restaurantId}__${itemId}`
}

function docToSoldItem(snapId: string, data: Record<string, unknown>): SoldItem {
  return {
    id: snapId,
    restaurantId: String(data.restaurantId ?? ''),
    restaurantSlug: String(data.restaurantSlug ?? data.restaurantId ?? ''),
    restaurantName: String(data.restaurantName ?? ''),
    itemId: String(data.itemId ?? ''),
    itemName: String(data.itemName ?? ''),
    imageUrl: String(data.imageUrl ?? ''),
    price: Number(data.price ?? 0),
    soldCount: Number(data.soldCount ?? 0),
  }
}

/**
 * Order place hone ke baad call karo. Har cart line ka counter increment hota
 * hai. `setDoc` + `merge` isliye ki pehla order bhi counter document bana de,
 * aur `increment` atomic hone se concurrent orders safe rahein.
 *
 * Best-effort hai — fail ho jaye to order phir bhi successful rehta hai,
 * bas leaderboard me wo item ka count nahi badhega.
 */
export async function recordSale(lines: CartLine[], restaurantName: string): Promise<void> {
  const valid = lines.filter((line) => line.restaurantId && line.itemId && line.quantity > 0)
  if (valid.length === 0) return

  // Cart me slug nahi hota — leaderboard ke link banane ke liye ek hi read.
  // Fail ho jaye to id hi slug maan lete hain (seed me slug == id hota hai).
  const restaurantId = valid[0]?.restaurantId ?? ''
  let slug = restaurantId
  try {
    slug = (await fetchRestaurantById(restaurantId))?.slug ?? restaurantId
  } catch {
    slug = restaurantId
  }

  const writes = valid.map((line) =>
    setDoc(
      doc(db, 'itemSales', saleDocId(line.restaurantId, line.itemId)),
      {
        restaurantId: line.restaurantId,
        restaurantSlug: slug,
        restaurantName: line.restaurantName || restaurantName,
        itemId: line.itemId,
        itemName: line.itemName,
        imageUrl: line.imageUrl,
        price: line.price,
        soldCount: increment(line.quantity),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    ).catch((error: unknown) => {
      console.warn('itemSales update fail:', error)
    }),
  )

  await Promise.all(writes)
}

/**
 * Top most-sold items. Sirf un items ka data chahiye jo document me denormalized
 * hai — isliye display ke liye restaurant + item dono ke naam store karte hain,
 * extra fetch ki zarurat nahi padti.
 */
export async function fetchMostSoldItems(limitCount = 10): Promise<SoldItem[]> {
  const snap = await getDocs(
    query(collection(db, 'itemSales'), orderBy('soldCount', 'desc'), limit(limitCount)),
  )
  return snap.docs.map((d) => docToSoldItem(d.id, d.data()))
}