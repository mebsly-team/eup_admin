import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('should log in successfully with valid credentials', async ({ page }) => {
    await page.goto('http://52.28.100.129:3001/auth/jwt/login');
    await page.waitForTimeout(1000);
    await page.fill('input[name="email"]', 'info1@info.com');
    await page.waitForTimeout(1000);
    await page.fill('input[name="password"]', 'Test123456!');
    await page.waitForTimeout(1000);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    await page.waitForURL('http://52.28.100.129:3001/dashboard/product');
    await expect(page).toHaveURL('http://52.28.100.129:3001/dashboard/product');
  });


  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('http://52.28.100.129:3001/auth/jwt/login');
    await page.waitForTimeout(1000);
    await page.fill('input[name="email"]', 'invalid_email');
    await page.waitForTimeout(1000);
    await page.fill('input[name="password"]', 'invalid_password');
    await page.waitForTimeout(1000);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    const errorMessage = await page.locator('text=Email must be a valid email address');
    await expect(errorMessage).toBeVisible();
    await expect(page).toHaveURL('http://52.28.100.129:3001/auth/jwt/login');
  });

  test('should show error for empty username and password', async ({ page }) => {
    await page.goto('http://52.28.100.129:3001/auth/jwt/login');
    await page.waitForTimeout(1000);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    const errorMessage = await page.locator('text=Email is required');
    await expect(errorMessage).toBeVisible();
    const errorMessage2 = await page.locator('text=Password is required');
    await expect(errorMessage2).toBeVisible();
    await expect(page).toHaveURL('http://52.28.100.129:3001/auth/jwt/login');
  });
});
