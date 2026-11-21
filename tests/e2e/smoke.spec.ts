import { test, expect } from '@playwright/test'

test('opens the mobile-first scanner and shows privacy boundary', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('PaperScan')).toBeVisible()
  await expect(page.getByText('預設不會上傳掃描內容')).toBeVisible()
  await expect(page.getByRole('button', { name: '相簿' })).toBeVisible()
})
