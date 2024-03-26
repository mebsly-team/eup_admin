export function getBICFromIBAN(iban: string) {
    // Remove spaces from IBAN
    iban = iban.replace(/\s/g, '');

    // Check if IBAN length is valid
    if (iban.length < 15) {
        console.error('Invalid IBAN length');
        return null;
    }

    // Check if IBAN starts with country code (BE for Belgium, NL for Netherlands)
    if (!iban.startsWith('BE') && !iban.startsWith('NL')) {
        console.error('IBAN should start with BE for Belgium or NL for Netherlands');
        return null;
    }

    // Define BIC length for Belgium and Netherlands
    const bicLengthBE = 8;
    const bicLengthNL = 8;

    // Extract BIC from IBAN
    let bic;
    if (iban.startsWith('BE')) {
        bic = iban.substring(4, 4 + bicLengthBE);
    } else if (iban.startsWith('NL')) {
        bic = iban.substring(4, 4 + bicLengthNL);
    }

    return bic;
}

const iban1 = 'BE71096123456769'; // Example Belgian IBAN
const iban2 = 'NL91ABNA0417164300'; // Example Dutch IBAN

console.log('BIC from IBAN1:', getBICFromIBAN(iban1)); // Output: BIC from IBAN1: 09612345
console.log('BIC from IBAN2:', getBICFromIBAN(iban2)); // Output: BIC from IBAN2: ABNA0417
