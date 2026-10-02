/**
 * Razorpay checkout helper.
 *
 * Script lazy load hoti hai. Agar `VITE_RAZORPAY_KEY_ID` set nahi hai to
 * `isRazorpayConfigured()` false return karta hai aur app COD pe chalti hai.
 */

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void }
  }
}

export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined

export function isRazorpayConfigured(): boolean {
  return Boolean(RAZORPAY_KEY_ID)
}

let scriptPromise: Promise<boolean> | null = null

/** Razorpay checkout script ek hi baar load hoti hai. */
export function loadRazorpay(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if (window.Razorpay) return Promise.resolve(true)
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => {
      scriptPromise = null
      resolve(false)
    }
    document.body.appendChild(script)
  })

  return scriptPromise
}

export interface RazorpayResult {
  paid: boolean
  paymentId?: string
}

/** Checkout modal kholta hai. Resolve tab hota hai jab user pay/cancel karta hai. */
export async function openRazorpayCheckout(params: {
  amount: number
  orderId: string
  userName: string
  userEmail: string
  description: string
}): Promise<RazorpayResult> {
  const loaded = await loadRazorpay()
  if (!loaded || !window.Razorpay || !RAZORPAY_KEY_ID) {
    throw new Error('Razorpay load nahi hua. Cash on delivery use karo.')
  }

  return new Promise((resolve) => {
    const razorpay = new window.Razorpay!({
      key: RAZORPAY_KEY_ID,
      amount: params.amount * 100, // paise me
      currency: 'INR',
      name: 'Zomato Clone',
      description: params.description,
      order_id: params.orderId,
      prefill: { name: params.userName, email: params.userEmail },
      theme: { color: '#e23744' },
      handler: (response: { razorpay_payment_id?: string }) => {
        resolve({ paid: true, paymentId: response.razorpay_payment_id })
      },
      modal: {
        ondismiss: () => resolve({ paid: false }),
      },
    })

    razorpay.open()
  })
}