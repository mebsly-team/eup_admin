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
  function generateRandomCategoriesName() {
    const categories = [
      [
        "Smart Devices",
        "Apparel",
        "E-books",
        "Office",
        "Kitchen Appliances",
        "Outdoor",
        "Cosmetics",
        "Kids' Toys",
        "Home Decor",
        "Office",
        "Cleaning Products",
        "Jewelry",
        "Automotive Accessories",
        "Garden Equipment",
        "Pet Care Products",
        "Accessories",
        "Health Supplements",
        "Sports Footwear",
        "Snacks",
        "Camping Gear",
        "Travel Bags",
        "Craft",
        "Digital Content",
        "Fitness Equipment"
    ]
    ];
    const randomIndex = Math.floor(Math.random() * categories[0].length);
    return categories[0][randomIndex];
}
const generatedCategoriesName = generateRandomCategoriesName();
  await page.getByRole('button', { name: 'Merk' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Lijst' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('link', { name: 'Nieuw Merk' }).click();
  await page.waitForTimeout(2000);
  await page.getByLabel('Naam').click();
  await page.getByLabel('Naam').fill(generatedCategoriesName);
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
  await page.getByPlaceholder('Zoeken...').click();
  await page.getByPlaceholder('Zoeken...').fill("Fitness Equipment");
  await page.waitForTimeout(2000);
  // await page.getByRole('row', { name: 'Arc' }).getByRole('button').click();
  // await page.waitForTimeout(2000);
  const rows = await page.getByRole('row').all();
  const randomIndex = Math.floor(Math.random() * rows.length);
  await rows[randomIndex].getByRole('button').click();
  await page.waitForTimeout(2000);

  await page.getByRole('menuitem', { name: 'Bewerken' }).click();
  await page.waitForTimeout(2000);
  await page.getByLabel('Beschrijving').click();
  await page.getByLabel('Beschrijving').fill(generatedCategoriesName);
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Selecteer' }).click();
  await page.waitForTimeout(2000);
  await page.getByPlaceholder('Typ hier...').click();
  await page.getByPlaceholder('Typ hier...').fill('8720604315165.jpg');
  await page.waitForTimeout(2000);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Selecteer', exact: true }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Wijzigingen opslaan' }).click();
  await page.waitForTimeout(2000);
  await page.getByPlaceholder('Zoeken...').click();
  await page.getByPlaceholder('Zoeken...').fill('Flaxine');
  await page.waitForTimeout(2000);
  await page.getByRole('row', { name: 'Flaxine' }).getByRole('button').click();
  await page.waitForTimeout(2000);
  await page.getByRole('menuitem', { name: 'Verwijderen' }).click();
  await page.waitForTimeout(2000);

  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.waitForTimeout(2000);
});
