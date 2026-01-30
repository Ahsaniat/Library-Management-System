import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'member@library.local');
    await page.fill('input[type="password"]', 'Member123!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
    await expect(page.locator('text=Welcome back')).toBeVisible({ timeout: 10000 });
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await page.waitForSelector('[class*="bg-red"]', { timeout: 15000 });
    await expect(page.locator('[class*="bg-red"]')).toBeVisible();
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page).toHaveURL(/.*\/login/, { timeout: 10000 });
  });

  test('should logout successfully', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'member@library.local');
    await page.fill('input[type="password"]', 'Member123!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
    
    await page.click('button:has(svg.lucide-log-out)');
    
    await expect(page.locator('header >> text=Login')).toBeVisible({ timeout: 10000 });
  });

  test('should show validation errors on register', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'test@test.com');
    await page.fill('input[name="password"]', 'short');
    await page.fill('input[name="confirmPassword"]', 'short');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('[class*="bg-red"]')).toBeVisible({ timeout: 10000 });
  });

  test('should show password mismatch error', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'test@test.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('[class*="bg-red"]')).toBeVisible({ timeout: 10000 });
  });
});
