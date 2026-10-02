import { test, expect, type Page } from '@playwright/test'

/**
 * Login ke baad ka flow — cart → checkout → order.
 *
 * NOTE: ye tests real orders banaate hain (demo project me, harmless).
 */

const EMAIL = 'demo@test.com'
const PASSWORD = 'demo12345'

/** Har test clean slate se shuru ho. */
async function freshCart(page: Page) {
  await page.addInitScript(() => window.localStorage.removeItem('zomato.cart.v1'))
}

/**
 * Cart Firestore se bhi hydrate hota hai (users/{uid}/carts/current),
 * isliye localStorage clear karna kaafi nahi — UI se khaal karna padta hai.
 */
async function emptyCartViaUI(page: Page) {
  await page.goto('/cart')
  for (let i = 0; i < 10; i += 1) {
    const removeButtons = page.getByRole('button', { name: 'Remove' })
    if ((await removeButtons.count()) === 0) break
    await removeButtons.first().click()
    await expect(removeButtons.first()).toBeHidden({ timeout: 2000 }).catch(() => undefined)
  }
  await expect(page.getByText('Cart khali hai')).toBeVisible()
}

/**
 * Firebase Auth session IndexedDB me hota hai jo storageState se reliably
 * restore nahi hota — isliye har test UI se login karta hai.
 *
 * Firebase sign-in throttled hota hai, isliye 2 baar try karte hain.
 * Cart bhi shared hai — clean start karte hain.
 */
async function login(page: Page) {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    await page.goto('/login')
    await page.getByLabel('Email').fill(EMAIL)
    await page.getByLabel('Password').fill(PASSWORD)
    await page.getByRole('button', { name: 'Login', exact: true }).click()

    try {
      await expect(page.getByRole('link', { name: 'My Orders' })).toBeVisible({ timeout: 10_000 })
      await emptyCartViaUI(page)
      return
    } catch {
      if (attempt === 2) throw new Error('Login fail: My Orders link nahi aaya (auth throttle?)')
      await page.waitForTimeout(3000)
    }
  }
}

test('login with email and password works', async ({ page }) => {
  await freshCart(page)
  await page.goto('/')

  await page.getByRole('link', { name: 'Login' }).click()
  await page.getByLabel('Email').fill(EMAIL)
  await page.getByLabel('Password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Login', exact: true }).click()

  await expect(page.getByRole('link', { name: 'My Orders' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible()
})

test('wrong password shows friendly error', async ({ page }) => {
  await freshCart(page)
  await page.goto('/login')
  await page.getByLabel('Email').fill(EMAIL)
  await page.getByLabel('Password').fill('galat-password-123')
  await page.getByRole('button', { name: 'Login', exact: true }).click()

  // Raw Firebase error user ko nahi dikhna chahiye
  await expect(page.getByText('Email ya password galat hai.')).toBeVisible()
})

test('protected route redirects to login', async ({ page }) => {
  await freshCart(page)
  await page.goto('/checkout')
  await expect(page).toHaveURL(/\/login/)
})

test('add dish to cart, change quantity, remove it', async ({ page }) => {
  await freshCart(page)
  await login(page)

  await page.goto('/restaurant/pizza-hub')

  // Cart khali hai
  await expect(page.getByText('Cart khali hai — koi item add karo.')).toBeVisible()

  // 2 qty ke saath Margherita add karo
  await page.getByLabel('Margherita Pizza quantity').selectOption('2')
  await page
    .getByRole('article')
    .filter({ hasText: 'Margherita Pizza' })
    .getByRole('button', { name: 'ADD' })
    .click()

  await expect(page.getByText('Added ✓')).toBeVisible()

  // Cart summary me item aa gaya
  const summary = page.locator('dl')
  // 2 x 299 = 598
  await expect(summary.getByText('Delivery fee').locator('..')).toContainText('FREE')

  // Badge 2 dikhna chahiye
  await expect(page.getByRole('link', { name: /Cart/ })).toContainText('2')

  // Quantity aur badhao
  await page.getByRole('button', { name: 'Margherita Pizza quantity increase' }).click()
  await expect(page.getByRole('link', { name: /Cart/ })).toContainText('3')

  // Remove karo
  await page.getByRole('button', { name: 'Remove' }).first().click()
  await expect(page.getByText('Cart khali hai — koi item add karo.')).toBeVisible()
})

test('cart survives reload (localStorage)', async ({ page }) => {
  await freshCart(page)
  await login(page)

  await page.goto('/restaurant/pizza-hub')
  await page
    .getByRole('article')
    .filter({ hasText: 'Garlic Bread' })
    .getByRole('button', { name: 'ADD' })
    .click()
  await expect(page.getByRole('link', { name: /Cart/ })).toContainText('1')

  await page.reload()
  await expect(page.getByText('Garlic Bread')).toBeVisible()
})

test('adding from another restaurant replaces the cart', async ({ page }) => {
  await freshCart(page)
  await login(page)

  await page.goto('/restaurant/pizza-hub')
  await page
    .getByRole('article')
    .filter({ hasText: 'Margherita Pizza' })
    .getByRole('button', { name: 'ADD' })
    .click()
  await expect(page.getByText('Added ✓')).toBeVisible()

  // Doosre restaurant se add karo
  await page.goto('/restaurant/burger-junction')
  await page
    .getByRole('article')
    .filter({ hasText: 'Double Cheese Burger' })
    .getByRole('button', { name: 'ADD' })
    .click()

  // Cart summary (aside) me sirf naye restaurant ka item hona chahiye
  const cartSummary = page.locator('aside')
  await expect(cartSummary.getByText('Double Cheese Burger')).toBeVisible()
  await expect(cartSummary.getByText('Margherita Pizza')).toHaveCount(0)

  // Badge sirf 1 item ka
  await expect(page.getByRole('link', { name: /Cart/ })).toContainText('1')
})

test('checkout form validates input', async ({ page }) => {
  await freshCart(page)
  await login(page)

  await page.goto('/restaurant/pizza-hub')
  await page
    .getByRole('article')
    .filter({ hasText: 'Farmhouse Pizza' })
    .getByRole('button', { name: 'ADD' })
    .click()

  await page.getByRole('link', { name: /Checkout/ }).first().click()
  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible()

  // Khaali form submit karo → validation errors
  await page.getByRole('button', { name: 'Place order' }).first().click()
  await expect(page.getByText('Address likhna zaroori hai.')).toBeVisible()
  await expect(page.getByText('City zaroori hai.')).toBeVisible()
  await expect(page.getByText('6 digit ka pincode daalo.')).toBeVisible()
  await expect(page.getByText('10 digit ka phone daalo.')).toBeVisible()

  // Galat pincode (5 digit)
  await page.getByLabel('Pincode').fill('12345')
  await page.getByLabel('Phone number').fill('9876543210')
  await page.getByLabel('Flat, building, street').fill('123, ABC Road')
  await page.getByLabel('City').fill('Bengaluru')
  await page.getByRole('button', { name: 'Place order' }).first().click()
  await expect(page.getByText('6 digit ka pincode daalo.')).toBeVisible()
})

test('place order and see it in My Orders', async ({ page }) => {
  await freshCart(page)
  await login(page)
  await emptyCartViaUI(page)

  await page.goto('/restaurant/spice-route')
  await page
    .getByRole('article')
    .filter({ hasText: 'Paneer Butter Masala' })
    .getByRole('button', { name: 'ADD' })
    .click()

  await page.getByRole('link', { name: /Checkout/ }).first().click()

  await page.getByLabel('Phone number').fill('9876543210')
  await page.getByLabel('Flat, building, street').fill('42, Test Colony')
  await page.getByLabel('Area, landmark (optional)').fill('Near park')
  await page.getByLabel('City').fill('Bengaluru')
  await page.getByLabel('Pincode').fill('400001')

  await page.getByRole('button', { name: 'Place order' }).first().click()

  // Order place hote hi My Orders pe land hone chahiye
  await expect(page).toHaveURL(/\/orders/)
  await expect(page.getByText('🎉 Order place ho gaya!')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'My orders' })).toBeVisible()

  // Order card me restaurant aur items
  await expect(page.getByText('Spice Route').first()).toBeVisible()
  // \u00d7 = "×" (ASCII escape so encoding issues na ho)
  // .first() — pichle test runs ke orders bhi list me hain
  await expect(page.getByText(/Paneer Butter Masala \u00d7 1/).first()).toBeVisible()

  // Cart khaal ho jana chahiye
  await expect(page.getByRole('link', { name: /^Cart$/ })).not.toContainText('1')
})

test('cart page shows empty state after order', async ({ page }) => {
  await freshCart(page)
  await login(page)
  await page.goto('/cart')
  await expect(page.getByText('Cart khali hai')).toBeVisible()
  await expect(page.getByText('Browse restaurants')).toBeVisible()
})

test('logout clears session', async ({ page }) => {
  await freshCart(page)
  await login(page)

  await page.getByRole('button', { name: 'Logout' }).click()
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible()

  // Logged out hone ke baad protected route bhi block hona chahiye
  await page.goto('/checkout')
  await expect(page).toHaveURL(/\/login/)
})
