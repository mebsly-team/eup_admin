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
  await page.goto('http://52.28.100.129:3001/auth/jwt/login?returnTo=%2Fdashboard%2Fsupplier');
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
  await page.waitForURL('**/dashboard/supplier');
  console.log('Login successful!');
});

test.afterAll(async () => {
  await page.context().close();
});

test(' Supplier page test', async () => {
  test.setTimeout(10000);
  await page.getByRole('button', { name: 'Leverancier' }).click();
  // await page.getByRole('button', { name: 'Lijst' }).click();
  // await page.waitForTimeout(2000);
  await page.locator('a:has-text("Nieuw Leverancier")').click();
  await page.waitForTimeout(2000);
  // function generateRandomSupplierName() {
  //   const supplierNames = [
  //       "ABC Suppliers",
  //       "XYZ Traders",
  //       "Global Distributors",
  //       "Sunrise Enterprises",
  //       "Moonlight Importers",
  //       "Star Exporters",
  //       "Oceanic Wholesalers",
  //       "Mountain Trading Co.",
  //       "City Suppliers",
  //       "Pacific Trading"
  //   ];
  //   const randomIndex = Math.floor(Math.random() * supplierNames.length);
  //   return supplierNames[randomIndex];
  // }

  // const randomSupplierName = generateRandomSupplierName();

  function generateCompanyName() {
    return `Company_${Math.floor(Math.random() * 1000)}`;
  }
  const bedrijfsnaam = generateCompanyName();

  await page.getByLabel('Bedrijfsnaam').click();
  await page.getByLabel('Bedrijfsnaam').fill(bedrijfsnaam);
  await page.waitForTimeout(2000);

  function generateCode() {
    return `${Math.floor(Math.random() * 10000)}`;
  }

  const leverancierscode = generateCode();

  await page.getByLabel('Leverancierscode').click();
  await page.getByLabel('Leverancierscode').fill(leverancierscode);
  await page.waitForTimeout(2000);

  function generateName() {
    const names = ['John Doe', 'Jane Smith', 'Harsha', 'Yash'];
    return names[Math.floor(Math.random() * names.length)];
  }

  const eigenaarVolledigeNaam = generateName();

  await page.getByLabel('Eigenaar Volledige naam').click();
  await page.getByLabel('Eigenaar Volledige naam').fill(eigenaarVolledigeNaam);
  await page.waitForTimeout(2000);

  function generateEmail() {
    const domains = ['example.com', 'test.com', 'email.com'];
    return `user_${Math.floor(Math.random() * 1000)}@${domains[Math.floor(Math.random() * domains.length)]}`;
  }

  const email = generateEmail();
  await page.getByLabel('E-mail', { exact: true }).click();
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.waitForTimeout(2000);

  const emailExtra = generateEmail();
  await page.getByLabel('E-mail Extra').click();
  await page.getByLabel('E-mail Extra').fill(emailExtra);
  await page.waitForTimeout(2000);

  function generatePhoneNumber() {
    return `0${Math.floor(100000000 + Math.random() * 900000000)}`;
  }

  const telefoon = generatePhoneNumber();
  await page.getByLabel('Telefoon').click();
  await page.getByLabel('Telefoon').fill(telefoon);
  await page.waitForTimeout(2000);

  const mobiel = generatePhoneNumber();
  await page.getByLabel('Mobiel').click();
  await page.getByLabel('Mobiel').fill(mobiel);
  await page.waitForTimeout(2000);

  const fax = generateCode();
  await page.getByLabel('Fax').click();
  await page.getByLabel('Fax').fill(fax);
  await page.waitForTimeout(2000);

  function generateStreetAddress() {
    return `Street ${Math.floor(Math.random() * 100)}, House ${Math.floor(Math.random() * 100)}, City`;
  }

  const straatnaam = generateStreetAddress();
  await page.getByLabel('Straatnaam, huisnummer & toe.').click();
  await page.getByLabel('Straatnaam, huisnummer & toe.').fill(straatnaam);
  await page.waitForTimeout(2000);

  function generatePostalCode() {
    return `${Math.floor(10000 + Math.random() * 90000)}`;
  }

  const postcode = generatePostalCode();
  await page.getByLabel('Postcode', { exact: true }).click();
  await page.getByLabel('Postcode', { exact: true }).fill(postcode);
  await page.waitForTimeout(2000);

  function generateCity() {
    const cities = ['Amsterdam', 'Rotterdam', 'Utrecht', 'Netherland'];
    return cities[Math.floor(Math.random() * cities.length)];
  }

  const plaats = generateCity();
  await page.getByLabel('Plaats', { exact: true }).click();
  await page.getByLabel('Plaats', { exact: true }).fill(plaats);
  await page.waitForTimeout(2000);

  function generateProvince() {
    const provinces = ['North Holland', 'South Holland', 'Utrecht', 'Gelderland'];
    return provinces[Math.floor(Math.random() * provinces.length)];
  }

  const provincie = generateProvince();
  await page.getByLabel('Provincie (optioneel)').click();
  await page.getByLabel('Provincie (optioneel)').fill(provincie);
  await page.waitForTimeout(2000);

  function generateCountry() {
    const countries = ['Netherlands', 'Belgium', 'Germany', 'France'];
    return countries[Math.floor(Math.random() * countries.length)];
  }

  const land = generateCountry();
  await page.getByLabel('Land', { exact: true }).click();
  await page.getByLabel('Land', { exact: true }).fill(land);
  await page.waitForTimeout(2000);

  const contactpersoonNaam = generateName();
  await page.getByLabel('Contactpersoon Naam').click();
  await page.getByLabel('Contactpersoon Naam').fill(contactpersoonNaam);
  await page.waitForTimeout(2000);

  const contactpersoonEmail = generateEmail();
  await page.getByLabel('Contactpersoon Email').click();
  await page.getByLabel('Contactpersoon Email').fill(contactpersoonEmail);
  await page.waitForTimeout(2000);

  const contactpersoonTel = generatePhoneNumber();
  await page.getByLabel('Contactpersoon Tel').click();
  await page.getByLabel('Contactpersoon Tel').fill(contactpersoonTel);
  await page.waitForTimeout(2000);

  const contactpersoonLand = generateCountry();
  await page.getByLabel('Contactpersoon Land').click();
  await page.getByLabel('Contactpersoon Land').fill(contactpersoonLand);
  await page.waitForTimeout(2000);

  function generateDepartment() {
    const departments = ['Sales', 'Marketing', 'IT', 'HR', 'Clothes'];
    return departments[Math.floor(Math.random() * departments.length)];
  }

  const contactpersoonDepartment = generateDepartment()
  await page.getByLabel('Contactpersoon Department').click();
  await page.getByLabel('Contactpersoon Department').fill(contactpersoonDepartment);
  await page.waitForTimeout(2000);

  function generateStoreType() {
    const storeTypes = ['Retail', 'Wholesale', 'Online', 'Physical'];
    return storeTypes[Math.floor(Math.random() * storeTypes.length)];
  }
  const soortWinkel = generateStoreType();
  await page.getByLabel('SoortWinkel').click();
  await page.getByLabel('SoortWinkel').fill(soortWinkel);
  await page.waitForTimeout(2000);

  function generateClassification() {
    const classifications = ['Type A', 'Type B', 'Type C', 'Two Type'];
    return classifications[Math.floor(Math.random() * classifications.length)];
  }
  const classification = generateClassification();
  await page.getByLabel('Classification').click();
  await page.getByLabel('Classification').fill(classification);
  await page.waitForTimeout(2000);

  const contactpersoonNationaliteit = generateCountry();
  await page.getByLabel('Contactpersoon Nationaliteit').click();
  await page.getByLabel('Contactpersoon Nationaliteit').fill(contactpersoonNationaliteit);
  await page.waitForTimeout(2000);

  function generateBankAccountNumber() {
    return `${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  }
  const bankrekeningnummer = generateBankAccountNumber();
  await page.getByLabel('Bankrekeningnummer').click();
  await page.getByLabel('Bankrekeningnummer').fill(bankrekeningnummer);
  await page.waitForTimeout(2000);

  function generateIBAN() {
    return `NL${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  }
  const iban = generateIBAN();
  await page.getByLabel('IBAN').click();
  await page.getByLabel('IBAN').fill(iban);
  await page.waitForTimeout(2000);

  function generateBIC() {
    return `BIC${Math.floor(100000 + Math.random() * 900000)}`;
  }

  const bic = generateBIC();
  await page.getByLabel('BIC').click();
  await page.getByLabel('BIC').fill(bic);
  await page.waitForTimeout(2000);

  const naamRekeninghouder = generateName();
  await page.getByLabel('Naam rekeninghouder').click();
  await page.getByLabel('Naam rekeninghouder').fill(naamRekeninghouder);
  await page.waitForTimeout(2000);

  await page.getByRole('button', { name: 'Nieuwe Leverancier' }).click();
  await page.waitForTimeout(2000);

  const rekeninghouderStad = generateCity();
  await page.getByLabel('Rekeninghouder stad').click();
  await page.getByLabel('Rekeninghouder stad').fill(rekeninghouderStad);
  await page.waitForTimeout(2000);

  function generateBTW() {
    return `${Math.floor(1000 + Math.random() * 9000)}`;
  }
  const btw = generateBTW();
  await page.getByLabel('BTW').click();
  await page.getByLabel('BTW').fill(btw);
  await page.waitForTimeout(2000);

  function generateKVKNummer() {
    return `${Math.floor(1000000 + Math.random() * 9000000)}`;
  }

  const kvkNummer = generateKVKNummer();
  await page.getByLabel('KVK nummer').click();
  await page.getByLabel('KVK nummer').fill(kvkNummer);
  await page.waitForTimeout(2000);

  function generateDebiteurennummer() {
    return `${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const debiteurennummer = generateDebiteurennummer();
  await page.getByLabel('Debiteurennummer').click();
  await page.getByLabel('Debiteurennummer').fill(debiteurennummer);
  await page.waitForTimeout(2000);

  function generatePaymentTerm() {
    const terms = ['Net 30', 'Net 60', 'Net 90', 'Online'];
    return terms[Math.floor(Math.random() * terms.length)];
  }

  const betalingstermijn = generatePaymentTerm();
  await page.getByLabel('Betalingstermijn').click();
  await page.getByLabel('Betalingstermijn').fill(betalingstermijn);
  await page.waitForTimeout(2000);

  function generateCreditLimit() {
    return `${Math.floor(Math.random() * 100)}`;
  }

  const kredietLimiet = generateCreditLimit();
  await page.getByLabel('Krediet limiet').click();
  await page.getByLabel('Krediet limiet').fill(kredietLimiet);
  await page.waitForTimeout(2000);

  await page.getByLabel('Bestelmethode').click();
  await page.getByRole('option', { name: 'whatsapp' }).click();
  await page.waitForTimeout(2000);

  const betalingsmethode = 'bank';
  await page.getByLabel('Betalingsmethode').click();
  await page.getByRole('option', { name: betalingsmethode }).click();
  await page.waitForTimeout(2000);

  function generateDeliveryTime() {
    return `${Math.floor(Math.random() * 30) + 1}`;
  }

  const levertijdVanBestelling = generateDeliveryTime();
  await page.getByLabel('Levertijd van bestelling').click();
  await page.getByLabel('Levertijd van bestelling').fill(levertijdVanBestelling);
  await page.waitForTimeout(2000);

  function generateMinimumOrderAmount() {
    return `${Math.floor(Math.random() * 1000)}`;
  }

  const minimaalBestelbedrag = generateMinimumOrderAmount();
  await page.getByLabel('Minimaal bestelbedrag').click();
  await page.getByLabel('Minimaal bestelbedrag').fill(minimaalBestelbedrag);
  await page.waitForTimeout(2000);

  function generatePercentage() {
    return `${Math.floor(Math.random() * 100)}`;
  }

  const percentageToeTeVoegen = generatePercentage();
  await page.getByLabel('Percentage toe te voegen').click();
  await page.getByLabel('Percentage toe te voegen').fill(percentageToeTeVoegen);
  await page.waitForTimeout(2000);

  function generateClosedDays() {
    return `${Math.floor(Math.random() * 30)}`;
  }

  const geslotenDagen = generateClosedDays();
  await page.getByLabel('Gesloten dagen').click();
  await page.getByLabel('Gesloten dagen').fill(geslotenDagen);
  await page.waitForTimeout(2000);

  const facebook = 'https://www.facebook.com/';
  const linkedin = 'https://www.linkedin.com/';
  const twitter = 'https://x.com/';
  const instagram = 'https://www.instagram.com/';
  const pinterest = 'https://in.pinterest.com/';
  const tiktok = 'https://www.tiktok.com/tiktokstudio';
  const website = 'https://www.com/';
  const memo = 'https://www.memo-official.org/';
  const leverancierExtraInfo = '456';

  await page.getByLabel('facebook').click();
  await page.getByLabel('facebook').fill(facebook);
  await page.waitForTimeout(2000);

  await page.getByLabel('linkedin').click();
  await page.getByLabel('linkedin').fill(linkedin);
  await page.waitForTimeout(2000);

  await page.getByLabel('Twitter').click();
  await page.getByLabel('Twitter').fill(twitter);
  await page.waitForTimeout(2000);

  await page.getByLabel('instagram').click();
  await page.getByLabel('instagram').fill(instagram);
  await page.waitForTimeout(2000);

  await page.getByLabel('pinterest').click();
  await page.getByLabel('pinterest').fill(pinterest);
  await page.waitForTimeout(2000);

  await page.getByLabel('tiktok').click();
  await page.getByLabel('tiktok').fill(tiktok);
  await page.waitForTimeout(2000);

  await page.getByLabel('website').click();
  await page.getByLabel('website').fill(website);
  await page.waitForTimeout(2000);

  await page.getByLabel('memo').click();
  await page.getByLabel('memo').fill(memo);
  await page.waitForTimeout(2000);

  await page.getByLabel('leverancier extra info').click();
  await page.getByLabel('leverancier extra info').fill(leverancierExtraInfo);
  await page.waitForTimeout(2000);

  await page.getByLabel('Betalingsmachtiging incasseren').check();
  await page.waitForTimeout(2000);
  await page.getByLabel('Heeft verbinding met het').check();
  await page.waitForTimeout(2000);
  await page.getByLabel('Actief').check();
  await page.waitForTimeout(2000);

  await page.getByRole('button', { name: 'Nieuwe Leverancier' }).click();
  await page.waitForTimeout(2000);

  await page.getByRole('button', { name: 'Leverancier', exact: true }).click();
  await page.waitForTimeout(3000);
  await page.getByPlaceholder('Zoeken').click();
  await page.getByPlaceholder('Zoeken').fill('De Vijzel');
  await page.waitForTimeout(2000);
  await page.getByRole('row', { name: 'De Vijzel' }).getByRole('button').click();
  await page.waitForTimeout(2000);
  await page.getByRole('menuitem', { name: 'Bewerken' }).click();
  await page.waitForTimeout(2000);
  await page.getByLabel('KVK nummer').click();
  await page.getByLabel('KVK nummer').fill(kvkNummer);
  await page.waitForTimeout(2000);
  await page.getByLabel('Percentage toe te voegen').click();
  await page.getByLabel('Percentage toe te voegen').fill(percentageToeTeVoegen);
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Wijzigingen opslaan' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('list').getByRole('link', { name: 'Leverancier' }).click();
  await page.waitForTimeout(2000);
  await page.getByPlaceholder('Zoeken').click();
  await page.getByPlaceholder('Zoeken').fill('De Vijzel');
  await page.waitForTimeout(2000);
  await page.getByRole('row', { name: 'De Vijzel' }).getByRole('button').click();
  await page.waitForTimeout(2000);
  await page.getByRole('menuitem', { name: 'Verwijderen' }).click();
  await page.waitForTimeout(2000)
  await page.getByRole('button', { name: 'Verwijderen' }).click();
  await page.waitForTimeout(2000)
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.waitForTimeout(2000)

})