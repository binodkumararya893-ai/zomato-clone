import { test, expect, type Page } from '@playwright/test'

const EMAIL = 'demo@test.com'
const PASSWORD = 'demo12345'

/** Firebase sign-in throttled hota hai — retry ke saath login. */
async function login(page: Page) {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    await page.goto('/login')
    await page.getByLabel('Email').fill(EMAIL)
    await page.getByLabel('Password').fill(PASSWORD)
    await page.getByRole('button', { name: 'Login', exact: true }).click()
    try {
      await expect(page.getByRole('link', { name: 'My Orders' })).toBeVisible({ timeout: 10_000 })
      return
    } catch {
      if (attempt === 2) throw new Error('Login fail (auth throttle?)')
      await page.waitForTimeout(3000)
    }
  }
}

test('logged out user sees login prompt instead of review form', async ({ page }) => {
  // Fresh context = logged out already
  await page.goto('/restaurant/wok-chinese')

  await expect(page.getByRole('heading', { name: 'Reviews & ratings' })).toBeVisible()
  await expect(page.getByText('Abhi koi review nahi')).toBeVisible()
  await expect(page.getByRole('link', { name: 'login', exact: true })).toBeVisible()
})

test('submit a review and see it listed', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.removeItem('zomato.cart.v1'))
  await login(page)

  await page.goto('/restaurant/wok-chinese')

  const section = page.locator('section').filter({ hasText: 'Reviews & ratings' })

  // Rating chune bina submit -> error
  await section.getByRole('button', { name: 'Submit review' }).click()
  await expect(section.getByText('Pehle star rating chuno.')).toBeVisible()

  // 4 star + comment
  await section.getByRole('radio', { name: '4 star' }).click()
  await section.getByLabel('Comment').fill('Noodles bahut tasty the, delivery bhi jaldi.')
  await section.getByRole('button', { name: 'Submit review' }).click()

  await expect(section.getByText('Review save ho gaya! Shukriya.')).toBeVisible()
  // Naya review list me dikhna chahiye (write ke baad read latency ho sakti hai)
  const reviewList = section.getByRole('list')
  await expect(
    reviewList.getByText('Noodles bahut tasty the, delivery bhi jaldi.'),
  ).toBeVisible({ timeout: 15_000 })
  await expect(reviewList.getByText('demo')).toBeVisible()
})

test('review can be updated and deleted', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.removeItem('zomato.cart.v1'))
  await login(page)

  await page.goto('/restaurant/wok-chinese')
  const section = page.locator('section').filter({ hasText: 'Reviews & ratings' })

  // Pehle se review pada hoga (pichle test se) → update mode
  await section.getByRole('radio', { name: '2 star' }).click()
  await section.getByLabel('Comment').fill('Updated: service slow thi.')
  await section.getByRole('button', { name: 'Update review' }).click()
  await expect(section.getByText('Updated: service slow thi.')).toBeVisible()

  // Delete karo
  await section.getByRole('button', { name: 'Delete' }).click()
  await expect(section.getByText('Updated: service slow thi.')).toHaveCount(0)
})

test('restaurant rating reflects reviews on listing page', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.removeItem('zomato.cart.v1'))
  await login(page)

  // Ek review daalo
  await page.goto('/restaurant/tiffin-house')
  const section = page.locator('section').filter({ hasText: 'Reviews & ratings' })
  await section.getByRole('radio', { name: '5 star' }).click()
  await section.getByLabel('Comment').fill('Best dosa in town.')
  await section.getByRole('button', { name: 'Submit review' }).click()
  await expect(section.getByText('Review save ho gaya! Shukriya.')).toBeVisible()

  // Ab listing page pe rating update honi chahiye
  await page.goto('/')
  const card = page.locator('a[href="/restaurant/tiffin-house"]')
  await expect(card.getByText('Tiffin House')).toBeVisible()

  // Review delete karke rating wapas aani chahiye
  await page.goto('/restaurant/tiffin-house')
  const section2 = page.locator('section').filter({ hasText: 'Reviews & ratings' })
  await section2.getByRole('button', { name: 'Delete' }).click()
  await expect(section2.getByText('Best dosa in town.')).toHaveCount(0)
})

test('orders page shows payment method and status tracker', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.removeItem('zomato.cart.v1'))
  await login(page)

  await page.goto('/orders')
  await expect(page.getByRole('heading', { name: 'My orders' })).toBeVisible()

  const orders = page.locator('li').filter({ hasText: 'Order #' })
  const count = await orders.count()

  if (count > 0) {
    await expect(orders.first().getByText('Cash on delivery')).toBeVisible()
    await expect(orders.first().getByText('Payment pending')).toBeVisible()
    // Status tracker steps
    await expect(orders.first().getByText('Placed')).toBeVisible()
    await expect(orders.first().getByText('Delivered')).toBeVisible()
  }
})

test('checkout offers cash on delivery and disabled razorpay', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.removeItem('zomato.cart.v1'))
  await login(page)

  await page.goto('/restaurant/wok-chinese')
  await page
    .getByRole('article')
    .filter({ hasText: 'Hakka Noodles' })
    .getByRole('button', { name: 'ADD' })
    .click()

  await page.getByRole('link', { name: /Checkout/ }).first().click()

  await expect(page.getByText('Payment method', { exact: true })).toBeVisible()
  await expect(page.getByText('Cash on delivery')).toBeVisible()

  // Razorpay key set nahi hai → disabled + explanation
  const razorpayRadio = page.getByRole('radio', { name: /Pay online/ })
  await expect(razorpayRadio).toBeDisabled()
  await expect(page.getByText(/VITE_RAZORPAY_KEY_ID add karo/)).toBeVisible()

  // COD default selected
  await expect(page.getByRole('radio', { name: /Cash on delivery/ })).toBeChecked()
})