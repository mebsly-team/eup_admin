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
    await page.goto('http://52.28.100.129:3001/auth/jwt/login?returnTo=%2Fdashboard%2Fcategory');
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
    await page.waitForURL('**/dashboard/category');
    console.log('Login successful!');
});

test.afterAll(async () => {
    await page.context().close();
});

test(' Categories page test', async () => {
    test.setTimeout(10000);
    await page.getByRole('button', { name: 'Categorie' }).click();
    await page.waitForTimeout(2000);
    // await page.getByRole('button', { name: 'Lijst' }).click();
    // await page.waitForTimeout(3000);
    await page.locator('a:has-text("Nieuw Categorie")').click();
    await page.waitForTimeout(2000);
    // await page.locator('div').filter({ hasText: /^4A$/ }).getByRole('button').first().click();
    // await page.getByRole('menuitem', { name: 'English' }).click();
    // await page.waitForTimeout(2000);
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
    await page.getByLabel('Beschrijving').click();
    await page.getByLabel('Beschrijving').fill(generatedCategoriesName);
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: 'Uploaden' }).click();
    await page.waitForTimeout(2000);
    await page.getByPlaceholder('Typ hier...').click();
    await page.getByPlaceholder('Typ hier...').fill('domestos-logo.jpeg');
    await page.waitForTimeout(2000);
    await page.getByRole('checkbox').first().check();
    await page.getByRole('button', { name: 'Selecteer', exact: true }).click();
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: 'Nieuwe Categorie' }).click()
    await page.waitForTimeout(2000);

    // await page.getByPlaceholder('Zoeken...').click();
    // await page.getByPlaceholder('Zoeken...').fill("handle");
    // await page.waitForTimeout(2000);
    // await page.getByRole('row', { name: "handle" }).getByRole('button').click();
    // await page.waitForTimeout(2000);
    // await page.getByRole('menuitem', { name: 'Bewerken' }).click();
    // await page.waitForTimeout(2000);
    // await page.getByLabel('Beschrijving').click();
    // await page.getByLabel('Beschrijving').fill(generatedCategoriesName);
    // await page.waitForTimeout(2000);
    // await page.getByRole('button', { name: 'Wijzigingen opslaan' }).click();
    // await page.waitForTimeout(2000);
    // await page.getByPlaceholder('Zoeken...').click();
    // await page.getByPlaceholder('Zoeken...').fill("Books");
    // await page.waitForTimeout(2000);
    // const row = await page.getByRole('row', { name: "Books" });
    // const button = await row.getByRole('button').first();
    // await button.click();
    // await page.waitForTimeout(2000);
    // await page.getByRole('menuitem', { name: 'Verwijderen' }).click();
    // await page.waitForTimeout(2000);
    // try {
    //   await page.getByRole('button', { name: 'Verwijderen' }).click();
    // } catch (error) {
    //   console.log('Error caught: ', error);
    // }
    // await page.waitForTimeout(2000);
    // await page.getByRole('button', { name: 'Cancel' }).click();
    // await page.waitForTimeout(2000);
    // await page.getByRole('button', { name: 'Clear' }).click();
    // await page.waitForTimeout(2000);
});