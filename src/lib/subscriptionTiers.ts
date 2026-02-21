/**
 * Subscription Tier Configuration
 * Central source of truth for all tier-related data
 * Tiers: Free (Awakening) → Plus (Optimization) → Apex (Command)
 * 
 * Philosophy:
 *   Free  = Self Awareness
 *   Plus  = Self Optimization
 *   Apex  = Self Mastery + Execution Power
 */

export type SubscriptionTier = "free" | "plus" | "apex";

export interface TierConfig {
  tier: SubscriptionTier;
  productId: string | null;
  priceId: string | null;
  priceUSD: number;
  priceILS: number;
  label: { en: string; he: string };
  subtitle: { en: string; he: string };
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
    label: { en: "Awakening", he: "התעוררות" },
    subtitle: { en: "Self Awareness", he: "מודעות עצמית" },
    description: {
      en: "See your life clearly. Core assessments, daily structure & Aurora basics",
      he: "ראה את חייך בבהירות. אבחונים, מבנה יומי ואורורה בסיסית",
    },
  },
  plus: {
    tier: "plus",
    productId: "prod_U12Wn9F03FrDpf",
    priceId: "price_1T30RDL9lVJ44TbRPRLAICE8",
    priceUSD: 69,
    priceILS: 249,
    label: { en: "Plus", he: "Plus" },
    subtitle: { en: "Self Optimization", he: "אופטימיזציה עצמית" },
    description: {
      en: "Full pillars, unlimited Aurora, AI hypnosis, proactive coaching & Arena",
      he: "כל הפילרים, אורורה ללא הגבלה, היפנוזה AI, אימון פרואקטיבי וזירה",
    },
    trial: 7,
  },
  apex: {
    tier: "apex",
    productId: "prod_U12iPHqxPjZmYN",
    priceId: "price_1T30dML9lVJ44TbRYgjf56K9",
    priceUSD: 199,
    priceILS: 749,
    label: { en: "Apex", he: "Apex" },
    subtitle: { en: "Self Mastery + Execution Power", he: "שליטה עצמית + כוח ביצוע" },
    description: {
      en: "Full proactive intelligence, Projects, Business Advanced & Orb DNA",
      he: "אינטליגנציה פרואקטיבית מלאה, פרויקטים, עסקים מתקדם ו-Orb DNA",
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
  apex: 2,
};

export function tierIncludes(userTier: SubscriptionTier, requiredTier: SubscriptionTier): boolean {
  return TIER_RANK[userTier] >= TIER_RANK[requiredTier];
}

/** Features list for each tier (for UI display) */
export const TIER_FEATURES: Record<SubscriptionTier, { en: string[]; he: string[] }> = {
  free: {
    en: [
      "7 Core pillar assessments (incl. Consciousness)",
      "Dashboard & 90-day overview",
      "5 Aurora messages/day",
      "3 active habits",
      "XP, leveling & streaks",
      "Basic Orb",
      "Arena overview (view-only)",
    ],
    he: [
      "7 אבחוני ליבה (כולל תודעה)",
      "דאשבורד וסקירת 90 יום",
      "5 הודעות יומיות לאורורה",
      "3 הרגלים פעילים",
      "XP, רמות ורצפים",
      "אורב בסיסי",
      "סקירת זירה (צפייה בלבד)",
    ],
  },
  plus: {
    en: [
      "Everything in Awakening",
      "Full 7 Core pillars + 6 Arena pillars",
      "Unlimited Aurora with memory",
      "AI hypnosis & daily scripts",
      "Basic proactive nudges",
      "Full Arena access",
      "Business module (basic)",
      "Full 90-day plan + recalibration",
      "Unlimited habits & checklists",
      "Community & leaderboards",
    ],
    he: [
      "הכל מ-Awakening",
      "7 פילרי ליבה + 6 פילרי זירה",
      "אורורה ללא הגבלה עם זיכרון",
      "היפנוזה AI ותסריטים יומיים",
      "נאדג׳ים פרואקטיביים בסיסיים",
      "גישה מלאה לזירה",
      "מודול עסקים (בסיסי)",
      "תוכנית 90 יום מלאה + כיול מחדש",
      "הרגלים ורשימות ללא הגבלה",
      "קהילה ולוחות מובילים",
    ],
  },
  apex: {
    en: [
      "Everything in Plus",
      "Full proactive intelligence engine",
      "Morning briefings & mid-day checks",
      "Behavioral pattern & energy modeling",
      "Action auto-execution trust system",
      "Push notifications",
      "Unlimited Projects (full ERP)",
      "Business Advanced + AI plans",
      "Full Orb DNA (70-variable profile)",
      "Consciousness Leap access",
    ],
    he: [
      "הכל מ-Plus",
      "מנוע אינטליגנציה פרואקטיבית מלא",
      "תדרוכי בוקר ובדיקות אמצע יום",
      "מודלינג דפוסים התנהגותיים ואנרגיה",
      "מערכת ביצוע אוטונומי",
      "התראות פוש",
      "פרויקטים ללא הגבלה (ERP מלא)",
      "עסקים מתקדם + תוכניות AI",
      "Orb DNA מלא (70 משתנים)",
      "גישה לקפיצת תודעה",
    ],
  },
};
