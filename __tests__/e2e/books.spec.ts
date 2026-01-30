import { test, expect } from '@playwright/test';

test.describe('Books Catalog', () => {
  test('should display books catalog page', async ({ page }) => {
    await page.goto('/books');
    
    await expect(page.locator('text=Book Catalog')).toBeVisible();
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
  });

  test('should display seeded books', async ({ page }) => {
    await page.goto('/books');
    
    await expect(page.locator('text=1984')).toBeVisible();
    await expect(page.locator('text=Pride and Prejudice')).toBeVisible();
  });

  test('should search for books', async ({ page }) => {
    await page.goto('/books');
    
    await page.fill('input[placeholder*="Search"]', 'Gatsby');
    await page.click('button:has-text("Search")');
    
    await page.waitForTimeout(1000);
    
    const url = page.url();
    expect(url).toContain('q=Gatsby');
  });

  test('should navigate to book detail page', async ({ page }) => {
    await page.goto('/books');
    
    await page.click('text=1984');
    
    await expect(page).toHaveURL(/.*\/books\/.*/);
    await expect(page.locator('h1:has-text("1984")')).toBeVisible();
    await expect(page.locator('text=George Orwell')).toBeVisible();
  });

  test('should display book details', async ({ page }) => {
    await page.goto('/books');
    await page.click('text=1984');
    
    await expect(page.locator('text=ISBN')).toBeVisible();
    await expect(page.locator('text=9780451524935')).toBeVisible();
    await expect(page.locator('text=Description')).toBeVisible();
    await expect(page.locator('text=Availability')).toBeVisible();
  });

  test('should show available copies count', async ({ page }) => {
    await page.goto('/books');
    await page.click('text=1984');
    
    await expect(page.locator('text=/\\d+ copies available/')).toBeVisible();
  });
});
