import { test, expect } from '@playwright/test';

test.describe('JwtLoginView Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/auth/jwt/login?returnTo=%2Fdashboard');
  });


  test('Loading Page', async ({ page }) => {
    const title = page.locator('h4:has-text("Sign in")');
    await expect(title).toBeVisible();

    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const loginButton = page.locator('button:has-text("Login")');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();
  });

 
  test('Form Validation Error', async ({ page }) => {
    const loginButton = page.locator('button:has-text("Login")');

  
    await loginButton.click();

    const emailError = page.locator('text=Email is required');
    const passwordError = page.locator('text=Password is required');

    await expect(emailError).toBeVisible();
    await expect(passwordError).toBeVisible();
  });

  
  test('Show/hide password', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]');
  
 
    const toggleButton = page.locator('button.MuiIconButton-edgeEnd');
    await toggleButton.waitFor();

    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
  
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });


  test('Incorrect login attempt', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const loginButton = page.locator('button:has-text("Login")');

  
    await emailInput.fill('wrong@example.com');
    await passwordInput.fill('invalidpassword');
    await loginButton.click();

  });

  test('Correct login attempt', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const loginButton = page.locator('button:has-text("Login")');

  
    await emailInput.fill('info1@info.com');
    await passwordInput.fill('Test123456!'); 
    await loginButton.click();

  
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
  });
});