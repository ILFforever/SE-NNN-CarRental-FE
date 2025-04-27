import { test, expect } from '@playwright/test';

test.describe('Car Favorite Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the site
    await page.goto('http://localhost:3000/');
  });

  test('should add and remove cars from favorites', async ({ page }) => {
    // Navigate to login and sign in
    await page.getByRole('link', { name: /Sign-In/i }).click();
    await page.getByRole('textbox', { name: /Email Address/i }).fill('playwright@gmail.com');
    await page.getByRole('textbox', { name: /Password/i }).fill('12345678');
    await page.getByRole('button', { name: /Sign In as User/i }).click();

    // Wait for login to complete
    await page.goto('http://localhost:3000/');

    // Navigate to catalog
    await page.getByRole('link', { name: /Catalog/i }).click();
    
    // Wait for cars to load
    await page.waitForSelector('[data-test-id="catalog-item"]');
    
    // Get favorite buttons and add cars to favorites
    const favoriteButtons = page.locator('[aria-label="Add to favorites"]');
    
    // Add first three cars to favorites
    await page.locator('[data-test-id="catalog"] div').filter({ hasText: '$2.00/dayconvertiblePlaywright Hand2025 • Playwright TestRated by 6 people5.0$2' }).getByLabel('Add to favorites').click();
    await page.locator('[data-test-id="catalog"] div').filter({ hasText: '$2.00/dayhatchbackTesla Test' }).getByLabel('Add to favorites').click();
    await page.locator('[data-test-id="catalog"] div').filter({ hasText: '$1.00/daysuvPlaywright CI/CD 182025 • Playwright TestRated by 6 people5.0$1 /' }).getByLabel('Add to favorites').click();
    
    // Navigate to favorites page using more flexible navigation
    await page.goto('http://localhost:3000/account/favorite');
    
    // Verify that 3 cars are in favorites
    const favoriteCars = page.locator('[data-test-id="favorite-car-item"]');
    await expect(favoriteCars).toHaveCount(3);
    
    // Remove the first car from favorites
    const removeButtons = page.locator('[aria-label="Remove from favorites"]');
    await removeButtons.first().click();
    
    // Wait for the refresh button to appear and click it
    await page.waitForSelector('[data-test-id="refresh-favorites"]');
    await page.getByTestId('refresh-favorites').click();
    
    // Verify that only 2 cars remain
    await expect(favoriteCars).toHaveCount(2);
    
    // Remove all remaining favorites
    await removeButtons.nth(0).click();
    await removeButtons.nth(0).click();
    
    // Refresh the list
    await page.getByTestId('refresh-favorites').click();
    
    // Verify empty state message
    await expect(page.getByText(/You haven't added any cars to your favorites yet/i)).toBeVisible();
  });

  test('should persist favorites after navigation', async ({ page }) => {
    // Navigate to login and sign in
    await page.getByRole('link', { name: /Sign-In/i }).click();
    await page.getByRole('textbox', { name: /Email Address/i }).fill('playwright@gmail.com');
    await page.getByRole('textbox', { name: /Password/i }).fill('12345678');
    await page.getByRole('button', { name: /Sign In as User/i }).click();

    // Wait for login to complete
    await page.waitForURL('**/');

    // Navigate to catalog
    await page.getByRole('link', { name: /Catalog/i }).click();
    
    // Add a car to favorites
    const firstFavoriteButton = page.locator('[aria-label="Add to favorites"]').first();
    await firstFavoriteButton.click();
    
    // Navigate away
    await page.getByRole('link', { name: /Home/i }).click();
    
    // Navigate back to catalog
    await page.getByRole('link', { name: /Catalog/i }).click();
    
    // Verify the car is still favorited
    const firstFavoriteButtonAfterNavigation = page.locator('[aria-label="Remove from favorites"]').first();
    await expect(firstFavoriteButtonAfterNavigation).toBeVisible();
  });

  test('should be able to remove favorite from car details page', async ({ page }) => {
    // Navigate to login and sign in
    await page.getByRole('link', { name: /Sign-In/i }).click();
    await page.getByRole('textbox', { name: /Email Address/i }).fill('playwright@gmail.com');
    await page.getByRole('textbox', { name: /Password/i }).fill('12345678');
    await page.getByRole('button', { name: /Sign In as User/i }).click();

    // Wait for login to complete
    await page.waitForURL('**/');

    // Navigate to catalog
    await page.getByRole('link', { name: /Catalog/i }).click();
    
    // Add a car to favorites
    const firstFavoriteButton = page.locator('[aria-label="Add to favorites"]').first();
    await firstFavoriteButton.click();
    
    // Click on the car to view details
    const viewCarButton = page.getByRole('button', { name: /View Car/i }).first();
    await viewCarButton.click();
    
    // Remove from favorites on the details page
    const removeFavoriteButton = page.locator('[aria-label="Remove from favorites"]');
    await removeFavoriteButton.click();
    
    // Navigate to favorites page
    await page.goto('http://localhost:3000/account/favorite');
    
    // Verify empty state
    await expect(page.getByText(/You haven't added any cars to your favorites yet/i)).toBeVisible();
  });
});