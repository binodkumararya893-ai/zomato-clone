import type { OrderStatus } from '@/types'

const STEPS: Array<{ status: OrderStatus; label: string }> = [
  { status: 'placed', label: 'Placed' },
  { status: 'preparing', label: 'Preparing' },
  { status: 'out-for-delivery', label: 'On the way' },
  { status: 'delivered', label: 'Delivered' },
]

/**
 * Live status bar — order status Firestore se change hota hai, to ye
 * component bina reload ke apne aap update ho jata hai.
 */
export function StatusTracker({ status }: { status: OrderStatus }) {
  const currentIndex = STEPS.findIndex((s) => s.status === status)

  if (currentIndex === -1) return null

  return (
    <div className="mt-4">
      <div className="flex items-center">
        {STEPS.map((step, index) => {
          const reached = index <= currentIndex
          const isCurrent = index === currentIndex
          return (
            <div key={step.status} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                    reached
                      ? isCurrent
                        ? 'bg-red-600 text-white ring-4 ring-red-100 dark:ring-red-950'
                        : 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                  }`}
                >
                  {reached ? '✓' : index + 1}
                </span>
                <span
                  className={`whitespace-nowrap text-[10px] ${
                    isCurrent ? 'font-semibold text-red-700 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <span
                  className={`mx-1 h-0.5 flex-1 -translate-y-3 ${
                    index < currentIndex ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}