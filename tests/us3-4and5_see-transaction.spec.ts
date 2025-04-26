import { test, expect } from "@playwright/test";

test("user story 3-4/5(Acceptance criteria 1) test viewing all transactions", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("link", { name: "Sign-In" }).click();
  await page.getByRole("textbox", { name: "Email Address" }).click();
  await page
    .getByRole("textbox", { name: "Email Address" })
    .fill("transaction@gmail.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("12345678");
  await page.getByRole("button", { name: "Sign In as User" }).click();
  await page.getByRole("button", { name: "trasaction" }).click();
  await page.getByRole("link", { name: "My Profile" }).click();
  await page.locator(".MuiBackdrop-root").click();
  await page.getByRole("link", { name: "View My Transactions Track" }).click();
  await page.getByRole("button", { name: "Expand details" }).first().click();
  await page.getByRole("button", { name: "Expand details" }).click();
  await page
    .getByText(
      "+500.00Credit depositDeposit27/04/2025 02:03PMReference:QRCodePerformed By:-"
    )
    .click();
  await page
    .getByText(
      "+1,000.00Credit depositDeposit26/04/2025 02:01PMReference:QRCodePerformed By:-"
    )
    .click();
});

test("user story 3-4/5(Acceptance criteria 2) test viewing transactions and applying filters to view specific transactions", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("link", { name: "Sign-In" }).click();
  await page.getByRole("textbox", { name: "Email Address" }).click();
  await page
    .getByRole("textbox", { name: "Email Address" })
    .fill("transaction@gmail.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("12345678");
  await page.getByRole("button", { name: "Sign In as User" }).click();
  await page.getByRole("button", { name: "trasaction" }).click();
  await page.getByRole("link", { name: "My Profile" }).click();
  await page.locator(".MuiBackdrop-root").click();
  await page.getByRole("link", { name: "View My Transactions Track" }).click();
  await page.getByRole("button", { name: "Expand details" }).first().click();
  await page.getByRole("button", { name: "Expand details" }).click();
  await expect(
    page.getByText(
      "+500.00Credit depositDeposit27/04/2025 02:03PMReference:QRCodePerformed By:-"
    )
  ).toBeVisible();
  await expect(
    page.getByText(
      "+1,000.00Credit depositDeposit26/04/2025 02:01PMReference:QRCodePerformed By:-"
    )
  ).toBeVisible();
  await page
    .locator("div")
    .filter({ hasText: /^Start Date$/ })
    .getByRole("textbox")
    .fill("2025-04-27");
  await page
    .locator("div")
    .filter({ hasText: /^End Date$/ })
    .getByRole("textbox")
    .fill("2025-04-27");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(
    page.getByText(
      "+500.00Credit depositDeposit27/04/2025 02:03PMReference:QRCodePerformed By:-"
    )
  ).toBeVisible();
});
