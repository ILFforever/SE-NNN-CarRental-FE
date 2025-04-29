import { test, expect } from '@playwright/test';



test('car details page shows rating of car provider', async ({ page }) => {
    await page.goto('http://se-cedt-rentals.vercel.app/');
    await page.getByRole('link', { name: 'Sign-In' }).click();
    await page.getByRole('textbox', { name: 'Email Address' }).click();
    await page.getByRole('textbox', { name: 'Email Address' }).fill('playwright@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
    await page.getByRole('button', { name: 'Sign In as User' }).click();
    await page.waitForTimeout(3000);
    await page.getByRole('link', { name: 'Catalog' }).click();
    await page.getByRole('button', { name: /View Car/i }).first().click();
    await expect(page.getByRole('heading', { name: 'Reviews & Ratings' })).toBeVisible();
  });

  test('user can review after status is Completed', async ({ page }) => {
    // First, we need to sign in as a user and make a reservation
    await page.goto('http://se-cedt-rentals.vercel.app/');
    await page.getByRole('link', { name: 'Sign-In' }).click();
    await page.getByRole('textbox', { name: 'Email Address' }).click();
    await page.getByRole('textbox', { name: 'Email Address' }).fill('playwright@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
    await page.getByRole('button', { name: 'Sign In as User' }).click();
    await page.waitForTimeout(3000);
    await page.getByRole('link', { name: 'Catalog' }).click();
    await page.getByRole('button', { name: /View Car/i }).first().click();
    await page.locator('div').filter({ hasText: /^Pickup Date$/ }).getByRole('textbox').fill('2025-05-01');
    await page.getByRole('button', { name: /^Confirm & Pay/i }).click();
    await page.getByLabel('Close').click();
    await page.getByRole('button', { name: 'Playwright Man' }).click();
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await page.getByRole('button', { name: 'Yes, Sign Out' }).click();
    await page.waitForTimeout(3000);
    // Now, we can sign in as the admin and mark the reservation as unpaid
    await page.getByRole('link', { name: 'Sign-In' }).click();
    await page.getByRole('textbox', { name: 'Email Address' }).click();
    await page.getByRole('textbox', { name: 'Email Address' }).fill('admin_playwright@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
    await page.getByRole('button', { name: 'Sign In as User' }).click();
    await page.waitForTimeout(3000);
    await page.getByRole('button', { name: 'Playwright Admin' }).click();
    await page.getByRole('button', { name: 'Admin Tools' }).click();
    await page.getByRole('link', { name: 'View All Bookings' }).click();
    await page.getByRole('button', { name: 'Confirm reservation' }).first().click();
    await page.getByRole('button', { name: 'Yes, Confirm Reservation' }).click();
    await page.getByRole('button', { name: 'Mark as unpaid' }).click();
    await page.getByRole('button', { name: 'Yes, Mark as Unpaid' }).click();
    await page.getByRole('button', { name: 'Playwright Admin' }).click();
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await page.getByRole('button', { name: 'Yes, Sign Out' }).click();
    await page.waitForTimeout(3000);
    // Now, we can sign in as the user and pay for the reservation and review the reservation
    await page.getByRole('link', { name: 'Sign-In' }).click();
    await page.getByRole('textbox', { name: 'Email Address' }).click();
    await page.getByRole('textbox', { name: 'Email Address' }).fill('playwright@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
    await page.getByRole('button', { name: 'Sign In as User' }).click();
    await page.waitForTimeout(3000);
    await page.getByRole('button', { name: 'Playwright Man' }).click();
    await page.getByRole('button', { name: 'My Reservations' }).click();
    await page.getByRole('button', { name: 'Pay Now' }).click();
    await page.getByRole('button', { name: 'Pay $' }).click();
    await page.getByRole('link', { name: 'View My Reservations' }).click();
    await page.getByRole('button', { name: 'Review Provider' }).first().click();
    await expect(page.getByRole('heading', { name: 'Rate Reservation' })).toBeVisible();
    await page.locator('label').filter({ hasText: '5 Stars' }).click();
    await page.getByRole('button', { name: 'Confirm Rating' }).click();
    await expect(page.getByText('Already Reviewed').first()).toBeVisible();
    await page.getByRole('button', { name: 'Playwright Man' }).click();
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await page.getByRole('button', { name: 'Yes, Sign Out' }).click();
    await page.waitForTimeout(1000);
  });


