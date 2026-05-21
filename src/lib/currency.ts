// Currency formatting utility for ILS → USD / EUR conversion based on language.
// Spanish-speaking markets get EUR pricing by default; Hebrew gets ILS; English gets USD.

type Lang = 'he' | 'en' | 'es';

// Marketing-friendly USD price mapping (ILS -> USD)
const USD_PRICE_MAP: Record<number, number> = {
  297: 79,      // Personal Hypnosis Video
  1997: 549,   // Consciousness Leap
  179: 49,     // Pro Monthly
  289: 79,     // Coach Monthly
  469: 129,    // Business Monthly
  97: 27,      // Legacy Monthly Subscription
  250: 69,     // Single Session
  800: 219,    // 4-Session Package
  1000: 279,   // General fallback for ~1000 ILS
};

/**
 * Convert ILS price to marketing-friendly USD
 */
export const convertToUSD = (ilsPrice: number): number => {
  // Check for exact match first
  if (USD_PRICE_MAP[ilsPrice]) {
    return USD_PRICE_MAP[ilsPrice];
  }
  
  // For other prices, use approximate conversion (1 ILS ≈ $0.27)
  const converted = Math.round(ilsPrice * 0.27);
  
  // Round to a clean number for marketing purposes
  if (converted < 50) return Math.ceil(converted / 5) * 5; // Round to nearest 5
  if (converted < 200) return Math.ceil(converted / 10) * 10; // Round to nearest 10
  return Math.ceil(converted / 50) * 50; // Round to nearest 50
};

/**
 * Format price with currency based on language
 */
export const formatPrice = (
  priceInILS: number,
  language: Lang,
): string => {
  if (language === 'en') {
    return `$${convertToUSD(priceInILS)}`;
  }
  if (language === 'es') {
    // EUR ≈ USD for marketing rounding; reuse USD ladder.
    return `€${convertToUSD(priceInILS)}`;
  }
  return `₪${priceInILS.toLocaleString()}`;
};

/**
 * Get currency symbol based on language
 */
export const getCurrencySymbol = (language: Lang): string => {
  if (language === 'en') return '$';
  if (language === 'es') return '€';
  return '₪';
};

/**
 * Get currency code based on language
 */
export const getCurrencyCode = (language: Lang): string => {
  if (language === 'en') return 'USD';
  if (language === 'es') return 'EUR';
  return 'ILS';
};

/**
 * Format currency with amount and currency code
 */
export const formatCurrency = (amount: number, currency: string = 'ILS'): string => {
  if (currency === 'USD' || currency === '$') {
    return `$${amount.toLocaleString()}`;
  }
  if (currency === 'EUR' || currency === '€') {
    return `€${amount.toLocaleString()}`;
  }
  return `₪${amount.toLocaleString()}`;
};
