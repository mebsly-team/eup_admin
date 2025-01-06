import { test, expect, Page, BrowserContext } from '@playwright/test';

let page: Page;
let context: BrowserContext;

// Helper function to generate a random value
function getRandomValue(min: number, max: number, decimals: number): string {
  return (Math.random() * (max - min) + min).toFixed(decimals);
}

test.beforeAll(async ({ browser }) => {
  test.setTimeout(10000); // Increase timeout to 60 seconds
  context = await browser.newContext();
  page = await context.newPage();

  console.log('Navigating to login page...');
  await page.goto('http://52.28.100.129:3001/auth/jwt/login?returnTo=%2Fdashboard%2Fmap%2Flist');
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

  // Verify navigation success
  await page.waitForURL('**/dashboard/map/list');
  console.log('Login successful!');
});

test.afterAll(async () => {
  await page.context().close();
});

test('Map Page test', async () => {
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