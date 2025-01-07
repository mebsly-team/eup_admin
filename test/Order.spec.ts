import { test, expect, Page, ElementHandle } from '@playwright/test';


let page: Page;

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();
  await page.goto('http://52.28.100.129:3001/auth/jwt/login?returnTo=%2Fdashboard');
  await page.getByLabel('Email address').waitFor({ state: 'visible' });
  await page.getByLabel('Email address').fill('info1@info.com');
  await page.getByLabel('Password').waitFor({ state: 'visible' });
  await page.getByLabel('Password').fill('Test123456!');
  await page.getByRole('button', { name: 'Login' }).click();
});

test.afterAll(async () => {
  await page.context().close();
});

test('Order test', async () => {
    test.setTimeout(280000);
    async function scrollElementIntoView(element: ElementHandle) {
        await element.scrollIntoViewIfNeeded();
    }
    await page.getByRole('button', { name: 'Bestelling' }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Bestelling' }).click();
    const currentDate = new Date();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const currentDay = String(currentDate.getDate()).padStart(2, '0');
    const currentYear = currentDate.getFullYear();
    const formattedCurrentDate = `${currentMonth}/${currentDay}/${currentYear}`;

    await page.getByLabel('Begindatum').waitFor({ state: 'visible' });
    await page.getByLabel('Begindatum').click();
    await page.getByLabel('Begindatum').fill(generateRandomStartDate());

    await page.getByLabel('Einddatum').waitFor({ state: 'visible' });
    await page.getByLabel('Einddatum').click();
    await page.getByLabel('Einddatum').fill(formattedCurrentDate);

    await page.getByLabel('rows per page').waitFor({ state: 'visible' });
    await page.getByLabel('rows per page').click();
    await page.getByRole('option', { name: '100' }).waitFor({ state: 'visible' });
    await page.getByRole('option', { name: '100' }).click();

    await page.getByPlaceholder('Zoeken...').waitFor({ state: 'visible' });
    await page.getByPlaceholder('Zoeken...').click();
    await page.getByPlaceholder('Zoeken...').fill('243f5093@anonymous.com');

    await page.getByRole('row', { name: '30 243f5093@anonymous.com' }).getByRole('checkbox').waitFor({ state: 'visible' });
    await page.getByRole('row', { name: '30 243f5093@anonymous.com' }).getByRole('checkbox').check();
    await page.getByRole('row', { name: '30 243f5093@anonymous.com' }).getByRole('button').first().waitFor({ state: 'visible' });
    await page.getByRole('row', { name: '30 243f5093@anonymous.com' }).getByRole('button').first().click();
    await page.getByRole('row', { name: '30 243f5093@anonymous.com' }).getByRole('button').nth(1).waitFor({ state: 'visible' });
    await page.getByRole('row', { name: '30 243f5093@anonymous.com' }).getByRole('button').nth(1).click();
    await page.getByRole('menuitem', { name: 'Bekijk' }).waitFor({ state: 'visible' });
    await page.getByRole('menuitem', { name: 'Bekijk' }).click();
    await page.waitForTimeout(2000);
    await page.locator('.MuiCardHeader-action > .MuiButtonBase-root').first().waitFor({ state: 'visible' });
    await page.locator('.MuiCardHeader-action > .MuiButtonBase-root').first().click();
    await page.getByRole('spinbutton').first().waitFor({ state: 'visible' });
    await page.getByRole('spinbutton').first().click();
    await page.getByRole('spinbutton').first().fill('12');
    await page.getByRole('spinbutton').first().click();
    await page.getByRole('spinbutton').first().fill('4.9');
    await page.getByRole('spinbutton').nth(1).waitFor({ state: 'visible' });
    await page.getByRole('spinbutton').nth(1).click();
    await page.getByRole('spinbutton').nth(1).fill('0.0');
    await page.getByRole('spinbutton').nth(2).waitFor({ state: 'visible' });
    await page.getByRole('spinbutton').nth(2).click();
    await page.getByRole('spinbutton').nth(2).fill('0.004');
    await page.getByRole('button', { name: 'Opslaan' }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Opslaan' }).click();
    await page.locator('div:nth-child(4) > .MuiCardHeader-action > .MuiButtonBase-root').waitFor({ state: 'visible' });
    await page.locator('div:nth-child(4) > .MuiCardHeader-action > .MuiButtonBase-root').click();
    await page.locator('div:nth-child(7) > .MuiCardHeader-action > .MuiButtonBase-root').waitFor({ state: 'visible' });
    await page.locator('div:nth-child(7) > .MuiCardHeader-action > .MuiButtonBase-root').click();
    await page.getByRole('button', { name: 'Opslaan' }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Opslaan' }).click();
    await page.getByRole('main').getByRole('link').first().waitFor({ state: 'visible' });
    await page.getByRole('main').getByRole('link').first().click();
});

// Rastgele başlangıç tarihi oluşturma fonksiyonu
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
