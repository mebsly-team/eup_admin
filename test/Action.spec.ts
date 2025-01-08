import { test, expect, Page, BrowserContext } from '@playwright/test';

let page: Page;
let context: BrowserContext;

// Helper function to generate a random value
function getRandomValue(min: number, max: number, decimals: number): string {
  return (Math.random() * (max - min) + min).toFixed(decimals);
}

test.beforeAll(async ({ browser }) => {
  test.setTimeout(10000);
  context = await browser.newContext();
  page = await context.newPage();

  console.log('Navigating to login page...');
  await page.goto('http://52.28.100.129:3001/auth/jwt/login?returnTo=%2Fdashboard%2Fcampaign');
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
  await page.waitForURL('**/dashboard/campaign');
  console.log('Login successful!');
});

test.afterAll(async () => {
  await context.close();
});

test('Action Page test', async () => {
  // Navigate to actions
  const newCampaignButton = page.getByTestId('new-campaign-button');
  await newCampaignButton.waitFor();
  await newCampaignButton.click();

  // Generate a unique campaign name (e.g., using the current timestamp)
  const uniqueCampaignName = `Perfex Toiletpapier ${Date.now()}`;

  // Fill out the form with the unique campaign name
  const newCampaignNameInput = page.locator('[data-testid="campaign-name-input"] input');
  await newCampaignNameInput.waitFor();
  await newCampaignNameInput.fill(uniqueCampaignName);

  const newCampaignDescriptionInput = page.locator('[data-testid="campaign-description-input"] input');
  await newCampaignDescriptionInput.waitFor();
  await newCampaignDescriptionInput.fill('24 rollen 3 lagen');

  const percentageValue = getRandomValue(1, 100, 0);
  const newCampaignPercentageInput = page.locator('[data-testid="campaign-discount_percentage-input"] input');
  await newCampaignPercentageInput.waitFor();
  await newCampaignPercentageInput.fill(percentageValue);

  // Handle file upload
  await page.getByRole('button', { name: 'Uploaden' }).click();
  const fileSearchInput = page.getByPlaceholder('Typ hier...');
  await fileSearchInput.fill('domestos-logo');
  const switchInput = page.locator('div:nth-child(3) > .MuiPaper-root > span > .PrivateSwitchBase-input');
  await switchInput.check();
  await page.getByRole('button', { name: 'Selecteer', exact: true }).click();

  await page.getByRole('button', { name: 'Nieuwe Actie' }).click();

  // Verify success
  // const successMessage = page.locator('text=Succesvol gecreëerd');
  // await expect(successMessage).toBeVisible({ timeout: 5000 });

  await page.waitForURL('http://52.28.100.129:3001/dashboard/campaign');
  await expect(page).toHaveURL('http://52.28.100.129:3001/dashboard/campaign');
});

