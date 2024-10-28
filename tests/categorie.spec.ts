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
"Technology & Devices",
    "Apparel & Footwear",
    "Literature & Publications",
    "Home Furnishings & Decor",
    "Kitchen Essentials & Utensils",
    "Sports & Outdoor Equipment",
    "Beauty & Personal Care Items",
    "Children’s Toys & Games",
    "Living Space Furniture",
    "Office Supplies & Stationery",
    "Cleaning Supplies & Household Goods",
    "Gardening Tools & Supplies",
    "Infant Products & Accessories",
    "Pet Care Products & Accessories",
    "Grocery & Organic Items",
    "Automotive Accessories & Parts",
    "Watches & Jewelry",
    "Musical Gear & Instruments",
    "Personal Hygiene & Care Items",
    "Luggage & Travel Accessories",
    "Camping & Outdoor Gear",
    "Home Electronics & Appliances",
    "Health & Fitness Products",
    "Video Game Consoles & Accessories",
    "Lighting Fixtures & Supplies"
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
  await page.getByLabel('description').fill(generatedCategoriesName);
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
  await page.getByPlaceholder('search...').fill("handle");
  await page.waitForTimeout(2000);
  await page.getByRole('row', { name: "handle" }).getByRole('button').click();
  await page.waitForTimeout(2000);
  await page.getByRole('menuitem', { name: 'Bewerken' }).click();
  await page.waitForTimeout(2000);
  await page.getByLabel('description').click();
  await page.getByLabel('description').fill(generatedCategoriesName);
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.waitForTimeout(2000);
  await page.getByPlaceholder('search...').click();
  await page.getByPlaceholder('search...').fill("Books");
  await page.waitForTimeout(2000);
  const row = await page.getByRole('row', { name: "Books" });
  const button = await row.getByRole('button').first(); 
  await button.click();
  await page.waitForTimeout(2000);
  await page.getByRole('menuitem', { name: 'Verwijderen' }).click();
  await page.waitForTimeout(2000);
  try {
    await page.getByRole('button', { name: 'Verwijderen' }).click();
  } catch (error) {
    console.log('Error caught: ', error);
  }
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.waitForTimeout(2000);
});