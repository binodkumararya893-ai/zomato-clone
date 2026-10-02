import { Link } from 'react-router-dom'
import { formatCount, formatINR } from '@/utils/format'
import type { Restaurant } from '@/types'

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link
      to={`/restaurant/${restaurant.slug}`}
      className="group overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md"
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

      <div className="p-4">
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
      </div>
    </Link>
  )
}