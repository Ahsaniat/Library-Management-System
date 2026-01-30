import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display the library management system homepage', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/Library Management System/);
    await expect(page.locator('h1:has-text("Welcome to the Library Management System")')).toBeVisible();
    await expect(page.locator('button:has-text("Browse Catalog")')).toBeVisible();
    await expect(page.locator('button:has-text("Get Started")')).toBeVisible();
  });

  test('should display navigation header', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('header >> text=LibraryMS')).toBeVisible();
    await expect(page.locator('header >> text=Catalog')).toBeVisible();
    await expect(page.locator('header >> text=Login')).toBeVisible();
    await expect(page.locator('header >> text=Register')).toBeVisible();
  });

  test('should display footer', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('text=Made with')).toBeVisible();
  });

  test('should navigate to books catalog', async ({ page }) => {
    await page.goto('/');
    
    await page.click('button:has-text("Browse Catalog")');
    await expect(page).toHaveURL(/.*\/books/, { timeout: 10000 });
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    
    await page.click('header >> text=Login');
    await expect(page).toHaveURL(/.*\/login/, { timeout: 10000 });
    await expect(page.locator('text=Sign in to your account')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/');
    
    await page.click('header >> text=Register');
    await expect(page).toHaveURL(/.*\/register/, { timeout: 10000 });
    await expect(page.locator('text=Create your account')).toBeVisible();
  });
});
