import { Link } from 'react-router-dom'
import { PageShell } from '@/components/ui/Feedback'

export default function NotFoundPage() {
  return (
    <PageShell>
      <div className="py-24 text-center">
        <p className="text-6xl font-black text-red-600">404</p>
        <h1 className="mt-4 text-xl font-semibold text-gray-900">Page nahi mila</h1>
        <p className="mt-1 text-sm text-gray-500">Link shayad galat hai ya page hat gaya.</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700"
        >
          Home pe jao
        </Link>
      </div>
    </PageShell>
  )
}