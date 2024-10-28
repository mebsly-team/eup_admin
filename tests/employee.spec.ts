
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


test('employee page test', async () => {
    test.setTimeout(280000);
  await page.getByRole('button', { name: 'Gebruiker' }).click();
  await page.getByRole('button', { name: 'Creëren' }).click();
  await page.waitForTimeout(2000);
  await page.getByLabel('E-mail').click();
  await page.waitForTimeout(2000);

  function generateRandomEmail(count: number) {
    const domains = ["example.com", "test.com", "demo.com"]; 
    const emails = [];
  
    for (let i = 0; i < count; i++) {
      const randomName = `user${Math.floor(Math.random() * 1000)}`;
      const randomDomain = domains[Math.floor(Math.random() * domains.length)]; 
      emails.push(`${randomName}@${randomDomain}`); 
    }
  
    return emails;
  }
  const randomEmails = generateRandomEmail(1);
  
  await page.getByLabel('E-mail').fill(randomEmails[0]);
  await page.waitForTimeout(2000);
  await page.getByLabel('Naam', { exact: true }).click();
  await page.getByLabel('Naam', { exact: true }).fill('a');
  await page.waitForTimeout(2000);
  await page.getByLabel('Achternaam').click();
  await page.getByLabel('Achternaam').fill('b');
  await page.waitForTimeout(2000);
  await page.getByLabel('Wachtwoord').click();
  await page.getByLabel('Wachtwoord').fill('123');
  await page.waitForTimeout(2000);
  await page.getByLabel('Telefoon').click();
  await page.getByLabel('Telefoon').fill('05555555555');
  await page.waitForTimeout(2000);
  await page.getByLabel('Notities').click();
  await page.getByLabel('Notities').fill('newUser');
  await page.waitForTimeout(2000);
  await page.getByLabel('Actief').uncheck();
  await page.getByLabel('Actief').check();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Nieuwe Gebruiker' }).click();
  await page.waitForTimeout(2000);
  const checkbox = page
  .getByRole('row', { name: randomEmails[0] })
  .locator('input[name="is_active"]');

if (await checkbox.isChecked()) {
  await checkbox.click();
} 
  await page.waitForTimeout(2000);
  await page.getByRole('tab', { name: 'Actief', exact: true }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('tab', { name: 'Inactief' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('checkbox').nth(1).check();
  await page.waitForTimeout(2000);
  await page.getByRole('row', { name: randomEmails[0] }).getByRole('button').click();
  await page.waitForTimeout(2000);
  await page.getByRole('menuitem', { name: 'Bewerken' }).click();
  await page.waitForTimeout(2000);
  await page.getByLabel('Telefoon', { exact: true }).click();
  await page.getByLabel('Telefoon', { exact: true }).fill('05551111111');
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Opslaan' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('row', { name: randomEmails[0] }).getByRole('button').click();
  await page.getByRole('menuitem', { name: 'Verwijderen' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Verwijderen' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('row', { name: randomEmails[0] }).getByRole('checkbox').first().check();
  await page.getByLabel('Verwijderen').click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Verwijderen' }).click();
  await page.waitForTimeout(2000);
});