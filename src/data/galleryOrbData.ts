/**
 * galleryOrbData.ts – 1000 unique orb archetypes for the NFT-style gallery.
 * 100 hand-crafted + 900 procedurally generated.
 */
import type { OrbProfile, MaterialType, PatternType, GeometryFamily } from '@/components/orb/types';
import { DEFAULT_ORB_PROFILE } from '@/lib/orbProfileGenerator';
import { ORB_PRESETS } from '@/lib/orbPresets';

function p(overrides: Partial<OrbProfile>): OrbProfile {
  return { ...DEFAULT_ORB_PROFILE, particleEnabled: false, particleCount: 0, ...overrides };
}

export type GlowLevel = 'none' | 'soft' | 'medium' | 'intense' | 'cosmic';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface GalleryOrb {
  id: string;
  nameEn: string;
  nameHe: string;
  descEn: string;
  descHe: string;
  rarity: Rarity;
  traits: {
    material: MaterialType;
    pattern: PatternType;
    geometry: GeometryFamily;
    glow: GlowLevel;
    particles: boolean;
  };
  profile: OrbProfile;
}

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '210 15% 55%',
  uncommon: '140 50% 45%',
  rare: '220 75% 55%',
  epic: '275 70% 55%',
  legendary: '45 90% 55%',
};

export const RARITY_LABELS: Record<Rarity, { en: string; he: string }> = {
  common: { en: 'Common', he: 'נפוץ' },
  uncommon: { en: 'Uncommon', he: 'לא שכיח' },
  rare: { en: 'Rare', he: 'נדיר' },
  epic: { en: 'Epic', he: 'אפי' },
  legendary: { en: 'Legendary', he: 'אגדי' },
};

// Helper to create profiles from hue-based specs
function hueProfile(
  hue: number,
  mat: MaterialType,
  pat: PatternType,
  geo: GeometryFamily,
  intensity: number, // 0-1 overall power level
  opts?: { particles?: boolean; hueSpread?: number }
): OrbProfile {
  const spread = opts?.hueSpread ?? 30;
  const h1 = hue;
  const h2 = (hue + spread) % 360;
  const h3 = (hue + spread * 2) % 360;
  const sat = 40 + intensity * 45;
  const lit = 25 + intensity * 30;

  const metalness = mat === 'metal' ? 0.6 + intensity * 0.3 : mat === 'wire' ? 0.15 : mat === 'iridescent' ? 0.2 + intensity * 0.15 : mat === 'plasma' ? 0.1 : 0.05;
  const roughness = mat === 'metal' ? 0.5 - intensity * 0.3 : mat === 'wire' ? 0.5 : mat === 'glass' ? 0.2 : 0.1;
  const clearcoat = mat === 'glass' ? 0.4 + intensity * 0.5 : mat === 'iridescent' ? 0.6 + intensity * 0.35 : intensity * 0.4;
  const transmission = mat === 'glass' ? 0.2 + intensity * 0.3 : mat === 'plasma' ? 0.15 + intensity * 0.2 : 0;
  const emissive = intensity * 0.45;

  return p({
    materialType: mat,
    gradientMode: intensity > 0.6 ? 'noise' : intensity > 0.3 ? 'radial' : 'vertical',
    patternType: pat,
    geometryFamily: geo,
    bloomStrength: intensity * 0.95,
    chromaShift: intensity * 0.6,
    gradientStops: [
      `${h1} ${sat}% ${lit - 5}%`,
      `${h1} ${sat + 10}% ${lit + 10}%`,
      `${h2} ${sat}% ${lit + 20}%`,
      ...(intensity > 0.5 ? [`${h3} ${sat - 10}% ${lit + 30}%`] : []),
    ],
    coreGradient: [`${h1} ${sat}% ${lit}%`, `${h2} ${sat}% ${lit + 20}%`],
    rimLightColor: `${h3} ${sat - 10}% ${lit + 30}%`,
    primaryColor: `${h1} ${sat + 10}% ${lit + 10}%`,
    secondaryColors: [`${h1} ${sat}% ${lit}%`, `${h2} ${sat}% ${lit + 20}%`],
    accentColor: `${h3} ${sat - 10}% ${lit + 30}%`,
    materialParams: {
      metalness, roughness, clearcoat, transmission,
      ior: 1.3 + intensity * 0.7,
      emissiveIntensity: emissive,
    },
    morphIntensity: 0.1 + intensity * 0.55,
    morphSpeed: 0.2 + intensity * 0.8,
    motionSpeed: 0.3 + intensity * 0.8,
    patternIntensity: 0.1 + intensity * 0.5,
    layerCount: Math.round(1 + intensity * 5),
    coreIntensity: 0.2 + intensity * 0.75,
    particleEnabled: opts?.particles ?? false,
    particleCount: opts?.particles ? Math.round(4 + intensity * 20) : 0,
  });
}

// ─────────────────────────── 100 ORBS ───────────────────────────

const MATERIALS: MaterialType[] = ['glass', 'metal', 'iridescent', 'plasma', 'crystal'];
const PATTERNS: PatternType[] = ['voronoi', 'cellular', 'fractal', 'shards', 'swirl', 'strata'];
const GEOS: GeometryFamily[] = ['sphere', 'dodeca', 'icosa', 'octa', 'torus', 'spiky'];

const HAND_CRAFTED_ORBS: GalleryOrb[] = [
  // ═══════════ 1-10: Original presets ═══════════
  {
    id: 'abyss-glass', nameEn: 'Abyss Glass', nameHe: 'זכוכית התהום',
    descEn: 'Born from deep introspection', descHe: 'נולד מהתבוננות עמוקה',
    rarity: 'rare', traits: { material: 'glass', pattern: 'cellular', geometry: 'sphere', glow: 'medium', particles: false },
    profile: ORB_PRESETS.find(x => x.id === 'abyss-glass')!.profile,
  },
  {
    id: 'solar-metal', nameEn: 'Solar Metal', nameHe: 'מתכת השמש',
    descEn: 'Forged by ambition and drive', descHe: 'מחושל על ידי שאיפה ודחף',
    rarity: 'epic', traits: { material: 'metal', pattern: 'shards', geometry: 'octa', glow: 'soft', particles: false },
    profile: ORB_PRESETS.find(x => x.id === 'solar-metal')!.profile,
  },
  {
    id: 'violet-iridescence', nameEn: 'Violet Iridescence', nameHe: 'זוהר סגול',
    descEn: 'Reflects creative vision', descHe: 'משקף חזון יצירתי',
    rarity: 'legendary', traits: { material: 'iridescent', pattern: 'voronoi', geometry: 'dodeca', glow: 'cosmic', particles: true },
    profile: ORB_PRESETS.find(x => x.id === 'violet-iridescence')!.profile,
  },
  {
    id: 'jade-nexus', nameEn: 'Jade Nexus', nameHe: 'נקודת הירקן',
    descEn: 'Crystalline core of growth', descHe: 'ליבה קריסטלית של צמיחה',
    rarity: 'rare', traits: { material: 'glass', pattern: 'swirl', geometry: 'spiky', glow: 'medium', particles: false },
    profile: ORB_PRESETS.find(x => x.id === 'jade-nexus')!.profile,
  },
  {
    id: 'arctic-stone', nameEn: 'Arctic Stone', nameHe: 'אבן ארקטית',
    descEn: 'Quiet resilience carved from patience', descHe: 'חוסן שקט שנחצב מסבלנות',
    rarity: 'common', traits: { material: 'metal', pattern: 'strata', geometry: 'icosa', glow: 'none', particles: false },
    profile: ORB_PRESETS.find(x => x.id === 'arctic-stone')!.profile,
  },
  {
    id: 'midnight-prism', nameEn: 'Midnight Prism', nameHe: 'פריזמת חצות',
    descEn: 'Refracts hidden dimensions', descHe: 'שובר ממדים נסתרים',
    rarity: 'epic', traits: { material: 'iridescent', pattern: 'fractal', geometry: 'torus', glow: 'intense', particles: false },
    profile: ORB_PRESETS.find(x => x.id === 'midnight-prism')!.profile,
  },
  {
    id: 'rose-quartz', nameEn: 'Rose Quartz', nameHe: 'קוורץ ורוד',
    descEn: 'Gentle power of empathy', descHe: 'כוח עדין של אמפתיה',
    rarity: 'uncommon', traits: { material: 'glass', pattern: 'voronoi', geometry: 'sphere', glow: 'soft', particles: false },
    profile: ORB_PRESETS.find(x => x.id === 'rose-quartz')!.profile,
  },
  {
    id: 'obsidian-edge', nameEn: 'Obsidian Edge', nameHe: 'קצה אובסידיאן',
    descEn: 'The edge of raw potential', descHe: 'הקצה של פוטנציאל גולמי',
    rarity: 'uncommon', traits: { material: 'obsidian', pattern: 'shards', geometry: 'octa', glow: 'none', particles: false },
    profile: hueProfile(270, 'obsidian', 'shards', 'octa', 0.35),
  },
  {
    id: 'aurora-skin', nameEn: 'Aurora Skin', nameHe: 'עור אורורה',
    descEn: 'Ever-shifting like northern lights', descHe: 'משתנה כמו הזוהר הצפוני',
    rarity: 'legendary', traits: { material: 'iridescent', pattern: 'cellular', geometry: 'dodeca', glow: 'cosmic', particles: true },
    profile: ORB_PRESETS.find(x => x.id === 'aurora-skin')!.profile,
  },
  {
    id: 'sunset-marble', nameEn: 'Sunset Marble', nameHe: 'שיש שקיעה',
    descEn: 'Warmth of experience etched in stone', descHe: 'חום הניסיון חרוט באבן',
    rarity: 'rare', traits: { material: 'metal', pattern: 'strata', geometry: 'icosa', glow: 'soft', particles: false },
    profile: ORB_PRESETS.find(x => x.id === 'sunset-marble')!.profile,
  },

  // ═══════════ 11-20: Plasma & Plasma variants ═══════════
  {
    id: 'phantom-plasma', nameEn: 'Phantom Plasma', nameHe: 'פלזמת רוח',
    descEn: 'Ethereal energy from beyond', descHe: 'אנרגיה אתרית מעבר למסך',
    rarity: 'epic', traits: { material: 'plasma', pattern: 'fractal', geometry: 'sphere', glow: 'intense', particles: true },
    profile: hueProfile(200, 'plasma', 'fractal', 'sphere', 0.85, { particles: true }),
  },
  {
    id: 'crimson-forge', nameEn: 'Crimson Forge', nameHe: 'כור ארגמן',
    descEn: 'Tempered in fire, unbreakable will', descHe: 'מחושל באש, רצון בלתי שביר',
    rarity: 'rare', traits: { material: 'metal', pattern: 'shards', geometry: 'spiky', glow: 'medium', particles: false },
    profile: hueProfile(5, 'metal', 'shards', 'spiky', 0.6),
  },
  {
    id: 'void-crystal', nameEn: 'Void Crystal', nameHe: 'קריסטל ריק',
    descEn: 'The silence between thoughts', descHe: 'השקט שבין המחשבות',
    rarity: 'uncommon', traits: { material: 'glass', pattern: 'fractal', geometry: 'dodeca', glow: 'soft', particles: false },
    profile: hueProfile(250, 'glass', 'fractal', 'dodeca', 0.3),
  },
  {
    id: 'neon-pulse', nameEn: 'Neon Pulse', nameHe: 'פולס ניאון',
    descEn: 'Electric current through digital veins', descHe: 'זרם חשמלי בוורידים דיגיטליים',
    rarity: 'rare', traits: { material: 'plasma', pattern: 'cellular', geometry: 'torus', glow: 'intense', particles: true },
    profile: hueProfile(165, 'plasma', 'cellular', 'torus', 0.75, { particles: true }),
  },
  {
    id: 'desert-ember', nameEn: 'Desert Ember', nameHe: 'גחלת מדבר',
    descEn: 'Ancient warmth buried in sand', descHe: 'חום עתיק טמון בחול',
    rarity: 'common', traits: { material: 'metal', pattern: 'strata', geometry: 'sphere', glow: 'none', particles: false },
    profile: hueProfile(30, 'metal', 'strata', 'sphere', 0.15),
  },
  {
    id: 'nebula-heart', nameEn: 'Nebula Heart', nameHe: 'לב ערפילית',
    descEn: 'A star nursery lives within', descHe: 'חממת כוכבים חיה בפנים',
    rarity: 'legendary', traits: { material: 'plasma', pattern: 'swirl', geometry: 'spiky', glow: 'cosmic', particles: true },
    profile: hueProfile(335, 'plasma', 'swirl', 'spiky', 0.95, { particles: true, hueSpread: 40 }),
  },
  {
    id: 'frozen-crystal', nameEn: 'Frozen Crystal', nameHe: 'קריסטל קפוא',
    descEn: 'Structure laid bare — raw potential', descHe: 'מבנה חשוף — פוטנציאל גולמי',
    rarity: 'common', traits: { material: 'ice', pattern: 'shards', geometry: 'icosa', glow: 'none', particles: false },
    profile: hueProfile(205, 'ice', 'shards', 'icosa', 0.1),
  },
  {
    id: 'emerald-swirl', nameEn: 'Emerald Swirl', nameHe: 'מערבולת אזמרגד',
    descEn: 'Nature\'s spiral — growth unbound', descHe: 'ספירלת הטבע — צמיחה ללא גבולות',
    rarity: 'uncommon', traits: { material: 'glass', pattern: 'swirl', geometry: 'sphere', glow: 'soft', particles: false },
    profile: hueProfile(150, 'glass', 'swirl', 'sphere', 0.35),
  },
  {
    id: 'blood-diamond', nameEn: 'Blood Diamond', nameHe: 'יהלום דם',
    descEn: 'Pressure creates perfection', descHe: 'הלחץ יוצר שלמות',
    rarity: 'epic', traits: { material: 'glass', pattern: 'shards', geometry: 'dodeca', glow: 'intense', particles: false },
    profile: hueProfile(355, 'glass', 'shards', 'dodeca', 0.8),
  },
  {
    id: 'storm-cell', nameEn: 'Storm Cell', nameHe: 'תא סערה',
    descEn: 'Chaos contained within order', descHe: 'כאוס כלוא בתוך סדר',
    rarity: 'rare', traits: { material: 'plasma', pattern: 'cellular', geometry: 'octa', glow: 'medium', particles: true },
    profile: hueProfile(220, 'plasma', 'cellular', 'octa', 0.65, { particles: true }),
  },

  // ═══════════ 21-30: Metal & Earth ═══════════
  {
    id: 'iron-lotus', nameEn: 'Iron Lotus', nameHe: 'לוטוס ברזל',
    descEn: 'Strength blooming from discipline', descHe: 'כוח שפורח ממשמעת',
    rarity: 'uncommon', traits: { material: 'metal', pattern: 'swirl', geometry: 'dodeca', glow: 'soft', particles: false },
    profile: hueProfile(0, 'metal', 'swirl', 'dodeca', 0.4),
  },
  {
    id: 'titanium-shell', nameEn: 'Titanium Shell', nameHe: 'קליפת טיטניום',
    descEn: 'Impenetrable outer defense', descHe: 'הגנה חיצונית בלתי חדירה',
    rarity: 'common', traits: { material: 'metal', pattern: 'cellular', geometry: 'sphere', glow: 'none', particles: false },
    profile: hueProfile(215, 'metal', 'cellular', 'sphere', 0.2),
  },
  {
    id: 'bronze-sentinel', nameEn: 'Bronze Sentinel', nameHe: 'זקיף ארד',
    descEn: 'Guardian of ancient wisdom', descHe: 'שומר חוכמה עתיקה',
    rarity: 'uncommon', traits: { material: 'metal', pattern: 'fractal', geometry: 'icosa', glow: 'soft', particles: false },
    profile: hueProfile(35, 'metal', 'fractal', 'icosa', 0.35),
  },
  {
    id: 'molten-core', nameEn: 'Molten Core', nameHe: 'ליבה מותכת',
    descEn: 'The planet\'s burning heart', descHe: 'הלב הבוער של כוכב הלכת',
    rarity: 'epic', traits: { material: 'metal', pattern: 'voronoi', geometry: 'spiky', glow: 'intense', particles: true },
    profile: hueProfile(15, 'metal', 'voronoi', 'spiky', 0.82, { particles: true }),
  },
  {
    id: 'copper-patina', nameEn: 'Copper Patina', nameHe: 'פטינה נחושת',
    descEn: 'Time reveals true beauty', descHe: 'הזמן חושף יופי אמיתי',
    rarity: 'common', traits: { material: 'metal', pattern: 'strata', geometry: 'torus', glow: 'none', particles: false },
    profile: hueProfile(170, 'metal', 'strata', 'torus', 0.18),
  },
  {
    id: 'platinum-echo', nameEn: 'Platinum Echo', nameHe: 'הד פלטינום',
    descEn: 'Reflects everything, absorbs nothing', descHe: 'משקף הכל, סופג כלום',
    rarity: 'rare', traits: { material: 'metal', pattern: 'shards', geometry: 'dodeca', glow: 'medium', particles: false },
    profile: hueProfile(240, 'metal', 'shards', 'dodeca', 0.55),
  },
  {
    id: 'rust-prophet', nameEn: 'Rust Prophet', nameHe: 'נביא החלודה',
    descEn: 'Decay teaches renewal', descHe: 'הריקבון מלמד התחדשות',
    rarity: 'common', traits: { material: 'metal', pattern: 'cellular', geometry: 'octa', glow: 'none', particles: false },
    profile: hueProfile(20, 'metal', 'cellular', 'octa', 0.12),
  },
  {
    id: 'gold-sovereign', nameEn: 'Gold Sovereign', nameHe: 'ריבון הזהב',
    descEn: 'Rules with radiant authority', descHe: 'שולט בסמכות זוהרת',
    rarity: 'legendary', traits: { material: 'metal', pattern: 'voronoi', geometry: 'dodeca', glow: 'cosmic', particles: true },
    profile: hueProfile(45, 'metal', 'voronoi', 'dodeca', 0.95, { particles: true }),
  },
  {
    id: 'mercury-flux', nameEn: 'Mercury Flux', nameHe: 'שטף כספית',
    descEn: 'Liquid metal in constant motion', descHe: 'מתכת נוזלית בתנועה מתמדת',
    rarity: 'rare', traits: { material: 'metal', pattern: 'swirl', geometry: 'sphere', glow: 'medium', particles: false },
    profile: hueProfile(200, 'metal', 'swirl', 'sphere', 0.6),
  },
  {
    id: 'steel-nerve', nameEn: 'Steel Nerve', nameHe: 'עצב פלדה',
    descEn: 'Unshakeable under pressure', descHe: 'בלתי ניתן לערעור תחת לחץ',
    rarity: 'uncommon', traits: { material: 'metal', pattern: 'fractal', geometry: 'spiky', glow: 'soft', particles: false },
    profile: hueProfile(210, 'metal', 'fractal', 'spiky', 0.4),
  },

  // ═══════════ 31-40: Glass spectrum ═══════════
  {
    id: 'sapphire-depth', nameEn: 'Sapphire Depth', nameHe: 'עומק ספיר',
    descEn: 'Clarity of the deepest ocean', descHe: 'בהירות האוקיינוס העמוק',
    rarity: 'rare', traits: { material: 'glass', pattern: 'voronoi', geometry: 'icosa', glow: 'medium', particles: false },
    profile: hueProfile(225, 'glass', 'voronoi', 'icosa', 0.6),
  },
  {
    id: 'amber-lens', nameEn: 'Amber Lens', nameHe: 'עדשת ענבר',
    descEn: 'Preserves truth in golden light', descHe: 'משמר אמת באור זהוב',
    rarity: 'uncommon', traits: { material: 'glass', pattern: 'strata', geometry: 'sphere', glow: 'soft', particles: false },
    profile: hueProfile(40, 'glass', 'strata', 'sphere', 0.35),
  },
  {
    id: 'crystal-bloom', nameEn: 'Crystal Bloom', nameHe: 'פריחת קריסטל',
    descEn: 'Fragile beauty, inner strength', descHe: 'יופי שביר, כוח פנימי',
    rarity: 'rare', traits: { material: 'glass', pattern: 'cellular', geometry: 'dodeca', glow: 'medium', particles: false },
    profile: hueProfile(310, 'glass', 'cellular', 'dodeca', 0.55),
  },
  {
    id: 'prism-tear', nameEn: 'Prism Tear', nameHe: 'דמעת פריזמה',
    descEn: 'Light split into emotion', descHe: 'אור שנפרד לרגש',
    rarity: 'epic', traits: { material: 'glass', pattern: 'fractal', geometry: 'torus', glow: 'intense', particles: true },
    profile: hueProfile(280, 'glass', 'fractal', 'torus', 0.78, { particles: true }),
  },
  {
    id: 'sea-glass', nameEn: 'Sea Glass', nameHe: 'זכוכית ים',
    descEn: 'Smoothed by endless tides', descHe: 'מוחלק על ידי גלים אינסופיים',
    rarity: 'common', traits: { material: 'glass', pattern: 'swirl', geometry: 'icosa', glow: 'none', particles: false },
    profile: hueProfile(180, 'glass', 'swirl', 'icosa', 0.2),
  },
  {
    id: 'opal-dream', nameEn: 'Opal Dream', nameHe: 'חלום אופל',
    descEn: 'Every angle reveals new colors', descHe: 'כל זווית חושפת צבעים חדשים',
    rarity: 'epic', traits: { material: 'glass', pattern: 'voronoi', geometry: 'spiky', glow: 'intense', particles: false },
    profile: hueProfile(340, 'glass', 'voronoi', 'spiky', 0.75),
  },
  {
    id: 'glacier-heart', nameEn: 'Glacier Heart', nameHe: 'לב קרחון',
    descEn: 'Frozen beauty, immense power within', descHe: 'יופי קפוא, כוח עצום בפנים',
    rarity: 'uncommon', traits: { material: 'glass', pattern: 'shards', geometry: 'octa', glow: 'soft', particles: false },
    profile: hueProfile(195, 'glass', 'shards', 'octa', 0.38),
  },
  {
    id: 'diamond-dust', nameEn: 'Diamond Dust', nameHe: 'אבקת יהלום',
    descEn: 'Shattered brilliance reassembled', descHe: 'ברק מנותץ שהורכב מחדש',
    rarity: 'legendary', traits: { material: 'glass', pattern: 'shards', geometry: 'dodeca', glow: 'cosmic', particles: true },
    profile: hueProfile(0, 'glass', 'shards', 'dodeca', 0.92, { particles: true, hueSpread: 60 }),
  },
  {
    id: 'aqua-vessel', nameEn: 'Aqua Vessel', nameHe: 'כלי מים',
    descEn: 'Contains the essence of flow', descHe: 'מכיל את מהות הזרימה',
    rarity: 'common', traits: { material: 'glass', pattern: 'cellular', geometry: 'sphere', glow: 'none', particles: false },
    profile: hueProfile(188, 'glass', 'cellular', 'sphere', 0.15),
  },
  {
    id: 'ruby-prism', nameEn: 'Ruby Prism', nameHe: 'פריזמת אודם',
    descEn: 'Passion crystallized into form', descHe: 'תשוקה שהתגבשה לצורה',
    rarity: 'rare', traits: { material: 'glass', pattern: 'fractal', geometry: 'spiky', glow: 'medium', particles: false },
    profile: hueProfile(350, 'glass', 'fractal', 'spiky', 0.58),
  },

  // ═══════════ 41-55: Iridescent ═══════════
  {
    id: 'cosmic-butterfly', nameEn: 'Cosmic Butterfly', nameHe: 'פרפר קוסמי',
    descEn: 'Wings that span galaxies', descHe: 'כנפיים שמתפרשות על פני גלקסיות',
    rarity: 'legendary', traits: { material: 'iridescent', pattern: 'swirl', geometry: 'dodeca', glow: 'cosmic', particles: true },
    profile: hueProfile(290, 'iridescent', 'swirl', 'dodeca', 0.95, { particles: true, hueSpread: 50 }),
  },
  {
    id: 'pearl-wave', nameEn: 'Pearl Wave', nameHe: 'גל פנינה',
    descEn: 'Elegance born from irritation', descHe: 'אלגנטיות שנולדה מגירוי',
    rarity: 'uncommon', traits: { material: 'iridescent', pattern: 'strata', geometry: 'sphere', glow: 'soft', particles: false },
    profile: hueProfile(30, 'iridescent', 'strata', 'sphere', 0.35),
  },
  {
    id: 'rainbow-shell', nameEn: 'Rainbow Shell', nameHe: 'צדף קשת',
    descEn: 'Every color lives in harmony', descHe: 'כל צבע חי בהרמוניה',
    rarity: 'epic', traits: { material: 'iridescent', pattern: 'cellular', geometry: 'icosa', glow: 'intense', particles: false },
    profile: hueProfile(120, 'iridescent', 'cellular', 'icosa', 0.78, { hueSpread: 60 }),
  },
  {
    id: 'oil-slick', nameEn: 'Oil Slick', nameHe: 'כתם שמן',
    descEn: 'Dark beauty in thin films', descHe: 'יופי אפל בשכבות דקות',
    rarity: 'rare', traits: { material: 'iridescent', pattern: 'voronoi', geometry: 'torus', glow: 'medium', particles: false },
    profile: hueProfile(260, 'iridescent', 'voronoi', 'torus', 0.58),
  },
  {
    id: 'morpho-wing', nameEn: 'Morpho Wing', nameHe: 'כנף מורפו',
    descEn: 'Structural color, no pigment needed', descHe: 'צבע מבני, אין צורך בפיגמנט',
    rarity: 'epic', traits: { material: 'iridescent', pattern: 'fractal', geometry: 'spiky', glow: 'intense', particles: true },
    profile: hueProfile(210, 'iridescent', 'fractal', 'spiky', 0.8, { particles: true }),
  },
  {
    id: 'soap-bubble', nameEn: 'Soap Bubble', nameHe: 'בועת סבון',
    descEn: 'Beautiful in its fragility', descHe: 'יפה בשבריריותו',
    rarity: 'common', traits: { material: 'iridescent', pattern: 'cellular', geometry: 'sphere', glow: 'none', particles: false },
    profile: hueProfile(180, 'iridescent', 'cellular', 'sphere', 0.15),
  },
  {
    id: 'abalone-core', nameEn: 'Abalone Core', nameHe: 'ליבת אבלון',
    descEn: 'Ocean\'s secret masterpiece', descHe: 'יצירת המופת הסודית של האוקיינוס',
    rarity: 'rare', traits: { material: 'iridescent', pattern: 'swirl', geometry: 'octa', glow: 'medium', particles: false },
    profile: hueProfile(155, 'iridescent', 'swirl', 'octa', 0.6),
  },
  {
    id: 'hologram-echo', nameEn: 'Hologram Echo', nameHe: 'הד הולוגרמה',
    descEn: 'Reality reflected in light', descHe: 'מציאות שמשתקפת באור',
    rarity: 'epic', traits: { material: 'iridescent', pattern: 'shards', geometry: 'dodeca', glow: 'intense', particles: false },
    profile: hueProfile(300, 'iridescent', 'shards', 'dodeca', 0.75),
  },
  {
    id: 'peacock-throne', nameEn: 'Peacock Throne', nameHe: 'כס הטווס',
    descEn: 'Royalty in every feather', descHe: 'מלכות בכל נוצה',
    rarity: 'legendary', traits: { material: 'iridescent', pattern: 'voronoi', geometry: 'spiky', glow: 'cosmic', particles: true },
    profile: hueProfile(160, 'iridescent', 'voronoi', 'spiky', 0.93, { particles: true, hueSpread: 45 }),
  },
  {
    id: 'aurora-veil', nameEn: 'Aurora Veil', nameHe: 'צעיף אורורה',
    descEn: 'Northern lights captured in glass', descHe: 'הזוהר הצפוני לכוד בזכוכית',
    rarity: 'rare', traits: { material: 'iridescent', pattern: 'strata', geometry: 'icosa', glow: 'medium', particles: false },
    profile: hueProfile(140, 'iridescent', 'strata', 'icosa', 0.55, { hueSpread: 50 }),
  },
  {
    id: 'chameleon-eye', nameEn: 'Chameleon Eye', nameHe: 'עין זיקית',
    descEn: 'Adapts to every environment', descHe: 'מסתגל לכל סביבה',
    rarity: 'uncommon', traits: { material: 'iridescent', pattern: 'fractal', geometry: 'torus', glow: 'soft', particles: false },
    profile: hueProfile(80, 'iridescent', 'fractal', 'torus', 0.38),
  },
  {
    id: 'dragonscale', nameEn: 'Dragonscale', nameHe: 'קשקש דרקון',
    descEn: 'Ancient armor of mythical beasts', descHe: 'שריון עתיק של חיות מיתיות',
    rarity: 'epic', traits: { material: 'iridescent', pattern: 'shards', geometry: 'icosa', glow: 'intense', particles: true },
    profile: hueProfile(25, 'iridescent', 'shards', 'icosa', 0.82, { particles: true }),
  },
  {
    id: 'silk-moon', nameEn: 'Silk Moon', nameHe: 'ירח משי',
    descEn: 'Soft glow of a crescent night', descHe: 'זוהר רך של ליל סהר',
    rarity: 'uncommon', traits: { material: 'iridescent', pattern: 'swirl', geometry: 'sphere', glow: 'soft', particles: false },
    profile: hueProfile(55, 'iridescent', 'swirl', 'sphere', 0.32),
  },
  {
    id: 'stardust-bloom', nameEn: 'Stardust Bloom', nameHe: 'פריחת אבק כוכבים',
    descEn: 'Cosmic pollen of creation', descHe: 'אבקנים קוסמיים של הבריאה',
    rarity: 'legendary', traits: { material: 'iridescent', pattern: 'cellular', geometry: 'dodeca', glow: 'cosmic', particles: true },
    profile: hueProfile(270, 'iridescent', 'cellular', 'dodeca', 0.9, { particles: true }),
  },
  {
    id: 'prism-lotus', nameEn: 'Prism Lotus', nameHe: 'לוטוס פריזמה',
    descEn: 'Enlightenment through refraction', descHe: 'הארה דרך שבירת אור',
    rarity: 'rare', traits: { material: 'iridescent', pattern: 'voronoi', geometry: 'octa', glow: 'medium', particles: false },
    profile: hueProfile(315, 'iridescent', 'voronoi', 'octa', 0.62),
  },

  // ═══════════ 56-70: Plasma variants ═══════════
  {
    id: 'solar-flare', nameEn: 'Solar Flare', nameHe: 'התלקחות שמש',
    descEn: 'Eruption of pure energy', descHe: 'התפרצות של אנרגיה טהורה',
    rarity: 'legendary', traits: { material: 'plasma', pattern: 'voronoi', geometry: 'spiky', glow: 'cosmic', particles: true },
    profile: hueProfile(30, 'plasma', 'voronoi', 'spiky', 0.96, { particles: true }),
  },
  {
    id: 'plasma-vein', nameEn: 'Plasma Vein', nameHe: 'וריד פלזמה',
    descEn: 'Life force made visible', descHe: 'כוח חיים שהפך גלוי',
    rarity: 'rare', traits: { material: 'plasma', pattern: 'cellular', geometry: 'torus', glow: 'medium', particles: false },
    profile: hueProfile(345, 'plasma', 'cellular', 'torus', 0.6),
  },
  {
    id: 'lightning-core', nameEn: 'Lightning Core', nameHe: 'ליבת ברק',
    descEn: 'Captured thunderbolt in stasis', descHe: 'ברק לכוד במצב סטטי',
    rarity: 'epic', traits: { material: 'plasma', pattern: 'shards', geometry: 'octa', glow: 'intense', particles: true },
    profile: hueProfile(55, 'plasma', 'shards', 'octa', 0.82, { particles: true }),
  },
  {
    id: 'aurora-plasma', nameEn: 'Aurora Plasma', nameHe: 'פלזמת אורורה',
    descEn: 'Magnetic field made tangible', descHe: 'שדה מגנטי שהפך מוחשי',
    rarity: 'epic', traits: { material: 'plasma', pattern: 'swirl', geometry: 'dodeca', glow: 'intense', particles: true },
    profile: hueProfile(140, 'plasma', 'swirl', 'dodeca', 0.78, { particles: true, hueSpread: 45 }),
  },
  {
    id: 'bioluminescence', nameEn: 'Bioluminescence', nameHe: 'ביולומינסצנציה',
    descEn: 'Deep-sea light from within', descHe: 'אור ים עמוק מבפנים',
    rarity: 'rare', traits: { material: 'plasma', pattern: 'cellular', geometry: 'sphere', glow: 'medium', particles: false },
    profile: hueProfile(175, 'plasma', 'cellular', 'sphere', 0.55),
  },
  {
    id: 'gamma-burst', nameEn: 'Gamma Burst', nameHe: 'פרץ גמא',
    descEn: 'Universe\'s most violent flash', descHe: 'ההבזק האלים ביותר ביקום',
    rarity: 'legendary', traits: { material: 'plasma', pattern: 'fractal', geometry: 'spiky', glow: 'cosmic', particles: true },
    profile: hueProfile(265, 'plasma', 'fractal', 'spiky', 0.98, { particles: true }),
  },
  {
    id: 'ember-wisp', nameEn: 'Ember Wisp', nameHe: 'רוח גחלים',
    descEn: 'Fading warmth of a dying star', descHe: 'חום דועך של כוכב גוסס',
    rarity: 'uncommon', traits: { material: 'plasma', pattern: 'strata', geometry: 'icosa', glow: 'soft', particles: false },
    profile: hueProfile(15, 'plasma', 'strata', 'icosa', 0.35),
  },
  {
    id: 'ion-sphere', nameEn: 'Ion Sphere', nameHe: 'כדור יונים',
    descEn: 'Charged particles in equilibrium', descHe: 'חלקיקים טעונים בשיווי משקל',
    rarity: 'uncommon', traits: { material: 'plasma', pattern: 'voronoi', geometry: 'sphere', glow: 'soft', particles: false },
    profile: hueProfile(195, 'plasma', 'voronoi', 'sphere', 0.4),
  },
  {
    id: 'plasma-crown', nameEn: 'Plasma Crown', nameHe: 'כתר פלזמה',
    descEn: 'Corona of compressed starlight', descHe: 'עטרה של אור כוכבים דחוס',
    rarity: 'epic', traits: { material: 'plasma', pattern: 'shards', geometry: 'dodeca', glow: 'intense', particles: true },
    profile: hueProfile(50, 'plasma', 'shards', 'dodeca', 0.8, { particles: true }),
  },
  {
    id: 'quasar-seed', nameEn: 'Quasar Seed', nameHe: 'זרע קוואזר',
    descEn: 'Black hole nursery in miniature', descHe: 'חממת חורים שחורים במיניאטורה',
    rarity: 'rare', traits: { material: 'plasma', pattern: 'swirl', geometry: 'torus', glow: 'medium', particles: false },
    profile: hueProfile(285, 'plasma', 'swirl', 'torus', 0.65),
  },
  {
    id: 'fusion-heart', nameEn: 'Fusion Heart', nameHe: 'לב היתוך',
    descEn: 'Atomic fusion in a sphere', descHe: 'היתוך גרעיני בכדור',
    rarity: 'rare', traits: { material: 'plasma', pattern: 'fractal', geometry: 'icosa', glow: 'medium', particles: true },
    profile: hueProfile(45, 'plasma', 'fractal', 'icosa', 0.62, { particles: true }),
  },
  {
    id: 'spirit-flame', nameEn: 'Spirit Flame', nameHe: 'להבת רוח',
    descEn: 'The fire that never burns out', descHe: 'האש שלעולם לא כבה',
    rarity: 'uncommon', traits: { material: 'plasma', pattern: 'strata', geometry: 'octa', glow: 'soft', particles: false },
    profile: hueProfile(10, 'plasma', 'strata', 'octa', 0.38),
  },
  {
    id: 'nova-shell', nameEn: 'Nova Shell', nameHe: 'קליפת נובה',
    descEn: 'Remnant of a stellar explosion', descHe: 'שריד של פיצוץ כוכבי',
    rarity: 'common', traits: { material: 'plasma', pattern: 'cellular', geometry: 'dodeca', glow: 'none', particles: false },
    profile: hueProfile(330, 'plasma', 'cellular', 'dodeca', 0.18),
  },
  {
    id: 'cosmic-ember', nameEn: 'Cosmic Ember', nameHe: 'גחלת קוסמית',
    descEn: 'Last light of a dying galaxy', descHe: 'האור האחרון של גלקסיה גוססת',
    rarity: 'common', traits: { material: 'plasma', pattern: 'voronoi', geometry: 'icosa', glow: 'none', particles: false },
    profile: hueProfile(5, 'plasma', 'voronoi', 'icosa', 0.12),
  },
  {
    id: 'thunder-orb', nameEn: 'Thunder Orb', nameHe: 'כדור רעם',
    descEn: 'Storm energy compressed to a point', descHe: 'אנרגיית סערה דחוסה לנקודה',
    rarity: 'rare', traits: { material: 'plasma', pattern: 'shards', geometry: 'spiky', glow: 'medium', particles: true },
    profile: hueProfile(225, 'plasma', 'shards', 'spiky', 0.68, { particles: true }),
  },

  // ═══════════ 71-85: Wire & structural ═══════════
  {
    id: 'circuit-mind', nameEn: 'Circuit Mind', nameHe: 'מוח מעגלים',
    descEn: 'Logic paths etched in light', descHe: 'נתיבי לוגיקה חרוטים באור',
    rarity: 'rare', traits: { material: 'wire', pattern: 'cellular', geometry: 'dodeca', glow: 'medium', particles: false },
    profile: hueProfile(170, 'wire', 'cellular', 'dodeca', 0.55),
  },
  {
    id: 'web-spinner', nameEn: 'Web Spinner', nameHe: 'טווה רשת',
    descEn: 'Connected threads of reality', descHe: 'חוטים מחוברים של המציאות',
    rarity: 'uncommon', traits: { material: 'wire', pattern: 'voronoi', geometry: 'sphere', glow: 'soft', particles: false },
    profile: hueProfile(280, 'wire', 'voronoi', 'sphere', 0.35),
  },
  {
    id: 'skeleton-key', nameEn: 'Skeleton Key', nameHe: 'מפתח שלד',
    descEn: 'Unlocks any dimension', descHe: 'פותח כל ממד',
    rarity: 'epic', traits: { material: 'wire', pattern: 'fractal', geometry: 'spiky', glow: 'intense', particles: true },
    profile: hueProfile(45, 'wire', 'fractal', 'spiky', 0.78, { particles: true }),
  },
  {
    id: 'cage-star', nameEn: 'Cage Star', nameHe: 'כוכב כלוב',
    descEn: 'Light imprisoned in structure', descHe: 'אור כלוא במבנה',
    rarity: 'rare', traits: { material: 'wire', pattern: 'shards', geometry: 'dodeca', glow: 'medium', particles: false },
    profile: hueProfile(55, 'wire', 'shards', 'dodeca', 0.6),
  },
  {
    id: 'nerve-lattice', nameEn: 'Nerve Lattice', nameHe: 'סריג עצבים',
    descEn: 'Neural pathways made solid', descHe: 'נתיבים עצביים שהפכו מוצקים',
    rarity: 'uncommon', traits: { material: 'wire', pattern: 'cellular', geometry: 'octa', glow: 'soft', particles: false },
    profile: hueProfile(320, 'wire', 'cellular', 'octa', 0.32),
  },
  {
    id: 'digital-ghost', nameEn: 'Digital Ghost', nameHe: 'רוח דיגיטלית',
    descEn: 'Echo in the machine', descHe: 'הד במכונה',
    rarity: 'common', traits: { material: 'wire', pattern: 'strata', geometry: 'sphere', glow: 'none', particles: false },
    profile: hueProfile(240, 'wire', 'strata', 'sphere', 0.12),
  },
  {
    id: 'synapse-web', nameEn: 'Synapse Web', nameHe: 'רשת סינפסות',
    descEn: 'Thoughts made visible', descHe: 'מחשבות שהפכו גלויות',
    rarity: 'epic', traits: { material: 'wire', pattern: 'voronoi', geometry: 'torus', glow: 'intense', particles: true },
    profile: hueProfile(190, 'wire', 'voronoi', 'torus', 0.8, { particles: true }),
  },
  {
    id: 'code-matrix', nameEn: 'Code Matrix', nameHe: 'מטריצת קוד',
    descEn: 'Reality\'s source code exposed', descHe: 'קוד המקור של המציאות נחשף',
    rarity: 'legendary', traits: { material: 'wire', pattern: 'fractal', geometry: 'dodeca', glow: 'cosmic', particles: true },
    profile: hueProfile(130, 'wire', 'fractal', 'dodeca', 0.92, { particles: true }),
  },
  {
    id: 'antenna-array', nameEn: 'Antenna Array', nameHe: 'מערך אנטנות',
    descEn: 'Receiving signals from beyond', descHe: 'קולט אותות ממרחקים',
    rarity: 'uncommon', traits: { material: 'wire', pattern: 'shards', geometry: 'spiky', glow: 'soft', particles: false },
    profile: hueProfile(100, 'wire', 'shards', 'spiky', 0.38),
  },
  {
    id: 'crystal-cage', nameEn: 'Crystal Cage', nameHe: 'כלוב קריסטל',
    descEn: 'Transparent prison of form', descHe: 'כלא שקוף של צורה',
    rarity: 'common', traits: { material: 'wire', pattern: 'fractal', geometry: 'icosa', glow: 'none', particles: false },
    profile: hueProfile(260, 'wire', 'fractal', 'icosa', 0.15),
  },
  {
    id: 'radio-star', nameEn: 'Radio Star', nameHe: 'כוכב רדיו',
    descEn: 'Broadcasting on all frequencies', descHe: 'משדר בכל התדרים',
    rarity: 'rare', traits: { material: 'wire', pattern: 'swirl', geometry: 'octa', glow: 'medium', particles: true },
    profile: hueProfile(35, 'wire', 'swirl', 'octa', 0.58, { particles: true }),
  },
  {
    id: 'ghost-frame', nameEn: 'Ghost Frame', nameHe: 'מסגרת רפאים',
    descEn: 'Barely there, always watching', descHe: 'כמעט לא קיים, תמיד צופה',
    rarity: 'common', traits: { material: 'wire', pattern: 'strata', geometry: 'torus', glow: 'none', particles: false },
    profile: hueProfile(300, 'wire', 'strata', 'torus', 0.08),
  },
  {
    id: 'data-weave', nameEn: 'Data Weave', nameHe: 'אריגת נתונים',
    descEn: 'Information woven into being', descHe: 'מידע ארוג לקיום',
    rarity: 'uncommon', traits: { material: 'wire', pattern: 'voronoi', geometry: 'icosa', glow: 'soft', particles: false },
    profile: hueProfile(70, 'wire', 'voronoi', 'icosa', 0.3),
  },
  {
    id: 'pulse-grid', nameEn: 'Pulse Grid', nameHe: 'רשת פולס',
    descEn: 'Heartbeat of the digital realm', descHe: 'פעימת הלב של העולם הדיגיטלי',
    rarity: 'rare', traits: { material: 'wire', pattern: 'cellular', geometry: 'spiky', glow: 'medium', particles: false },
    profile: hueProfile(350, 'wire', 'cellular', 'spiky', 0.52),
  },
  {
    id: 'quantum-mesh', nameEn: 'Quantum Mesh', nameHe: 'רשת קוונטית',
    descEn: 'Exists in all states simultaneously', descHe: 'קיים בכל המצבים בו-זמנית',
    rarity: 'epic', traits: { material: 'wire', pattern: 'swirl', geometry: 'dodeca', glow: 'intense', particles: true },
    profile: hueProfile(155, 'wire', 'swirl', 'dodeca', 0.76, { particles: true }),
  },

  // ═══════════ 86-100: Cross-material special editions ═══════════
  {
    id: 'shadow-prism', nameEn: 'Shadow Prism', nameHe: 'פריזמת צל',
    descEn: 'Darkness that refracts light', descHe: 'חושך ששובר אור',
    rarity: 'epic', traits: { material: 'glass', pattern: 'shards', geometry: 'torus', glow: 'intense', particles: false },
    profile: hueProfile(270, 'glass', 'shards', 'torus', 0.75),
  },
  {
    id: 'volcanic-glass', nameEn: 'Volcanic Glass', nameHe: 'זכוכית וולקנית',
    descEn: 'Forged in earth\'s belly', descHe: 'מחושל בבטן האדמה',
    rarity: 'uncommon', traits: { material: 'glass', pattern: 'strata', geometry: 'octa', glow: 'soft', particles: false },
    profile: hueProfile(10, 'glass', 'strata', 'octa', 0.4),
  },
  {
    id: 'cyber-chrome', nameEn: 'Cyber Chrome', nameHe: 'כרום סייבר',
    descEn: 'Future reflected in polished steel', descHe: 'העתיד משתקף בפלדה מלוטשת',
    rarity: 'rare', traits: { material: 'metal', pattern: 'fractal', geometry: 'torus', glow: 'medium', particles: false },
    profile: hueProfile(195, 'metal', 'fractal', 'torus', 0.6),
  },
  {
    id: 'terra-core', nameEn: 'Terra Core', nameHe: 'ליבת אדמה',
    descEn: 'Earth\'s magnetic heartbeat', descHe: 'פעימת הלב המגנטית של כדור הארץ',
    rarity: 'uncommon', traits: { material: 'metal', pattern: 'swirl', geometry: 'icosa', glow: 'soft', particles: false },
    profile: hueProfile(120, 'metal', 'swirl', 'icosa', 0.38),
  },
  {
    id: 'star-sapphire', nameEn: 'Star Sapphire', nameHe: 'ספיר כוכב',
    descEn: 'Six-rayed light from ancient depths', descHe: 'אור שש-קרני מעומקים עתיקים',
    rarity: 'legendary', traits: { material: 'glass', pattern: 'voronoi', geometry: 'dodeca', glow: 'cosmic', particles: true },
    profile: hueProfile(230, 'glass', 'voronoi', 'dodeca', 0.9, { particles: true }),
  },
  {
    id: 'dark-matter', nameEn: 'Dark Matter', nameHe: 'חומר אפל',
    descEn: 'The invisible glue of galaxies', descHe: 'הדבק הבלתי נראה של גלקסיות',
    rarity: 'legendary', traits: { material: 'plasma', pattern: 'voronoi', geometry: 'dodeca', glow: 'cosmic', particles: true },
    profile: hueProfile(250, 'plasma', 'voronoi', 'dodeca', 0.95, { particles: true }),
  },
  {
    id: 'crystal-nexus', nameEn: 'Crystal Nexus', nameHe: 'צומת קריסטל',
    descEn: 'Where all energy pathways converge', descHe: 'היכן שכל נתיבי האנרגיה מתכנסים',
    rarity: 'epic', traits: { material: 'glass', pattern: 'cellular', geometry: 'spiky', glow: 'intense', particles: true },
    profile: hueProfile(160, 'glass', 'cellular', 'spiky', 0.8, { particles: true }),
  },
  {
    id: 'ancient-rune', nameEn: 'Ancient Rune', nameHe: 'רונה עתיקה',
    descEn: 'Symbols of forgotten power', descHe: 'סמלים של כוח שנשכח',
    rarity: 'common', traits: { material: 'metal', pattern: 'voronoi', geometry: 'octa', glow: 'none', particles: false },
    profile: hueProfile(25, 'metal', 'voronoi', 'octa', 0.18),
  },
  {
    id: 'ice-shard', nameEn: 'Ice Shard', nameHe: 'רסיס קרח',
    descEn: 'Frozen fragment of absolute zero', descHe: 'רסיס קפוא של אפס מוחלט',
    rarity: 'common', traits: { material: 'glass', pattern: 'shards', geometry: 'icosa', glow: 'none', particles: false },
    profile: hueProfile(200, 'glass', 'shards', 'icosa', 0.15),
  },
  {
    id: 'soul-ember', nameEn: 'Soul Ember', nameHe: 'גחלת נשמה',
    descEn: 'The last spark before transcendence', descHe: 'הניצוץ האחרון לפני ההתעלות',
    rarity: 'rare', traits: { material: 'plasma', pattern: 'swirl', geometry: 'sphere', glow: 'medium', particles: false },
    profile: hueProfile(340, 'plasma', 'swirl', 'sphere', 0.58),
  },
  {
    id: 'genesis-orb', nameEn: 'Genesis Orb', nameHe: 'כדור בראשית',
    descEn: 'The first orb — origin of all', descHe: 'הכדור הראשון — מקור הכל',
    rarity: 'legendary', traits: { material: 'iridescent', pattern: 'fractal', geometry: 'sphere', glow: 'cosmic', particles: true },
    profile: hueProfile(0, 'iridescent', 'fractal', 'sphere', 0.98, { particles: true, hueSpread: 72 }),
  },
  {
    id: 'emerald-throne', nameEn: 'Emerald Throne', nameHe: 'כס אזמרגד',
    descEn: 'Nature\'s crown jewel', descHe: 'יהלום הכתר של הטבע',
    rarity: 'epic', traits: { material: 'metal', pattern: 'cellular', geometry: 'dodeca', glow: 'intense', particles: true },
    profile: hueProfile(140, 'metal', 'cellular', 'dodeca', 0.8, { particles: true }),
  },
  {
    id: 'lunar-tide', nameEn: 'Lunar Tide', nameHe: 'גאות ירח',
    descEn: 'Pulled by invisible gravity', descHe: 'נמשך על ידי כוח משיכה בלתי נראה',
    rarity: 'uncommon', traits: { material: 'glass', pattern: 'swirl', geometry: 'torus', glow: 'soft', particles: false },
    profile: hueProfile(215, 'glass', 'swirl', 'torus', 0.33),
  },
  {
    id: 'gravity-well', nameEn: 'Gravity Well', nameHe: 'באר כבידה',
    descEn: 'Space-time curves around it', descHe: 'מרחב-זמן מתעקם סביבו',
    rarity: 'rare', traits: { material: 'plasma', pattern: 'fractal', geometry: 'torus', glow: 'medium', particles: true },
    profile: hueProfile(280, 'plasma', 'fractal', 'torus', 0.65, { particles: true }),
  },
  {
    id: 'infinity-shard', nameEn: 'Infinity Shard', nameHe: 'רסיס אינסוף',
    descEn: 'A fragment of the infinite', descHe: 'רסיס של האינסוף',
    rarity: 'legendary', traits: { material: 'iridescent', pattern: 'shards', geometry: 'spiky', glow: 'cosmic', particles: true },
    profile: hueProfile(200, 'iridescent', 'shards', 'spiky', 0.96, { particles: true, hueSpread: 55 }),
  },

  // ═══════════ 101-112: New shape showcase ═══════════
  {
    id: 'obsidian-cube', nameEn: 'Obsidian Cube', nameHe: 'קוביית אובסידיאן',
    descEn: 'Perfect order in dark matter', descHe: 'סדר מושלם בחומר אפל',
    rarity: 'rare', traits: { material: 'metal', pattern: 'shards', geometry: 'cube', glow: 'medium', particles: false },
    profile: hueProfile(240, 'metal', 'shards', 'cube', 0.6),
  },
  {
    id: 'crystal-pyramid', nameEn: 'Crystal Pyramid', nameHe: 'פירמידת קריסטל',
    descEn: 'Ancient geometry of power', descHe: 'גיאומטריה עתיקה של כוח',
    rarity: 'epic', traits: { material: 'glass', pattern: 'fractal', geometry: 'tetra', glow: 'intense', particles: true },
    profile: hueProfile(50, 'glass', 'fractal', 'tetra', 0.8, { particles: true }),
  },
  {
    id: 'plasma-cone', nameEn: 'Plasma Cone', nameHe: 'חרוט פלזמה',
    descEn: 'Energy focused to a point', descHe: 'אנרגיה ממוקדת לנקודה',
    rarity: 'rare', traits: { material: 'plasma', pattern: 'swirl', geometry: 'cone', glow: 'medium', particles: false },
    profile: hueProfile(300, 'plasma', 'swirl', 'cone', 0.6),
  },
  {
    id: 'iron-cylinder', nameEn: 'Iron Cylinder', nameHe: 'גליל ברזל',
    descEn: 'Industrial strength, endless rotation', descHe: 'חוזק תעשייתי, סיבוב אינסופי',
    rarity: 'uncommon', traits: { material: 'metal', pattern: 'strata', geometry: 'cylinder', glow: 'soft', particles: false },
    profile: hueProfile(20, 'metal', 'strata', 'cylinder', 0.35),
  },
  {
    id: 'bio-capsule', nameEn: 'Bio Capsule', nameHe: 'קפסולה ביולוגית',
    descEn: 'Life preserved in amber light', descHe: 'חיים שמורים באור ענבר',
    rarity: 'epic', traits: { material: 'iridescent', pattern: 'cellular', geometry: 'capsule', glow: 'intense', particles: true },
    profile: hueProfile(90, 'iridescent', 'cellular', 'capsule', 0.78, { particles: true }),
  },
  {
    id: 'eternal-knot', nameEn: 'Eternal Knot', nameHe: 'קשר נצחי',
    descEn: 'Infinity twisted into form', descHe: 'אינסוף מפותל לצורה',
    rarity: 'legendary', traits: { material: 'iridescent', pattern: 'swirl', geometry: 'knot', glow: 'cosmic', particles: true },
    profile: hueProfile(180, 'iridescent', 'swirl', 'knot', 0.95, { particles: true, hueSpread: 50 }),
  },
  {
    id: 'glass-tetra', nameEn: 'Glass Tetra', nameHe: 'טטרה זכוכית',
    descEn: 'Simplest platonic solid, purest clarity', descHe: 'הגוף הפלטוני הפשוט ביותר',
    rarity: 'common', traits: { material: 'glass', pattern: 'strata', geometry: 'tetra', glow: 'none', particles: false },
    profile: hueProfile(195, 'glass', 'strata', 'tetra', 0.15),
  },
  {
    id: 'neon-cube', nameEn: 'Neon Cube', nameHe: 'קוביית ניאון',
    descEn: 'Digital architecture glowing', descHe: 'ארכיטקטורה דיגיטלית זוהרת',
    rarity: 'rare', traits: { material: 'wire', pattern: 'cellular', geometry: 'cube', glow: 'medium', particles: true },
    profile: hueProfile(160, 'wire', 'cellular', 'cube', 0.62, { particles: true }),
  },
  {
    id: 'fire-cone', nameEn: 'Fire Cone', nameHe: 'חרוט אש',
    descEn: 'Volcano captured in crystal', descHe: 'הר געש לכוד בקריסטל',
    rarity: 'uncommon', traits: { material: 'plasma', pattern: 'voronoi', geometry: 'cone', glow: 'soft', particles: false },
    profile: hueProfile(10, 'plasma', 'voronoi', 'cone', 0.4),
  },
  {
    id: 'chrome-capsule', nameEn: 'Chrome Capsule', nameHe: 'קפסולת כרום',
    descEn: 'Sleek future containment', descHe: 'מיכל עתידני חלק',
    rarity: 'uncommon', traits: { material: 'metal', pattern: 'fractal', geometry: 'capsule', glow: 'soft', particles: false },
    profile: hueProfile(210, 'metal', 'fractal', 'capsule', 0.38),
  },
  {
    id: 'plasma-knot', nameEn: 'Plasma Knot', nameHe: 'קשר פלזמה',
    descEn: 'Magnetic field lines tangled', descHe: 'קווי שדה מגנטי סבוכים',
    rarity: 'epic', traits: { material: 'plasma', pattern: 'fractal', geometry: 'knot', glow: 'intense', particles: true },
    profile: hueProfile(275, 'plasma', 'fractal', 'knot', 0.82, { particles: true }),
  },
  {
    id: 'golden-cylinder', nameEn: 'Golden Cylinder', nameHe: 'גליל זהב',
    descEn: 'Pillar of ancient empires', descHe: 'עמוד של אימפריות עתיקות',
    rarity: 'rare', traits: { material: 'metal', pattern: 'voronoi', geometry: 'cylinder', glow: 'medium', particles: false },
    profile: hueProfile(42, 'metal', 'voronoi', 'cylinder', 0.58),
  },
];

// ─── Merge hand-crafted + generated orbs for 1000 total ───
import { GENERATED_ORBS } from './generatedOrbs';
export const GALLERY_ORBS: GalleryOrb[] = [...HAND_CRAFTED_ORBS, ...GENERATED_ORBS];

/* ─── Trait filter definitions ─── */

export interface TraitCategory {
  key: string;
  labelEn: string;
  labelHe: string;
  options: { value: string; labelEn: string; labelHe: string }[];
}

export const TRAIT_CATEGORIES: TraitCategory[] = [
  {
    key: 'material', labelEn: 'Material', labelHe: 'חומר',
    options: [
      { value: 'glass', labelEn: 'Glass', labelHe: 'זכוכית' },
      { value: 'metal', labelEn: 'Metal', labelHe: 'מתכת' },
      { value: 'iridescent', labelEn: 'Iridescent', labelHe: 'אופלסנט' },
      { value: 'plasma', labelEn: 'Plasma', labelHe: 'פלזמה' },
      { value: 'wire', labelEn: 'Wire', labelHe: 'שלד' },
    ],
  },
  {
    key: 'pattern', labelEn: 'Pattern', labelHe: 'דפוס',
    options: [
      { value: 'voronoi', labelEn: 'Voronoi', labelHe: 'וורונוי' },
      { value: 'cellular', labelEn: 'Cellular', labelHe: 'תאי' },
      { value: 'fractal', labelEn: 'Fractal', labelHe: 'פרקטלי' },
      { value: 'shards', labelEn: 'Shards', labelHe: 'רסיסים' },
      { value: 'swirl', labelEn: 'Swirl', labelHe: 'מערבולת' },
      { value: 'strata', labelEn: 'Strata', labelHe: 'שכבות' },
    ],
  },
  {
    key: 'geometry', labelEn: 'Shape', labelHe: 'צורה',
    options: [
      { value: 'sphere', labelEn: 'Sphere', labelHe: 'כדור' },
      { value: 'dodeca', labelEn: 'Dodeca', labelHe: 'דודקהדרון' },
      { value: 'icosa', labelEn: 'Icosa', labelHe: 'איקוסהדרון' },
      { value: 'octa', labelEn: 'Octa', labelHe: 'אוקטהדרון' },
      { value: 'torus', labelEn: 'Torus', labelHe: 'טורוס' },
      { value: 'spiky', labelEn: 'Spiky', labelHe: 'קוצני' },
      { value: 'tetra', labelEn: 'Tetra', labelHe: 'טטרהדרון' },
      { value: 'cube', labelEn: 'Cube', labelHe: 'קוביה' },
      { value: 'cone', labelEn: 'Cone', labelHe: 'חרוט' },
      { value: 'cylinder', labelEn: 'Cylinder', labelHe: 'גליל' },
      { value: 'capsule', labelEn: 'Capsule', labelHe: 'קפסולה' },
      { value: 'knot', labelEn: 'Knot', labelHe: 'קשר' },
    ],
  },
  {
    key: 'glow', labelEn: 'Glow', labelHe: 'זוהר',
    options: [
      { value: 'none', labelEn: 'None', labelHe: 'ללא' },
      { value: 'soft', labelEn: 'Soft', labelHe: 'רך' },
      { value: 'medium', labelEn: 'Medium', labelHe: 'בינוני' },
      { value: 'intense', labelEn: 'Intense', labelHe: 'אינטנסיבי' },
      { value: 'cosmic', labelEn: 'Cosmic', labelHe: 'קוסמי' },
    ],
  },
  {
    key: 'rarity', labelEn: 'Rarity', labelHe: 'נדירות',
    options: [
      { value: 'common', labelEn: 'Common', labelHe: 'נפוץ' },
      { value: 'uncommon', labelEn: 'Uncommon', labelHe: 'לא שכיח' },
      { value: 'rare', labelEn: 'Rare', labelHe: 'נדיר' },
      { value: 'epic', labelEn: 'Epic', labelHe: 'אפי' },
      { value: 'legendary', labelEn: 'Legendary', labelHe: 'אגדי' },
    ],
  },
  {
    key: 'particles', labelEn: 'Particles', labelHe: 'חלקיקים',
    options: [
      { value: 'true', labelEn: 'Yes', labelHe: 'כן' },
      { value: 'false', labelEn: 'No', labelHe: 'לא' },
    ],
  },
];
