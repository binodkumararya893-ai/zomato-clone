import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { ensureUserProfile } from '@/services/orders'
import { AuthContext, type AuthContextValue } from '@/hooks/useAuth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextValue['user']>(null)
  const [profile, setProfile] = useState<AuthContextValue['profile']>(null)
  const [initialising, setInitialising] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (!firebaseUser) {
        setProfile(null)
        setInitialising(false)
        return
      }
      try {
        setProfile(
          await ensureUserProfile(firebaseUser.uid, {
            email: firebaseUser.email ?? '',
            displayName: firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'Guest',
            photoURL: firebaseUser.photoURL,
          }),
        )
      } catch (error) {
        console.error('[auth] profile load failed', error)
      } finally {
        setInitialising(false)
      }
    })

    return unsubscribe
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, profile, isAdmin: profile?.role === 'admin', initialising }),
    [user, profile, initialising],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}