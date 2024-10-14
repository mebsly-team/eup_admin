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


test('Brand Page test', async ({}) => {
  test.setTimeout(280000);
  await page.getByRole('button', { name: 'Merk' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Lijst' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('link', { name: 'Nieuw Merk' }).click();
  await page.waitForTimeout(2000);
  await page.getByLabel('Naam').click();
  await page.getByLabel('Naam').fill('Flix');
  await page.waitForTimeout(2000);
  await page.getByLabel('Beschrijving').click();
  await page.getByLabel('Beschrijving').fill('Good Product to Purchase');
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Selecteer' }).click();
  await page.locator('div:nth-child(6) > .MuiPaper-root > span > .PrivateSwitchBase-input').check();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Selecteer', exact: true }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Nieuwe Merk' }).click();
  await page.waitForTimeout(2000);
  // await page.getByPlaceholder('search...').click();
  // await page.getByPlaceholder('search...').fill('detergent powder');
  // await page.waitForTimeout(2000);
  // await page.getByRole('row', { name: 'detergent powder detergent powder Handle with care' }).getByRole('button').click();
  // await page.waitForTimeout(2000);
  // await page.getByRole('menuitem', { name: 'Bewerken' }).click();
  // await page.getByRole('button', { name: 'Uploaden' }).click();
  // await page.waitForTimeout(2000);
  // await page.getByPlaceholder('Typ hier...').click();
  // await page.getByPlaceholder('Typ hier...').fill('8720604315165.jpg');
  // await page.waitForTimeout(2000);
  // await page.getByRole('checkbox').check();
  // await page.getByRole('button', { name: 'Selecteer', exact: true }).click();
  // await page.waitForTimeout(2000);
  // await page.getByRole('button', { name: 'Save Changes' }).click();
  // await page.waitForTimeout(2000);
  // await page.getByPlaceholder('search...').click();
  // await page.getByPlaceholder('search...').fill('detergent powder');
  // await page.waitForTimeout(2000);
  // await page.getByRole('row', { name: 'detergent powder detergent powder Handle with care' }).getByRole('button').click();
  // await page.waitForTimeout(2000);
  // await page.getByRole('menuitem', { name: 'Verwijderen' }).click();
  // await page.waitForTimeout(2000);
  // await page.getByRole('button', { name: 'Verwijderen' }).click();
  // await page.waitForTimeout(2000);
  // await page.getByRole('button', { name: 'Clear' }).click();
  await page.waitForTimeout(2000);
});
