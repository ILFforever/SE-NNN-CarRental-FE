import { test, expect } from "@playwright/test";

test("New Provider unverified", async ({ page }) => {
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
  //Not yet be verified
  await expect(page.getByRole("main")).toContainText("Pending Verification");
  await expect(page.getByRole("main")).toContainText("123-4567890");

  await page.getByRole("button", { name: "Temp Provider" }).click();
  await page.getByRole("link", { name: "Provider Tools" }).click();
  await page.locator(".MuiBackdrop-root").click();
  await page.getByRole("link", { name: "Manage Cars Add, update, or" }).click();
  await page.waitForTimeout(2000);
  await page
    .getByRole("button", { name: "Add New Car", exact: true })
    .first()
    .click();
  await page.getByRole("textbox", { name: "License Plate *" }).click();
  await page
    .getByRole("textbox", { name: "License Plate *" })
    .fill("US1-4 Test");
  await page.getByRole("textbox", { name: "Brand *" }).click();
  await page.getByRole("textbox", { name: "Brand *" }).fill("Playwright");
  await page.getByRole("textbox", { name: "Model *" }).click();
  await page.getByRole("textbox", { name: "Model *" }).fill("Playwright");
  await page.getByLabel("Color *").selectOption("Orange");
  await page
    .getByRole("textbox", { name: "Manufacture Date *" })
    .fill("2025-04-28");
  await page.getByRole("spinbutton", { name: "Daily Rate (USD) *" }).click();
  await page.getByRole("spinbutton", { name: "Daily Rate (USD) *" }).fill("11");
  await page.locator(".p-3 > div > .w-5").first().click();
  await page.locator("div:nth-child(2) > div > .w-5").click();
  await page.getByRole("button", { name: "Add Car" }).click();
  await page.waitForTimeout(2000);
  await expect(page.locator("tbody")).toContainText("US1-4 Test");
  await expect(page.locator("tbody")).toContainText("Playwright Playwright");

  //Log out
  await page.getByRole("button", { name: "Temp Provider" }).click();
  await page.getByRole("link", { name: "Sign Out" }).click();
  await page.getByRole("button", { name: "Yes, Sign Out" }).click();
  await expect(page.locator("body")).toContainText("Register");

  //Admin create temp admin for this test
  await page.getByRole("link", { name: "Sign-In" }).click();
  await page.getByRole("textbox", { name: "Email Address" }).click();
  await page
    .getByRole("textbox", { name: "Email Address" })
    .fill("admin@gmail.com");
  await page.getByRole("textbox", { name: "Email Address" }).press("Tab");
  await page.getByRole("textbox", { name: "Password" }).fill("12345678");
  await page.getByRole("button", { name: "Sign In as User" }).click();
  await page.getByRole("button", { name: "Admin" }).click();
  await page.getByRole("link", { name: "Admin Tools" }).click();
  await page.locator(".MuiBackdrop-root").click();
  await page.getByRole("link", { name: "Manage Admins Create and" }).click();
  await page.getByRole("button", { name: "Create New Admin" }).click();
  await page.getByRole("textbox", { name: "Full Name" }).click();
  await page
    .getByRole("textbox", { name: "Full Name" })
    .fill("us1-4 playwright test");
  await page.getByRole("textbox", { name: "Email Address" }).click();
  await page
    .getByRole("textbox", { name: "Email Address" })
    .fill("us1-4playwright@gmail.com");
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
  await page.getByRole("button", { name: "Create Admin User" }).click();
  await page.waitForTimeout(2000);
  await expect(page.locator("tbody")).toContainText("us1-4 playwright test");
  await expect(page.locator("tbody")).toContainText(
    "us1-4playwright@gmail.com"
  );
  await page.getByRole("button", { name: "Admin", exact: true }).click();
  await page.getByRole("link", { name: "Sign Out" }).click();
  await page.getByRole("button", { name: "Yes, Sign Out" }).click();
  await expect(page.locator("body")).toContainText("Register");

  // const qrCodePromise = new Promise<string>((resolve) => {
  //   page.on("request", (request) => {
  //     const url = request.url();
  //     if (url.startsWith("https://droplet.ngixx.in.th/api/v1/qrcode/")) {
  //       const qrCodeId = url.split("/").pop();
  //       if (qrCodeId) {
  //         resolve(qrCodeId);
  //       }
  //     }
  //   });
  // });

  const responsePromise = page.waitForResponse(response => 
    response.url().startsWith('https://droplet.ngixx.in.th/api/v1/qrcode/')
  );

  //Log in as the new account and add funds
  await page.getByRole("link", { name: "Sign-In" }).click();
  await page.getByRole("textbox", { name: "Email Address" }).click();
  await page
    .getByRole("textbox", { name: "Email Address" })
    .fill("us1-4playwright@gmail.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("12345678");
  await page.getByRole("button", { name: "Sign In as User" }).click();
  await page.waitForTimeout(1000);
  await page.getByRole("button", { name: "0", exact: true }).click();
  await page.getByRole("button", { name: "Topup" }).click();
  await expect(page.locator("h1")).toContainText("Top Up Your Balance");
  await expect(page.locator("#user-menu-button")).toContainText(
    "us1-4 playwright test"
  );
  await page.getByRole("button", { name: "Custom Amount" }).click();
  await page.getByPlaceholder("Enter amount").click();
  await page.getByPlaceholder("Enter amount").fill("99999");
  await page.waitForTimeout(2000);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForTimeout(2000);
  await page.getByRole("button", { name: "Confirm" }).click();
  //const qrCodeId = await qrCodePromise;
  const response = await responsePromise;
  const qrCodeId = response.url().split('/').pop();

  if (qrCodeId) {
    const retrieveUrl = `https://se-nnn-carrental-be.fly.dev/api/v1/credits/topup/retrieve?trans_id=${qrCodeId}`;
    await page.goto(retrieveUrl);
  }
  //Back to home
  await page.goto("http://localhost:3000/");
  for (let i = 0; i < 10; i++) {
    await page.getByRole("link", { name: "Catalog" }).click();
    await page
      .locator('[data-test-id="catalog"] div')
      .filter({ hasText: "$11.00/daysedanPlaywright" })
      .getByRole("button")
      .nth(1)
      .click();
    await page
      .locator("div")
      .filter({ hasText: /^Pickup Date$/ })
      .getByRole("textbox")
      .fill("2025-05-01");
    await page
      .getByRole("button", { name: "Confirm & Pay $1.10 Deposit" })
      .click();
    await expect(page.getByRole("main")).toContainText("Booking Successful!");
    await expect(page.getByRole("main")).toContainText("Playwright Playwright");
    await page.getByText("Close").click();
    await page.getByRole("link", { name: "View Details" }).first().click();
    page.once("dialog", (dialog) => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.dismiss().catch(() => {});
    });
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: "Confirm Reservation" }).click();
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: "Complete Reservation" }).click();
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    //await expect(page.getByRole('main')).toContainText('Reservation completed successfully');

    await page.getByRole("link", { name: "Back to All Reservations" }).click();
    await page.getByRole("button", { name: "Pay Now" }).click();
    await expect(page.locator('h1')).toContainText('Complete Your Payment');
    await page.getByRole("button", { name: "Pay $" }).click();
  }
  //Log in as admin and delete user
  // await page.getByRole("link", { name: "Sign-In" }).click();
  // await page.getByRole("textbox", { name: "Email Address" }).click();
  // await page
  //   .getByRole("textbox", { name: "Email Address" })
  //   .fill("admin@gmail.com");
  // await page.getByRole("textbox", { name: "Password" }).click();
  // await page.getByRole("textbox", { name: "Password" }).fill("12345678");
  // await page.getByRole("button", { name: "Sign In as User" }).click();
  // await expect(page.locator("#user-menu-button")).toContainText("Admin");
  // await page.getByRole("button", { name: "Admin" }).click();
  // await page.getByRole("link", { name: "Admin Tools" }).click();
  // await page.locator(".MuiBackdrop-root").click();
  // await page.getByRole("link", { name: "Manage Car Providers Add or" }).click();
  // await page.waitForTimeout(2000);
  // await expect(page.getByRole("heading")).toContainText("Manage Car Providers");
  // await expect(page.locator("tbody")).toContainText("Temp Provider");
  // await expect(page.locator("tbody")).toContainText(
  //   "playwright.temp@gmail.com"
  // );
  // await page
  //   .getByRole("row", { name: "Temp Provider playwright.temp" })
  //   .getByRole("button")
  //   .nth(1)
  //   .click();
  // await expect(page.locator("h3")).toContainText("Deactivate Car Provider");
  // await page
  //   .locator("div")
  //   .filter({ hasText: /^DeactivateCancel$/ })
  //   .getByRole("button")
  //   .first()
  //   .click();
  // await expect(page.getByRole("main")).toContainText(
  //   "Car provider deactivated successfully"
  // );
  // await page.getByRole("button", { name: "Admin" }).click();
  // await page.getByRole("link", { name: "Sign Out" }).click();
  // await expect(page.getByRole("paragraph")).toContainText(
  //   "Are you sure you want to sign out of your CEDT Rentals account?"
  // );
  // await page.getByRole("button", { name: "Yes, Sign Out" }).click();
  // await expect(page.locator("body")).toContainText("Register");
});
