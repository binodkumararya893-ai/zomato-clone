import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { placeOrder } from '@/services/orders'
import { recordSale } from '@/services/sales'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { isRazorpayConfigured, openRazorpayCheckout } from '@/lib/razorpay'
import { CartSummary } from '@/components/cart/CartSummary'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Form'
import { EmptyState, PageShell } from '@/components/ui/Feedback'
import { orderTotals } from '@/utils/format'
import { friendlyFirebaseError } from '@/utils/errors'
import type { OrderAddress, PaymentMethod } from '@/types'

interface FormState {
  label: string
  line1: string
  line2: string
  city: string
  pincode: string
  phone: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const INITIAL: FormState = { label: 'Home', line1: '', line2: '', city: '', pincode: '', phone: '' }

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!form.line1.trim()) errors.line1 = 'Address likhna zaroori hai.'
  if (!form.city.trim()) errors.city = 'City zaroori hai.'
  if (!/^\d{6}$/.test(form.pincode.trim())) errors.pincode = '6 digit ka pincode daalo.'
  if (!/^\d{10}$/.test(form.phone.trim())) errors.phone = '10 digit ka phone daalo.'
  return errors
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { lines, restaurantId, restaurantName, subtotal, clearCart } = useCart()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [placing, setPlacing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const razorpayReady = isRazorpayConfigured()

  // RequireAuth ke baad bhi guard — TS narrowing ke liye.
  if (!user) return <Navigate to="/login" replace />

  if (lines.length === 0) {
    return (
      <PageShell>
        <EmptyState
          title="Checkout ke liye cart empty hai"
          description="Pehle kuch add karo."
          action={{ label: 'Browse restaurants', to: '/' }}
        />
      </PageShell>
    )
  }

  const totals = orderTotals(subtotal)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return

    const validation = validate(form)
    setErrors(validation)
    if (Object.keys(validation).length > 0) return

    setPlacing(true)
    setSubmitError(null)
    try {
      const address: OrderAddress = {
        label: form.label,
        line1: form.line1.trim(),
        line2: form.line2.trim() || undefined,
        city: form.city.trim(),
        pincode: form.pincode.trim(),
        phone: form.phone.trim(),
      }

      // Pehle payment, phir order record — taaki failed payment pe order na bane
      let paymentStatus: 'pending' | 'paid' = 'pending'

      if (paymentMethod === 'razorpay' && razorpayReady) {
        const result = await openRazorpayCheckout({
          amount: totals.total,
          orderId: `order_${Date.now()}`,
          userName: profile?.displayName ?? 'Guest',
          userEmail: user.email ?? '',
          description: restaurantName ?? 'Food order',
        })
        if (!result.paid) {
          setSubmitError('Payment cancel ho gaya. Order place nahi hua.')
          return
        }
        paymentStatus = 'paid'
      }

      await placeOrder(
        {
          userId: user.uid,
          restaurantId: restaurantId ?? '',
          restaurantName: restaurantName ?? '',
          items: lines.map((l) => ({
            itemId: l.itemId,
            name: l.itemName,
            price: l.price,
            quantity: l.quantity,
          })),
          address,
          paymentMethod,
          ...totals,
        },
        paymentStatus,
      )

      // Counter update best-effort hai aur navigation ko block nahi karta —
      // fail ho jaye to order phir bhi successful rehta hai, sirf
      // leaderboard ka count miss hoga.
      void recordSale(lines, restaurantName ?? '')

      clearCart()
      navigate('/orders?placed=1')
    } catch (error) {
      setSubmitError(friendlyFirebaseError(error))
    } finally {
      setPlacing(false)
    }
  }

  return (
    <PageShell>
      <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Checkout</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit} noValidate className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Delivery address</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              label="Address label"
              name="label"
              value={form.label}
              onChange={(e) => update('label', e.target.value)}
            />
            <Input
              label="Phone number"
              name="phone"
              inputMode="numeric"
              placeholder="9876543210"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              error={errors.phone}
            />
            <div className="sm:col-span-2">
              <Input
                label="Flat, building, street"
                name="line1"
                value={form.line1}
                onChange={(e) => update('line1', e.target.value)}
                error={errors.line1}
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="Area, landmark (optional)"
                name="line2"
                value={form.line2}
                onChange={(e) => update('line2', e.target.value)}
              />
            </div>
            <Input
              label="City"
              name="city"
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              error={errors.city}
            />
            <Input
              label="Pincode"
              name="pincode"
              inputMode="numeric"
              placeholder="400001"
              value={form.pincode}
              onChange={(e) => update('pincode', e.target.value)}
              error={errors.pincode}
            />
          </div>

          <fieldset className="mt-5">
            <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment method</legend>
            <div className="mt-2 space-y-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-300 p-3 text-sm has-checked:border-red-500 has-checked:bg-red-50/40 dark:border-gray-700 dark:has-checked:bg-red-950/40">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="h-4 w-4 accent-red-600"
                />
                <span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">Cash on delivery</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">Cash rakho, deliver hote hi de dena</span>
                </span>
              </label>

              <label
                className={`flex items-center gap-3 rounded-lg border border-gray-300 p-3 text-sm dark:border-gray-700 ${
                  razorpayReady
                    ? 'cursor-pointer has-checked:border-red-500 has-checked:bg-red-50/40 dark:has-checked:bg-red-950/40'
                    : 'cursor-not-allowed bg-gray-50 opacity-60 dark:bg-gray-800'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                  disabled={!razorpayReady}
                  className="h-4 w-4 accent-red-600"
                />
                <span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">Pay online (Razorpay)</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    {razorpayReady
                      ? 'UPI, cards, netbanking'
                      : 'Setup nahi hai — VITE_RAZORPAY_KEY_ID add karo .env.local me'}
                  </span>
                </span>
              </label>
            </div>
          </fieldset>

          {submitError && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </p>
          )}

          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Logged in as {profile?.email ?? user.email}. Payment demo hai — real gateway nahi.
          </p>

          <div className="mt-5 flex items-center gap-3">
            <Button type="submit" size="lg" loading={placing}>
              {placing ? 'Placing order…' : 'Place order'}
            </Button>
            <Link to="/cart" className="text-sm text-gray-600 hover:text-red-600">
              Cart edit karo
            </Link>
          </div>
        </form>

        <CartSummary
          action={
            <Button
              size="lg"
              className="w-full"
              loading={placing}
              onClick={() => document.querySelector<HTMLFormElement>('form')?.requestSubmit()}
            >
              Place order
            </Button>
          }
        />
      </div>
    </PageShell>
  )
}