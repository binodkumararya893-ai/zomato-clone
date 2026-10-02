import { useEffect, useState } from 'react'
import { fetchUserOrders, subscribeUserOrders } from '@/services/orders'
import type { Order } from '@/types'

export interface LiveOrdersState {
  orders: Order[]
  loading: boolean
  error: string | null
}

interface InternalState {
  /** Kis uid ke liye ye state valid hai. */
  uid: string | null
  orders: Order[]
  loading: boolean
  error: string | null
}

const INITIAL: InternalState = { uid: null, orders: [], loading: true, error: null }

/**
 * User ke orders live subscribe karta hai.
 *
 * Pehle ek fetch + phir `onSnapshot` — taaki listener banne se pehle bhi
 * data dikhe aur reconnect par kuch na chhoothe.
 *
 * `uid` badalne pe naya subscription lagta hai; loading state render me derive
 * hoti hai (effect me synchronous setState se cascading renders avoid karne ke liye).
 */
export function useLiveOrders(uid: string | null): LiveOrdersState {
  const [state, setState] = useState<InternalState>(INITIAL)

  useEffect(() => {
    if (!uid) return

    let cancelled = false

    // Initial fetch — listener ready hone se pehle UI khaali na dikhe
    void fetchUserOrders(uid)
      .then((initial) => {
        if (!cancelled && initial.length > 0) {
          setState((prev) =>
            prev.uid === uid ? { ...prev, orders: initial, loading: false } : prev,
          )
        }
      })
      // Ignore — listener ka error path user ko dikhata hai
      .catch(() => undefined)

    const unsubscribe = subscribeUserOrders(
      uid,
      (live) => {
        if (cancelled) return
        setState({ uid, orders: live, loading: false, error: null })
      },
      (message) => {
        if (cancelled) return
        setState((prev) => (prev.uid === uid ? { ...prev, loading: false, error: message } : prev))
      },
    )

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [uid])

  if (!uid) return { orders: [], loading: false, error: null }

  // Naye uid ke liye state stale hai → loading dikhao
  const isStale = state.uid !== uid

  return {
    orders: isStale ? [] : state.orders,
    loading: isStale || state.loading,
    error: isStale ? null : state.error,
  }
}