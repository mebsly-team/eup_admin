import { test, expect } from '@playwright/test';
import { ElementHandle } from 'playwright';
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

test('Order test', async ({}) => {
    test.setTimeout(280000);
    // await page.locator('div').filter({ hasText: /^4A$/ }).getByRole('button').first().click();
    // await page.getByRole('menuitem', { name: 'English' }).click();
    async function scrollElementIntoView(element: ElementHandle) {
        await element.scrollIntoViewIfNeeded();
    }
    await page.getByRole('button', { name: 'Bestelling' }).click();
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: 'Lijst' }).click();
    await page.waitForTimeout(2000);

    const analyticsButton = await page.getByRole('button', { name: 'analytics' });
    await scrollElementIntoView(analyticsButton);
    await analyticsButton.click();
    await page.waitForTimeout(2000);
    const orderButton = await page.getByRole('button', { name: 'order' });
    await scrollElementIntoView(orderButton);
    await orderButton.click();
    await page.waitForTimeout(2000);
    const listButton = await page.getByRole('button', { name: 'list' });
    await scrollElementIntoView(listButton);
    await listButton.click();
    await page.waitForTimeout(2000);
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
    await page.getByLabel('Start date').click();
    
    await page.waitForTimeout(2000);
    await page.getByLabel('Start date').fill(generateRandomStartDate());
    
    await page.waitForTimeout(3000);
    const currentDate = new Date();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const currentDay = String(currentDate.getDate()).padStart(2, '0');
    const currentYear = currentDate.getFullYear(); 
    const formattedCurrentDate = `${currentMonth}/${currentDay}/${currentYear}`;
    
    await page.getByLabel('End date').click();
    
    await page.waitForTimeout(2000);
    await page.getByLabel('End date').fill(formattedCurrentDate);
    
    

    await page.waitForTimeout(3000);
    
    await page.getByPlaceholder('Search customer or order').click();
    await page.waitForTimeout(2000);
    await page.getByPlaceholder('Search customer or order').fill('Selina Boyer');
    await page.waitForTimeout(2000);
    await page.getByRole('row', { name: '#60117 S Selina Boyer dawn.' }).getByRole('button').first().click();
    await page.waitForTimeout(2000);
    await page.getByRole('row', { name: '#60117 S Selina Boyer dawn.' }).getByRole('button').nth(1).click();
    await page.waitForTimeout(2000);
    await page.getByRole('menuitem', { name: 'View' }).click();
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: 'completed' }).click();
    await page.waitForTimeout(2000);
    await page.getByRole('menuitem', { name: 'Completed' }).click();
    await page.waitForTimeout(2000);
    await page.getByRole('main').getByRole('link').click();
    await page.waitForTimeout(2000);
    await page.getByRole('tab', { name: 'Pending' }).click();
    await page.waitForTimeout(2000);
    await page.getByRole('tab', { name: 'Completed' }).click();
    await page.waitForTimeout(2000);
    await page.getByRole('tab', { name: 'Cancelled' }).click();
    await page.waitForTimeout(2000);
    await page.getByRole('tab', { name: 'Refunded' }).click();
    await page.waitForTimeout(2000);

  });
