import { test, expect, type Page } from '@playwright/test'

/**
 * FR-9 ke liye POSITIVE evidence — rules deployed + counters seeded ke baad.
 * Pehle ka run sirf negative evidence de paya (list hidden thi).
 */
const SHOT_DIR = 'rfp/evidence'

async function shot(page: Page, name: string) {
  await page
    .waitForFunction(() => Array.from(document.images).every((i) => i.complete), undefined, {
      timeout: 8000,
    })
    .catch(() => undefined)
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${SHOT_DIR}/${name}`, fullPage: false })
}

test('FR-9.1 most-sold items card ke niche dikhti hain', async ({ page }) => {
  await page.goto('/')

  // "MOST SOLD" label ab present hona chahiye — counters bane hain
  const label = page.getByText('MOST SOLD')
  await expect(label.first()).toBeVisible({ timeout: 20_000 })

  const count = await label.count()
  console.log(`[evidence] cards with MOST SOLD: ${count}`)

  // Sold count badge bhi dikhni chahiye
  await expect(page.getByText(/\d+ sold/).first()).toBeVisible()

  // Card apne items ke saath
  await expect(page.getByText('Gulab Jamun (2 pcs)')).toBeVisible()

  await page.locator('text=MOST SOLD').first().scrollIntoViewIfNeeded()
  await shot(page, '09-most-sold-visible.png')
})

test('FR-9.3 most-sold item ADD button cart me daalta hai', async ({ page }) => {
  await page.goto('/')
  const addBtn = page.getByRole('button', { name: /add to cart/i }).first()
  await expect(addBtn).toBeVisible({ timeout: 20_000 })

  // Cart shuru me khaali
  await expect(page.getByRole('link', { name: /^Cart$/ })).toBeVisible()

  const dishName = await page
    .locator('li:has(button[aria-label*="add to cart"]) span.font-medium')
    .first()
    .textContent()
  console.log(`[evidence] adding dish: ${dishName}`)

  // ADD dabao
  await addBtn.click()

  // "Added ✓" feedback aana chahiye
  await expect(page.getByRole('button', { name: /add to cart/i }).first()).toBeDisabled({
    timeout: 5000,
  })
  await expect(page.getByText('Added ✓').first()).toBeVisible()

  // Cart badge update hona chahiye
  const badge = page.locator('a[href="/cart"] span').first()
  await expect(badge).toHaveText('1', { timeout: 5000 })
  console.log('[evidence] cart badge = 1')

  await shot(page, '10-most-sold-added-to-cart.png')

  // Cart page par item dikhna chahiye
  await page.getByRole('link', { name: /^Cart/ }).click()
  await page.waitForURL('**/cart')
  await expect(page.getByText(dishName ?? '')).toBeVisible({ timeout: 10_000 })
})