/**
 * Simple currency mapping for the onboarding offer
 * Base Price: $2.99 USD
 */

const CURRENCY_MAP = {
    'US': { code: 'USD', symbol: '$', rate: 1, format: '${price}' },
    'IN': { code: 'INR', symbol: '₹', rate: 85, format: '₹{price}' }, // Approx 
    'UK': { code: 'GBP', symbol: '£', rate: 0.78, format: '£{price}' },
    'EU': { code: 'EUR', symbol: '€', rate: 0.92, format: '€{price}' },
    'CA': { code: 'CAD', symbol: 'C$', rate: 1.35, format: 'C${price}' },
    'AU': { code: 'AUD', symbol: 'A$', rate: 1.50, format: 'A${price}' },
    'JP': { code: 'JPY', symbol: '¥', rate: 150, format: '¥{price}' },
    // Add default fallback
    'DEFAULT': { code: 'USD', symbol: '$', rate: 1, format: '${price}' }
};

export const COUNTRIES = [
    { code: 'US', name: 'United States' },
    { code: 'IN', name: 'India' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'EU', name: 'Europe (Eurozone)' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'JP', name: 'Japan' },
    { code: 'OT', name: 'Other' }
];

export function getConvertedPrice(countryCode, basePriceUSD = 2.99) {
    const currency = CURRENCY_MAP[countryCode] || CURRENCY_MAP['DEFAULT'];
    const converted = (basePriceUSD * currency.rate).toFixed(2);

    // Nice formatting for round numbers (e.g. INR usually no decimals for small amounts if we want, but let's keep it simple)
    if (currency.code === 'INR' || currency.code === 'JPY') {
        return currency.format.replace('{price}', Math.round(basePriceUSD * currency.rate));
    }

    return currency.format.replace('{price}', converted);
}
