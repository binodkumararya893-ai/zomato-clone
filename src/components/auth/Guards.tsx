import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader } from '@/components/ui/Feedback'
import { useAuth } from '@/hooks/useAuth'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, initialising } = useAuth()
  const location = useLocation()

  if (initialising) return <Loader label="Session check ho raha hai…" />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <>{children}</>
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, profile, initialising } = useAuth()
  const location = useLocation()

  if (initialising) return <Loader label="Permissions check ho rahe hain…" />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (profile?.role !== 'admin') {
    return (
      <div className="mx-auto max-w-md rounded-xl bg-white p-10 text-center ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
        <p className="font-semibold text-gray-900 dark:text-gray-100">Access denied</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Ye page sirf admins ke liye hai.</p>
      </div>
    )
  }
  return <>{children}</>
}