/**
 * Subscription Tier Configuration
 * Central source of truth for all tier-related data
 * Tiers: Free → Plus → Pro
 */

export type SubscriptionTier = "free" | "plus" | "pro";

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
  plus: {
    tier: "plus",
    productId: "prod_U0uQqUiCnxGgpB",
    priceId: "price_1T2sbYL9lVJ44TbRzI0K3mzx",
    priceUSD: 49,
    priceILS: 149,
    label: { en: "Plus", he: "Plus" },
    description: {
      en: "Unlimited Aurora, daily AI hypnosis, proactive coaching",
      he: "אורורה ללא הגבלה, היפנוזה AI יומית, אימון פרואקטיבי",
    },
    trial: 7,
  },
  pro: {
    tier: "pro",
    productId: "prod_U0tv7nZ9CPMMgt",
    priceId: "price_1T2s7ZL9lVJ44TbRrZhs4rA5",
    priceUSD: 150,
    priceILS: 549,
    label: { en: "Pro", he: "Pro" },
    description: {
      en: "Everything in Plus + Core, Arena, Projects & advanced tools",
      he: "הכל מ-Plus + ליבה, זירה, פרויקטים וכלים מתקדמים",
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
  plus: 1,
  pro: 2,
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
    ],
    he: [
      "דאשבורד ותוכנית 90 יום",
      "5 הודעות יומיות לאורורה",
      "3 הרגלים פעילים",
    ],
  },
  plus: {
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
  pro: {
    en: [
      "Everything in Plus",
      "Core hub (6 development pillars)",
      "Arena hub (Wealth, Influence, Relationships)",
      "Projects module",
      "Advanced AI coaching & analysis",
      "Full Life OS access",
    ],
    he: [
      "הכל מ-Plus",
      "ליבה (6 עמודי פיתוח)",
      "זירה (עושר, השפעה, קשרים)",
      "מודול פרויקטים",
      "אימון AI מתקדם וניתוח",
      "גישה מלאה ל-Life OS",
    ],
  },
};
