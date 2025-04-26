import { test, expect } from '@playwright/test';

test.describe('Car Favorite Feature', () => {
  // Use beforeEach to login instead of registering a new user
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    // await page.goto('http://localhost:3000/signin');
    
    // // Login with an existing test user
    // await page.getByRole('textbox', { name: 'Email Address' }).fill('test_favo@gmail.com');
    // await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
    // await page.getByRole('button', { name: 'Sign In as User' }).click();
    
    // // Wait for navigation to complete
    // await page.waitForURL('**/');
  });

  test('should add and remove cars from favorites', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.goto('http://localhost:3000/signin');
    
    // Login with an existing test user
    await page.getByRole('textbox', { name: 'Email Address' }).fill('playwright@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
    await page.getByRole('button', { name: 'Sign In as User' }).click();

    await page.goto('http://localhost:3000/catalog');

    // Navigate to catalog
    // await page.getByRole('link', { name: 'Catalog' }).click();
    
    // Wait for cars to load
    await page.waitForSelector('[data-test-id="catalog-item"]');
    
    // Get favorite buttons and add cars to favorites
    const favoriteButtons = page.locator('[aria-label="Add to favorites"]');
    
    // Add first three cars to favorites
    for (let i = 0; i < 3; i++) {
      await favoriteButtons.nth(i).click();

    }
    
    // Navigate to favorites page
    await page.getByRole('button', { name: 'Playwright Man' }).click();
    await page.getByRole('link', { name: 'My Profile' }).click();
    await page.locator('.MuiBackdrop-root').click();
    await page.getByRole('link', { name: 'View Favorite Cars See your' }).click();
    
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
    await removeButtons.nth(1).click();
    
    // Refresh the list
    await page.getByTestId('refresh-favorites').click();
    
    // Verify empty state message
    await expect(page.getByText(/You haven't added any cars to your favorites yet/i)).toBeVisible();
  });

  test('should persist favorites after navigation', async ({ page }) => {
    // Navigate to catalog
    await page.getByRole('link', { name: 'Catalog' }).click();
    
    // Add a car to favorites
    const firstFavoriteButton = page.locator('[aria-label="Add to favorites"]').first();
    await firstFavoriteButton.click();
    
    // Navigate away
    await page.getByRole('link', { name: 'Home' }).click();
    
    // Navigate back to catalog
    await page.getByRole('link', { name: 'Catalog' }).click();
    
    // Verify the car is still favorited
    const firstFavoriteButtonAfterNavigation = page.locator('[aria-label="Remove from favorites"]').first();
    await expect(firstFavoriteButtonAfterNavigation).toBeVisible();
  });

  test('should be able to remove favorite from car details page', async ({ page }) => {
    // Navigate to catalog
    await page.getByRole('link', { name: 'Catalog' }).click();
    
    // Add a car to favorites
    const firstFavoriteButton = page.locator('[aria-label="Add to favorites"]').first();
    await firstFavoriteButton.click();
    
    // Click on the car to view details
    const viewCarButton = page.getByRole('button', { name: 'View Car' }).first();
    await viewCarButton.click();
    
    // Remove from favorites on the details page
    const removeFavoriteButton = page.locator('[aria-label="Remove from favorites"]');
    await removeFavoriteButton.click();
    
    // Navigate to favorites page
    await page.getByRole('button', { name: 'Playwright Test' }).click();
    await page.getByRole('link', { name: 'My Profile' }).click();
    await page.getByRole('link', { name: 'View Favorite Cars' }).click();
    
    // Verify empty state
    await expect(page.getByText(/You haven't added any cars to your favorites yet/i)).toBeVisible();
  });
});