import { test, expect, Page, BrowserContext } from '@playwright/test';

let page: Page;
let context: BrowserContext;

// Helper function to generate a random value
function getRandomValue(min: number, max: number, decimals: number): string {
  return (Math.random() * (max - min) + min).toFixed(decimals);
}

// Helper function to generate SKU
function generateSKU(): string {
  const adjectives = ['Fast', 'Slick', 'Soft', 'Smooth', 'Strong'];
  const nouns = ['Conditioner', 'Shampoo', 'Soap', 'Lotion', 'Cream'];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${randomAdjective}${randomNoun}`;
}

// Helper function to generate random values for form fields
function generateRandomData() {
  const variants = ['special', 'limited', 'exclusive', 'standard', 'premium'];
  const products = [
    'At Home Wash Fabric Softener Pink Secrets wasverzachter 750ml',
    'Ultra Clean Dishwashing Liquid 500ml',
    'Fresh Breeze Air Freshener 250ml',
    'Soft Touch Hand Soap 300ml',
    'Sparkling Clean Window Cleaner 750ml',
  ];
  const locations = ['Netherlands', 'Germany', 'France', 'Italy', 'Spain'];
  const banners = ['At home', 'Special offer', 'Limited edition', 'New arrival', 'Best seller'];

  return {
    hsCode: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
    variant: variants[Math.floor(Math.random() * variants.length)],
    metaKeywords: products[Math.floor(Math.random() * products.length)],
    supplierCode: Math.floor(Math.random() * 100).toString(),
    extraLocation: locations[Math.floor(Math.random() * locations.length)],
    banner: banners[Math.floor(Math.random() * banners.length)],
  };
}

test.beforeAll(async ({ browser }) => {
  test.setTimeout(10000); // Increase timeout to 60 seconds
  context = await browser.newContext();
  page = await context.newPage();

  console.log('Navigating to login page...');
  await page.goto('http://52.28.100.129:3001/auth/jwt/login?returnTo=%2Fdashboard%2Fproduct');
  await page.waitForTimeout(1000);

  // Login process
  const loginEmailInput = page.locator('[data-testid="login-email-input"] input');
  await loginEmailInput.waitFor({ state: 'visible' });
  await loginEmailInput.fill('info1@info.com');

  const loginPasswordInput = page.locator('[data-testid="login-password-input"] input');
  await loginPasswordInput.waitFor({ state: 'visible' });
  await loginPasswordInput.fill('Test123456!');

  const loginButton = page.getByTestId('login-button');
  await loginButton.waitFor();
  await loginButton.click();

  await page.waitForURL('**/dashboard/product');
  console.log('Login successful!');
});

test.afterAll(async () => {
  await context.close();
});

test('Product Page test', async () => {
  test.setTimeout(10000);

  await page.getByRole('button', { name: 'Product' }).click();

  await page.getByText('Actieve Lijst').waitFor({ state: 'visible' });
  await page.getByText('Actieve Lijst').click();

  await page.getByRole('option', { name: 'Particulier zal zien' }).waitFor({ state: 'visible' });
  await page.getByRole('option', { name: 'Particulier zal zien' }).click();

  await page.getByText('B2B zal zien').waitFor();
  await page.getByText('B2B zal zien').click();

  await page.getByRole('button', { name: 'Reset' }).waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Reset' }).click();


  await page.getByLabel('Categorie').waitFor({ state: 'visible' });
  await page.getByLabel('Categorie').click();

  await page.getByPlaceholder('Zoeken').waitFor({ state: 'visible' });
  await page.getByPlaceholder('Zoeken').fill('Lemon');
  await page.waitForTimeout(2000);

  await page.getByRole('row', { name: 'Lemon' }).first().getByRole('button').waitFor({ state: 'visible' });

  await page.getByRole('row', { name: 'Lemon' }).first().getByRole('button').click();

  const bewerkenMenuItem = page.getByRole('menuitem', { name: 'Bewerken' });
await bewerkenMenuItem.waitFor();
await bewerkenMenuItem.click();

  const sku = generateSKU();
  const randomData = generateRandomData();

  await page.getByLabel('SKU').waitFor({ state: 'visible' });
  await page.getByLabel('SKU').fill(sku);

  await page.getByLabel('HS-code').waitFor({ state: 'visible' });
  await page.getByLabel('HS-code').fill(randomData.hsCode);

  await page.getByLabel('Kleur').waitFor({ state: 'visible' });
  await page.getByLabel('Kleur').click();
  await page.getByRole('option', { name: 'Tarwe' }).waitFor({ state: 'visible' });
  await page.getByRole('option', { name: 'Tarwe' }).click();

  await page.getByLabel('Optie').waitFor({ state: 'visible' });
  await page.getByLabel('Optie').fill(randomData.variant);

  await page.getByLabel('Meta zoekwoorden').waitFor({ state: 'visible' });
  await page.getByLabel('Meta zoekwoorden').fill(randomData.metaKeywords);

  await page.getByLabel('Leveranciersartikelcode').waitFor({ state: 'visible' });
  await page.getByLabel('Leveranciersartikelcode').fill(randomData.supplierCode);

  await page.getByLabel('Extra locatie', { exact: true }).waitFor({ state: 'visible' });
  await page.getByLabel('Extra locatie', { exact: true }).fill(randomData.extraLocation);

  await page.getByLabel('Banner').waitFor({ state: 'visible' });
  await page.getByLabel('Banner').fill(randomData.banner);

  // Ürün kaydetme işlemleri
  await page.getByRole('button', { name: 'Opslaan & Blijven' }).waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Opslaan & Blijven' }).click();


  await page.getByRole('button', { name: 'Opslaan & Terug' }).waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Opslaan & Terug' }).click();

  console.log('Product creation and editing successful!');
});

test('Product Bundels Test', async () => {
  test.setTimeout(280000);

  await page.getByRole('button', { name: 'Product' }).click();

  await page.getByPlaceholder('Zoeken').click();

  await page.getByPlaceholder('Zoeken').fill('Eda');
  await page.waitForTimeout(2000);

  await page.getByRole('row', { name: 'Eda' }).getByRole('button').nth(0).waitFor({ state: 'visible' });
  await page.getByRole('row', { name: 'Eda' }).getByRole('button').nth(0).click();

  const bewerkenMenuItem = page.getByRole('menuitem', { name: 'Bewerken' });
  await bewerkenMenuItem.waitFor();
  await bewerkenMenuItem.click();

  await page.getByRole('tab', { name: 'Bundels' }).waitFor();
  await page.getByRole('tab', { name: 'Bundels' }).click();

  await page.getByLabel('', { exact: true }).waitFor();
  await page.getByLabel('', { exact: true }).click();

  await page.getByRole('option', { name: 'Rol' }).waitFor();
  await page.getByRole('option', { name: 'Rol' }).click();

  await page.locator('body').click({ position: { x: 50, y: 20 } });

  await page.getByRole('button', { name: 'Bundel Genereren' }).waitFor();
  await page.getByRole('button', { name: 'Bundel Genereren' }).click();

  await page.getByLabel('Delete').waitFor();
  await page.getByLabel('Delete').click();
});

test('Product Variant Test', async () => {
  test.setTimeout(280000);

  await page.getByRole('button', { name: 'Product' }).click();

  await page.getByPlaceholder('Zoeken').click();

  await page.getByPlaceholder('Zoeken').fill('Eda');
  await page.waitForTimeout(2000);

  await page.getByRole('row', { name: 'Eda' }).getByRole('button').nth(0).waitFor({ state: 'visible' });
  await page.getByRole('row', { name: 'Eda' }).getByRole('button').nth(0).click();

  const bewerkenMenuItem = page.getByRole('menuitem', { name: 'Bewerken' });
  await bewerkenMenuItem.waitFor();
  await bewerkenMenuItem.click();

  await page.getByRole('tab', { name: 'Varianten' }).waitFor();
  await page.getByRole('tab', { name: 'Varianten' }).click();

  await page.getByRole('combobox').waitFor();
  await page.getByRole('combobox').click();

  await page.getByRole('option', { name: 'Bisque' }).waitFor();
  await page.getByRole('option', { name: 'Bisque' }).click();

  await page.locator('body').click({ position: { x: 50, y: 20 } });

  await page.getByRole('button', { name: 'Variant Genereren' }).waitFor();
  await page.getByRole('button', { name: 'Variant Genereren' }).click();

  await page.getByLabel('Edit').first().waitFor();
  await page.getByLabel('Edit').first().click();
});



test('Create New Product Page test', async () => {
  test.setTimeout(280000);

  // Ürün butonuna tıklama
  await page.getByRole('button', { name: 'Product' }).click();

  // Yeni ürün sayfasına gitme
  await page.locator('a:has-text("Nieuw Product")').waitFor({ state: 'visible' });
  await page.locator('a:has-text("Nieuw Product")').click();

  // Ürün bilgilerini doldurma
  const artikelcode = generateArtikelcode();
  await page.getByLabel('Artikelcode', { exact: true }).waitFor({ state: 'visible' });
  await page.getByLabel('Artikelcode', { exact: true }).fill(artikelcode);

  const ean = generateEAN();
  await page.getByLabel('EAN', { exact: true }).waitFor({ state: 'visible' });
  await page.getByLabel('EAN', { exact: true }).fill(ean);

  const sku = generateSKU();
  await page.getByLabel('SKU').waitFor({ state: 'visible' });
  await page.getByLabel('SKU').fill(sku);

  const hsCode = generateHSCode();
  await page.getByLabel('HS-code').waitFor({ state: 'visible' });
  await page.getByLabel('HS-code').fill(hsCode);

  const randomUnit = getRandomUnit();
  await page.getByText('Eenheid Bewerken').waitFor({ state: 'visible' });
  await page.getByText('Eenheid Bewerken').click();
  await page.getByLabel('Eenheid', { exact: true }).waitFor({ state: 'visible' });
  await page.getByLabel('Eenheid', { exact: true }).click();
  await page.getByRole('option', { name: randomUnit }).waitFor({ state: 'visible' });
  await page.getByRole('option', { name: randomUnit }).click();

  const randomColor = getRandomColor();
  await page.getByLabel('Kleur', { exact: true }).waitFor({ state: 'visible' });
  await page.getByLabel('Kleur', { exact: true }).click();
  await page.getByRole('option', { name: "Oranje", exact: true }).waitFor({ state: 'visible' });
  await page.getByRole('option', { name: "Oranje", exact: true }).click();

  const variant = generateVariant();
  await page.getByLabel('Optie').waitFor({ state: 'visible' });
  await page.getByLabel('Optie').fill(variant);

  const products = generateProduct();
  await page.getByLabel('Product Cardtitel').waitFor({ state: 'visible' });
  await page.getByLabel('Product Cardtitel').fill(products);
  await page.getByLabel('Lange Producttitel').waitFor({ state: 'visible' });
  await page.getByLabel('Lange Producttitel').fill(products);

  const metaKeywords = generateMetaKeywords();
  await page.getByLabel('Meta zoekwoorden').waitFor({ state: 'visible' });
  await page.getByLabel('Meta zoekwoorden').fill(metaKeywords);

  const quantityValue = getRandomValue(1, 100, 0);
  await page.getByLabel('Aantal per verpakking').waitFor({ state: 'visible' });
  await page.getByLabel('Aantal per verpakking').fill(quantityValue);

  const priceCostValue = getRandomValue(1, 100, 2);
  await page.getByLabel('Kostprijs per stuk').waitFor({ state: 'visible' });
  await page.getByLabel('Kostprijs per stuk').fill(priceCostValue);

  const pricePerPieceValue = getRandomValue(1, 100, 2);
  await page.locator('input[name="price_per_piece"]').waitFor({ state: 'visible' });
  await page.locator('input[name="price_per_piece"]').fill(pricePerPieceValue);

  const randomVat = getRandomVat();
  await page.getByLabel('BTW').waitFor({ state: 'visible' });
  await page.getByLabel('BTW').click();
  await page.getByRole('option', { name: randomVat }).waitFor({ state: 'visible' });
  await page.getByRole('option', { name: randomVat }).click();

  const supplierCode = generateSupplierCode();
  await page.getByLabel('Leveranciersartikelcode').waitFor({ state: 'visible' });
  await page.getByLabel('Leveranciersartikelcode').fill(supplierCode);

  const lengte = generateDimension();
  await page.getByLabel('Lengte').waitFor({ state: 'visible' });
  await page.getByLabel('Lengte').fill(lengte);

  const breedte = generateDimension();
  await page.getByLabel('Breedte').waitFor({ state: 'visible' });
  await page.getByLabel('Breedte').fill(breedte);

  const hoogte = generateDimension();
  await page.getByLabel('Hoogte').waitFor({ state: 'visible' });
  await page.getByLabel('Hoogte').fill(hoogte);

  const liter = generateVolume();
  await page.getByLabel('Liter', { exact: true }).waitFor({ state: 'visible' });
  await page.getByLabel('Liter', { exact: true }).fill(liter);

  const gewicht = generateWeight();
  await page.getByLabel('Gewicht', { exact: true }).waitFor({ state: 'visible' });
  await page.getByLabel('Gewicht', { exact: true }).fill(gewicht);

  const locatie = generateLocation();
  await page.getByLabel('Locatie', { exact: true }).waitFor({ state: 'visible' });
  await page.getByLabel('Locatie', { exact: true }).fill(locatie);

  const extraLocation = generateExtraLocation();
  await page.getByLabel('Extra locatie', { exact: true }).waitFor({ state: 'visible' });
  await page.getByLabel('Extra locatie', { exact: true }).fill(extraLocation);

  const banner = generateBanner();
  await page.getByLabel('Banner').waitFor({ state: 'visible' });
  await page.getByLabel('Banner').fill(banner);

  const maxVerkoopaantal = generateMaxSalesQuantity();
  await page.getByLabel('Max verkoopaantal').waitFor({ state: 'visible' });
  await page.getByLabel('Max verkoopaantal').fill(maxVerkoopaantal);

  // Ürünü kaydetme
  await page.getByRole('button', { name: 'Nieuwe Product' }).waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Nieuwe Product' }).click();
});

// Yardımcı fonksiyonlar
function generateArtikelcode() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

function generateEAN() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

function generateHSCode() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

function getRandomUnit() {
  const options = ['Stuk', 'Pak', 'Rol', 'Collie/Doos'];
  return options[Math.floor(Math.random() * options.length)];
}

function getRandomColor() {
  const colors = [
    'Rood', 'Blauw', 'Geel', 'Bruin', 'Roze', 'Paars', 'Zwart',
    'Wit', 'Oranje', 'Grijs', 'Cyaan', 'Magenta', 'Turkoois', 'Goud',
    'Zilver', 'Lavendel', 'Teal', 'Indigo', 'Olijf',
    'Zalm', 'Perzik', 'Violet', 'Koraal', 'Limoen', 'Beige', 'Khaki',
    'Fuchsia', 'Ivoor'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function generateVariant() {
  const variants = ['special', 'limited', 'exclusive', 'standard', 'premium'];
  return variants[Math.floor(Math.random() * variants.length)];
}

function generateProduct() {
  const products = [
    'Vanilla Fresh Laundry Detergent 2L',
    'Tropical Breeze Dishwashing Liquid 1L',
    'Fresh Mountain Air Freshener 500ml',
    'Chamomile Hand Wash 300ml',
    'Crystal Clear Glass Cleaner 750ml',
    'Orange Blossom Multi-Surface Cleaner 2L',
    'Extra Strength Floor Cleaner 1.5L',
    'Cool Mint Toilet Gel 700ml',
    'Silk Touch Fabric Softener 1L',
    'Brilliant Shine Window Cleaner 500ml',
    'Deep Action Bathroom Cleaner 600ml',
    'Lemon Wood Polish 400ml',
    'Hygienic Surface Spray 500ml',
    'Grease Buster Oven Cleaner 750ml',
    'Citrus Power Shower Cleaner 500ml',
    'Green Earth Laundry Powder 1kg',
    'Floral Breeze Fabric Softener 1.5L',
    'Allergy Friendly Carpet Cleaner 1L',
    'Stubborn Stain Remover 400ml',
    'Auto Shine Car Wash Liquid 1L',
    'Ocean Mist Room Spray 300ml',
    'Coconut Milk Hand Soap Refill 1L',
    'Tile & Grout Power Cleaner 750ml',
    'Lime Fresh Antibacterial Wipes 100ct',
    'Peppermint Toilet Cleaner 1L',
    'Herbal Fresh Kitchen Cleaner 500ml',
    'Citrus Power Degreaser Spray 750ml',
    'Anti-Mold Bathroom Cleaner 400ml',
    'Sensitive Skin Baby Laundry Detergent 2L',
    'Spotless Window Wipes 80ct',
    'Citrus Burst Garbage Disposal Cleaner 200ml'
  ];
  return products[Math.floor(Math.random() * products.length)];
}

function generateMetaKeywords() {
  const product = [
    'At Home Wash Fabric Softener Pink Secrets wasverzachter 750ml',
    'Ultra Clean Dishwashing Liquid 500ml',
    'Fresh Breeze Air Freshener 250ml',
    'Soft Touch Hand Soap 300ml',
    'Sparkling Clean Window Cleaner 750ml'
  ];
  return product[Math.floor(Math.random() * product.length)];
}

function getRandomVat() {
  const vatoptions = ['0', '9', '21'];
  return vatoptions[Math.floor(Math.random() * vatoptions.length)];
}

function generateSupplierCode() {
  return Math.floor(Math.random() * 100).toString();
}

function generateDimension() {
  return Math.floor(Math.random() * 100).toString();
}

function generateVolume() {
  return Math.floor(Math.random() * 100).toString();
}

function generateWeight() {
  return Math.floor(Math.random() * 50).toString();
}

function generateLocation() {
  const locations = ['US', 'NL', 'DE', 'FR', 'IT', 'ES'];
  return locations[Math.floor(Math.random() * locations.length)];
}

function generateExtraLocation() {
  const locations = ['Netherlands', 'Germany', 'France', 'Italy', 'Spain'];
  return locations[Math.floor(Math.random() * locations.length)];
}

function generateBanner() {
  const banners = ['At home', 'Special offer', 'Limited edition', 'New arrival', 'Best seller'];
  return banners[Math.floor(Math.random() * banners.length)];
}

function generateMaxSalesQuantity() {
  return Math.floor(Math.random() * 100).toString();
}
