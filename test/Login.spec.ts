import { test, expect, Page, BrowserContext } from '@playwright/test';

test.describe('Login Page', () => {
  test('should log in successfully with valid credentials', async ({ page }) => {
    await page.goto('http://52.28.100.129:3001/auth/jwt/login');
    await page.waitForTimeout(1000);

    // Locate and fill email input
    const loginEmailInput = page.locator('[data-testid="login-email-input"] input');
    await loginEmailInput.waitFor({ state: 'visible' });
    await loginEmailInput.fill('info1@info.com');

    // Locate and fill password input
    const loginPasswordInput = page.locator('[data-testid="login-password-input"] input');
    await loginPasswordInput.waitFor({ state: 'visible' });
    await loginPasswordInput.fill('Test123456!');

    // Click the login button
    const loginButton = page.getByTestId('login-button');
    await loginButton.waitFor();
    await loginButton.click();

    await page.waitForURL('http://52.28.100.129:3001/dashboard/product');
    await expect(page).toHaveURL('http://52.28.100.129:3001/dashboard/product');
  });


  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('http://52.28.100.129:3001/auth/jwt/login');
    await page.waitForTimeout(1000);
    // Locate and fill email input
    const loginEmailInput = page.locator('[data-testid="login-email-input"] input');
    await loginEmailInput.waitFor({ state: 'visible' });
    await loginEmailInput.fill('invalid_email');

    // Locate and fill password input
    const loginPasswordInput = page.locator('[data-testid="login-password-input"] input');
    await loginPasswordInput.waitFor({ state: 'visible' });
    await loginPasswordInput.fill('invalid_password');

    // Click the login button
    const loginButton = page.getByTestId('login-button');
    await loginButton.waitFor();
    await loginButton.click();
    const errorMessage = await page.locator('text=Email must be a valid email address');
    await expect(errorMessage).toBeVisible();
    await expect(page).toHaveURL('http://52.28.100.129:3001/auth/jwt/login');
  });

  test('should show error for empty username and password', async ({ page }) => {
    await page.goto('http://52.28.100.129:3001/auth/jwt/login');
    await page.waitForTimeout(1000);
    const loginButton = page.getByTestId('login-button');
    await loginButton.waitFor();
    await loginButton.click();
    const errorMessage = await page.locator('text=Email is required');
    const errorMessage2 = await page.locator('text=Password is required');
    await expect(errorMessage2).toBeVisible();
    await expect(page).toHaveURL('http://52.28.100.129:3001/auth/jwt/login');
  });
});