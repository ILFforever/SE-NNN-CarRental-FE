import { test, expect } from "@playwright/test";
import path from "path";

const ImagesList = [
  "car01.jpeg",
  "car02.jpg",
  "car03.jpg",
  "car04.jpg",
  "car05.jpg",
  "car06.jpg",
  "car07.jpg",
  "car08.jpg",
];
const randomImage = ImagesList[Math.floor(Math.random() * ImagesList.length)];

const BrandName = "Playwright";
const ModelName = "CI/CD " + Math.floor(Math.random() * 100);
const LicensePlate =
  "PLY-" +
  new Date().getMonth() +
  new Date().getDate() +
  Math.floor(Math.random() * 100);

test("Car Provider should adding new car normally", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("link", { name: "Sign-In" }).click();
  await page.getByRole("button", { name: "Car Provider" }).click();
  await page.getByRole("textbox", { name: "Email Address" }).click();
  await page
    .getByRole("textbox", { name: "Email Address" })
    .fill("playwright@gmail.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("12345678");
  await page.getByRole("button", { name: "Sign In as Car Provider" }).click();
  await page.getByRole("link", { name: "Provider Tools" }).click();
  await page.getByRole("link", { name: "Manage My Cars" }).click();
  await page.getByRole("button", { name: "Add New Car" }).first().click();
  await page.getByRole("textbox", { name: "License Plate *" }).click();
  await page
    .getByRole("textbox", { name: "License Plate *" })
    .fill(LicensePlate);
  await page.getByRole("textbox", { name: "Brand *" }).click();
  await page.getByRole("textbox", { name: "Brand *" }).fill(BrandName);
  await page.getByRole("textbox", { name: "Model *" }).click();
  await page.getByRole("textbox", { name: "Model *" }).fill(ModelName);
  await page.getByLabel("Type *").selectOption("suv");
  await page.getByLabel("Color *").selectOption("Yellow");
  await page.getByRole("spinbutton", { name: "Daily Rate (USD) *" }).click();
  await page.getByRole("spinbutton", { name: "Daily Rate (USD) *" }).fill("1");
  await page.setInputFiles(
    'input[type="file"]',
    path.resolve("tests/images/" + randomImage)
  );
  await page.getByRole("button", { name: "Add Car" }).click();
  await expect(page.locator("tbody")).toContainText(LicensePlate);
  await page.getByRole("button", { name: "Playwright Test" }).click();
  await page.getByRole("link", { name: "Sign Out" }).click();
  await page.getByRole("link", { name: "Catalog" }).click();
  await page.waitForLoadState("domcontentloaded");

  await expect(
    page.locator('[data-test-id="catalog-item-title"]').filter({
      hasText: `${BrandName} ${ModelName}`,
    })
  ).toHaveCount(1);
});

test("Car Provider should not upload un-image files", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("link", { name: "Sign-In" }).click();
  await page.getByRole("button", { name: "Car Provider" }).click();
  await page.getByRole("textbox", { name: "Email Address" }).click();
  await page
    .getByRole("textbox", { name: "Email Address" })
    .fill("playwright@gmail.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("12345678");
  await page.getByRole("button", { name: "Sign In as Car Provider" }).click();
  await page.getByRole("link", { name: "Provider Tools" }).click();
  await page.getByRole("link", { name: "Manage My Cars" }).click();
  await page.getByRole("button", { name: "Add New Car" }).first().click();
  await page.getByRole("textbox", { name: "License Plate *" }).click();
  await page
    .getByRole("textbox", { name: "License Plate *" })
    .fill(LicensePlate);
  await page.getByRole("textbox", { name: "Brand *" }).click();
  await page.getByRole("textbox", { name: "Brand *" }).fill(BrandName + " Err");
  await page.getByRole("textbox", { name: "Model *" }).click();
  await page.getByRole("textbox", { name: "Model *" }).fill(ModelName);
  await page.getByLabel("Type *").selectOption("suv");
  await page.getByLabel("Color *").selectOption("Yellow");
  await page.getByRole("spinbutton", { name: "Daily Rate (USD) *" }).click();
  await page.getByRole("spinbutton", { name: "Daily Rate (USD) *" }).fill("1");
  await page.setInputFiles(
    'input[type="file"]',
    path.resolve("tests/images/unsupport/A2-001.pdf")
  );
  await expect(page.locator('form')).toContainText('Upload up to 5 images of your car.The first image will be used as the main photo.');
});
