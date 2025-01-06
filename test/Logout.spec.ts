import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://52.28.100.129:3001/auth/jwt/login?returnTo=%2Fdashboard');
    await page.waitForTimeout(5000);
  });

  test('Logout Test', async ({ page }) => {
    test.setTimeout(280000);
    await page.getByLabel('Email address').click();
    await page.getByLabel('Email address').fill('info1@info.com');
    await page.waitForTimeout(2000);
    await page.getByLabel('Password').click();
    await page.getByLabel('Password').fill('Test123456!');
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForTimeout(5000)
    await page.getByRole('button', { name: 'A', exact: true }).click();
    await page.waitForTimeout(2000);
    await page.getByRole('menuitem', { name: 'Logout' }).click();
    await page.waitForTimeout(3000);

  });
})