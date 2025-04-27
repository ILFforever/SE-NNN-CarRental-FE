import { test, expect } from '@playwright/test';

test('should see discount on summary', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Sign-In' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('playwright@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.getByRole('button', { name: 'Sign In as User' }).click();
  await page.getByRole('link', { name: 'Catalog' }).click();
  await page.locator('[data-test-id="catalog"] div').filter({ hasText: '$2.00/dayconvertiblePlaywright Hand2025 • Playwright TestRated by 0 people0.0$2' }).getByRole('button').nth(3).click();
  await page.locator('div').filter({ hasText: /^Pickup Date$/ }).getByRole('textbox').fill('2025-05-05');
  await page.locator('div').filter({ hasText: /^Return Date$/ }).getByRole('textbox').fill('2025-05-09');
  await expect(page.getByRole('main')).toContainText('$8.50');
  await expect(page.getByRole('main')).toContainText('Loyalty Discount (15%):');
});

test('should not see discount on summary', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Sign-In' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('user8@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.getByRole('button', { name: 'Sign In as User' }).click();
  await page.getByRole('link', { name: 'Catalog' }).click();
  await page.locator('[data-test-id="catalog"] div').filter({ hasText: '$2.00/dayconvertiblePlaywright Hand2025 • Playwright TestRated by 0 people0.0$2' }).getByRole('button').nth(3).click();
  await page.locator('div').filter({ hasText: /^Pickup Date$/ }).getByRole('textbox').fill('2025-05-05');
  await page.locator('div').filter({ hasText: /^Return Date$/ }).getByRole('textbox').fill('2025-05-09');
  await expect(page.getByRole('main')).toContainText('$10.00');
});