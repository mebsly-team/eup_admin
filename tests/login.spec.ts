import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test.beforeEach(async ({ page }) => {
  await page.goto('http://52.28.100.129:3001/auth/jwt/login?returnTo=%2Fdashboard');
  await page.waitForTimeout(5000);
  });
  
  test('Login with valid credentials', async ({ page }) => {
    test.setTimeout(280000);
  await page.getByLabel('Email address').click();
  await page.getByLabel('Email address').fill('test7@test.com');
  await page.waitForTimeout(2000);
  await page.getByLabel('Password').click();
  await page.getByLabel('Password').fill('Example1!');
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForTimeout(5000)
});

test('Login with invalid credentials', async ({ page }) => {
    test.setTimeout(280000);
    await page.getByLabel('Email address').click();
  await page.getByLabel('Email address').fill('test3@test.com');
  await page.waitForTimeout(2000);
  await page.getByLabel('Password').click();
  await page.getByLabel('Password').fill('Test123');
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForTimeout(5000)
})
})