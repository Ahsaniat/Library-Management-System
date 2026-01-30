import { test, expect } from '@playwright/test';

test.describe('Books Catalog', () => {
  test('should display books catalog page', async ({ page }) => {
    await page.goto('/books');
    
    await expect(page.locator('h1:has-text("Book Catalog")')).toBeVisible({ timeout: 10000 });
  });

  test('should display seeded books', async ({ page }) => {
    await page.goto('/books');
    
    await expect(page.locator('text=1984')).toBeVisible({ timeout: 10000 });
  });

  test('should search for books', async ({ page }) => {
    await page.goto('/books');
    
    await page.fill('input[placeholder*="Search"]', 'Gatsby');
    await page.keyboard.press('Enter');
    
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url).toContain('q=Gatsby');
  });

  test('should navigate to book detail page', async ({ page }) => {
    await page.goto('/books');
    
    await page.locator('a:has-text("1984")').first().click();
    
    await expect(page).toHaveURL(/.*\/books\/.*/, { timeout: 10000 });
    await expect(page.locator('h1:has-text("1984")')).toBeVisible({ timeout: 10000 });
  });

  test('should display book details', async ({ page }) => {
    await page.goto('/books');
    await page.locator('a:has-text("1984")').first().click();
    
    await expect(page.locator('text=ISBN')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Description')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Availability')).toBeVisible({ timeout: 10000 });
  });

  test('should show book cover image', async ({ page }) => {
    await page.goto('/books');
    await page.locator('a:has-text("1984")').first().click();
    
    await expect(page.locator('img[alt="1984"]')).toBeVisible({ timeout: 10000 });
  });
});
