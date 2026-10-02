import type { ReactNode } from 'react'
import { AuthProvider } from '@/hooks/AuthProvider'
import { CartProvider } from '@/hooks/CartProvider'
import { useAuth } from '@/hooks/useAuth'

/** Cart ko current uid ke saath wrap karta hai (bridge component). */
export function AppProviders({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  return <CartProvider userId={user?.uid ?? null}>{children}</CartProvider>
}

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AppProviders>{children}</AppProviders>
    </AuthProvider>
  )
}