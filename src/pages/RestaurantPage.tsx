import { useCallback, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchMenu, fetchRestaurantBySlug } from '@/services/restaurants'
import { fetchReviews, getMyReview } from '@/services/reviews'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { MenuItemRow } from '@/components/menu/MenuItemRow'
import { CartSummary } from '@/components/cart/CartSummary'
import { ReviewsSection } from '@/components/reviews/ReviewsSection'
import { LinkButton } from '@/components/ui/Button'
import { ErrorState, Loader, PageShell } from '@/components/ui/Feedback'
import { formatCount, formatINR } from '@/utils/format'

export default function RestaurantPage() {
  const { slug = '' } = useParams()
  const { user } = useAuth()

  const restaurant = useAsync(() => fetchRestaurantBySlug(slug), [slug])
  const menu = useAsync(
    () => (restaurant.data ? fetchMenu(restaurant.data.id) : Promise.resolve([])),
    [restaurant.data?.id],
  )
  const reviews = useAsync(
    () => (restaurant.data ? fetchReviews(restaurant.data.id) : Promise.resolve([])),
    [restaurant.data?.id],
  )
  const myReview = useAsync(
    () =>
      restaurant.data && user ? getMyReview(restaurant.data.id, user.uid) : Promise.resolve(null),
    [restaurant.data?.id, user?.uid],
  )

  /** Review submit/delete ke baad sab kuch refresh. */
  const refreshReviews = useCallback(() => {
    reviews.reload()
    restaurant.reload()
    if (user) myReview.reload()
  }, [reviews, restaurant, myReview, user])

  const categories = useMemo(() => {
    const items = menu.data ?? []
    return [...new Set(items.map((i) => i.category))].sort((a, b) =>
      a === 'Recommended' ? -1 : b === 'Recommended' ? 1 : a.localeCompare(b),
    )
  }, [menu.data])

  // Sirf pehli load pe full-page loader (revalidation pe data stale rehta hai)
  if ((restaurant.loading || menu.loading) && !restaurant.data) {
    return <Loader label="Menu load ho raha hai…" />
  }

  if (restaurant.error) {
    return (
      <PageShell>
        <ErrorState message={restaurant.error} onRetry={restaurant.reload} />
      </PageShell>
    )
  }

  const r = restaurant.data
  if (!r) {
    return (
      <PageShell>
        <ErrorState message="Ye restaurant nahi mila." />
      </PageShell>
    )
  }

  const items = menu.data ?? []

  return (
    <PageShell>
      <nav className="mb-4 text-sm text-gray-500">
        <Link to="/" className="hover:text-red-600">
          Restaurants
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{r.name}</span>
      </nav>

      <header className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="h-48 w-full bg-gray-100 sm:h-56">
          {r.imageUrl && (
            <img src={r.imageUrl} alt={r.name} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="p-5">
          <h1 className="text-2xl font-bold text-gray-900">{r.name}</h1>
          <p className="mt-1 text-sm text-gray-600">{r.cuisines.join(', ')}</p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1 font-semibold text-gray-900">
              ★ {r.rating.toFixed(1)}
              <span className="font-normal text-gray-500">
                ({formatCount(r.ratingCount)} ratings)
              </span>
            </span>
            <span className="text-gray-500">{formatINR(r.priceForTwo)} for two</span>
            <span className="text-gray-500">{r.deliveryTimeMinutes} min delivery</span>
            <span className="text-gray-500">
              {r.location.area}, {r.location.city}
            </span>
          </div>
          {r.offer && (
            <p className="mt-3 inline-block rounded-lg bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-700">
              🏷️ {r.offer}
            </p>
          )}
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {categories.map((category) => (
            <section key={category} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <h2 className="mb-1 text-lg font-bold text-gray-900">{category}</h2>
              <div>
                {items
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <MenuItemRow key={item.id} item={item} restaurantName={r.name} />
                  ))}
              </div>
            </section>
          ))}

          <ReviewsSection
            restaurantId={r.id}
            reviews={reviews.data ?? []}
            myReview={myReview.data ?? null}
            onChanged={refreshReviews}
          />
        </div>

        <CartSummary
          action={
            <LinkButton to="/checkout" size="lg" className="w-full">
              Checkout
            </LinkButton>
          }
        />
      </div>
    </PageShell>
  )
}