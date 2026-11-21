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

test('allows a corner to be dragged with pointer input', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="420"><rect width="320" height="420" fill="#f7f7f7"/><path d="M20 20h280v380H20z" fill="none" stroke="#333" stroke-width="4"/></svg>')
  await page.locator('input[type="file"]').setInputFiles({ name: 'test.svg', mimeType: 'image/svg+xml', buffer: svg })
  const point = page.getByLabel('拖曳第 1 個角點')
  await expect(point).toBeVisible()
  const before = await point.boundingBox()
  expect(before).not.toBeNull()
  await page.mouse.move((before?.x ?? 0) + 22, (before?.y ?? 0) + 22)
  await page.mouse.down()
  await page.mouse.move((before?.x ?? 0) + 55, (before?.y ?? 0) + 48)
  await page.mouse.up()
  const after = await point.boundingBox()
  expect(after).not.toBeNull()
  expect(after?.x).not.toBe(before?.x)
})

test('keeps PDF as the default export format and hides other formats', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: '匯出 PDF' })).toBeVisible()
  await expect(page.getByRole('menu')).toHaveCount(0)
  await page.getByRole('button', { name: /格式/ }).click()
  await expect(page.getByRole('menu')).toBeVisible()
  await expect(page.getByRole('menu').getByText('PDF（預設）')).toBeVisible()
})
