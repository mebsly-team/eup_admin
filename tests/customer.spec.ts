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

test(' Customer Type  page test', async ({}) => {
  test.setTimeout(280000);
  await page.getByRole('button', { name: 'Klant' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Lijst' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('link', { name: 'Nieuw Klant' }).click();
  
  await page.waitForTimeout(3000);
   
  const user_type = [
    'Speciaal',
    'Groothandelaar',
    'Supermarkt',
  ];
  const randomuser_type =
  user_type[Math.floor(Math.random() * user_type.length)];
  await page.getByLabel('Klanttype').click();
  await page.getByRole('option', { name: randomuser_type }).click();
  await page.waitForTimeout(3000);

const randomEmail = 'test' + Math.floor(Math.random() * 1000) + '@example.com';
const generatedUserName = randomEmail;
await page.getByLabel('E-mail').click();
await page.getByLabel('E-mail').fill(generatedUserName);
await page.waitForTimeout(2000);

function generateRandomFirstName() {
  const firstNames = ["John", "Jane", "Michael", "Emily", "David", "Sarah", "Daniel", "Jessica", "Christopher", "Elizabeth"];
  const randomIndex = Math.floor(Math.random() * firstNames.length);
  return firstNames[randomIndex];
}

const randomFirstName = generateRandomFirstName();
await page.getByLabel('Naam', { exact: true }).click();
await page.getByLabel('Naam', { exact: true }).fill(randomFirstName);
await page.waitForTimeout(2000);

await page.getByLabel('Achternaam').click();
await page.getByLabel('Achternaam').fill('son');
await page.waitForTimeout(2000);
await page.getByLabel('Wachtwoord').click();
await page.getByLabel('Wachtwoord').fill('Mike1234');
await page.waitForTimeout(2000);

function generatePhoneNumber() {
    return `0${Math.floor(100000000 + Math.random() * 900000000)}`;
  }
  
  const telefoon = generatePhoneNumber();
  const phoneNumberInput = page.getByLabel('Telefoon', { exact: true }).first();
  await phoneNumberInput.click();
  await phoneNumberInput.fill(telefoon);
  await page.waitForTimeout(2000);
 
const randommobielNumber = String(Math.floor(1000000000 + Math.random() * 9000000000)).slice(0, 10);
await page.getByLabel('mobiel').click();
await page.getByLabel('mobiel').fill(randommobielNumber);
await page.waitForTimeout(2000);

function generateRandomDOB() {
 
  const year = Math.floor(Math.random() * (2003 - 1950 + 1)) + 1950;
 
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');

  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

await page.getByPlaceholder('YYYY-MM-DD').click();
await page.getByPlaceholder('YYYY-MM-DD').fill(generateRandomDOB());
await page.waitForTimeout(2000);

await page.getByLabel('Is geabonneerd op').check();
await page.waitForTimeout(2000);
await page.getByLabel('Is toegang verleend tot').check();
await page.waitForTimeout(2000);

const business_name = [
    'TechGenius Solutions','SwiftServe Logistics','SparkleShine Cleaning Co.','HealthHub Nutrition','CraftyCreations Workshop','UrbanEats Catering','BlueSky Aviation Services','SereneSails Yacht Charters','SecureShield Cybersecurity'];
const randombusiness_name =
business_name[Math.floor(Math.random() * business_name.length)];
await page.getByLabel('Bedrijfsnaam').click();
await page.getByLabel('Bedrijfsnaam').fill(randombusiness_name);
await page.waitForTimeout(2000);

function generateContactpersoon() {
    const names = ['John Doe', 'Jane Smith', 'Harsha', 'Yash'];
    return names[Math.floor(Math.random() * names.length)];
  }
const contactpersoonNaam = generateContactpersoon();
await page.getByLabel('Contactpersoon Naam').click();
await page.getByLabel('Contactpersoon Naam').fill(contactpersoonNaam);
await page.waitForTimeout(2000);


const randomcontact_person_phone_number = String(Math.floor(1000000000 + Math.random() * 9000000000)).slice(0, 10);

await page.getByLabel('Contactpersoon telefoon').click();
await page.getByLabel('Contactpersoon telefoon').fill(randomcontact_person_phone_number);
await page.waitForTimeout(2000);

function generateEmail() {
  const domains = ['example.com', 'test.com', 'email.com'];
  return `user_${Math.floor(Math.random() * 1000)}@${domains[Math.floor(Math.random() * domains.length)]}`;
}

const Contactpersoonemail = generateEmail();
await page.getByLabel('Contactpersoon Email').click();
await page.getByLabel('Contactpersoon Email').fill(Contactpersoonemail);
await page.waitForTimeout(2000);


function generateDepartment() {
  const departments = ['Sales', 'Marketing', 'IT', 'HR'];
  return departments[Math.floor(Math.random() * departments.length)];
}
const department = generateDepartment();
await page.getByLabel('department').click();
await page.getByLabel('department').fill(department);
await page.waitForTimeout(2000);

function generateClassification() {
  const classifications = ['Type A', 'Type B', 'Type C'];
  return classifications[Math.floor(Math.random() * classifications.length)];
}

const classification = generateClassification();
await page.getByLabel('Classification').click();
await page.getByLabel('Classification').fill(classification);
await page.waitForTimeout(2000);

function generateBranch() {
  const branches = ['Main', 'Secondary', 'Tertiary'];
  return branches[Math.floor(Math.random() * branches.length)];
}
const branch = generateBranch();
await page.getByLabel('branch').click();
await page.getByLabel('branch').fill(branch);
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

function generateName() {
  const names = ['John Doe', 'Jane Smith', 'Alice Brown', 'Bob Johnson'];
  return names[Math.floor(Math.random() * names.length)];
}

const naamRekeninghouder = generateName();
await page.getByLabel('Naam rekeninghouder').click();
await page.getByLabel('Naam rekeninghouder').fill(naamRekeninghouder);
await page.waitForTimeout(2000);

function generateCity() {
  const cities = ['Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag'];
  return cities[Math.floor(Math.random() * cities.length)];
}

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

function generateKVK() {
  return `${Math.floor(1000000 + Math.random() * 9000000)}`;
}
const kvk = generateKVK();
await page.getByLabel('KVK').click();
await page.getByLabel('KVK').fill(kvk);
await page.waitForTimeout(2000);

await page.getByLabel('Betalingsmethode').click();
await page.getByRole('option', { name: 'Geen' }).click();
await page.waitForTimeout(2000);
await page.getByLabel('Betalingsmethode').click();
await page.getByRole('option', { name: 'bank' }).click();
await page.waitForTimeout(2000);

function generatePercentage() {
  return `${Math.floor(Math.random() * 100)}`;
}

const klantPercentage = generatePercentage();
await page.getByLabel('Klant Percentage').click();
await page.getByLabel('Klant Percentage').fill(klantPercentage);
await page.waitForTimeout(2000);

const factuurKorting = generatePercentage();
await page.getByLabel('Factuur korting').click();
await page.getByLabel('Factuur korting').fill(factuurKorting);
await page.waitForTimeout(2000);

function generatePaymentTerm() {
  const terms = ['Net 30', 'Net 60', 'Net 90'];
  return terms[Math.floor(Math.random() * terms.length)];
}

const betalingstermijn = generatePaymentTerm();
await page.getByLabel('Betalingstermijn', { exact: true }).click();
await page.getByLabel('Betalingstermijn', { exact: true }).fill(betalingstermijn);
await page.waitForTimeout(2000);

function generateCreditLimit() {
  return `${Math.floor(Math.random() * 10000)}`;
}
const kredietLimiet = generateCreditLimit();
await page.getByLabel('Krediet limiet').click();
await page.getByLabel('Krediet limiet').fill(kredietLimiet);
await page.waitForTimeout(2000);

function generateStreetAddress() {
  return `Street ${Math.floor(Math.random() * 100)}, House ${Math.floor(Math.random() * 100)}, City`;
}
const factuurAdres = generateStreetAddress();
await page.getByLabel('Factuur adres').click();
await page.getByLabel('Factuur adres').fill(factuurAdres);
await page.waitForTimeout(2000);

function generateLanguage() {
  const languages = ['Dutch', 'English', 'French', 'German'];
  return languages[Math.floor(Math.random() * languages.length)];
}
const factuurTaal = generateLanguage();
await page.getByLabel('Factuur Taal').click();
await page.getByLabel('Factuur Taal').fill(factuurTaal);
await page.waitForTimeout(2000);

function generateDiscountGroup() {
  const groups = ['Group A', 'Group B', 'Group C'];
  return groups[Math.floor(Math.random() * groups.length)];
}
const kortingsgroep = generateDiscountGroup();
await page.getByLabel('Kortingsgroep').click();
await page.getByLabel('Kortingsgroep').fill(kortingsgroep);
await page.waitForTimeout(2000);

function generateInformMethod() {
  const methods = ['Email', 'Phone', 'SMS', 'Post'];
  return methods[Math.floor(Math.random() * methods.length)];
}
const informeerVia = generateInformMethod();
await page.getByLabel('Informeer via').click();
await page.getByLabel('Informeer via').fill(informeerVia);
await page.waitForTimeout(2000);

function generateCustomerColor() {
  const colors = ['Rood', 'Blauw', 'Groen', 'Geel'];
  return colors[Math.floor(Math.random() * colors.length)];
}
const klantkleur = generateCustomerColor();
await page.getByLabel('Klantkleur').click();
await page.getByRole('option', { name: klantkleur }).click();
await page.waitForTimeout(2000);

function generateRelationType() {
  const types = ['Friend', 'Colleague', 'Partner'];
  return types[Math.floor(Math.random() * types.length)];
}
const relatieType = generateRelationType();
await page.getByLabel('Relatie type').click();
await page.getByLabel('Relatie type').fill(relatieType);
await page.waitForTimeout(2000);

function generateRelationMethod() {
  const methods = ['Visa', 'Mastercard', 'Amex'];
  return methods[Math.floor(Math.random() * methods.length)];
}
const relationVia = generateRelationMethod();
await page.getByLabel('relation_via').click();
await page.getByLabel('relation_via').fill(relationVia);
await page.waitForTimeout(2000);

function generateClosedDays() {
  return `${Math.floor(Math.random() * 30)}`;
}
const geslotenDagen = generateClosedDays();
await page.getByLabel('Gesloten dagen').click();
await page.getByLabel('Gesloten dagen').fill(geslotenDagen);
await page.waitForTimeout(2000);

function generateDaysNotDeliver() {
  return `${Math.floor(Math.random() * 30)}`;
}
const dagenNietLeveren = generateDaysNotDeliver();
await page.getByLabel('Dagen niet leveren').click();
await page.getByLabel('Dagen niet leveren').fill(dagenNietLeveren);
await page.waitForTimeout(2000);

function generateCode() {
  return `${Math.floor(Math.random() * 10000)}`;
}
const fax = generateCode();
await page.getByLabel('Fax').click();
await page.getByLabel('Fax').fill(fax);
await page.waitForTimeout(2000);

await page.getByLabel('Incasseren').check();
await page.getByLabel('Betalingstermijn activeren').check();
await page.getByLabel('Levertijd').check();
await page.getByLabel('Geen betaling/Alleen factuur').check();
await page.getByLabel('inform_when_new_products').check();
await page.getByLabel('Aanmanen').check();

const facebook = 'https://www.facebook.com/';
const linkedin = 'https://www.linkedin.com/';
const twitter = 'https://x.com/';
const instagram = 'https://www.instagram.com/';
const pinterest = 'https://in.pinterest.com/';
const tiktok = 'https://www.tiktok.com/tiktokstudio';
const website = 'https://www.com/';

await page.getByLabel('website').click();
await page.getByLabel('website').fill(website);
await page.waitForTimeout(2000);

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
await page.getByLabel('Notities').click();
await page.getByLabel('Notities').fill('abc');
await page.waitForTimeout(2000);
await page.getByRole('button', { name: 'Nieuwe Klant' }).click();
await page.waitForTimeout(2000);
await page.getByPlaceholder('Zoeken...').click();
await page.getByPlaceholder('Zoeken...').fill(generatedUserName);
await page.waitForTimeout(2000);
await page.getByRole('row', { name: generatedUserName }).getByRole('button').click();
await page.waitForTimeout(2000);
await page.getByRole('menuitem', { name: 'Bewerken' }).click();
await page.waitForTimeout(2000);
await page.getByLabel('Notities').click();
await page.getByLabel('Notities').fill('New Customer');
await page.waitForTimeout(2000);
await page.getByRole('button', { name: 'Opslaan' }).click();
await page.waitForTimeout(2000);
await page.getByPlaceholder('Zoeken...').click();
await page.getByPlaceholder('Zoeken...').fill(generatedUserName);
await page.waitForTimeout(2000);
await page.getByRole('row', { name: generatedUserName }).getByRole('button').click();
await page.waitForTimeout(2000);
await page.getByRole('menuitem', { name: 'Verwijderen' }).click();
await page.waitForTimeout(2000);
await page.getByRole('button', { name: 'Verwijderen' }).click();
await page.waitForTimeout(2000);

})
