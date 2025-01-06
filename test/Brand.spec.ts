import { test, expect, Page } from '@playwright/test';
let page: Page;

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();
  await page.goto('http://52.28.100.129:3001/auth/jwt/login?returnTo=%2Fdashboard');
  await page.waitForTimeout(1000);
  await page.getByLabel('Email address').click();
  await page.getByLabel('Email address').fill('info1@info.com');
  await page.waitForTimeout(1000);
  await page.getByLabel('Password').click();
  await page.getByLabel('Password').fill('Test123456!');
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Login' }).click();
});

test.afterAll(async () => {
  await page.context().close();
});


test('Brand Page test', async ({ }) => {
  test.setTimeout(5000);
  function generateRandomCategoriesName() {
    const categories = [
      [
        "Smart Tech",
        "Fashion & Wear",
        "Digital Reads",
        "Workspace Essentials",
        "Gourmet Gadgets",
        "Adventure Gear",
        "Beauty & Wellness",
        "Toys & Games",
        "Living Spaces",
        "Professional Tools",
        "Cleaning Essentials",
        "Luxury Pieces",
        "Auto Add-ons",
        "Green Thumb Tools",
        "Furry Friends Supplies",
        "Stylish Add-ons",
        "Wellness Boosters",
        "Active Shoes",
        "Quick Bites",
        "Outdoor Essentials",
        "Luggage & Travel",
        "Creative Supplies",
        "Streaming Media",
        "Workout Gear"
      ]
    ];
    const randomIndex = Math.floor(Math.random() * categories[0].length);
    const randomSuffix = Math.floor(Math.random() * 1000) + 1;
    return `${categories[0][randomIndex]}-${randomSuffix}`;
  }
  const generatedCategoriesName = generateRandomCategoriesName();
  await page.getByRole('button', { name: 'Merk' }).click();
  await page.waitForTimeout(1000);
  // await page.getByRole('button', { name: 'Lijst' }).click();
  // await page.waitForTimeout(1000);
  await page.locator('a:has-text("Nieuw Merk")').click();
  await page.waitForTimeout(1000);
  await page.getByLabel('Naam').click();
  await page.getByLabel('Naam').fill(generatedCategoriesName);
  await page.waitForTimeout(1000);
  await page.getByLabel('Beschrijving').click();
  await page.getByLabel('Beschrijving').fill('Good Product to Purchase');
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Selecteer' }).click();
  await page.locator('div:nth-child(6) > .MuiPaper-root > span > .PrivateSwitchBase-input').check();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Selecteer', exact: true }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Nieuwe Merk' }).click();
  await page.waitForTimeout(1000);
  await page.getByPlaceholder('Zoeken...').click();
  await page.getByPlaceholder('Zoeken...').fill("Fitness Equipment");
  await page.waitForTimeout(1000);
  // await page.getByRole('row', { name: 'Arc' }).getByRole('button').click();
  // await page.waitForTimeout(1000);
  // await page.getByRole('row', { name: 'Fitness Equipment Fitness' }).getByRole('button').click();
  // await page.waitForTimeout(1000);

  await page.getByRole('menuitem', { name: 'Bewerken' }).click();
  await page.waitForTimeout(1000);
  await page.getByLabel('Beschrijving').click();
  await page.getByLabel('Beschrijving').fill(generatedCategoriesName);
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Selecteer' }).click();
  await page.waitForTimeout(1000);
  await page.getByPlaceholder('Typ hier...').click();
  await page.getByPlaceholder('Typ hier...').fill('8720604315165.jpg');
  await page.waitForTimeout(1000);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Selecteer', exact: true }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Wijzigingen opslaan' }).click();
  await page.waitForTimeout(1000);
  await page.getByPlaceholder('Zoeken...').click();
  await page.getByPlaceholder('Zoeken...').fill('Flaxine');
  await page.waitForTimeout(1000);
  await page.getByRole('row', { name: 'Flaxine' }).getByRole('button').click();
  await page.waitForTimeout(1000);

  // silme işlemi gerçekleşmiyor
  await page.getByRole('menuitem', { name: 'Verwijderen' }).click();
  await page.waitForTimeout(1000);

  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.waitForTimeout(1000);
});
