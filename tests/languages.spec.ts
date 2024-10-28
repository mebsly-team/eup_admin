import { test, expect, Page } from '@playwright/test';
let page: Page;

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();
  await page.goto('http://52.28.100.129:3001/auth/jwt/login?returnTo=%2Fdashboard');
  await page.waitForTimeout(2000);
  await page.getByLabel('Email address').click();
    await page.getByLabel('Email address').fill('info1@info.com');
  await page.waitForTimeout(2000);
  await page.getByLabel('Password').click();
  await page.getByLabel('Password').fill('Test123456!');
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Login' }).click();
});

test.afterAll(async () => {
  await page.context().close();
});
test(' Language  page test', async ({}) => {
    test.setTimeout(28000);
    await page.locator('div').filter({ hasText: /^4A$/ }).getByRole('button').first().click();
    await page.waitForTimeout(2000);
    await page.getByRole('menuitem', { name: 'English' }).click();
    await page.waitForTimeout(2000);
    await page.locator('div').filter({ hasText: /^4A$/ }).getByRole('button').first().click();
    await page.waitForTimeout(2000);
    await page.getByRole('menuitem', { name: 'Turkce' }).click();
    await page.waitForTimeout(2000);
  });