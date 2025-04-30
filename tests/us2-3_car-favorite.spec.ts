import { test, expect } from '@playwright/test';

test('add favorite car', async ({ page }) => {
  await page.goto('https://se-cedt-rentals.vercel.app/');
  await page.getByRole('link', { name: 'Sign-In' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('playwright@gmail.com');
  await page.locator('div').filter({ hasText: /^Password$/ }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.getByRole('button', { name: 'Sign In as User' }).click();
  await page.waitForTimeout(3000);

  // Navigate to catalog
  await page.getByRole('link', { name: /Catalog/i }).click();
  await page.waitForTimeout(3000);

  // Add 3 cars to favorites
  const favoriteButtons = page.locator('[aria-label="Add to favorites"]');
  for (let i = 0; i < 3; i++) {
    await favoriteButtons.nth(0).click();
    await page.waitForTimeout(500); // Wait for the action to complete
  }

  // Navigate to profile and then to favorites
  await page.getByRole('button', { name: 'Playwright Man' }).click();
  await page.getByRole('button', { name: 'My Profile' }).click();
  // await page.locator('.MuiBackdrop-root').click();
  await page.getByRole('link', { name: 'Favorite Cars See your saved' }).click();
  
  // Wait for favorites page to load
  await page.waitForTimeout(2000);
  
  // Count the number of favorite cars
  const favoriteCars = await page.locator('[data-test-id="favorite-car-item"]');
  await expect(favoriteCars).toHaveCount(3);
});

test('have car in favorite page and can go to reservation page', async ({ page }) => {
  await page.goto('https://se-cedt-rentals.vercel.app/');
  await page.getByRole('link', { name: 'Sign-In' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('playwright@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.getByRole('button', { name: 'Sign In as User' }).click();
  await page.waitForTimeout(1000);

  await page.getByRole('button', { name: 'Playwright Man' }).click();
  await page.getByRole('button', { name: 'My Profile' }).click();
  // await page.locator('.MuiBackdrop-root').click();
  await page.waitForTimeout(1000);

  await page.getByRole('link', { name: 'Favorite Cars See your saved' }).click();
  await page.waitForTimeout(5000);
  
  const carTitles = await page.locator('h2').allInnerTexts(); 
  const selectedCar = carTitles[0];  
  console.log(selectedCar);
  await page.getByRole('button', { name: 'Reserve Now' }).first().click();
  await page.waitForTimeout(4000);
  
  const carTitleElement = page.locator('h3').first();
  await expect(carTitleElement).toHaveText(selectedCar);
});

test('delete car from favorite', async ({ page }) => {
  await page.goto('https://se-cedt-rentals.vercel.app/');
  await page.getByRole('link', { name: 'Sign-In' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('playwright@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.getByRole('button', { name: 'Sign In as User' }).click();
  await page.waitForTimeout(3000);
  await page.waitForLoadState('networkidle');
  
  // Navigate to favorites page
  await page.waitForTimeout(3000);

  await page.getByRole('button', { name: 'Playwright Man' }).click();
  await page.waitForTimeout(3000);

  await page.getByRole('button', { name: 'My Profile' }).click();
    await page.waitForTimeout(3000);

  // await page.locator('.MuiBackdrop-root').click();
  await page.getByRole('link', { name: 'Favorite Cars See your saved' }).click();
  await page.waitForLoadState('networkidle');
  
  // Wait for favorites to load completely
  await page.waitForSelector('[data-test-id="favorite-car-item"]');
  
  // Count initial favorites
  const initialFavorites = await page.locator('[data-test-id="favorite-car-item"]');
  const initialCount = await initialFavorites.count();
  
  // Remove all favorites using the remove button
  while (await page.locator('[aria-label="Remove from favorites"]').count() > 0) {
    // Get all remove buttons each time in the loop
    const removeButtons = await page.locator('[aria-label="Remove from favorites"]').all();
    
    // Click the first remove button with force if needed
    await removeButtons[0].click({ force: true });
    
    // Wait for the UI to update
    await page.waitForTimeout(2000);
    
    // Check if refresh button appears and click it
    const refreshButton = page.getByTestId('refresh-favorites');
    const isRefreshVisible = await refreshButton.isVisible().catch(() => false);
    
    if (isRefreshVisible) {
      await refreshButton.click();
      await page.waitForLoadState('networkidle');
    }
   
    
    // Wait for potential UI updates
    await page.waitForTimeout(1000);
  }
   await page.goto('https://se-cedt-rentals.vercel.app/account/favorite');
  // Verify that no favorites are left
  await expect(page.getByText(/You haven't added any cars to your favorites yet/i)).toBeVisible({ timeout: 10000 });
});
