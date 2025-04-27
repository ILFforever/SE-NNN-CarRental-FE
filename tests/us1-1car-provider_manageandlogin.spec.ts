import { test, expect } from "@playwright/test";

test("Car Provider Login and Logout Normal", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("link", { name: "Sign-In" }).click();
  await page.goto("http://localhost:3000/signin");
  await page.getByRole("textbox", { name: "Email Address" }).click();
  await page
    .getByRole("textbox", { name: "Email Address" })
    .fill("playwright@gmail.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("12345678");
  await page.getByRole("button", { name: "Car Provider" }).click();
  await page.getByRole("button", { name: "Sign In as Car Provider" }).click();
  await page.getByRole("button", { name: "Playwright Test" }).click();
  await page.getByRole("link", { name: "My Profile" }).click();
  await page.locator(".MuiBackdrop-root").click();
  await expect(page.getByRole("main")).toContainText("Playwright Test");
  await expect(page.getByRole("main")).toContainText("playwright@gmail.com");
  await expect(page.getByRole("main")).toContainText(
    "680c50c88dba4ce13dfebd5f"
  );
  await page.getByRole("button", { name: "Playwright Test" }).click();
  await page.getByRole("link", { name: "Sign Out" }).click();
  await page.getByRole("button", { name: "Yes, Sign Out" }).click();
});

test("provider login with non-existant credentials", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("link", { name: "Sign-In" }).click();
  await page.getByRole("button", { name: "Car Provider" }).click();
  await page.getByRole("textbox", { name: "Email Address" }).click();
  await page
    .getByRole("textbox", { name: "Email Address" })
    .fill("fakeprovider@gmail.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("12345678");
  await page.getByRole("button", { name: "Sign In as Car Provider" }).click();
  await expect(page.getByRole("main")).toContainText("Invalid credentials");
});

test("Create New Provider", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("button", { name: "Car Provider" }).click();
  await page.waitForTimeout(1000);
  await expect(page.getByRole("main")).toContainText(
    "Car Provider Registration"
  );
  await page.getByRole("textbox", { name: "Company Name" }).click();
  await page
    .getByRole("textbox", { name: "Company Name" })
    .fill("Temp Provider");
  await page.getByRole("textbox", { name: "Email Address" }).click();
  await page
    .getByRole("textbox", { name: "Email Address" })
    .fill("playwright.temp@gmail.com");
  await page.getByRole("textbox", { name: "Company Address" }).click();
  await page.getByRole("textbox", { name: "Company Address" }).fill("BKK");
  await page.getByRole("textbox", { name: "Telephone (XXX-XXXXXXX)" }).click();
  await page
    .getByRole("textbox", { name: "Telephone (XXX-XXXXXXX)" })
    .fill("123-4567890");
  await page.getByRole("textbox", { name: "Password", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Password", exact: true })
    .fill("12345678");
  await page.getByRole("textbox", { name: "Confirm Password" }).click();
  await page
    .getByRole("textbox", { name: "Confirm Password" })
    .fill("12345678");
  await page.getByRole("button", { name: "Register as Provider" }).click();
  await page.waitForTimeout(2000);
  await expect(page.getByRole("heading")).toContainText(
    "Provider Registration Successful"
  );
  await page.getByRole("link", { name: "Sign In" }).click();
  await page.getByRole("textbox", { name: "Email Address" }).click();
  await page
    .getByRole("textbox", { name: "Email Address" })
    .fill("playwright.temp@gmail.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("12345678");
  await page.getByRole("button", { name: "Car Provider", exact: true }).click();
  await page
    .getByRole("button", { name: "Sign In as Car Provider", exact: true })
    .click();
  await page.getByRole("button", { name: "Temp Provider" }).click();
  await page.getByRole("link", { name: "My Profile" }).click();
  await page.locator(".MuiBackdrop-root").click();
  await expect(page.getByRole("main")).toContainText("Temp Provider");
  await expect(page.getByRole("main")).toContainText(
    "playwright.temp@gmail.com"
  );
  await expect(page.getByRole("main")).toContainText("123-4567890");
  await page.getByRole("button", { name: "Temp Provider" }).click();
  await page.getByRole("link", { name: "Sign Out" }).click();
  await page.getByRole("button", { name: "Yes, Sign Out" }).click();
  await expect(page.locator('body')).toContainText('Register');

  //Log in as admin and delete user
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Sign-In' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('admin@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.getByRole('button', { name: 'Sign In as User' }).click();
  await expect(page.locator('#user-menu-button')).toContainText('Admin');
  await page.getByRole('button', { name: 'Admin' }).click();
  await page.getByRole('link', { name: 'Admin Tools' }).click();
  await page.locator('.MuiBackdrop-root').click();
  await page.getByRole('link', { name: 'Manage Car Providers Add or' }).click();
  await page.waitForTimeout(2000);
  await expect(page.getByRole('heading')).toContainText('Manage Car Providers');
  await expect(page.locator('tbody')).toContainText('Temp Provider');
  await expect(page.locator('tbody')).toContainText('playwright.temp@gmail.com');
  await page.getByRole('row', { name: 'Temp Provider playwright.temp' }).getByRole('button').nth(1).click();
  await expect(page.locator('h3')).toContainText('Deactivate Car Provider');
  await page.locator('div').filter({ hasText: /^DeactivateCancel$/ }).getByRole('button').first().click();
  await expect(page.getByRole('main')).toContainText('Car provider deactivated successfully');
  await page.getByRole('button', { name: 'Admin' }).click();
  await page.getByRole('link', { name: 'Sign Out' }).click();
  await expect(page.getByRole('paragraph')).toContainText('Are you sure you want to sign out of your CEDT Rentals account?');
  await page.getByRole('button', { name: 'Yes, Sign Out' }).click();
  await expect(page.locator('body')).toContainText('Register');
});
