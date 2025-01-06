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
  await page.goto('http://52.28.100.129:3001/auth/jwt/login?returnTo=%2Fdashboard%2Fcalendar');
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
  await page.waitForURL('**/dashboard/calendar');
  console.log('Login successful!');
});
test.afterAll(async () => {
  await page.context().close();
});

test('Calendar Page test', async () => {
  test.setTimeout(300000);

  await page.getByRole('button', { name: 'Kalender' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Month' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('menuitem', { name: 'Week' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Week' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('menuitem', { name: 'Agenda' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Agenda' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('menuitem', { name: 'Month' }).click();
  await page.waitForTimeout(2000);


  // await page.locator('div').filter({ hasText: /^19 Oct 2024$/ }).getByRole('button').nth(1).click();
  // await page.waitForTimeout(3000);
  // await page.locator('div').filter({ hasText: /^01 Nov 2024$/ }).getByRole('button').first().click();
  // await page.waitForTimeout(3000);
  await page.getByRole('button', { name: 'Today' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'New Event' }).click();
  await page.waitForTimeout(2000);
  await page.getByLabel('Title').click();
  await page.waitForTimeout(2000);
  await page.getByLabel('Title').fill('Event 1');
  await page.waitForTimeout(2000);
  await page.getByLabel('Description').click();
  await page.waitForTimeout(2000);
  await page.getByLabel('Description').fill('test event1');
  await page.waitForTimeout(2000);
  await page.getByLabel('All day').check();
  await page.waitForTimeout(2000);
  await page.locator('div').filter({ hasText: /^Begindatum$/ }).getByPlaceholder('DD/MM/YYYY hh:mm aa').click();
  await page.waitForTimeout(2000);
  await page.getByRole('gridcell', { name: '20' }).click();
  await page.waitForTimeout(2000);
  await page.locator('.MuiClock-squareMask').click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await page.waitForTimeout(2000);
  await page.locator('div').filter({ hasText: /^Einddatum$/ }).getByPlaceholder('DD/MM/YYYY hh:mm aa').click();
  await page.waitForTimeout(2000);
  await page.getByRole('gridcell', { name: '23' }).click();
  await page.waitForTimeout(2000);
  await page.locator('.MuiClock-squareMask').click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await page.waitForTimeout(2000);
  await page.locator('div:nth-child(6) > button:nth-child(3)').click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.waitForTimeout(2000);
  await page.locator('div').filter({ hasText: /^Today$/ }).getByRole('button').nth(1).click();
  await page.waitForTimeout(2000);
  await page.locator('.MuiPaper-root > div:nth-child(3) > div > button').first().click();
  await page.waitForTimeout(2000);
  await page.locator('.MuiPaper-root > div:nth-child(3) > div > button:nth-child(3)').click();
  await page.waitForTimeout(2000);
  await page.getByLabel('Begindatum').click();
  await page.waitForTimeout(2000);
  await page.getByLabel('Begindatum').fill('02-10-2023');
  await page.waitForTimeout(2000);
  await page.getByLabel('Einddatum').click();
  await page.waitForTimeout(2000);
  await page.getByLabel('Einddatum').fill('10-10-2024');
  await page.waitForTimeout(2000);
  await page.getByLabel('Reset').click();
  await page.waitForTimeout(2000);
  await page.locator('.MuiPaper-root > div:nth-child(3) > div > button').first().click();
  await page.waitForTimeout(2000);
  await page.locator('.MuiPaper-root > div:nth-child(3) > div > button:nth-child(3)').click();
  await page.waitForTimeout(2000);
  await page.getByLabel('Begindatum').click();
  await page.waitForTimeout(2000);
  await page.getByLabel('Begindatum').fill('02-10-2023');
  await page.waitForTimeout(2000);
  await page.getByLabel('Einddatum').click();
  await page.waitForTimeout(2000);
  await page.getByLabel('Einddatum').fill('10-10-2024');
  await page.waitForTimeout(2000);
  await page.locator('div').filter({ hasText: /^Filters$/ }).getByRole('button').nth(1).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.waitForTimeout(2000);
});