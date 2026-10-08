import { expect, test } from '@playwright/test'

test('user can open the catalog from the main page', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Vie' })).toBeVisible()

  await page.getByRole('link', { name: 'Каталог' }).click()

  await expect(page).toHaveURL(/\/catalog$/)
  await expect(page.getByRole('heading', { name: 'Каталог' })).toBeVisible()
})
