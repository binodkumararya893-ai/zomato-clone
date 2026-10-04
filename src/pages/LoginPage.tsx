import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { loginWithEmail, loginWithGoogle, signupWithEmail } from '@/services/auth'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Form'
import { PageShell } from '@/components/ui/Feedback'

type Mode = 'login' | 'signup'

export default function LoginPage() {
  const { user, initialising } = useAuth()
  const location = useLocation()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/orders'

  if (!initialising && user) return <Navigate to={from} replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password)
      } else {
        await signupWithEmail(email, password, email.split('@')[0] ?? 'Guest')
      }
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogle() {
    setBusy(true)
    setError(null)
    try {
      await loginWithGoogle()
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-md rounded-2xl bg-white p-7 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {mode === 'login' ? 'Login' : 'Create account'}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {mode === 'login' ? 'Order track karne ke liye login karo.' : 'Naye user ke liye signup.'}
        </p>

        <Button
          variant="secondary"
          className="mt-5 w-full"
          onClick={() => void handleGoogle()}
          disabled={busy}
        >
          <GoogleIcon /> Continue with Google
        </Button>

        <div className="my-5 flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
          <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
          OR
          <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" loading={busy}>
            {mode === 'login' ? 'Login' : 'Signup'}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === 'login' ? 'signup' : 'login'))
            setError(null)
          }}
          className="mt-4 w-full text-center text-sm text-gray-600 hover:text-red-600"
        >
          {mode === 'login' ? 'Naya account banao? Signup karo' : 'Account hai? Login karo'}
        </button>
      </div>
    </PageShell>
  )
}

function friendlyError(error: unknown): string {
  const code = (error as { code?: string } | null)?.code
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email ya password galat hai.'
    case 'auth/email-already-in-use':
      return 'Ye email pehle se registered hai. Login karo.'
    case 'auth/weak-password':
      return 'Password kam se kam 6 characters ka rakho.'
    case 'auth/popup-closed-by-user':
      return 'Google popup band ho gaya. Dobara try karo.'
    case 'auth/operation-not-allowed':
      return 'Google login abhi enable nahi hai. Firebase Console → Authentication → Sign-in method me Google enable karo.'
    case 'auth/unauthorized-domain':
      return 'Ye domain authorized nahi hai. Firebase Console → Authentication → Settings → Authorized domains me apna domain add karo.'
    case 'auth/account-exists-with-different-credential':
      return 'Ye email pehle se email/password se bana hai. Password se login karo.'
    default:
      return error instanceof Error ? error.message : 'Login nahi hua. Dobara try karo.'
  }
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3a7.2 7.2 0 0 1-10.7-3.8h-4v3.1A12 12 0 0 0 12 24z"
      />
      <path fill="#FBBC05" d="M5.3 14.3a7.1 7.1 0 0 1 0-4.6v-3.1h-4a12 12 0 0 0 0 10.8l4-3.1z" />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1A7.2 7.2 0 0 1 12 4.8z"
      />
    </svg>
  )
}