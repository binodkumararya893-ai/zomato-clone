import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/hooks/useCart'
import { formatINR, orderTotals } from '@/utils/format'

export function CartSummary({ action }: { action: React.ReactNode }) {
  const { lines, subtotal, setQuantity, removeItem } = useCart()
  const [expanded, setExpanded] = useState(false)
  const totals = orderTotals(subtotal)

  const visible = expanded ? lines : lines.slice(0, 3)

  return (
    <aside className="lg:sticky lg:top-20">
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
        <h2 className="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-900">
          Order summary
        </h2>

        <ul className="divide-y divide-gray-50">
          {visible.map((line) => (
            <li key={line.itemId} className="flex items-start gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{line.itemName}</p>
                <p className="text-xs text-gray-500">{formatINR(line.price)} each</p>
                <div className="mt-1.5 inline-flex items-center rounded-lg ring-1 ring-red-600">
                  <button
                    onClick={() => setQuantity(line.itemId, line.quantity - 1)}
                    aria-label={`${line.itemName} quantity decrease`}
                    className="px-2.5 py-0.5 text-red-600"
                  >
                    −
                  </button>
                  <span className="min-w-6 text-center text-sm font-medium text-gray-900">
                    {line.quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(line.itemId, line.quantity + 1)}
                    aria-label={`${line.itemName} quantity increase`}
                    className="px-2.5 py-0.5 text-red-600"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-semibold text-gray-900">
                  {formatINR(line.price * line.quantity)}
                </span>
                <Button size="sm" variant="ghost" onClick={() => removeItem(line.itemId)}>
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>

        {lines.length === 0 && (
          <p className="border-b border-gray-100 px-4 py-6 text-center text-sm text-gray-500">
            Cart khali hai — koi item add karo.
          </p>
        )}

        {lines.length > 3 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full border-t border-gray-100 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            {expanded ? 'Kam dikhao' : `${lines.length - 3} aur items dikhao`}
          </button>
        )}

        <dl className="space-y-2 border-t border-gray-100 px-4 py-3 text-sm">
          <div className="flex justify-between text-gray-600">
            <dt>Item total</dt>
            <dd>{formatINR(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between text-gray-600">
            <dt>Delivery fee</dt>
            <dd className={totals.deliveryFee === 0 ? 'text-green-600' : ''}>
              {totals.deliveryFee === 0 ? 'FREE' : formatINR(totals.deliveryFee)}
            </dd>
          </div>
          <div className="flex justify-between text-gray-600">
            <dt>Taxes & fees</dt>
            <dd>{formatINR(totals.taxes)}</dd>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold text-gray-900">
            <dt>To pay</dt>
            <dd>{formatINR(totals.total)}</dd>
          </div>
        </dl>

        <div className="border-t border-gray-100 p-4">{action}</div>
      </div>
    </aside>
  )
}