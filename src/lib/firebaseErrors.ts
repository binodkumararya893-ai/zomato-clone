/**
 * Firebase config validation ke liye custom error.
 * Isko alag file me rakha hai taaki ErrorBoundary import kar sake
 * bina Firebase module ke side effects trigger kiye.
 */
export class FirebaseSetupError extends Error {
  readonly missing: string[]

  constructor(missing: string[]) {
    super(
      `Firebase config missing: ${missing.join(', ')}. ` +
        'Copy `.env.example` to `.env.local` and fill your Firebase web app config.',
    )
    this.name = 'FirebaseSetupError'
    this.missing = missing
  }
}