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
  await page.goto('http://52.28.100.129:3001/auth/jwt/login?returnTo=%2Fdashboard%2Fuser%2Faccount');
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
  await page.waitForURL('**/dashboard/user/account');
  console.log('Login successful!');
});

test.afterAll(async () => {
  await page.context().close();
});


test('Settings test', async () => {
  test.setTimeout(280000);
  await page.getByRole('button', { name: 'A', exact: true }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('menuitem', { name: 'Settings' }).click();
  await page.waitForTimeout(2000);
  await page.getByLabel('Phone Number').click();
  await page.getByLabel('Phone Number').fill('05555555555');
  await page.waitForTimeout(2000);
  await page.getByLabel('Address', { exact: true }).click();
  await page.getByLabel('Address', { exact: true }).fill('123');
  await page.waitForTimeout(2000);
  await page.getByPlaceholder('Choose a country').click();
  await page.getByRole('option', { name: 'Turkey (TR) +' }).click();
  await page.waitForTimeout(2000);
  await page.getByLabel('State/Region').click();
  await page.getByLabel('State/Region').fill('asd');
  await page.waitForTimeout(2000);
  await page.getByLabel('City').click();
  await page.getByLabel('City').fill('istanbul');
  await page.waitForTimeout(2000);
  await page.getByLabel('Zip/Code').click();
  await page.getByLabel('Zip/Code').fill('34000');
  await page.waitForTimeout(2000);
  await page.getByLabel('About').click();
  await page.getByLabel('About').fill('asd');
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.waitForTimeout(2000);


  await page.getByRole('tab', { name: 'Billing' }).click();
  await page.waitForTimeout(2000);
  await page.getByText('basicFree').click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Jayvion Simon' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Deja Brady 18605 Thompson' }).click();
  await page.waitForTimeout(2000);


  await page.getByRole('tab', { name: 'Notifications' }).click();
  await page.getByLabel('Email me when someone answers').check();
  await page.getByLabel('Email me hen someone follows').check();
  await page.getByLabel('News and announcements').check();
  await page.getByLabel('Weekly product updates').uncheck();
  await page.getByLabel('Weekly blog digest').check();
  await page.getByRole('button', { name: 'Save Changes' }).click();

  await page.getByRole('tab', { name: 'Social links' }).click();
  await page.getByRole('tab', { name: 'Security' }).click();
});