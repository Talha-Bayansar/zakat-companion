import { expect, test } from '@playwright/test'

test('auth smoke: sign up -> sign out -> sign in', async ({ page }) => {
  const id = Date.now()
  const email = `smoke+${id}@example.com`
  const password = 'Password123!'

  await page.goto('/auth/sign-up')

  await page.getByLabel('Name').fill('Smoke Tester')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page).toHaveURL(/\/dashboard/)

  await page.goto('/profile')
  await page.getByRole('button', { name: 'Sign out' }).first().click()
  await page.getByRole('button', { name: 'Sign out' }).last().click()

  await expect(page).toHaveURL(/\/auth\/sign-in/)

  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL(/\/dashboard/)
})
