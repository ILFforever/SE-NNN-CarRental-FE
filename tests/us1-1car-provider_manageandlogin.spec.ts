import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Sign-In' }).click();
  await page.goto('http://localhost:3000/signin');
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('playwright@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.getByRole('button', { name: 'Car Provider' }).click();
  await page.getByRole('button', { name: 'Sign In as Car Provider' }).click();
  await page.getByRole('button', { name: 'Playwright Test' }).click();
  await page.getByRole('link', { name: 'My Profile' }).click();
  await page.locator('.MuiBackdrop-root').click();
  await page.getByRole('main').getByText('Playwright Test', { exact: true }).click();
  await expect(page.getByRole('main')).toContainText('Playwright Test');
  await expect(page.getByRole('main')).toContainText('playwright@gmail.com');
  await expect(page.getByRole('main')).toContainText('680c50c88dba4ce13dfebd5f');
});