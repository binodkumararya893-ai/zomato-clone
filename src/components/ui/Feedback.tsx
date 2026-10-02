import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Spinner } from '@/components/ui/Button'

export function Loader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
      <Spinner className="h-8 w-8 text-red-600" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
      <div className="h-44 w-full bg-gray-200" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-200" />
      </div>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="mx-auto max-w-md rounded-xl bg-red-50 p-6 text-center ring-1 ring-red-100">
      <p className="font-medium text-red-800">Kuch gadbad ho gayi</p>
      <p className="mt-1 text-sm text-red-700">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Dobara try karo
        </button>
      )}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: { label: string; to: string }
}) {
  return (
    <div className="mx-auto max-w-md rounded-xl bg-white p-10 text-center ring-1 ring-gray-100">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
        🍽️
      </div>
      <p className="font-semibold text-gray-900">{title}</p>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      {action && (
        <Link
          to={action.to}
          className="mt-5 inline-block rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}

export function PageShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">{children}</div>
}