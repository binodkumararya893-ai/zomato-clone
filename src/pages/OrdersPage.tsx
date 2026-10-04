import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLiveOrders } from '@/hooks/useLiveOrders'
import { useAuth } from '@/hooks/useAuth'
import { StatusTracker } from '@/components/orders/StatusTracker'
import { EmptyState, ErrorState, Loader, PageShell } from '@/components/ui/Feedback'
import { formatDate, formatINR } from '@/utils/format'
import type { OrderStatus, PaymentStatus } from '@/types'

const STATUS_STYLES: Record<OrderStatus, string> = {
  placed: 'bg-yellow-50 text-yellow-700 ring-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300 dark:ring-yellow-900',
  preparing:
    'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-900',
  'out-for-delivery':
    'bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:ring-purple-900',
  delivered:
    'bg-green-50 text-green-700 ring-green-200 dark:bg-green-950/50 dark:text-green-300 dark:ring-green-900',
  cancelled:
    'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-900',
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: 'Order placed',
  preparing: 'Preparing',
  'out-for-delivery': 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  pending: 'Payment pending',
  paid: 'Paid',
  failed: 'Payment failed',
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const { orders, loading, error } = useLiveOrders(user?.uid ?? null)

  // Success banner ko ek baar dikhake hata do.
  useEffect(() => {
    if (params.get('placed')) {
      const timer = window.setTimeout(() => setParams({}, { replace: true }), 4000)
      return () => window.clearTimeout(timer)
    }
  }, [params, setParams])

  return (
    <PageShell>
      <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">My orders</h1>

      {params.get('placed') && (
        <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 ring-1 ring-green-100 dark:bg-green-950/50 dark:text-green-300 dark:ring-green-900">
          🎉 Order place ho gaya! Restaurant jaldi start kar dega.
        </div>
      )}

      {loading && <Loader label="Orders load ho rahe hain…" />}
      {error && !loading && <ErrorState message={error} onRetry={() => window.location.reload()} />}

      {!loading && !error && orders.length === 0 && (
        <EmptyState
          title="Abhi koi order nahi"
          description="Pehla order place karo, yahan dikhega."
          action={{ label: 'Order food', to: '/' }}
        />
      )}

      <ul className="space-y-4">
        {orders.map((order) => (
          <li key={order.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{order.restaurantName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Order #{order.id.slice(0, 8)} • {formatDate(order.createdAt)}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${STATUS_STYLES[order.status]}`}
              >
                {STATUS_LABELS[order.status]}
              </span>
            </div>

            <ul className="mt-3 space-y-1 text-sm text-gray-600">
              {order.items.map((item) => (
                <li key={item.itemId} className="flex justify-between">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>{formatINR(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 text-sm dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">
                Deliver to: {order.address.line1}, {order.address.city} - {order.address.pincode}
              </span>
              <span className="flex items-center gap-2">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Razorpay'} ·{' '}
                  {PAYMENT_LABELS[order.paymentStatus]}
                </span>
                <span className="font-bold text-gray-900 dark:text-gray-100">{formatINR(order.total)}</span>
              </span>
            </div>

            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <StatusTracker status={order.status} />
            )}
          </li>
        ))}
      </ul>
    </PageShell>
  )
}