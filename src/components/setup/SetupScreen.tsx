import { FirebaseSetupError } from '@/lib/firebaseErrors'

interface Props {
  missing?: string[]
  error?: unknown
}

/**
 * Firebase config missing / init fail hone par dikhta hai.
 * Module-load errors React error boundary nahi pakad sakte,
 * isliye bootstrap se pehle render hota hai.
 */
export function SetupScreen({ missing = [], error }: Props) {
  const detail = error instanceof FirebaseSetupError ? error.message : undefined
  const otherError = error && !(error instanceof FirebaseSetupError)

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7] p-6">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-2xl">
          🔥
        </div>
        <h1 className="text-xl font-bold text-gray-900">Firebase setup chahiye</h1>

        {detail ? (
          <p className="mt-2 text-sm text-gray-600">{detail}</p>
        ) : otherError ? (
          <p className="mt-2 text-sm text-gray-600">
            App start nahi hua:{' '}
            {error instanceof Error ? error.message : 'unknown error'}. Console check karo.
          </p>
        ) : (
          <p className="mt-2 text-sm text-gray-600">
            Firebase config nahi mila. Ye 4 steps follow karo:
          </p>
        )}

        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-gray-700">
          <li>
            Firebase Console → project <strong>flipmart-c8f97</strong> → ⚙ Project settings → Your apps
          </li>
          <li>
            Web app (<code className="rounded bg-gray-100 px-1">)</code> icon click karke config copy karo
          </li>
          <li>
            <code className="rounded bg-gray-100 px-1">.env.example</code> ko{' '}
            <code className="rounded bg-gray-100 px-1">.env.local</code> me copy karo aur values bharo
          </li>
          <li>Dev server restart karo: <code className="rounded bg-gray-100 px-1">npm run dev</code></li>
        </ol>

        {missing.length > 0 && (
          <div className="mt-4 rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-700">Missing env keys:</p>
            <ul className="mt-1 list-inside list-disc text-xs text-gray-500">
              {missing.map((key) => (
                <li key={key}>
                  <code>{key}</code>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Reload
        </button>
      </div>
    </div>
  )
}