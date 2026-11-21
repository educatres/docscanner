import { test, expect } from '@playwright/test'

test('opens the mobile-first scanner and shows privacy boundary', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('PaperScan')).toBeVisible()
  await expect(page.getByText('預設不會上傳掃描內容')).toBeVisible()
  await expect(page.getByRole('button', { name: '相簿' })).toBeVisible()
})

test('keeps the shutter visible on a phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const shutter = page.getByRole('button', { name: '拍照' })
  await expect(shutter).toBeVisible()
  const box = await shutter.boundingBox()
  expect(box).not.toBeNull()
  expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThan(844 - 70)
})
