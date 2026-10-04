import { Link } from 'react-router-dom'
import { formatCount, formatINR } from '@/utils/format'
import type { Restaurant, SoldItem } from '@/types'

/**
 * Card ke andar niche top most-sold dishes.
 *
 * Ye alag `<Link>` nahi hai — poora card pehle se ek link hai aur destination
 * wahi hai (restaurant menu page). Nested anchor invalid HTML hota, isliye rows
 * plain text hain aur click card ke kahin se bhi kaam karta hai.
 *
 * Sirf unhi items ki list banti hai jinka sales counter exist karta hai.
 */
function MostSoldList({ items }: { items: SoldItem[] }) {
  if (items.length === 0) return null

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        🔥 Most sold
      </p>
      <ul className="mt-1.5 space-y-1">
        {items.map((item, index) => (
          <li key={item.id} className="flex items-center gap-2 text-xs">
            <span className="w-3 shrink-0 font-semibold text-gray-400">{index + 1}.</span>
            <span className="min-w-0 flex-1 truncate text-gray-700">{item.itemName}</span>
            <span className="shrink-0 font-medium text-gray-900">{formatINR(item.price)}</span>
            <span className="shrink-0 rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
              {formatCount(item.soldCount)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function RestaurantCard({
  restaurant,
  soldItems = [],
}: {
  restaurant: Restaurant
  soldItems?: SoldItem[]
}) {
  return (
    <Link
      to={`/restaurant/${restaurant.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md"
    >
      <div className="relative h-44 overflow-hidden bg-gray-100">
        {restaurant.imageUrl ? (
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl">🍛</div>
        )}
        {restaurant.offer && (
          <span className="absolute bottom-2 left-2 rounded-md bg-black/75 px-2 py-1 text-xs font-semibold text-white">
            {restaurant.offer}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="truncate font-semibold text-gray-900">{restaurant.name}</h3>
          <span className="flex shrink-0 items-center gap-1 rounded-md bg-green-600 px-1.5 py-0.5 text-xs font-semibold text-white">
            ★ {restaurant.rating.toFixed(1)}
          </span>
        </div>
        <p className="mt-1 truncate text-sm text-gray-500">{restaurant.cuisines.join(' • ')}</p>
        <p className="mt-1 text-sm text-gray-500">
          {formatINR(restaurant.priceForTwo)} for two • {restaurant.deliveryTimeMinutes} min
        </p>
        <p className="mt-1 text-xs text-gray-400">
          {restaurant.location.area}, {restaurant.location.city} ({formatCount(restaurant.ratingCount)} ratings)
        </p>

        {/* flex-1 spacer taaki cards ki heights ke comparable rahen
            aur sold-lists har card me same baseline pe shuru ho. */}
        <div className="flex-1" />

        <MostSoldList items={soldItems} />
      </div>
    </Link>
  )
}