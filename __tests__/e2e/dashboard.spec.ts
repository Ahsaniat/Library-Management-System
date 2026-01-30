import { test, expect } from '@playwright/test';

test.describe('Member Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'member@library.local');
    await page.fill('input[type="password"]', 'Member123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
  });

  test('should display dashboard with stats', async ({ page }) => {
    await expect(page.locator('text=Welcome back')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Welcome back', { timeout: 10000 });
  });

  test('should navigate to my loans page', async ({ page }) => {
    await page.click('header >> text=My Loans');
    await expect(page).toHaveURL(/.*\/my-loans/, { timeout: 10000 });
  });

  test('should navigate to reservations page', async ({ page }) => {
    await page.click('header >> text=Reservations');
    await expect(page).toHaveURL(/.*\/my-reservations/, { timeout: 10000 });
  });

  test('should display current loans section', async ({ page }) => {
    await expect(page.locator('text=Current Loans')).toBeVisible({ timeout: 10000 });
  });

  test('should display reservations section', async ({ page }) => {
    await expect(page.locator('h2:has-text("Reservations")')).toBeVisible({ timeout: 10000 });
  });
});
