import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600',
  secondary: 'bg-white text-gray-900 ring-1 ring-gray-300 hover:bg-gray-50 focus-visible:outline-gray-500',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:outline-gray-500',
  danger: 'bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100 focus-visible:outline-red-500',
}

const SIZES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

interface CommonProps {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  )
}

type LinkButtonProps = CommonProps & { to: string }

export function LinkButton({ variant = 'primary', size = 'md', className = '', to, children }: LinkButtonProps) {
  return (
    <Link to={to} className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}>
      {children}
    </Link>
  )
}

export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
      />
    </svg>
  )
}