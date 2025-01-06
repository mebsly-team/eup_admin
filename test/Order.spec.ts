import { ElementHandle } from 'playwright';
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
  await page.goto('http://52.28.100.129:3001/auth/jwt/login?returnTo=%2Fdashboard%2Forder');
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
  await page.waitForURL('**/dashboard/order');
  console.log('Login successful!');
});

test.afterAll(async () => {
  await page.context().close();
});

test('Order test', async () => {
  test.setTimeout(280000);
  // await page.locator('div').filter({ hasText: /^4A$/ }).getByRole('button').first().click();
  // await page.getByRole('menuitem', { name: 'English' }).click();
  async function scrollElementIntoView(element: ElementHandle) {
    await element.scrollIntoViewIfNeeded();
  }
  await page.getByRole('button', { name: 'Bestelling' }).scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Bestelling' }).click();
  await page.waitForTimeout(3000);
  // await page.getByRole('button', { name: 'Lijst' }).click();
  // await page.waitForTimeout(2000);
  // await page.getByRole('tab', { name: 'Order'}).click();
  // await page.waitForTimeout(3000);
  // await page.getByRole('button', { name: 'Clear' }).click();
  // await page.waitForTimeout(2000);
  // const analyticsButton = await page.getByRole('button', { name: 'analytics' });
  // await scrollElementIntoView(analyticsButton);
  // await analyticsButton.click();
  // await page.waitForTimeout(2000);
  // const orderButton = await page.getByRole('button', { name: 'order' });
  // await scrollElementIntoView(orderButton);
  // await orderButton.click();
  // await page.waitForTimeout(2000);
  // const listButton = await page.getByRole('button', { name: 'list' });
  // await scrollElementIntoView(listButton);
  // await listButton.click();
  // await page.waitForTimeout(2000);
  function generateRandomStartDate() {
    const startDate = new Date(2024, 0, 1).getTime();
    const endDate = new Date(2024, 1, 29).getTime();
    const randomTimestamp = Math.floor(Math.random() * (endDate - startDate)) + startDate;
    const randomDate = new Date(randomTimestamp);
    const month = String(randomDate.getMonth() + 1).padStart(2, '0');
    const day = String(randomDate.getDate()).padStart(2, '0');
    const year = randomDate.getFullYear();

    return `${month}/${day}/${year}`;
  }
  await page.getByLabel('Begindatum').click();

  await page.waitForTimeout(2000);
  await page.getByLabel('Begindatum').fill(generateRandomStartDate());

  await page.waitForTimeout(3000);
  const currentDate = new Date();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
  const currentDay = String(currentDate.getDate()).padStart(2, '0');
  const currentYear = currentDate.getFullYear();
  const formattedCurrentDate = `${currentMonth}/${currentDay}/${currentYear}`;

  await page.getByLabel('Einddatum').click();

  await page.waitForTimeout(2000);
  await page.getByLabel('Einddatum').fill(formattedCurrentDate);
  await page.waitForTimeout(3000);
  await page.getByLabel('rows per page').click();
  await page.waitForTimeout(2000);
  await page.getByRole('option', { name: '100' }).click();
  await page.waitForTimeout(2000);
  await page.getByPlaceholder('Zoeken...').click();
  await page.waitForTimeout(2000);
  await page.getByPlaceholder('Zoeken...').fill('243f5093@anonymous.com');
  await page.waitForTimeout(2000);

  await page.getByRole('row', { name: '30 243f5093@anonymous.com' }).getByRole('checkbox').check();
  await page.waitForTimeout(2000);
  await page.getByRole('row', { name: '30 243f5093@anonymous.com' }).getByRole('button').first().click();
  await page.waitForTimeout(2000);
  await page.getByRole('row', { name: '30 243f5093@anonymous.com' }).getByRole('button').nth(1).click();
  await page.waitForTimeout(2000);
  await page.getByRole('menuitem', { name: 'Bekijk' }).click();
  await page.waitForTimeout(2000);
  await page.locator('.MuiCardHeader-action > .MuiButtonBase-root').first().click();
  await page.waitForTimeout(2000);
  await page.getByRole('spinbutton').first().click();
  await page.waitForTimeout(2000);
  await page.getByRole('spinbutton').first().fill('12');
  await page.waitForTimeout(2000);
  await page.getByRole('spinbutton').first().click();
  await page.waitForTimeout(2000);
  await page.getByRole('spinbutton').first().fill('4.9');
  await page.waitForTimeout(2000);
  await page.getByRole('spinbutton').nth(1).click();
  await page.waitForTimeout(2000);
  await page.getByRole('spinbutton').nth(1).fill('0.0');
  await page.waitForTimeout(2000);
  await page.getByRole('spinbutton').nth(2).click();
  await page.waitForTimeout(2000);
  await page.getByRole('spinbutton').nth(2).fill('0.004');
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Opslaan' }).click();
  await page.waitForTimeout(2000);
  await page.locator('div:nth-child(4) > .MuiCardHeader-action > .MuiButtonBase-root').click();
  await page.waitForTimeout(2000);
  await page.locator('div:nth-child(4) > .MuiCardHeader-action > .MuiButtonBase-root').click();
  await page.waitForTimeout(2000);
  await page.locator('div:nth-child(7) > .MuiCardHeader-action > .MuiButtonBase-root').click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Opslaan' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('main').getByRole('link').first().click();
  await page.waitForTimeout(2000);

  // await page.getByRole('row', { name: '3b1e1254@anonymous.com' }).getByRole('button').first().click();
  // await page.waitForTimeout(2000);
  // await page.getByRole('row', { name: '3b1e1254@anonymous.com' }).getByRole('button').nth(1).click();
  // await page.waitForTimeout(2000);
  // await page.getByRole('menuitem', { name: 'Bekijk' }).click();
  // await page.waitForTimeout(2000);
  // await page.getByRole('button', { name: 'completed' }).click();
  // await page.waitForTimeout(2000);
  // await page.getByRole('menuitem', { name: 'Completed' }).click();
  // await page.waitForTimeout(2000);
  // await page.getByRole('main').getByRole('link').click();
  // await page.waitForTimeout(2000);
  // await page.getByRole('tab', { name: 'Pending' }).click();
  // await page.waitForTimeout(2000);
  // await page.getByRole('tab', { name: 'Completed' }).click();
  // await page.waitForTimeout(2000);
  // await page.getByRole('tab', { name: 'Cancelled' }).click();
  // await page.waitForTimeout(2000);
  // await page.getByRole('tab', { name: 'Refunded' }).click();
  // await page.waitForTimeout(2000);



});