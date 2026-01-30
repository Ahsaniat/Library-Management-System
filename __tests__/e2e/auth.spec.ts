import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'member@library.local');
    await page.fill('input[type="password"]', 'Member123!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.bg-red-50')).toBeVisible();
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should logout successfully', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'member@library.local');
    await page.fill('input[type="password"]', 'Member123!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    await page.click('button >> svg.lucide-log-out');
    
    await expect(page).toHaveURL('/');
    await expect(page.locator('header >> text=Login')).toBeVisible();
  });

  test('should show validation errors on register', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'test@test.com');
    await page.fill('input[name="password"]', 'short');
    await page.fill('input[name="confirmPassword"]', 'short');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.bg-red-50')).toBeVisible();
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
  });

  test('should show password mismatch error', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'test@test.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.bg-red-50')).toBeVisible();
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });
});
