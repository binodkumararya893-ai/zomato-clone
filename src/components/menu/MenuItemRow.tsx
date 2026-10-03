import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { formatINR } from '@/utils/format'
import { useCart } from '@/hooks/useCart'
import type { MenuItem } from '@/types'

export function MenuItemRow({ item, restaurantName }: { item: MenuItem; restaurantName: string }) {
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addItem(
      {
        restaurantId: item.restaurantId,
        restaurantName,
        itemId: item.id,
        itemName: item.name,
        imageUrl: item.imageUrl,
        price: item.price,
      },
      qty,
    )
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1500)
  }

  return (
    <article className="flex gap-4 border-b border-gray-100 py-5 last:border-b-0 dark:border-gray-800">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
              item.isVeg ? 'border-green-600' : 'border-red-600'
            }`}
            title={item.isVeg ? 'Veg' : 'Non-veg'}
          >
            <span className={`h-2 w-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
          </span>
          <h3 className="font-medium text-gray-900 dark:text-gray-100">{item.name}</h3>
          {item.isPopular && (
            <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[11px] font-medium text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
              Bestseller
            </span>
          )}
        </div>
        <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">{formatINR(item.price)}</p>
        <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
      </div>

      <div className="flex w-32 shrink-0 flex-col items-center gap-2">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            className="h-24 w-24 rounded-lg object-cover ring-1 ring-gray-100"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-gray-100 text-2xl">
            🍲
          </div>
        )}

        {added ? (
          <span className="text-xs font-medium text-green-700">Added ✓</span>
        ) : (
          <div className="flex items-center gap-2">
            <select
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              aria-label={`${item.name} quantity`}
              className="rounded-md border border-gray-300 px-2 py-1 text-xs"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <Button size="sm" variant="secondary" onClick={handleAdd}>
              ADD
            </Button>
          </div>
        )}
      </div>
    </article>
  )
}