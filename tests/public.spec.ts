import { test, expect } from '@playwright/test'

/**
 * Public pages — login ke bina test ho jaate hain.
 */

test('home page renders seeded restaurants', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Order food online' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'zomatoclone' })).toBeVisible()

  // Seed kiye hue restaurants dikhne chahiye
  await expect(page.getByText('Pizza Hub')).toBeVisible()
  await expect(page.getByText('Biryani Bazaar')).toBeVisible()
  await expect(page.getByText('Sweet Saffron')).toBeVisible()

  // Empty state nahi aana chahiye
  await expect(page.getByText('Koi restaurant nahi mila')).toHaveCount(0)

  await expect(page.getByRole('combobox').first()).toBeVisible()
})

test('search filters restaurants', async ({ page }) => {
  await page.goto('/')

  const search = page.getByRole('searchbox')
  await search.fill('biryani')
  await expect(page.getByText('Biryani Bazaar')).toBeVisible()
  await expect(page.getByText('Pizza Hub')).toHaveCount(0)

  // Clear karein to sab wapas aayein
  await search.fill('')
  await expect(page.getByText('Pizza Hub')).toBeVisible()
})

test('restaurant menu page shows dishes and veg markers', async ({ page }) => {
  await page.goto('/restaurant/pizza-hub')

  await expect(page.getByRole('heading', { name: 'Pizza Hub' })).toBeVisible()
  await expect(page.getByText('40% off on your first order')).toBeVisible()

  // Menu items
  await expect(page.getByText('Margherita Pizza')).toBeVisible()
  await expect(page.getByText('Pepperoni Pizza')).toBeVisible()
  await expect(page.getByText('Garlic Bread')).toBeVisible()

  // Veg / non-veg distinction
  await expect(page.getByTitle('Non-veg').first()).toBeVisible()
  await expect(page.getByTitle('Veg').first()).toBeVisible()

  // Empty cart pe delivery fee nahi lagni chahiye (regression test):
  // pehle ₹39 delivery fee lagti thi aur "To pay ₹39" dikhta tha
  const summary = page.locator('dl')
  await expect(summary.getByText('Delivery fee').locator('..')).toContainText('FREE')

  const toPayRow = summary.getByText('To pay').locator('..')
  await expect(toPayRow).toContainText('₹0')
})

test('deep link works on static hosting (SPA rewrite)', async ({ page }) => {
  const response = await page.goto('/restaurant/biryani-bazaar')
  expect(response?.status()).toBeLessThan(400)
  await expect(page.getByRole('heading', { name: 'Biryani Bazaar' })).toBeVisible()
})

test('unknown route shows 404 page', async ({ page }) => {
  await page.goto('/ye-page-nahi-hai')
  await expect(page.getByText('404')).toBeVisible()
})

test('login page renders form', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel('Password')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible()
})