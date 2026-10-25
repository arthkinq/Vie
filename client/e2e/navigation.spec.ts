import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route('**/api/movies', (route) =>
    route.fulfill({
      json: [
        {
          id: 1,
          title: 'Касабланка',
          year: 1942,
          genres: ['драма'],
          countries: ['США'],
          director: 'Майкл Кёртис',
          rating: 8.5,
          description: 'История любви во время войны.',
        },
      ],
    }),
  )
})

test('user opens a film from the main page', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /Касабланка/ }).click()

  await expect(page).toHaveURL(/\/film\/1$/)
  await expect(page.getByRole('heading', { name: 'Касабланка' })).toBeVisible()
})

test('user opens the about page from the header', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'О нас' }).click()

  await expect(page.getByRole('heading', { name: 'О нашем кинотеатре' })).toBeVisible()
})
