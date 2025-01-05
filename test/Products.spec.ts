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

test('Product Page test', async ({}) => {
  test.setTimeout(300000);
    await page.getByRole('button', { name: 'Product' }).click();
    await page.waitForTimeout(2000);
    // await page.getByRole('button', { name: 'Lijst' }).click();
    // await page.waitForTimeout(3000);
    await page.getByText('Actieve Lijst').click();
    await page.getByRole('option', { name: 'Particulier zal zien' }).click();
    await page.waitForTimeout(3000);
    await page.getByText('Particulier zal zien').first().click();
    await page.getByRole('option', { name: 'B2B zal zien' }).click();
    await page.waitForTimeout(3000);
    await page.getByText('B2B zal zien').first().click();
    await page.getByRole('option', { name: 'Verborgen' }).click();
    await page.waitForTimeout(3000);
    await page.getByRole('button', { name: 'Reset' }).click();
    await page.waitForTimeout(3000);
    await page.getByLabel('Categorie').click();

    await page.waitForTimeout(3000);
    await page.getByPlaceholder('Zoeken').click();
    await page.waitForTimeout(3000);
    await page.getByPlaceholder('Zoeken').fill('Eda');
    await page.waitForTimeout(3000);
    await page.getByRole('row', { name: 'Eda' }).getByRole('button').click();
    await page.waitForTimeout(3000);
    await page.getByRole('menuitem', { name: 'Bewerken' }).click();
    await page.waitForTimeout(3000);
    function generateSKU() {
      const adjectives = ['Fast', 'Slick', 'Soft', 'Smooth', 'Strong'];
      const nouns = ['Conditioner', 'Shampoo', 'Soap', 'Lotion', 'Cream'];
      const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
      return `${randomAdjective}${randomNoun}`;
  }

  function generateHSCode() {
      const hsCode = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      return hsCode;
  }
  const sku = generateSKU();
  const hsCode = generateHSCode();

  await page.getByLabel('SKU').click();
  await page.getByLabel('SKU').clear();
  await page.getByLabel('SKU').fill(sku);
  await page.waitForTimeout(2000);
  await page.getByLabel('HS-code').click();
  await page.getByLabel('HS-code').clear();
  await page.getByLabel('HS-code').fill(hsCode);
  await page.waitForTimeout(2000);
  await page.getByLabel('Kleur').click();
  await page.getByRole('option', { name: 'Tarwe' }).click();
  await page.waitForTimeout(2000);
  function generateVariant() {
    const variants = ['special', 'limited', 'exclusive', 'standard', 'premium'];
    return variants[Math.floor(Math.random() * variants.length)];
}

function generateMetaKeywords() {
    const products = [
        'At Home Wash Fabric Softener Pink Secrets wasverzachter 750ml',
        'Ultra Clean Dishwashing Liquid 500ml',
        'Fresh Breeze Air Freshener 250ml',
        'Soft Touch Hand Soap 300ml',
        'Sparkling Clean Window Cleaner 750ml'
    ];
    return products[Math.floor(Math.random() * products.length)];
}

function generateSupplierCode() {
    return Math.floor(Math.random() * 100).toString();
}

function generateExtraLocation() {
    const locations = ['Netherlands', 'Germany', 'France', 'Italy', 'Spain'];
    return locations[Math.floor(Math.random() * locations.length)];
}

function generateBanner() {
    const banners = ['At home', 'Special offer', 'Limited edition', 'New arrival', 'Best seller'];
    return banners[Math.floor(Math.random() * banners.length)];
}
const variant = generateVariant();
const metaKeywords = generateMetaKeywords();
const supplierCode = generateSupplierCode();
const extraLocation = generateExtraLocation();
const banner = generateBanner();

await page.getByLabel('Optie').click();
await page.getByLabel('Optie').clear();
await page.getByLabel('Optie').fill(variant);
await page.waitForTimeout(2000);

await page.getByLabel('Meta zoekwoorden').click();
await page.getByLabel('Meta zoekwoorden').clear();
await page.getByLabel('Meta zoekwoorden').fill(metaKeywords);
await page.waitForTimeout(2000);

await page.getByLabel('Leveranciersartikelcode').click();
await page.getByLabel('Leveranciersartikelcode').clear();
await page.getByLabel('Leveranciersartikelcode').fill(supplierCode);
await page.waitForTimeout(2000);

await page.getByLabel('Extra locatie', { exact: true }).click();
await page.getByLabel('Extra locatie', { exact: true }).clear();
await page.getByLabel('Extra locatie', { exact: true }).fill(extraLocation);
await page.waitForTimeout(2000);

await page.getByLabel('Banner').click();
await page.getByLabel('Banner').clear();
await page.getByLabel('Banner').fill(banner);
await page.waitForTimeout(2000);
await page.getByRole('button', { name: 'Opslaan & Blijven' }).click();
await page.waitForTimeout(5000);
await page.getByRole('button', { name: 'Opslaan & Terug' }).click();
await page.waitForTimeout(5000);
await page.getByRole('button', { name: 'Reset' }).click();
await page.waitForTimeout(5000);
})

test('Product Bundels Test', async ({}) => {
  test.setTimeout(280000);
  await page.getByRole('button', { name: 'Product' }).click();
    await page.waitForTimeout(2000);
    await page.getByPlaceholder('Zoeken').click();
    await page.waitForTimeout(2000);
    await page.getByPlaceholder('Zoeken').fill('Eda');
    await page.waitForTimeout(2000);
    await page.getByRole('row', { name: 'Eda' }).getByRole('button').nth(0).click();
    await page.waitForTimeout(3000);
    await page.getByRole('menuitem', { name: 'Bewerken' }).click();
    await page.waitForTimeout(3000);
    await page.getByRole('tab', { name: 'Bundels' }).click();
    await page.waitForTimeout(2000);
  await page.getByLabel('', { exact: true }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('option', { name: 'Rol' }).click();
  await page.waitForTimeout(2000);
  await page.locator('body').click({ position: { x: 50, y: 20 } });
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Bundel Genereren' }).click();
  await page.waitForTimeout(2000);
  await page.getByLabel('Delete').click();
})


test('Product Variant Test', async ({}) => {
  test.setTimeout(280000);
  await page.getByRole('button', { name: 'Product' }).click();
    await page.waitForTimeout(2000);
    await page.getByPlaceholder('Zoeken').click();
    await page.waitForTimeout(2000);
    await page.getByPlaceholder('Zoeken').fill('Eda');
    await page.waitForTimeout(2000);
    await page.getByRole('row', { name: 'Eda' }).getByRole('button').nth(0).click();
    await page.waitForTimeout(2000);
    await page.getByRole('menuitem', { name: 'Bewerken' }).click();
    await page.waitForTimeout(2000);
    await page.getByRole('tab', { name: 'Varianten' }).click();
    await page.waitForTimeout(2000);
    await page.getByRole('radiogroup').getByText('Optie').click();
    await page.waitForTimeout(2000);
  await page.getByRole('textbox').click();
  await page.getByRole('textbox').fill('55');
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Variant Genereren' }).click();
  await page.waitForTimeout(2000);
    await page.getByRole('radio', { name: 'Kleur' }).check();
    await page.waitForTimeout(2000);
    await page.getByRole('combobox').click();
    await page.waitForTimeout(2000);
    await page.getByRole('option', { name: 'Bisque' }).click();
    await page.waitForTimeout(2000);
    await page.locator('body').click({ position: { x: 50, y: 20 } });
  await page.waitForTimeout(2000);
    await page.getByRole('button', { name: 'Variant Genereren' }).click();
    await page.waitForTimeout(2000);
    await page.getByLabel('Edit').click();
})



test(' Create New Product Page test', async ({}) => {
  test.setTimeout(280000);
    await page.getByRole('button', { name: 'Product' }).click();
    await page.waitForTimeout(2000);
    // await page.getByRole('button', { name: 'Lijst' }).click();
    // await page.waitForTimeout(3000);
    await page.locator('a:has-text("Nieuw Product")').click();
  await page.waitForTimeout(2000);
    function generateArtikelcode() {
      return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  }

  const artikelcode = generateArtikelcode();
  await page.getByLabel('Artikelcode', { exact: true }).click();
  await page.getByLabel('Artikelcode', { exact: true }).fill(artikelcode);
  await page.waitForTimeout(2000);
  // await page.getByRole('button', { name: 'Nieuwe Product' }).click();
  function generateEAN() {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}
  const ean = generateEAN();
  await page.getByLabel('EAN', {exact: true}).click();
  await page.getByLabel('EAN', {exact: true}).fill(ean);
  await page.waitForTimeout(2000);
  function generateSKU() {
    const adjectives = ['Fast', 'Slick', 'Soft', 'Smooth', 'Strong'];
    const nouns = ['Conditioner', 'Shampoo', 'Soap', 'Lotion', 'Cream'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomAdjective}${randomNoun}`;
}

const sku = generateSKU();
await page.getByLabel('SKU').click();
await page.getByLabel('SKU').fill(sku);
await page.waitForTimeout(2000);
function generateHSCode() {
  const hsCode = Math.floor(1000000000 + Math.random() * 9000000000).toString();
  return hsCode;
}
const hsCode = generateHSCode();
await page.getByLabel('HS-code').click();
await page.getByLabel('HS-code').fill(hsCode);
await page.waitForTimeout(2000);
const options = ['Stuk', 'Pak', 'Rol', 'Collie/Doos'];
const randomIndex = Math.floor(Math.random() * options.length);
const randomUnit = options[randomIndex];

await page.getByText('Eenheid Bewerken').click();
await page.getByLabel('Eenheid', { exact: true }).click();
await page.getByRole('option', { name: randomUnit }).click();
await page.waitForTimeout(2000);

const colors = [
  'Rood', 'Blauw', 'Geel', 'Bruin', 'Roze', 'Paars', 'Zwart',
  'Wit', 'Oranje', 'Grijs', 'Cyaan', 'Magenta', 'Turkoois', 'Goud',
  'Zilver', 'Lavendel', 'Teal', 'Indigo', 'Olijf',
  'Zalm', 'Perzik', 'Violet', 'Koraal', 'Limoen', 'Beige', 'Khaki',
   'Fuchsia', 'Ivoor'
];
const randomIndex1 = Math.floor(Math.random() * colors.length);

const randomColor = colors[randomIndex1];

await page.getByLabel('Kleur', { exact: true }).click();
await page.getByRole('option', { name: "Oranje", exact: true }).click();
await page.waitForTimeout(2000);

function generateVariant() {
  const variants = ['special', 'limited', 'exclusive', 'standard', 'premium'];
  return variants[Math.floor(Math.random() * variants.length)];
}
const variant = generateVariant();
await page.getByLabel('Optie').click();
await page.getByLabel('Optie').fill(variant);
await page.waitForTimeout(2000);

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
const products = generateProduct();
await page.getByLabel('Product Cardtitel').click();
await page.getByLabel('Product Cardtitel').fill(products);
await page.waitForTimeout(2000);
await page.getByLabel('Lange Producttitel').click();
await page.getByLabel('Lange Producttitel').fill(products);
await page.waitForTimeout(2000);
function generateMetaKeywords() {
  const products = [
      'At Home Wash Fabric Softener Pink Secrets wasverzachter 750ml',
      'Ultra Clean Dishwashing Liquid 500ml',
      'Fresh Breeze Air Freshener 250ml',
      'Soft Touch Hand Soap 300ml',
      'Sparkling Clean Window Cleaner 750ml'
  ];
  return products[Math.floor(Math.random() * products.length)];
}
const metaKeywords = generateMetaKeywords();
await page.getByLabel('Meta zoekwoorden').click();
await page.getByLabel('Meta zoekwoorden').fill(metaKeywords);
await page.waitForTimeout(2000);

function getRandomValue(min, max, decimals) {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);
  return str;
}
const quantityValue = getRandomValue(1, 100, 0); // integer value between 1 and 100
const priceCostValue = getRandomValue(1, 100, 2); // decimal value between 1.00 and 100.00
const pricePerPieceValue = getRandomValue(1, 100, 2); // decimal value between 1.00 and 100.00


await page.getByLabel('Aantal per verpakking').click();
await page.getByLabel('Aantal per verpakking').fill(quantityValue);
await page.waitForTimeout(2000);
await page.getByLabel('Kostprijs per stuk').click();
await page.getByLabel('Kostprijs per stuk').fill(priceCostValue);
await page.waitForTimeout(2000);
await page.locator('input[name="price_per_piece"]').click();
await page.locator('input[name="price_per_piece"]').fill(pricePerPieceValue);
await page.waitForTimeout(2000);

const vatoptions = ['0', '9', '21'];
const randomIndex2 = Math.floor(Math.random() * vatoptions.length);
const randomVat = vatoptions[randomIndex2];
await page.getByLabel('BTW').click();
await page.getByRole('option', { name: randomVat }).click();
await page.waitForTimeout(2000);

await page.getByLabel('Inhoud Unit').click();
await page.getByRole('option', { name: 'Rol' }).click();
await page.waitForTimeout(2000);

function generateSupplierCode() {
    return Math.floor(Math.random() * 100).toString();
  }
const supplierCode = generateSupplierCode();
await page.getByLabel('Leveranciersartikelcode').click();
await page.getByLabel('Leveranciersartikelcode').fill(supplierCode);
await page.waitForTimeout(2000);
await page.getByLabel('Grootte Eenheid').click();
await page.getByRole('option', { name: 'mm' }).click();
await page.waitForTimeout(2000);
function generateDimension() {
  return Math.floor(Math.random() * 100).toString();
}
const lengte = generateDimension();
await page.getByLabel('Lengte').click();
await page.getByLabel('Lengte').fill(lengte);
await page.waitForTimeout(2000);

const breedte = generateDimension();
await page.getByLabel('Breedte').click();
await page.getByLabel('Breedte').fill(breedte);
await page.waitForTimeout(2000);

const hoogte = generateDimension();
await page.getByLabel('Hoogte').click();
await page.getByLabel('Hoogte').fill(hoogte);
await page.waitForTimeout(2000);

function generateVolume() {
  return Math.floor(Math.random() * 100).toString();
}
const liter = generateVolume();

await page.getByLabel('Liter', { exact: true }).click();
await page.getByLabel('Liter', { exact: true }).fill(liter);
await page.waitForTimeout(2000);

function generateWeight() {
  return Math.floor(Math.random() * 50).toString();
}
const gewicht = generateWeight();
await page.getByLabel('Gewicht', { exact: true }).click();
await page.getByLabel('Gewicht', { exact: true }).fill(gewicht);
await page.waitForTimeout(2000);

await page.getByLabel('Liter-eenheid').click();
await page.getByRole('option', { name: 'ml' }).click();
await page.waitForTimeout(2000);

await page.getByLabel('Gewichtseenheid').click();
await page.getByRole('option', { name: 'kg' }).click();
await page.waitForTimeout(2000);

function generateLocation() {
  const locations = ['US', 'NL', 'DE', 'FR', 'IT', 'ES'];
  return locations[Math.floor(Math.random() * locations.length)];
}
const locatie = generateLocation();
await page.getByLabel('Locatie', { exact: true }).click();
await page.getByLabel('Locatie', { exact: true }).fill(locatie);
await page.waitForTimeout(2000);

function generateExtraLocation() {
  const locations = ['Netherlands', 'Germany', 'France', 'Italy', 'Spain'];
  return locations[Math.floor(Math.random() * locations.length)];
}
const extraLocation = generateExtraLocation();
await page.getByLabel('Extra locatie', {exact:true}).click();
await page.getByLabel('Extra locatie', {exact:true}).fill(extraLocation);
await page.waitForTimeout(2000);

await page.getByLabel('Levertijd').click();
await page.getByRole('option', { name: '/ 5 Dagen' }).click();

function generateBanner() {
  const banners = ['At home', 'Special offer', 'Limited edition', 'New arrival', 'Best seller'];
  return banners[Math.floor(Math.random() * banners.length)];
}
const banner = generateBanner();
await page.getByLabel('Banner').click();
await page.getByLabel('Banner').fill(banner);
await page.waitForTimeout(2000);

function generateMaxSalesQuantity() {
  return Math.floor(Math.random() * 100).toString();
}
const maxVerkoopaantal = generateMaxSalesQuantity();
await page.getByLabel('Max verkoopaantal').click();
await page.getByLabel('Max verkoopaantal').fill(maxVerkoopaantal);
await page.waitForTimeout(2000);
await page.getByLabel('Is Gebruikt (Tweedehand)').check();
await page.waitForTimeout(2000);
await page.getByLabel('Voorraadcontrole').check();
await page.waitForTimeout(2000);
await page.getByLabel('Is Uitgelicht').check();
await page.waitForTimeout(2000);
await page.getByLabel('Is opruiming').check();
await page.waitForTimeout(2000);
await page.getByLabel('Is vermeld op Marktplaats').check();
await page.waitForTimeout(2000);
await page.getByLabel('Is vermeld op 2dehands').check();
await page.waitForTimeout(2000);
await page.getByPlaceholder('Talen Selecteren').click();
await page.waitForTimeout(2000);
await page.getByRole('option', { name: 'Netherlands (NL)' }).click();
await page.getByRole('option', { name: 'France (FR)' }).click();
await page.getByRole('option', { name: 'United Kingdom (GB)' }).click();
await page.getByLabel('Sluiten').click();
await page.waitForTimeout(2000);
await page.getByRole('heading', { name: 'Geselecteerde categorieën:' }).click();
await page.getByRole('button', { name: 'Categorieën toevoegen/' }).click();
await page.waitForTimeout(2000);
await page.getByText('Auto', {exact:true}).click();
await page.waitForTimeout(2000);
await page.getByText('Auto-accessoires', {exact:true}).click();
await page.getByText('Aanhangeronderdelen', {exact:true}).click();
await page.getByText('Acculaders', {exact:true}).click();
await page.waitForTimeout(2000);
await page.getByRole('button', { name: 'Annuleren' }).click();
await page.getByRole('button', { name: 'Afbeeldingen uploaden' }).click();
await page.waitForTimeout(2000);
await page.getByPlaceholder('Typ hier...').click();
await page.getByPlaceholder('Typ hier...').fill('bref');
await page.waitForTimeout(2000);
await page.locator('.MuiButtonBase-root.MuiCheckbox-root').click();
await page.waitForTimeout(2000);
await page.getByRole('button', { name: 'Selecteer', exact: true }).click();
await page.waitForTimeout(2000);
await page.getByRole('button', { name: 'Nieuwe Product' }).click();
await page.waitForTimeout(3000);



// function getRandomValue(min, max, decimals) {
//      const str = (Math.random() * (max - min) + min).toFixed(decimals);
//      return str;
//    }
//    const quantityValue = getRandomValue(1, 100, 0); // integer value between 1 and 100

//    const pricePerPieceValue = getRandomValue(1, 100, 2); // decimal value between 1.00 and 100.00

//    function generateDimension() {
//        return Math.floor(Math.random() * 100).toString();
//      }
//      const lengte = generateDimension();
//      const breedte = generateDimension();
//      const hoogte = generateDimension();

//      function generateVolume() {
//          return Math.floor(Math.random() * 100).toString();
//        }
//        const liter = generateVolume();

//        function generateWeight() {
//            return Math.floor(Math.random() * 50).toString();
//          }
//          const gewicht = generateWeight();

await page.getByRole('button', { name: 'Product', exact:true }).click();
    await page.waitForTimeout(2000);
await page.getByPlaceholder('Zoeken').click();
await page.waitForTimeout(3000);
await page.getByPlaceholder('Zoeken').fill('Eda');
await page.waitForTimeout(3000);
await page.getByRole('row', { name: 'Eda' }).getByRole('button').click();
await page.waitForTimeout(3000);
await page.getByRole('menuitem', { name: 'Bewerken' }).click();
await page.waitForTimeout(3000);

await page.getByLabel('Optie').click();
await page.getByLabel('Optie').fill('exclusive');
await page.waitForTimeout(2000);

await page.getByLabel('Aantal per verpakking').click();
await page.getByLabel('Aantal per verpakking').fill(quantityValue);
await page.waitForTimeout(2000);

await page.getByLabel('Prijs per Stuk', {exact:true}).click();
await page.getByLabel('Prijs per Stuk', {exact:true}).fill(pricePerPieceValue);
await page.waitForTimeout(2000);

await page.getByLabel('Lengte').click();
await page.getByLabel('Lengte').fill(lengte);
await page.waitForTimeout(2000);

await page.getByLabel('Breedte').click();
await page.getByLabel('Breedte').fill(breedte);
await page.waitForTimeout(2000);

await page.getByLabel('Hoogte').click();
await page.getByLabel('Hoogte').fill(hoogte);
await page.waitForTimeout(2000);

await page.getByLabel('Liter', { exact: true }).click();
await page.getByLabel('Liter', { exact: true }).fill(liter);
await page.waitForTimeout(2000);

await page.getByLabel('Gewicht', { exact: true }).click();
await page.getByLabel('Gewicht', { exact: true }).fill(gewicht);
await page.waitForTimeout(2000);

await page.getByLabel('Liter-eenheid').click();
await page.getByRole('option', { name: 'ml' }).click();
await page.waitForTimeout(2000);

await page.getByLabel('Gewichtseenheid').click();
await page.getByRole('option', { name: 'kg' }).click();
await page.waitForTimeout(2000);

// await page.getByPlaceholder('Zoeken').click();
// await page.waitForTimeout(3000);
// await page.getByPlaceholder('Zoeken').fill('Dreft Dishwashing Liquid Extra Hygiene Original 325 ml');
// await page.waitForTimeout(3000);
// await page.getByRole('row', { name: 'Dreft Dishwashing Liquid Extra Hygiene Original 325 ml' }).getByRole('button').click();
// await page.waitForTimeout(3000);
// await page.getByRole('menuitem', { name: 'Bewerken' }).click();
// await page.waitForTimeout(3000);
// await page.getByRole('tab', { name: 'Varianten' }).click();
// await page.getByRole('combobox').first().click();
// await page.getByRole('option', { name: 'Rood', exact: true }).click();
// await page.waitForTimeout(2000);
// await page.mouse.click(10, 10);
// await page.waitForTimeout(2000);
// await page.getByRole('textbox').click();
// await page.getByRole('textbox').fill('Supream');
// await page.waitForTimeout(2000);
// await page.getByLabel('', { exact: true }).click();
// await page.getByRole('option', { name: 'Pak' }).click();
// await page.waitForTimeout(2000);
// await page.mouse.click(10, 10);
// await page.waitForTimeout(2000);
// await page.getByRole('button', { name: 'Variant Genereren' }).click();
// await page.waitForTimeout(3000);
// await page.getByRole('row', { name: products }).nth(0).getByLabel('Edit').click();
// await page.waitForTimeout(3000);
// await page.getByRole('button', { name: 'Opslaan & Blijven' }).click();
// await page.waitForTimeout(3000);
// await page.getByRole('button', { name: 'Opslaan & Terug' }).click();
// await page.waitForTimeout(3000);
// await page.getByRole('row', { name: 'Dreft Dishwashing Liquid Extra Hygiene Original 325 ml' }).getByRole('button').click();
// await page.waitForTimeout(3000);
// await page.getByRole('menuitem', { name: 'Verwijderen' }).click();
// await page.waitForTimeout(2000);
await page.getByRole('button', { name: 'Verwijderen', exact:true }).click();
await page.waitForTimeout(3000);
});
