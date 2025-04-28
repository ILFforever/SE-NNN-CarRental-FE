import { test, expect } from "@playwright/test";

test("User want to change valid date", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Sign-In" }).click();
    await page.getByRole('textbox', { name: 'Email Address' }).click();
    await page.getByRole('textbox', { name: 'Email Address' }).fill('playwright@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
    await page.getByRole('button', { name: 'Sign In as User' }).click();
    await page.waitForTimeout(3000);
    //make reservation
    await page.getByRole('link', { name: 'Catalog' }).click();
    await page.getByRole('button', { name: /View Car/i }).first().click();
    await page.locator('div').filter({ hasText: /^Pickup Date$/ }).getByRole('textbox').fill('2026-09-09');
    await page.getByRole('button', { name: /^Confirm & Pay/i }).click();
    await page.getByLabel('Close').click();
    //edit reservation
    await page.getByRole("button", { name: "Playwright Man" }).click();
    await page.getByRole("link", { name: "My Reservations" }).click();
    await page.locator('.MuiBackdrop-root').click();
    await page.locator('button').filter({ hasText: /^Edit Reservation/i }).first().click();
    await page.locator('div').filter({ hasText: /^Start Date$/ }).getByRole('textbox').fill('2026-08-09');
    await page.locator('div').filter({ hasText: /^Return Date$/ }).getByRole('textbox').fill('2026-08-10');
    await page.getByRole('button', { name: /^Save/i }).click();
    await expect(page.locator('div.mb-6').getByText('Reservation updated successfully').first()).toBeVisible({ timeout: 100000 });
});

test("User want to change invalid date", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Sign-In" }).click();
    await page.getByRole('textbox', { name: 'Email Address' }).click();
    await page.getByRole('textbox', { name: 'Email Address' }).fill('playwright@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
    await page.getByRole('button', { name: 'Sign In as User' }).click();
    await page.waitForTimeout(3000);
    //make reservation
    await page.getByRole('link', { name: 'Catalog' }).click();
    await page.getByRole('button', { name: /View Car/i }).first().click();
    await page.locator('div').filter({ hasText: /^Pickup Date$/ }).getByRole('textbox').fill('2026-09-09');
    await page.getByRole('button', { name: /^Confirm & Pay/i }).click();
    await page.getByLabel('Close').click();
    //edit reservation
    await page.getByRole("button", { name: "Playwright Man" }).click();
    await page.getByRole("link", { name: "My Reservations" }).click();
    await page.locator('.MuiBackdrop-root').click();
    await page.locator('button').filter({ hasText: /^Edit Reservation/i }).first().click();
    await page.locator('div').filter({ hasText: /^Start Date$/ }).getByRole('textbox').fill('2027-05-11');
    await page.locator('div').filter({ hasText: /^Return Date$/ }).getByRole('textbox').fill('2027-04-29');
    await page.getByRole('button', { name: /^Save/i }).click();
    await expect(page.getByText('Return date cannot be before start date')).toBeVisible({timeout:10000});
});
