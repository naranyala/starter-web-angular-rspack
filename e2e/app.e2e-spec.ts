import { expect, test } from '@playwright/test';

test('should display the application title', async ({ page }) => {
  await page.goto('/');

  // Check if the app component is rendered
  await expect(page.locator('app-root')).toBeVisible();
});

test('should display demo cards', async ({ page }) => {
  await page.goto('/');

  // Check if at least one demo card is visible
  const cards = page.locator('[data-testid="card"]');
  await expect(cards.first()).toBeVisible({ timeout: 5000 });
});

test('should filter cards based on search', async ({ page }) => {
  await page.goto('/');

  const searchInput = page.locator('input[placeholder*="Search" i]');
  if (await searchInput.isVisible()) {
    await searchInput.fill('Angular');
    await expect(page.locator('text=Angular').first()).toBeVisible();
  }
});
