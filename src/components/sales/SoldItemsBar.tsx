import { useState } from 'react'
import { formatCount, formatINR } from '@/utils/format'
import { useCart } from '@/hooks/useCart'
import type { SoldItem } from '@/types'

/**
 * Restaurant card ke **bahar**, niche — most-sold items ki row jisme har item
 * ka apna ADD button hai.
 *
 * Ye jaan-boojh kar card ke bahar rakha gaya hai: `RestaurantCard` poora ek
 * `<Link>` hai, aur anchor ke andar `<button>` invalid HTML hai — browser usse
 * link ka hissa bana deta hai aur click pe cart ke bajaye page navigate ho
 * jaata. Isliye ADD yahan, link se bahar.
 */
function SoldRow({ item }: { item: SoldItem }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addItem(
      {
        restaurantId: item.restaurantId,
        restaurantName: item.restaurantName,
        itemId: item.itemId,
        itemName: item.itemName,
        imageUrl: item.imageUrl,
        price: item.price,
      },
      1,
    )
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1500)
  }

  return (
    <li className="flex items-center gap-2.5 rounded-lg bg-white px-2.5 py-2 text-xs ring-1 ring-gray-100">
      {/* Image isliye zaroori hai ki dish dikhne se hi add ka mann kare —
          naam + price se decide karna mushkil hota hai. */}
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.itemName}
          loading="lazy"
          className="h-10 w-10 shrink-0 rounded-md object-cover ring-1 ring-gray-100"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gray-100 text-base ring-1 ring-gray-100"
        >
          🍲
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-gray-900">{item.itemName}</span>
        <span className="block text-[11px] text-gray-500">
          {formatINR(item.price)}
          <span className="ml-1.5 rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
            {formatCount(item.soldCount)} sold
          </span>
        </span>
      </span>

      <button
        onClick={handleAdd}
        disabled={added}
        aria-label={`${item.itemName} add to cart`}
        className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
          added
            ? 'bg-green-50 text-green-700'
            : 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-red-600'
        }`}
      >
        {added ? 'Added ✓' : 'ADD'}
      </button>
    </li>
  )
}

/**
 * Card ke niche. Counter na ho to kuch render nahi hota — card layout
 * bilkul waisa hi rehta hai (FR-9 edge case: 0 counters).
 */
export function SoldItemsBar({ items }: { items: SoldItem[] }) {
  if (items.length === 0) return null

  return (
    <div className="mt-2">
      <p className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        <span aria-hidden="true">🔥</span> Most sold
      </p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <SoldRow key={item.id} item={item} />
        ))}
      </ul>
    </div>
  )
}