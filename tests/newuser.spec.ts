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

test(' New User page test', async ({}) => {
test.setTimeout(280000);
await page.getByRole('button', { name: 'Gebruiker' }).click();
await page.getByRole('button', { name: 'Lijst' }).click();
await page.getByRole('link', { name: 'Nieuw Gebruiker' }).click();
await page.waitForTimeout(2000);
function generateEmail() {
    const domains = ['example.com', 'test.com', 'email.com'];
    return `user_${Math.floor(Math.random() * 1000)}@${domains[Math.floor(Math.random() * domains.length)]}`;
  }
  
  const email = generateEmail();
await page.getByLabel('E-mail').click();
await page.getByLabel('E-mail').fill(email);
await page.waitForTimeout(2000);

function generateName() {
    const names = ['John Doe', 'Jane Smith', 'Harsha', 'Yash'];
    return names[Math.floor(Math.random() * names.length)];
  }
  
  const Naam = generateName();
await page.getByLabel('Naam', { exact: true }).click();
await page.getByLabel('Naam', { exact: true }).fill(Naam);
await page.waitForTimeout(2000);

await page.getByLabel('Achternaam').click();
await page.getByLabel('Achternaam').fill('user');
await page.waitForTimeout(2000);

await page.getByLabel('Wachtwoord').click();
await page.getByLabel('Wachtwoord').fill('Example1!');
await page.waitForTimeout(2000);

function generatePhoneNumber() {
  return `0${Math.floor(100000000 + Math.random() * 900000000)}`;
}

const telefoon = generatePhoneNumber();
await page.getByLabel('Telefoon').click();
await page.getByLabel('Telefoon').fill(telefoon);
await page.waitForTimeout(2000);

await page.getByLabel('Notities').click();
await page.getByLabel('Notities').fill('abc');
await page.waitForTimeout(2000);

await page.getByRole('button', { name: 'Nieuwe Gebruiker' }).click();
await page.waitForTimeout(2000);
await page.getByRole('row', { name: 'info1@info.com' }).getByRole('button').click();
await page.waitForTimeout(2000);
await page.getByRole('menuitem', { name: 'Bewerken' }).click();
await page.waitForTimeout(2000);
await page.getByLabel('Notities').click();
await page.getByLabel('Notities').fill('admin');
await page.waitForTimeout(2000);
await page.getByRole('button', { name: 'Opslaan' }).click();
await page.waitForTimeout(2000);
})