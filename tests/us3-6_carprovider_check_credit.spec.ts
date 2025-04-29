import { test, expect } from '@playwright/test';

test('Renter book and complete the payment for the car', async ({ page }) => {
await page.goto('http://localhost:3000/');
await page.getByRole('link', { name: 'Sign-In' }).click();
await page.getByRole('textbox', { name: 'Email Address' }).click();
await page.getByRole('textbox', { name: 'Email Address' }).fill('playwright@gmail.com');
await page.getByRole('textbox', { name: 'Password' }).click();
await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
await page.getByRole('button', { name: 'Sign In as User' }).click();
await page.getByRole('link', { name: 'Catalog' }).click();
await page.locator('div').filter({ hasText: /^KIA ev52025 • carprovider1Rated by 0 people0\.0\$50 \/day5 seatsGrayTier 0View Car$/ }).getByRole('button').click();
await page.locator('div').filter({ hasText: /^Pickup Date$/ }).getByRole('textbox').fill('2025-05-01');
await page.locator('div').filter({ hasText: /^Return Date$/ }).getByRole('textbox').fill('2025-05-03');
await page.getByText('Click to add services').click();
await page.locator('.mt-1 > div > div > div > .relative').click();
await page.getByRole('button', { name: 'Confirm & Pay $25.93 Deposit' }).click();
await page.getByText('Close').click();
await page.getByRole('button', { name: 'Playwright Man' }).click();
await page.getByRole('button', { name: 'Sign Out' }).click();
await page.getByRole('button', { name: 'Yes, Sign Out' }).click();
await page.getByRole('link', { name: 'Sign-In' }).click();
await page.getByRole('button', { name: 'Car Provider' }).click();
await page.getByRole('textbox', { name: 'Email Address' }).click();
await page.getByRole('textbox', { name: 'Email Address' }).fill('carprovider@gmail.com');
await page.getByRole('textbox', { name: 'Password' }).click();
await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
await page.getByRole('button', { name: 'Sign In as Car Provider' }).click();
await page.getByRole('link', { name: 'Provider Tools' }).click();
await page.getByRole('link', { name: 'View All Bookings' }).click();
await page.getByRole('button', { name: 'Confirm reservation' }).click();
await page.getByRole('button', { name: 'Yes, Confirm Reservation' }).click();
await page.getByRole('button', { name: 'Mark as unpaid' }).click();
await page.getByRole('button', { name: 'Yes, Mark as Unpaid' }).click();
await page.getByRole('button', { name: 'carprovider1' }).click();
await page.getByRole('button', { name: 'Sign Out' }).click();
await page.getByRole('button', { name: 'Yes, Sign Out' }).click();
await page.getByRole('link', { name: 'Sign-In' }).click();
await page.getByRole('textbox', { name: 'Email Address' }).click();
await page.getByRole('textbox', { name: 'Email Address' }).fill('playwright@gmail.com');
await page.getByRole('textbox', { name: 'Password' }).click();
await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
await page.getByRole('button', { name: 'Sign In as User' }).click();
await page.getByRole('button', { name: 'View credits' }).click();
await page.getByRole('button', { name: 'Playwright Man' }).click();
await page.getByRole('button', { name: 'My Reservations' }).click();
await page.getByRole('button', { name: 'Pay Now' }).click();
await page.getByRole('button', { name: 'Pay $' }).click();
await page.getByRole('button', { name: 'Playwright Man' }).click();
})

test('Car Provider check credit', async ({ page }) => {
await page.goto('http://localhost:3000/');
await page.getByRole('link', { name: 'Sign-In' }).click();
await page.getByRole('button', { name: 'Car Provider' }).click();
await page.getByRole('textbox', { name: 'Email Address' }).click();
await page.getByRole('textbox', { name: 'Email Address' }).fill('carprovider@gmail.com');
await page.getByRole('textbox', { name: 'Password' }).click();
await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
await page.getByRole('button', { name: 'Sign In as Car Provider' }).click();
await page.goto('http://localhost:3000/');
await page.getByRole('button', { name: 'View credits' }).click();
await page.getByRole('button', { name: 'Topup' }).click();
await page.getByRole('button', { name: 'carprovider1' }).click();
await page.getByRole('button', { name: 'My Dashboard' }).click();


if (await page.getByText('KIA ev5').first().isVisible()) {
    console.log('Test passed: KIA ev5 is visible');
    // pass the test

} else {await page.getByText('KIA ev5').first().click();
    console.log('Test failed: KIA ev5 is not visible');
    // fail the test
}
});