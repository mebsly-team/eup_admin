import { test, expect } from '@playwright/test';
let page;

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

test('Invoices test', async ({}) => {
    test.setTimeout(280000);    
await page.locator('div').filter({ hasText: /^4A$/ }).getByRole('button').first().click();
await page.getByRole('menuitem', { name: 'English' }).click();
await page.waitForTimeout(2000);
await page.getByRole('button', { name: 'invoice' }).click();
await page.waitForTimeout(2000);
await page.getByRole('button', { name: 'list' }).click();
await page.waitForTimeout(2000);
await page.getByRole('link', { name: 'New Invoice' }).click();
await page.waitForTimeout(2000);
await page.locator('div:nth-child(3) > .MuiStack-root > .MuiButtonBase-root').first().click();
await page.getByRole('button', { name: 'Deja Brady Hegmann, Kreiger' }).click();
await page.waitForTimeout(2000);
await page.getByLabel('Status').click();
await page.getByRole('option', { name: 'paid' }).click();
await page.waitForTimeout(2000);

function getRandomFutureDate() {
  const currentDate = new Date();
  const futureDate = new Date();
  futureDate.setDate(currentDate.getDate() + Math.floor(Math.random() * 30) + 1);
  
  const mm = String(futureDate.getMonth() + 1).padStart(2, '0'); 
  const dd = String(futureDate.getDate()).padStart(2, '0');
  const yyyy = futureDate.getFullYear();
  
  return `${mm}/${dd}/${yyyy}`;
}
const futureDate = getRandomFutureDate();
console.log(futureDate); 
await page.getByLabel('Due date').click();
await page.waitForTimeout(2000); 
await page.getByLabel('Due date').fill(futureDate); 

await page.waitForTimeout(2000);
await page.getByLabel('Title').click();
await page.getByLabel('Title').fill('Nike Air Force 1 NDESTRUKT');
await page.waitForTimeout(2000);
await page.getByLabel('Description').click();
await page.getByLabel('Description').fill('The sun slowly set over the horizon, painting the sky in vibrant hues of orange and pink.');
await page.waitForTimeout(2000);
await page.getByLabel('Service').click();
await page.getByRole('option', { name: 'HR Manager' }).click();
await page.waitForTimeout(2000);
await page.getByPlaceholder('0', { exact: true }).click();
await page.getByPlaceholder('0', { exact: true }).fill('11');
await page.waitForTimeout(2000);
await page.getByLabel('Shipping($)').click();
await page.getByLabel('Shipping($)').fill('100');
await page.waitForTimeout(2000);
await page.getByLabel('Discount($)').click();
await page.getByLabel('Discount($)').fill('90');
await page.waitForTimeout(2000);
await page.getByLabel('Taxes(%)').click();
await page.getByLabel('Taxes(%)').fill('50');
await page.waitForTimeout(2000);
await page.getByRole('button', { name: 'Create & Send' }).click();
await page.waitForTimeout(2000);
await page.getByPlaceholder('Zoeken...').click();
await page.getByPlaceholder('Zoeken...').fill('Deja Brady');
await page.waitForTimeout(2000);
await page.getByRole('row', { name: 'D Deja Brady INV-1991 29 Feb' }).getByRole('button').click();
await page.waitForTimeout(2000);
await page.getByRole('menuitem', { name: 'Edit' }).click();
await page.waitForTimeout(2000);
await page.getByRole('button', { name: 'Update & Send' }).click();
await page.waitForTimeout(2000);
await page.getByPlaceholder('Zoeken...').click();
await page.getByPlaceholder('Zoeken...').fill('Deja Brady');
await page.waitForTimeout(2000);
await page.getByRole('row', { name: 'D Deja Brady INV-1991 29 Feb' }).getByRole('button').click();
await page.getByRole('menuitem', { name: 'View' }).click();
await page.waitForTimeout(2000);
});