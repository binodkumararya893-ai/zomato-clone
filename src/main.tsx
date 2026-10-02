import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { SetupScreen } from '@/components/setup/SetupScreen'
import { missingFirebaseEnvKeys } from '@/lib/firebaseEnv'
import '@/index.css'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('#root element nahi mila')

const root = createRoot(rootElement)

/**
 * App ko dynamically import karte hain:
 * Firebase config missing hone par app crash ho, blank screen na dikhe —
 * setup instructions dikhaye jaayein.
 */
async function bootstrap() {
  const missing = missingFirebaseEnvKeys()
  if (missing.length > 0) {
    root.render(
      <StrictMode>
        <SetupScreen missing={missing} />
      </StrictMode>,
    )
    return
  }

  try {
    const [{ BrowserRouter }, { RootProviders }, { default: App }] = await Promise.all([
      import('react-router-dom'),
      import('@/components/layout/RootProviders'),
      import('@/App'),
    ])

    root.render(
      <StrictMode>
        <ErrorBoundary>
          <BrowserRouter>
            <RootProviders>
              <App />
            </RootProviders>
          </BrowserRouter>
        </ErrorBoundary>
      </StrictMode>,
    )
  } catch (error) {
    root.render(
      <StrictMode>
        <SetupScreen error={error} />
      </StrictMode>,
    )
  }
}

void bootstrap()