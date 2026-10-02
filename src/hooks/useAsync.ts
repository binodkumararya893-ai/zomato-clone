import { useCallback, useEffect, useRef, useState } from 'react'
import { friendlyFirebaseError } from '@/utils/errors'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
  reload: () => void
}

/**
 * Generic async data hook — loading / error / reload state ke saath.
 *
 * Pehli fetch pe `loading` true hota hai. Baad me revalidation background me
 * hoti hai — stale data screen par rehta hai aur component remount nahi hota,
 * warna local UI state (jaise "saved" message) reset ho jaata hai.
 */
export function useAsync<T>(fetcher: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)
  const hasDataRef = useRef(false)

  const reload = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false

    setError(null)
    // Sirf pehli load pe spinner; revalidation background me
    setLoading(!hasDataRef.current)

    fetcher()
      .then((result) => {
        if (cancelled) return
        hasDataRef.current = true
        setData(result)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(friendlyFirebaseError(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  return { data, loading, error, reload }
}