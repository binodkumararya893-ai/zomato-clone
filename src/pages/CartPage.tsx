import { Link } from 'react-router-dom'
import { useCart } from '@/hooks/useCart'
import { CartSummary } from '@/components/cart/CartSummary'
import { Button, LinkButton } from '@/components/ui/Button'
import { EmptyState, PageShell } from '@/components/ui/Feedback'

export default function CartPage() {
  const { lines } = useCart()

  if (lines.length === 0) {
    return (
      <PageShell>
        <EmptyState
          title="Cart khali hai"
          description="Kuch order karna hai? Restaurants browse karke cart bharo."
          action={{ label: 'Browse restaurants', to: '/' }}
        />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Your cart</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Items from {lines[0]?.restaurantName}</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            {lines.map((line) => (
              <li key={line.itemId} className="flex justify-between">
                <span>
                  {line.itemName} × {line.quantity}
                </span>
                <Link to="/" className="text-xs text-red-600 hover:underline">
                  Add more
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/checkout" className="mt-6 block sm:hidden">
            <Button className="w-full">Proceed to checkout</Button>
          </Link>
        </div>

        <CartSummary
          action={
            <LinkButton to="/checkout" size="lg" className="w-full">
              Proceed to checkout
            </LinkButton>
          }
        />
      </div>
    </PageShell>
  )
}