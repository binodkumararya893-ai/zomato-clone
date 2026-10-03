import { useMemo, useState } from 'react'
import { fetchRestaurants } from '@/services/restaurants'
import { useAsync } from '@/hooks/useAsync'
import { RestaurantCard } from '@/components/restaurant/RestaurantCard'
import { EmptyState, ErrorState, PageShell, SkeletonCard } from '@/components/ui/Feedback'
import { Select } from '@/components/ui/Form'
import { CUISINES } from '@/types'

export default function HomePage() {
  const { data, loading, error, reload } = useAsync(() => fetchRestaurants(), [])
  const [search, setSearch] = useState('')
  const [cuisine, setCuisine] = useState('all')
  const [sort, setSort] = useState('rating')

  const filtered = useMemo(() => {
    const all = data ?? []
    const query = search.trim().toLowerCase()
    const result = all.filter((r) => {
      const matchesSearch =
        !query ||
        r.name.toLowerCase().includes(query) ||
        r.cuisines.some((c) => c.toLowerCase().includes(query)) ||
        r.location.area.toLowerCase().includes(query)
      const matchesCuisine = cuisine === 'all' || r.cuisines.includes(cuisine as never)
      return matchesSearch && matchesCuisine
    })

    return [...result].sort((a, b) => {
      if (sort === 'price-low') return a.priceForTwo - b.priceForTwo
      if (sort === 'delivery') return a.deliveryTimeMinutes - b.deliveryTimeMinutes
      return b.rating - a.rating
    })
  }, [data, search, cuisine, sort])

  return (
    <PageShell>
      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-6 py-10 text-white sm:px-10">
        <h1 className="text-3xl font-black sm:text-4xl">Zomato Clone Hub</h1>
        <p className="mt-2 max-w-lg text-white/90">
          Best restaurants near you, fast delivery aur transparent pricing.
        </p>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Restaurant, cuisine ya area search karo"
          aria-label="Search restaurants"
          className="mt-6 w-full max-w-md rounded-lg bg-white px-4 py-3 text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-2 focus:outline-white dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
        />
      </section>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div className="w-44">
          <Select label="Cuisine" value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
            <option value="all">All cuisines</option>
            {CUISINES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-48">
          <Select label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="rating">Rating</option>
            <option value="delivery">Delivery time</option>
            <option value="price-low">Price: low to high</option>
          </Select>
        </div>
        <p className="ml-auto text-sm text-gray-500 dark:text-gray-400">{filtered.length} restaurants</p>
      </div>

      {loading && (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="mt-10">
          <ErrorState message={error} onRetry={reload} />
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="mt-10">
          <EmptyState
            title="Koi restaurant nahi mila"
            description="Search ya filters change karke dekho."
            action={{ label: 'Clear filters', to: '/' }}
          />
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </PageShell>
  )
}