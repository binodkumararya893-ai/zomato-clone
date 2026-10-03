import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const FIELD =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:outline-2 focus:outline-red-500/30 focus:outline-offset-0 disabled:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:disabled:bg-gray-800'

function FieldShell({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }

export function Input({ label, error, id, className = '', ...rest }: InputProps) {
  const inputId = id ?? rest.name ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <FieldShell id={inputId} label={label} error={error}>
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`${FIELD} ${error ? 'border-red-500' : ''} ${className}`}
        {...rest}
      />
    </FieldShell>
  )
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }

export function Textarea({ label, error, id, className = '', ...rest }: TextareaProps) {
  const textareaId = id ?? rest.name ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <FieldShell id={textareaId} label={label} error={error}>
      <textarea
        id={textareaId}
        aria-invalid={Boolean(error)}
        className={`${FIELD} ${error ? 'border-red-500' : ''} ${className}`}
        {...rest}
      />
    </FieldShell>
  )
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }

export function Select({ label, error, id, className = '', children, ...rest }: SelectProps) {
  const selectId = id ?? rest.name ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <FieldShell id={selectId} label={label} error={error}>
      <select id={selectId} className={`${FIELD} ${className}`} {...rest}>
        {children}
      </select>
    </FieldShell>
  )
}