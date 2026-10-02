/**
 * Auth context — current user + Firestore profile.
 * Fast Refresh warning avoid karne ke liye context aur provider
 * alag files mein rakhe hain (hooks-only module).
 */
import { createContext, useContext } from 'react'
import type { User } from 'firebase/auth'
import type { UserProfile } from '@/types'

export interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  isAdmin: boolean
  initialising: boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}