import { test, expect } from '@playwright/test';

test.describe('Member Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'member@library.local');
    await page.fill('input[type="password"]', 'Member123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('should display dashboard with stats', async ({ page }) => {
    await expect(page.locator('text=Welcome back, Jane')).toBeVisible();
    await expect(page.locator('text=Active Loans')).toBeVisible();
    await expect(page.locator('text=Pending Reservations')).toBeVisible();
    await expect(page.locator('text=Overdue')).toBeVisible();
  });

  test('should navigate to my loans page', async ({ page }) => {
    await page.click('text=My Loans');
    await expect(page).toHaveURL(/.*\/my-loans/);
    await expect(page.locator('h1:has-text("My Loans")')).toBeVisible();
  });

  test('should navigate to reservations page', async ({ page }) => {
    await page.click('text=Reservations');
    await expect(page).toHaveURL(/.*\/my-reservations/);
    await expect(page.locator('h1:has-text("My Reservations")')).toBeVisible();
  });

  test('should display empty state for loans', async ({ page }) => {
    await page.click('text=My Loans');
    await expect(page.locator('text=You have no loans')).toBeVisible();
    await expect(page.locator('text=Browse Books')).toBeVisible();
  });

  test('should display empty state for reservations', async ({ page }) => {
    await page.click('text=Reservations');
    await expect(page.locator('text=You have no reservations')).toBeVisible();
  });
});
