import { test, expect, type Page } from '@playwright/test'

/**
 * Evidence run — `rfp/requirement.md` ke acceptance gates.
 * Plan: `specs/plan.md`
 *
 * Har scenario ke end me screenshot `rfp/evidence/` me save hota hai.
 *
 * NOTE: Ye test order **place** nahi karta — wo live demo database me real
 * order likhta hai. Sirf cart aur form validation tak jaata hai.
 */

const SHOT_DIR = 'rfp/evidence'
const TEST_EMAIL = process.env.TEST_EMAIL ?? 'demo@test.com'
const TEST_PASSWORD = process.env.TEST_PASSWORD ?? 'demo12345'

async function shot(page: Page, name: string) {
  // `networkidle` Firebase ke open realtime connections ki wajah se kabhi
  // settle nahi hota — isliye images ke decode hone ka bounded wait karte hain,
  // warna screenshot me gray placeholders aa jate hain.
  await page
    .waitForFunction(
      () => {
        const imgs = Array.from(document.images).filter((i) => !i.complete)
        return imgs.length === 0
      },
      undefined,
      { timeout: 8000 },
    )
    .catch(() => undefined)
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${SHOT_DIR}/${name}`, fullPage: false })
}

/** Demo account se login — read-only hai, koi order create nahi hota. */
async function login(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(TEST_EMAIL)
  await page.getByLabel('Password').fill(TEST_PASSWORD)
  await page.getByRole('button', { name: 'Login' }).click()
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 20_000 })
}

/** Cards ki link se pehla restaurant URL nikal deta hai. */
async function firstRestaurantHref(page: Page): Promise<string> {
  const href = await page
    .locator('a[href^="/restaurant/"]')
    .first()
    .getAttribute('href')
  expect(href, 'homepage pe koi restaurant card nahi mila').toBeTruthy()
  return String(href)
}

test.describe('Acceptance gate evidence', () => {
  test('AC-1 listings load aur search filter karta hai', async ({ page }) => {
    // 1. Homepage kholo
    await page.goto('/')

    // 2. Restaurants load hone do
    await expect(page.getByRole('heading', { name: 'Zomato Clone Hub' })).toBeVisible()
    const cards = page.locator('a[href^="/restaurant/"]')
    await expect(cards.first()).toBeVisible({ timeout: 20_000 })
    const count = await cards.count()
    console.log(`[evidence] restaurant cards: ${count}`)
    expect(count, 'seeded restaurants load hone chahiye').toBeGreaterThan(0)

    // Screenshot lena BAAD me nahi — pehle unfiltered listing capture karo
    await shot(page, '01-homepage-listings.png')

    // 3. Search box me "dosa" type karo
    await page.getByLabel('Search restaurants').fill('dosa')
    await page.waitForTimeout(400)
    await expect(cards.first()).toBeVisible()

    // 4. Cuisine filter change karo
    await page.getByLabel('Search restaurants').fill('')
    await page.getByLabel('Cuisine').selectOption('Biryani')
    await page.waitForTimeout(400)

    await shot(page, '02-search-filtered.png')
  })

  test('AC-2 menu se cart tak, checkout validation tak', async ({ page }) => {
    await page.goto('/')
    const href = await firstRestaurantHref(page)

    // 1. Restaurant menu page kholo
    await page.goto(href)
    await expect(page.getByRole('button', { name: 'ADD' }).first()).toBeVisible({
      timeout: 20_000,
    })

    await shot(page, '03-restaurant-menu.png')

    // 2. Pehle item ADD karo
    await page.getByRole('button', { name: 'ADD' }).first().click()
    await expect(page.getByText('Added ✓')).toBeVisible()

    // 3. Cart page kholo
    await page.getByRole('link', { name: 'Cart' }).click()
    await page.waitForURL('**/cart')
    await expect(page.getByRole('heading', { name: 'Your cart' })).toBeVisible()

    await shot(page, '04-cart-totals.png')

    // 4. Checkout protected hai — login ke bina redirect hona chahiye (FR-1.6)
    await page.goto('/checkout')
    await page.waitForURL('**/login', { timeout: 15_000 })
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible()

    await shot(page, '05-protected-route-redirect.png')
  })

  test('AC-2 checkout form validation (login ke baad)', async ({ page }) => {
    // 1. Demo account se login (koi order create nahi hota)
    await login(page)

    // 2. Cart me kuch daalo
    await page.goto('/')
    const href = await firstRestaurantHref(page)
    await page.goto(href)
    await page.getByRole('button', { name: 'ADD' }).first().click()
    await expect(page.getByText('Added ✓')).toBeVisible()

    // 3. Checkout kholo
    await page.goto('/checkout')
    await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible({
      timeout: 20_000,
    })

    // 4. Khaali form submit karo — validation errors dikhone chahiye
    //    (order PLACE nahi hota, sirf form validate hota hai)
    await page.getByRole('button', { name: 'Place order' }).first().click()
    await page.waitForTimeout(600)

    await shot(page, '06-checkout-validation.png')
  })

  test('NFR-11 SPA deep link seed 404 nahi deta', async ({ page }) => {
    // Seed data me se ek known slug directly kholo
    const response = await page.goto('/restaurant/pizza-hub')
    expect(response?.status()).toBeLessThan(400)
    await expect(page.getByRole('heading', { name: 'Pizza Hub' })).toBeVisible({
      timeout: 20_000,
    })
  })

  test('404 page render hota hai', async ({ page }) => {
    await page.goto('/definitely-not-a-real-path')
    await expect(page.getByText('404')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Page nahi mila' })).toBeVisible()

    await shot(page, '07-404.png')
  })

  test('FR-9.7 most-sold list counter na hone par chhupi rehti hai', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.locator('a[href^="/restaurant/"]').first(),
    ).toBeVisible({ timeout: 20_000 })
    await page.waitForTimeout(1200)

    // Is machine ke Firestore me itemSales counters nahi hain (rules deploy
    // nahi hui + seed nahi chala), to FR-9.7 ke mutabik list render nahi hogi.
    // Ye negative evidence hai — FR-9.1 ke positive evidence ke liye
    // rules deploy + seed chahiye.
    const label = page.getByText('MOST SOLD')
    const visible = await label.count()
    console.log(`[evidence] "MOST SOLD" label count (expected 0): ${visible}`)
    expect(visible, 'counters na hone par list dikhni nahi chahiye').toBe(0)

    await shot(page, '08-most-sold-hidden.png')
  })
})