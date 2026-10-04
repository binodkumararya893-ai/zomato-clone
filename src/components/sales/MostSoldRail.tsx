import { Link } from 'react-router-dom'
import { formatCount, formatINR } from '@/utils/format'
import { useAsync } from '@/hooks/useAsync'
import { fetchMostSoldItems } from '@/services/sales'
import { SkeletonCard } from '@/components/ui/Feedback'
import type { SoldItem } from '@/types'

/** Ek item ka card — rank badge, dish, restaurant aur sold count. */
function SoldItemCard({ item, rank }: { item: SoldItem; rank: number }) {
  return (
    <Link
      to={`/restaurant/${item.restaurantSlug || item.restaurantId}`}
      className="group w-52 shrink-0 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md"
    >
      <div className="relative h-28 overflow-hidden bg-gray-100">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.itemName}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl">🍽️</div>
        )}
        <span className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-xs font-black text-white shadow">
          {rank}
        </span>
      </div>

      <div className="p-3">
        <p className="truncate font-semibold text-gray-900">{item.itemName}</p>
        <p className="mt-0.5 truncate text-xs text-gray-500">{item.restaurantName}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">{formatINR(item.price)}</span>
          <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
            {formatCount(item.soldCount)} sold
          </span>
        </div>
      </div>
    </Link>
  )
}

/**
 * Homepage ka "Most sold" rail.
 *
 * Data `itemSales` counters se aata hai, orders se nahi — orders private
 * collection hai. Isliye ye tab meaningful hota hai jab counters bane hon;
 * warna section chhup jaata hai (koi fake data dikhane se behtar).
 */
export function MostSoldRail() {
  const { data, loading, error } = useAsync(() => fetchMostSoldItems(10), [])

  // Koi counter nahi (ya fetch fail) — section render karne ka koi reason nahi.
  if (!loading && (error || (data?.length ?? 0) === 0)) return null

  return (
    <section className="mt-10" aria-labelledby="most-sold-heading">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 id="most-sold-heading" className="text-xl font-bold text-gray-900">
            🔥 Most sold items
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">Abhi sabse zyada order hone wale dishes</p>
        </div>
      </div>

      {loading && (
        <div className="mt-4 flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && data && data.length > 0 && (
        <div className="mt-4 flex gap-4 overflow-x-auto pb-3">
          {data.map((item, index) => (
            <SoldItemCard key={item.id} item={item} rank={index + 1} />
          ))}
        </div>
      )}
    </section>
  )
}