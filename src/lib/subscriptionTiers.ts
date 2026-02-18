/**
 * Subscription Tier Configuration
 * Central source of truth for all tier-related data
 */

export type SubscriptionTier = "free" | "pro" | "coach" | "business";

export interface TierConfig {
  tier: SubscriptionTier;
  productId: string | null;
  priceId: string | null;
  priceUSD: number;
  priceILS: number;
  label: { en: string; he: string };
  description: { en: string; he: string };
  trial?: number; // days
}

export const TIER_CONFIGS: Record<SubscriptionTier, TierConfig> = {
  free: {
    tier: "free",
    productId: null,
    priceId: null,
    priceUSD: 0,
    priceILS: 0,
    label: { en: "Free", he: "חינם" },
    description: {
      en: "Dashboard, 90-day plan, and 5 daily Aurora messages",
      he: "דאשבורד, תוכנית 90 יום ו-5 הודעות יומיות לאורורה",
    },
  },
  pro: {
    tier: "pro",
    productId: "prod_U00p6Sl2YSs5vQ",
    priceId: "price_1T20nXL9lVJ44TbRUzy3AjEN",
    priceUSD: 49,
    priceILS: 179,
    label: { en: "Pro", he: "Pro" },
    description: {
      en: "Unlimited coaching, daily AI hypnosis, proactive nudges",
      he: "אימון ללא הגבלה, היפנוזה יומית, נאדג׳ים פרואקטיביים",
    },
    trial: 7,
  },
  coach: {
    tier: "coach",
    productId: "prod_U00qb2VULzdvYx",
    priceId: "price_1T20oXL9lVJ44TbR60Ny0vdt",
    priceUSD: 79,
    priceILS: 289,
    label: { en: "Coach", he: "מאמן" },
    description: {
      en: "All Pro features + Coach AI tools & marketplace listing",
      he: "כל פיצ׳רי Pro + כלי AI למאמנים ונוכחות בשוק",
    },
  },
  business: {
    tier: "business",
    productId: "prod_U00oHca1mJzxl1",
    priceId: "price_1T20nDL9lVJ44TbRJh4CiTNn",
    priceUSD: 129,
    priceILS: 469,
    label: { en: "Business", he: "עסקי" },
    description: {
      en: "All Coach features + business hub, website builder & e-commerce",
      he: "כל פיצ׳רי Coach + מרכז עסקי, בניית אתר ואי-קומרס",
    },
  },
};

/** Map Stripe product ID to tier name */
export function productIdToTier(productId: string | null): SubscriptionTier {
  if (!productId) return "free";
  for (const cfg of Object.values(TIER_CONFIGS)) {
    if (cfg.productId === productId) return cfg.tier;
  }
  return "free";
}

/** Tier hierarchy for comparison (higher = more features) */
const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 1,
  coach: 2,
  business: 3,
};

export function tierIncludes(userTier: SubscriptionTier, requiredTier: SubscriptionTier): boolean {
  return TIER_RANK[userTier] >= TIER_RANK[requiredTier];
}

/** Features list for each tier (for UI display) */
export const TIER_FEATURES: Record<SubscriptionTier, { en: string[]; he: string[] }> = {
  free: {
    en: [
      "Dashboard & 90-day plan",
      "5 Aurora messages/day",
      "3 active habits",
      "Basic progress tracking",
    ],
    he: [
      "דאשבורד ותוכנית 90 יום",
      "5 הודעות יומיות לאורורה",
      "3 הרגלים פעילים",
      "מעקב התקדמות בסיסי",
    ],
  },
  pro: {
    en: [
      "Everything in Free",
      "Unlimited Aurora messages",
      "1 personalized AI hypnosis/day",
      "Proactive coaching nudges",
      "Unlimited habits & checklists",
    ],
    he: [
      "הכל מ-Free",
      "הודעות ללא הגבלה לאורורה",
      "היפנוזה AI מותאמת אישית יומית",
      "נאדג׳ים פרואקטיביים",
      "הרגלים ורשימות ללא הגבלה",
    ],
  },
  coach: {
    en: [
      "Everything in Pro",
      "Coach AI Plan Builder",
      "Marketplace listing",
      "Client management tools",
    ],
    he: [
      "הכל מ-Pro",
      "בונה תוכניות AI למאמנים",
      "נוכחות בשוק המאמנים",
      "כלי ניהול לקוחות",
    ],
  },
  business: {
    en: [
      "Everything in Coach",
      "Business hub & analytics",
      "Website builder",
      "E-commerce & Shopify tools",
    ],
    he: [
      "הכל מ-Coach",
      "מרכז עסקי ואנליטיקות",
      "בניית אתר",
      "כלי אי-קומרס ו-Shopify",
    ],
  },
};
