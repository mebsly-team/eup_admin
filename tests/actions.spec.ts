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


test('Action Page test', async ({}) => {
  test.setTimeout(280000);
await page.getByRole('button', { name: 'acties' }).click();
await page.waitForTimeout(2000);
await page.getByRole('button', { name: 'Lijst' }).click();
await page.waitForTimeout(2000);
await page.getByRole('link', { name: 'Nieuwe Actie' }).click();
await page.waitForTimeout(2000);
await page.getByLabel('Naam').click();
await page.getByLabel('Naam').fill('Perfex Toiletpapier');
await page.waitForTimeout(2000);
await page.getByLabel('Beschrijving').click();
await page.getByLabel('Beschrijving').fill('24 rollen 3 lagen');
function getRandomValue(min, max, decimals) {
    const str = (Math.random() * (max - min) + min).toFixed(decimals);
    return str;
  }
  const percentageValue = getRandomValue(1, 100, 0);
await page.getByLabel('Kortingspercentage').click();
await page.getByLabel('Kortingspercentage').fill(percentageValue);
await page.waitForTimeout(2000);
await page.getByRole('button', { name: 'Uploaden' }).click();
await page.waitForTimeout(2000);
await page.getByPlaceholder('Typ hier...').click();
await page.getByPlaceholder('Typ hier...').fill('Perfex Toiletpapier');
await page.getByPlaceholder('Typ hier...').clear();
await page.waitForTimeout(2000);
await page.locator('div:nth-child(3) > .MuiPaper-root > span > .PrivateSwitchBase-input').check();
await page.waitForTimeout(2000);
await page.getByRole('button', { name: 'Selecteer', exact: true }).click();
await page.waitForTimeout(2000);
});