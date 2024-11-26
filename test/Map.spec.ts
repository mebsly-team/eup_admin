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

test('Map Page test', async ({}) => {
    test.setTimeout(300000);

    await page.getByRole('button', { name: 'Map' }).click();
  // await page.getByRole('button', { name: 'Lijst' }).click();
  await page.waitForTimeout(3000);
  await page.getByLabel('Zoom out').click();
  await page.waitForTimeout(3000);
  await page.getByLabel('Zoom in').click();
  await page.waitForTimeout(2000);
  await page.locator('.MuiContainer-root > div:nth-child(2) > div > div:nth-child(2)').first().click();
  await page.waitForTimeout(2000);
  await page.locator('div:nth-child(2) > div > div:nth-child(3)').first().click();
  await page.waitForTimeout(2000);
  await page.locator('div:nth-child(2) > div > div:nth-child(4)').first().click();
  await page.waitForTimeout(2000);
  await page.getByText('Alle').click();
  await page.waitForTimeout(2000);
  await page.locator('.leaflet-marker-icon').nth(3).click();
  await page.waitForTimeout(2000);
  await page.getByLabel('Close popup').click();
  await page.waitForTimeout(2000);
});
