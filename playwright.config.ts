import { defineConfig, devices } from '@playwright/test'

/**
 * Zomato clone — live app ke against tests.
 *
 * `npm run test` → headed (browser screen pe dikhega)
 *
 * Har test fresh context me chalta hai aur UI se login karta hai
 * (Firebase Auth session IndexedDB me hota hai jo storageState se
 * reliably restore nahi hota).
 */
export default defineConfig({
  testDir: './tests',
  testIgnore: /auth\.setup\.ts|zz-debug\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  retries: 1,
  timeout: 45_000,
  reporter: [['list']],
  use: {
    baseURL: 'https://zomato-clone-b7f2.web.app',
    headless: false,
    viewport: { width: 1280, height: 900 },
    actionTimeout: 15_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})