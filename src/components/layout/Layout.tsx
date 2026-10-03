import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { logout } from '@/services/auth'
import { useCart } from '@/hooks/useCart'

export function Header() {
  const { user, profile, isAdmin } = useAuth()
  const { itemCount } = useCart()

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:py-2 sm:text-sm ${
      isActive
        ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400'
        : 'text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400'
    }`

  const displayName = profile?.displayName ?? user?.email ?? ''

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-black/80">
      {/* Narrow panels (OpenCode side pane) me bhi sab kuch dikhe —
          isliye wrap + compact spacing, koi `hidden` breakpoint nahi. */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-2 gap-y-1 px-3 py-2 sm:gap-4 sm:px-6">
        <Link to="/" className="text-lg font-black tracking-tight text-red-600 sm:text-xl">
          zomato<span className="text-gray-900 dark:text-gray-100">clone</span>
        </Link>

        <nav className="order-3 flex w-full items-center gap-1 sm:order-none sm:w-auto">
          <NavLink to="/" className={navLinkClass} end>
            Restaurants
          </NavLink>
          {user && (
            <NavLink to="/orders" className={navLinkClass}>
              My Orders
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            to="/cart"
            className="relative whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-medium text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 sm:px-3 sm:py-2 sm:text-sm"
          >
            Cart
            {itemCount > 0 && (
              <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white sm:h-5 sm:min-w-5 sm:text-[11px]">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <span
                title={displayName}
                className="max-w-20 truncate text-xs text-gray-600 dark:text-gray-400 sm:max-w-40 sm:text-sm"
              >
                {displayName}
              </span>
              <button
                onClick={() => void logout()}
                className="whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-medium text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 sm:px-3 sm:py-2 sm:text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="whitespace-nowrap rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 sm:px-4 sm:py-2 sm:text-sm"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-black">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-gray-500 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Zomato clone — React + Firebase demo project.</p>
        <p>Built for learning purposes.</p>
      </div>
    </footer>
  )
}