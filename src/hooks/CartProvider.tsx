import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { CartContext, type CartContextValue } from '@/hooks/useCart'
import type { CartLine } from '@/types'

const STORAGE_KEY = 'zomato.cart.v1'

interface PersistedCart {
  lines: CartLine[]
  restaurantId: string | null
}

function readPersistedCart(): PersistedCart {
  if (typeof window === 'undefined') return { lines: [], restaurantId: null }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { lines: [], restaurantId: null }
    const parsed = JSON.parse(raw) as PersistedCart
    return {
      lines: Array.isArray(parsed.lines) ? parsed.lines : [],
      restaurantId: parsed.restaurantId ?? null,
    }
  } catch {
    return { lines: [], restaurantId: null }
  }
}

/**
 * Cart state: localStorage-backed, signed-in users ke liye
 * Firestore (`users/{uid}/carts/current`) se bhi sync hota hai.
 */
export function CartProvider({
  children,
  userId,
}: {
  children: ReactNode
  userId: string | null
}) {
  const [lines, setLines] = useState<CartLine[]>(() => readPersistedCart().lines)
  const [restaurantId, setRestaurantId] = useState<string | null>(
    () => readPersistedCart().restaurantId,
  )

  // Persist locally on every change.
  useEffect(() => {
    const payload: PersistedCart = { lines, restaurantId }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [lines, restaurantId])

  // Signed-in user ke cart ko Firestore se hydrate karo (one-shot).
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    void (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', userId, 'carts', 'current'))
        if (cancelled || !snap.exists()) return
        const data = snap.data() as { lines?: CartLine[]; restaurantId?: string | null }
        if (Array.isArray(data.lines) && data.lines.length > 0) {
          setLines(data.lines)
          setRestaurantId(data.restaurantId ?? null)
        }
      } catch (error) {
        console.warn('[cart] cloud sync skipped', error)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userId])

  /**
   * Cloud writes serialize + debounce hoti hain.
   *
   * Pehle har mutation apna async `setDoc` fire karta tha — wo network me
   * out-of-order complete ho sakte hain, jisse stale cart (item phir se
   * "wapas" aa jaata tha) Firestore me likh diya jaata tha.
   * Ab pending snapshot rakhte hain aur ek hi flush chalata hai.
   */
  const pendingRef = useRef<{ lines: CartLine[]; restaurantId: string | null } | null>(null)
  const flushTimerRef = useRef<number | null>(null)
  const writingRef = useRef(false)
  /** Re-schedule ke liye — self-reference se bachne ke liye ref me rakhte hain. */
  const scheduleRef = useRef<((lines: CartLine[], restaurantId: string | null) => void) | null>(null)

  const writeSnapshot = useCallback(async () => {
    const snapshot = pendingRef.current
    if (!userId || !snapshot || writingRef.current) return
    pendingRef.current = null
    writingRef.current = true

    try {
      await setDoc(
        doc(db, 'users', userId, 'carts', 'current'),
        {
          lines: snapshot.lines,
          restaurantId: snapshot.restaurantId,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
    } catch (error) {
      console.warn('[cart] cloud persist failed', error)
    } finally {
      writingRef.current = false
    }
  }, [userId])

  const runFlush = useCallback(async () => {
    flushTimerRef.current = null
    await writeSnapshot()
    // Write ke beech me naya change aaya ho to turant likho
    if (pendingRef.current) {
      scheduleRef.current?.(pendingRef.current.lines, pendingRef.current.restaurantId)
    }
  }, [writeSnapshot])

  const persistToCloud = useCallback(
    (nextLines: CartLine[], nextRestaurantId: string | null) => {
      if (!userId) return
      pendingRef.current = { lines: nextLines, restaurantId: nextRestaurantId }
      if (flushTimerRef.current !== null) window.clearTimeout(flushTimerRef.current)
      flushTimerRef.current = window.setTimeout(() => void runFlush(), 250)
    },
    [runFlush, userId],
  )

  // Ref ko effect me update karo (render me ref access allowed nahi)
  useEffect(() => {
    scheduleRef.current = persistToCloud
  }, [persistToCloud])

  // Unmount pe pending write turant flush karo (data loss na ho)
  useEffect(() => {
    return () => {
      if (flushTimerRef.current !== null) window.clearTimeout(flushTimerRef.current)
      void writeSnapshot()
    }
  }, [writeSnapshot])

  const commit = useCallback(
    (nextLines: CartLine[], nextRestaurantId: string | null) => {
      setLines(nextLines)
      setRestaurantId(nextRestaurantId)
      persistToCloud(nextLines, nextRestaurantId)
    },
    [persistToCloud],
  )

  const addItem = useCallback<CartContextValue['addItem']>(
    (line, quantity = 1) => {
      setLines((prevLines) => {
        // Ek order ek hi restaurant ka — cross-restaurant add cart replace karta hai.
        const base =
          prevLines.length > 0 && prevLines[0]?.restaurantId !== line.restaurantId ? [] : prevLines
        const existing = base.find((l) => l.itemId === line.itemId)

        const nextLines = existing
          ? base.map((l) =>
              l.itemId === line.itemId ? { ...l, quantity: l.quantity + quantity } : l,
            )
          : [...base, { ...line, quantity }]

        const nextRestaurantId = line.restaurantId
        persistToCloud(nextLines, nextRestaurantId)
        return nextLines
      })
      setRestaurantId((prev) => (prev && prev === line.restaurantId ? prev : line.restaurantId))
    },
    [persistToCloud],
  )

  const setQuantity = useCallback<CartContextValue['setQuantity']>(
    (itemId, quantity) => {
      setLines((prev) => {
        const nextLines =
          quantity <= 0
            ? prev.filter((l) => l.itemId !== itemId)
            : prev.map((l) => (l.itemId === itemId ? { ...l, quantity } : l))
        persistToCloud(nextLines, restaurantId)
        return nextLines
      })
    },
    [persistToCloud, restaurantId],
  )

  const removeItem = useCallback(
    (itemId: string) => setQuantity(itemId, 0),
    [setQuantity],
  )

  const clearCart = useCallback(() => commit([], null), [commit])

  const value = useMemo<CartContextValue>(() => {
    const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0)
    return {
      lines,
      restaurantId,
      restaurantName: lines[0]?.restaurantName ?? null,
      itemCount: lines.reduce((sum, l) => sum + l.quantity, 0),
      subtotal,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    }
  }, [lines, restaurantId, addItem, setQuantity, removeItem, clearCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}