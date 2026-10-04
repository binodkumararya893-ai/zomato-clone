import { defineConfig, devices } from '@playwright/test'

/**
 * RFP evidence run — `rfp/requirement.md` ke acceptance gates ke liye
 * screenshots collect karta hai.
 *
 * Ye DELIBERATELY main `playwright.config.ts` se alag hai:
 * - main suite live deployed app ke against chalta hai (regression ke liye)
 * - ye suite LOCAL dev server ke against chalta hai, taaki screenshots
 *   is branch ke code dikhayein, deployed code ka nahi
 */
export default defineConfig({
  testDir: './tests/evidence',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: [['list']],
  outputDir: './test-results/evidence',
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    viewport: { width: 1280, height: 900 },
    actionTimeout: 15_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})