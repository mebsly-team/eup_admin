import { test, expect } from '@playwright/test';
let page;

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();
  await page.goto('http://52.28.100.129:3001/auth/jwt/login?returnTo=%2Fdashboard');
  await page.waitForTimeout(2000);
  await page.getByLabel('Email address').click();
  await page.getByLabel('Email address').fill('test7@test.com');
  await page.waitForTimeout(2000);
  await page.getByLabel('Password').click();
  await page.getByLabel('Password').fill('Example1!');
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Login' }).click();
});

test.afterAll(async () => {
  await page.context().close();
});

test(' Categories page test', async ({}) => {
  test.setTimeout(280000);
  await page.getByRole('button', { name: 'Categorie' }).click();
  await page.getByRole('button', { name: 'Lijst' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('link', { name: 'Nieuw Categorie' }).click();
  await page.waitForTimeout(2000);
  await page.locator('div').filter({ hasText: /^4A$/ }).getByRole('button').first().click();
  await page.getByRole('menuitem', { name: 'English' }).click();
  await page.waitForTimeout(2000);
  function generateRandomCategoriesName() {
    const categories = [
        "Electronics",
        "Clothing",
        "Books",
        "Home Decor",
        "Kitchenware",
        "Sports Gear",
        "Beauty Products",
        "Toys",
        "Furniture",
        "Stationery",
        "Detergents"
    ];
    const randomIndex = Math.floor(Math.random() * categories.length);
    return categories[randomIndex];
}
const generatedCategoriesName = generateRandomCategoriesName();
await page.getByLabel('Naam').click();
await page.getByLabel('Naam').fill(generatedCategoriesName);
  await page.waitForTimeout(2000);
  await page.getByLabel('Icon').click();
  await page.getByLabel('Icon').fill('house2');
  await page.waitForTimeout(2000);
  await page.getByLabel('description').click();
  await page.getByLabel('description').fill('Handle with care');
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Uploaden' }).click();
  await page.waitForTimeout(2000);
  await page.getByPlaceholder('Typ hier...').click();
  await page.getByPlaceholder('Typ hier...').fill('domestos-logo.jpeg');
  await page.waitForTimeout(2000);
  await page.getByRole('checkbox').first().check();
  await page.getByRole('button', { name: 'Selecteer', exact: true }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'create_category' }).click()

  await page.waitForTimeout(2000);
  await page.getByPlaceholder('search...').click();
  await page.getByPlaceholder('search...').fill(generatedCategoriesName);
  await page.waitForTimeout(2000);
  await page.getByRole('row', { name: generatedCategoriesName }).getByRole('button').click();
  await page.waitForTimeout(2000);
  await page.getByRole('menuitem', { name: 'Bewerken' }).click();
  await page.waitForTimeout(2000);
  await page.getByLabel('description').click();
  await page.getByLabel('description').fill('Handle with care');
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.waitForTimeout(2000);
  await page.getByPlaceholder('search...').click();
  await page.getByPlaceholder('search...').fill(generatedCategoriesName);
  await page.waitForTimeout(2000);
  await page.getByRole('row', { name: generatedCategoriesName }).getByRole('button').click();
  await page.waitForTimeout(2000);
  await page.getByRole('menuitem', { name: 'Verwijderen' }).click();
  await page.getByRole('button', { name: 'Verwijderen' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.waitForTimeout(2000);
});