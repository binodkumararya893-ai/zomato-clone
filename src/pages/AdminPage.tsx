import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadImage, MAX_IMAGE_BYTES } from '@/lib/storage'
import { fetchRestaurants } from '@/services/restaurants'
import { seedDemoData } from '@/services/seed'
import { useAsync } from '@/hooks/useAsync'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Form'
import { PageShell } from '@/components/ui/Feedback'

/**
 * Admin image upload demo — Firebase Storage.
 * Production me imageURL Firestore document me write karna hoga.
 */
export default function AdminPage() {
  const navigate = useNavigate()
  const restaurants = useAsync(() => fetchRestaurants(), [])
  const [scope, setScope] = useState<'restaurant' | 'menu'>('restaurant')
  const [restaurantId, setRestaurantId] = useState('')
  const [itemId, setItemId] = useState('')
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [seedNote, setSeedNote] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSeed() {
    setSeeding(true)
    setSeedNote(null)
    setError(null)
    try {
      const count = await seedDemoData()
      setSeedNote(`${count} demo restaurants Firestore me likh di gayi.`)
      restaurants.reload()
    } catch (err) {
      setError(
        err instanceof Error
          ? `Seed fail hua: ${err.message}`
          : 'Seed fail hua. Admin role check karo (Firestore console me users/{uid}.role = admin).',
      )
    } finally {
      setSeeding(false)
    }
  }

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)
    setUrl(null)
    setProgress(0)
    try {
      const base =
        scope === 'restaurant'
          ? `restaurants/${restaurantId || 'unassigned'}`
          : `restaurants/${restaurantId}/menu/${itemId || 'unassigned'}`
      const downloadUrl = await uploadImage({
        path: `${base}/${Date.now()}`,
        file,
        onProgress: setProgress,
      })
      setUrl(downloadUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload fail hua.')
    } finally {
      setProgress(null)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <h1 className="text-xl font-bold text-gray-900">Admin console</h1>
        <p className="mt-1 text-sm text-gray-500">
          Demo data seed karo aur images Firebase Storage me upload karo (
          {Math.round(MAX_IMAGE_BYTES / 1024 / 1024)}MB tak).
        </p>

        <div className="mt-5 rounded-xl bg-gray-50 p-4 ring-1 ring-gray-100">
          <p className="text-sm font-medium text-gray-900">Step 1 — Demo data</p>
          <p className="mt-1 text-sm text-gray-500">
            8 restaurants + unke menu items Firestore me likhta hai. Ye button har baar safely overwrite karta hai.
          </p>
          <Button className="mt-3" loading={seeding} onClick={() => void handleSeed()}>
            Seed demo restaurants
          </Button>
          {seedNote && <p className="mt-2 text-sm text-green-700">{seedNote}</p>}
        </div>

        <p className="mt-6 text-sm font-medium text-gray-900">Step 2 — Image upload</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Select
            label="Image type"
            value={scope}
            onChange={(e) => setScope(e.target.value as 'restaurant' | 'menu')}
          >
            <option value="restaurant">Restaurant cover</option>
            <option value="menu">Dish image</option>
          </Select>

          <Select
            label="Restaurant"
            value={restaurantId}
            onChange={(e) => setRestaurantId(e.target.value)}
          >
            <option value="">Select restaurant</option>
            {(restaurants.data ?? []).map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>

          {scope === 'menu' && (
            <Input
              label="Menu item doc ID"
              name="itemId"
              placeholder="e.g. paneer-butter-masala"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
            />
          )}
        </div>

        <div className="mt-5">
          <label className="text-sm font-medium text-gray-700" htmlFor="image-file">
            Image file
          </label>
          <input
            id="image-file"
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={(e) => void handleFile(e.target.files?.[0])}
            className="mt-1.5 w-full rounded-lg border border-gray-300 p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-red-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
          />
        </div>

        {progress !== null && (
          <div className="mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-full bg-red-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-xs text-gray-500">Uploading… {progress}%</p>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {url && (
          <div className="mt-4 rounded-lg bg-green-50 p-3 ring-1 ring-green-100">
            <p className="text-sm text-green-800">Upload done! Ye URL document me save karo:</p>
            <code className="mt-2 block break-all text-xs text-green-900">{url}</code>
            <img src={url} alt="Uploaded preview" className="mt-3 h-32 w-32 rounded-lg object-cover" />
          </div>
        )}

        <Button className="mt-6" variant="secondary" onClick={() => navigate('/')}>
          Back to app
        </Button>
      </div>
    </PageShell>
  )
}