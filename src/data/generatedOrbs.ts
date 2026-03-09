/**
 * generatedOrbs.ts — Procedurally generates 900 unique orbs to fill the 1000-orb collection.
 * Uses deterministic seeded random for consistent results across renders.
 */
import type { OrbProfile, MaterialType, PatternType, GeometryFamily } from '@/components/orb/types';
import { DEFAULT_ORB_PROFILE } from '@/lib/orbProfileGenerator';
import type { GalleryOrb, GlowLevel, Rarity } from './galleryOrbData';

function p(overrides: Partial<OrbProfile>): OrbProfile {
  return { ...DEFAULT_ORB_PROFILE, particleEnabled: false, particleCount: 0, ...overrides };
}

// ─── Seeded PRNG (mulberry32) ───
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ─── Name pools ───
const ADJ_EN = [
  'Ancient','Astral','Blazing','Bright','Burning','Calm','Celestial','Chaotic','Chromatic','Clouded',
  'Cold','Coral','Cosmic','Crimson','Crystal','Cursed','Dark','Dawn','Deep','Dire',
  'Divine','Dream','Dusk','Dusty','Echo','Elder','Electric','Ember','Enchanted','Eternal',
  'Ethereal','Fallen','Feral','Fierce','Fire','Flickering','Floating','Fog','Forged','Fractal',
  'Frozen','Fused','Galactic','Ghost','Gilded','Glacial','Glitch','Glow','Golden','Granite',
  'Grim','Haze','Hollow','Holy','Hyper','Ice','Infernal','Inner','Iron','Ivory',
  'Jade','Jeweled','Keen','Kinetic','Lava','Light','Liquid','Living','Lost','Lucid',
  'Lunar','Lurking','Magma','Magnetic','Malachite','Marble','Mellow','Mercurial','Midnight','Mist',
  'Molten','Moon','Moss','Mystic','Nether','Night','Noble','Nova','Null','Obsidian',
  'Opal','Orbital','Pale','Pearl','Phantom','Phase','Pixel','Polar','Primal','Prime',
  'Prismatic','Pulse','Pure','Quantum','Quartz','Radiant','Raging','Raw','Relic','Rift',
  'Ripple','Rising','Rogue','Rune','Rust','Sacred','Sage','Sand','Satin','Savage',
  'Scarlet','Shadow','Shattered','Shell','Shifting','Silent','Silver','Slate','Smoke','Solar',
  'Sonic','Soul','Spark','Spectral','Spiral','Spirit','Stardust','Static','Steam','Steel',
  'Stone','Storm','Stray','Sublime','Sun','Surge','Swift','Tempest','Thorn','Thunder',
  'Tidal','Titan','Topaz','Toxic','Twilight','Umbra','Vapor','Veil','Velvet','Venom',
  'Verdant','Violet','Vivid','Void','Volcanic','Warp','Whisper','Wild','Winding','Winter',
  'Wisp','Wraith','Woven','Zenith','Zero','Zephyr','Zodiac','Arcane','Ashen','Binary',
];

const NOUN_EN = [
  'Abyss','Aegis','Anchor','Arc','Aria','Armor','Atlas','Atom','Aura','Axis',
  'Bastion','Beacon','Blade','Bloom','Bolt','Bond','Borne','Breath','Brim','Bulwark',
  'Cairn','Cascade','Cell','Chalice','Cipher','Circuit','Citadel','Claw','Cloud','Coil',
  'Compass','Core','Corona','Cradle','Crest','Crown','Crucible','Crypt','Cube','Current',
  'Dagger','Dawn','Depths','Dome','Drift','Droplet','Dust','Echo','Edge','Effigy',
  'Element','Ember','Engine','Enigma','Epoch','Essence','Eye','Facet','Fang','Fate',
  'Filament','Flame','Flare','Flux','Focus','Force','Forge','Form','Fragment','Frame',
  'Fury','Gate','Gaze','Gem','Genesis','Ghost','Glyph','Grain','Guardian','Halo',
  'Harbinger','Haven','Heart','Helix','Herald','Hive','Hollow','Horizon','Horn','Hymn',
  'Icon','Idol','Index','Ingot','Iris','Isle','Jewel','Karma','Keeper','Key',
  'Knot','Lance','Lattice','Lens','Light','Link','Locus','Loop','Lore','Mantle',
  'Mark','Matrix','Maw','Maze','Medallion','Membrane','Mirror','Mist','Monolith','Moon',
  'Moraine','Myth','Nebula','Nerve','Nexus','Node','Nucleus','Oasis','Omen','Opus',
  'Oracle','Orbit','Origin','Paradox','Path','Pearl','Pendulum','Petal','Pillar','Pinnacle',
  'Plasma','Plume','Point','Portal','Prism','Prophecy','Pulse','Pyre','Quasar','Radiance',
  'Realm','Relic','Remnant','Resonance','Ridge','Ring','Ripple','Root','Rune','Sage',
  'Sanctum','Scepter','Seed','Sentinel','Shade','Shard','Shell','Shield','Sigil','Signal',
  'Silk','Skull','Sliver','Smoke','Solace','Spark','Spear','Spectre','Sphere','Spike',
  'Spine','Spiral','Splinter','Spore','Star','Stem','Stone','Storm','Strand','Surge',
  'Talisman','Tear','Temple','Tendril','Terrace','Thread','Throne','Tide','Token','Tomb',
  'Totem','Tower','Trace','Trident','Trinket','Tusk','Umbra','Urn','Vale','Vault',
  'Vein','Verse','Vertex','Vestige','Vial','Vine','Vortex','Wake','Ward','Warden',
  'Wave','Web','Whisper','Wisp','Wraith','Wyrm','Zenith','Zone',
];

const ADJ_HE = [
  'עתיק','אסטרלי','בוער','בהיר','לוהט','שקט','שמימי','כאוטי','כרומטי','מעונן',
  'קר','אלמוגי','קוסמי','ארגמני','קריסטלי','מקולל','חשוך','שחרי','עמוק','איום',
  'אלוהי','חלומי','דמדומי','מאובק','הד','קדמון','חשמלי','גחלתי','קסום','נצחי',
  'אתרי','נופל','פראי','עז','אשי','מהבהב','מרחף','ערפלי','מחושל','פרקטלי',
  'קפוא','מותך','גלקטי','רוחני','מוזהב','קרחוני','תקלתי','זוהר','זהוב','גרניטי',
  'קודר','ערפילי','חלול','קדוש','מוגבר','קרחי','תופתי','פנימי','ברזלי','שנהבי',
  'ירקני','משובץ','חד','קינטי','לבתי','אורי','נוזלי','חי','אבוד','צלול',
  'ירחי','אורב','מגמתי','מגנטי','מלכיטי','שיישי','רך','כספתי','חצותי','אדי',
  'מותך','ירחי','ירוק','מיסטי','תחתוני','לילי','אציל','נובתי','אפסי','אובסידי',
  'אופלי','מסלולי','חיוור','פנינתי','רפאימי','פאזי','פיקסלי','קוטבי','קדמוני','ראשוני',
  'פריזמתי','פועם','טהור','קוונטי','קוורצי','קורן','סוער','גולמי','שריד','סדקי',
  'אדווה','עולה','נוכל','רוני','חלוד','מקודש','חכם','חולי','סאטן','פרא',
  'שני','צלי','מנופץ','קליפתי','משתנה','דומם','כסוף','צפחה','עשני','שמשי',
  'צלילי','נשמתי','ניצוצי','ספקטרלי','ספירלי','רוחי','אבק כוכבים','סטטי','קיטורי','פלדתי',
  'אבני','סערתי','תועה','נשגב','שמשי','גל','מהיר','סערה','קוצני','רעמי',
  'גאותי','טיטני','טופזי','רעיל','בין ערביים','צל','אדי','רעלה','קטיפתי','ארסי',
  'ירוק עד','סגול','חי','ריק','געשי','עיוות','לחש','פרא','מתפתל','חורפי',
  'להבתי','רוח רפאים','ארוג','שיא','אפס','רוח','גלגלי','ארקני','אפרי','בינארי',
];

const NOUN_HE = [
  'תהום','מגן','עוגן','קשת','אריה','שריון','אטלס','אטום','הילה','ציר',
  'מבצר','מגדלור','להב','פריחה','ברק','קשר','נושא','נשימה','שפה','חומה',
  'גל','מפל','תא','גביע','צופן','מעגל','מצודה','טופר','ענן','סליל',
  'מצפן','ליבה','עטרת שמש','עריסה','פסגה','כתר','כור','מרתף','קוביה','זרם',
  'פגיון','שחר','מעמקים','כיפה','סחף','טיפה','אבק','הד','קצה','דמות',
  'יסוד','גחלת','מנוע','חידה','עידן','מהות','עין','פן','ניב','גורל',
  'חוט','להבה','התלקחות','שטף','מוקד','כוח','כור','צורה','שבר','מסגרת',
  'זעם','שער','מבט','אבן חן','בראשית','רוח','סמל','גרגר','שומר','הילה',
  'מבשר','מפלט','לב','סליל','כרוז','כוורת','חלל','אופק','קרן','המנון',
  'סמל','פסל','מפתח','מטיל','קשתית','אי','תכשיט','קארמה','שומר','מפתח',
  'קשר','חנית','סריג','עדשה','אור','חוליה','מוקד','לולאה','מסורת','מעטה',
  'סימן','מטריצה','לוע','מבוך','מדליון','קרום','מראה','ערפל','מצבה','ירח',
  'מורן','מיתוס','ערפילית','עצב','צומת','נקודה','גרעין','נווה','אות','יצירה',
  'נביא','מסלול','מקור','פרדוקס','שביל','פנינה','מטוטלת','עלה כותרת','עמוד','פסגה',
  'פלזמה','נוצה','נקודה','פורטל','פריזמה','נבואה','דופק','מדורה','קוואזר','זוהר',
  'ממלכה','שריד','שארית','תהודה','רכס','טבעת','אדווה','שורש','רונה','חכם',
  'מקדש','שרביט','זרע','זקיף','צל','רסיס','קליפה','מגן','חותם','אות',
  'משי','גולגולת','שבב','עשן','נחמה','ניצוץ','חנית','מראה','כדור','קוץ',
  'עמוד שדרה','ספירלה','רסיס','נבג','כוכב','גבעול','אבן','סערה','גדיל','גל',
  'קמע','דמעה','מקדש','קרן','מרפסת','חוט','כס','גאות','אסימון','קבר',
  'טוטם','מגדל','עקבה','קלשון','תכשיט','שן','צל','כד','עמק','כספת',
  'וריד','פסוק','קודקוד','שארית','צנצנת','גפן','מערבולת','גל','משמר','שומר',
  'גל','רשת','לחש','להבה','רוח','תולעת','שיא','אזור',
];

const DESC_TEMPLATES_EN = [
  'Born from the {adj} depths',
  'Whispers of {adj} power within',
  'Shaped by {adj} forces',
  'Resonates with {adj} energy',
  'Forged in {adj} silence',
  'Echoes of the {adj} realm',
  'Pulsing with {adj} light',
  'Carved from {adj} essence',
  'A {adj} artifact reborn',
  'Channels {adj} frequencies',
  'Harbors {adj} potential',
  'Crystallized from {adj} dreams',
  'Radiates {adj} harmony',
  'Contains {adj} chaos',
  'Distilled from {adj} matter',
];

const DESC_TEMPLATES_HE = [
  'נולד ממעמקים {adj}',
  'לחישות של כוח {adj}',
  'עוצב על ידי כוחות {adj}',
  'מהדהד עם אנרגיה {adj}',
  'מחושל בשקט {adj}',
  'הדי הממלכה ה{adj}',
  'פועם באור {adj}',
  'חצוב ממהות {adj}',
  'חפץ {adj} שנולד מחדש',
  'מתעל תדרים {adj}',
  'מכיל פוטנציאל {adj}',
  'מגובש מחלומות {adj}',
  'מקרין הרמוניה {adj}',
  'מכיל כאוס {adj}',
  'מזוקק מחומר {adj}',
];

const DESC_ADJ_EN = [
  'ancient','astral','cosmic','deep','divine','dream','electric','eternal','ethereal','frozen',
  'hidden','inner','living','lost','mystic','primal','sacred','shadow','silent','stellar',
  'timeless','twilight','unknown','vast','wild','burning','celestial','crystal','dark','fading',
];

const DESC_ADJ_HE = [
  'עתיקים','אסטרליים','קוסמיים','עמוקים','אלוהיים','חלומיים','חשמליים','נצחיים','אתריים','קפואים',
  'נסתרים','פנימיים','חיים','אבודים','מיסטיים','קדמוניים','קדושים','צליליים','שקטים','כוכביים',
  'נצחיים','דמדומיים','לא ידועים','עצומים','פראיים','בוערים','שמימיים','קריסטליים','חשוכים','נמוגים',
];

// ─── Trait arrays ───
const MATERIALS: MaterialType[] = ['glass', 'metal', 'iridescent', 'plasma', 'lava', 'crystal', 'matte', 'nebula', 'obsidian', 'tiger', 'thorny', 'bone', 'ember', 'ice', 'void', 'holographic'];
const PATTERNS: PatternType[] = ['voronoi', 'cellular', 'fractal', 'shards', 'swirl', 'strata'];
const GEOS: GeometryFamily[] = ['sphere', 'dodeca', 'icosa', 'octa', 'torus', 'spiky', 'tetra', 'cube', 'cone', 'cylinder', 'capsule', 'knot'];
const GLOWS: GlowLevel[] = ['none', 'soft', 'medium', 'intense', 'cosmic'];
const RARITIES: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
// Rarity weights: common 38%, uncommon 27%, rare 20%, epic 10%, legendary 5%
const RARITY_WEIGHTS = [0.38, 0.65, 0.85, 0.95, 1.0];

function hueProfile(
  hue: number, mat: MaterialType, pat: PatternType, geo: GeometryFamily,
  intensity: number, particles: boolean, hueSpread: number,
  satBoost: number = 0, litBoost: number = 0
): OrbProfile {
  const h1 = hue;
  const h2 = (hue + hueSpread) % 360;
  const h3 = (hue + hueSpread * 2) % 360;
  const sat = Math.min(98, Math.max(20, 40 + intensity * 55 + satBoost));
  const lit = Math.min(72, Math.max(18, 25 + intensity * 38 + litBoost));

  const metalness = mat === 'metal' ? 0.65 + intensity * 0.35 : mat === 'wire' ? 0.12 : mat === 'iridescent' ? 0.3 + intensity * 0.25 : mat === 'plasma' ? 0.08 : 0.04;
  const roughness = mat === 'metal' ? 0.4 - intensity * 0.35 : mat === 'wire' ? 0.55 : mat === 'glass' ? 0.12 : 0.06;
  const clearcoat = mat === 'glass' ? 0.55 + intensity * 0.45 : mat === 'iridescent' ? 0.75 + intensity * 0.25 : intensity * 0.4;
  const transmission = mat === 'glass' ? 0.3 + intensity * 0.4 : mat === 'plasma' ? 0.2 + intensity * 0.3 : 0;
  const emissive = mat === 'plasma' ? 0.4 + intensity * 0.6 : mat === 'iridescent' ? 0.15 + intensity * 0.35 : intensity * 0.4;

  return p({
    materialType: mat,
    gradientMode: intensity > 0.6 ? 'noise' : intensity > 0.3 ? 'radial' : 'vertical',
    patternType: pat,
    geometryFamily: geo,
    bloomStrength: intensity * 1.2,
    chromaShift: intensity * 0.85,
    gradientStops: [
      `${h1} ${sat}% ${lit - 8}%`,
      `${h1} ${Math.min(98, sat + 15)}% ${lit + 12}%`,
      `${h2} ${sat}% ${lit + 22}%`,
      `${h3} ${Math.max(15, sat - 12)}% ${lit + 32}%`,
    ],
    coreGradient: [`${h1} ${sat}% ${lit}%`, `${h2} ${sat}% ${lit + 22}%`],
    rimLightColor: `${h3} ${Math.max(15, sat - 12)}% ${lit + 32}%`,
    primaryColor: `${h1} ${Math.min(98, sat + 15)}% ${lit + 12}%`,
    secondaryColors: [`${h1} ${sat}% ${lit}%`, `${h2} ${sat}% ${lit + 22}%`, `${h3} ${Math.max(20, sat - 8)}% ${lit + 18}%`],
    accentColor: `${h3} ${Math.max(15, sat - 12)}% ${lit + 32}%`,
    materialParams: {
      metalness, roughness, clearcoat, transmission,
      ior: 1.3 + intensity * 0.7,
      emissiveIntensity: emissive,
    },
    morphIntensity: 0.35 + intensity * 0.55,
    morphSpeed: 0.45 + intensity * 0.75,
    motionSpeed: 0.45 + intensity * 0.85,
    patternIntensity: 0.2 + intensity * 0.6,
    layerCount: Math.round(2 + intensity * 4),
    coreIntensity: 0.35 + intensity * 0.6,
    particleEnabled: particles,
    particleCount: particles ? Math.round(8 + intensity * 22) : 0,
  });
}

// ─── Generator ───
export function generateOrbs(count: number, startId: number): GalleryOrb[] {
  const rng = mulberry32(98_331); // New seed for fresh collection
  const usedNames = new Set<string>();
  const orbs: GalleryOrb[] = [];

  for (let i = 0; i < count; i++) {
    // Pick traits deterministically
    const mat = MATERIALS[Math.floor(rng() * MATERIALS.length)];
    const pat = PATTERNS[Math.floor(rng() * PATTERNS.length)];
    const geo = GEOS[Math.floor(rng() * GEOS.length)];
    const glow = GLOWS[Math.floor(rng() * GLOWS.length)];

    // Rarity via weighted random
    const rVal = rng();
    let rarity: Rarity = 'common';
    for (let ri = 0; ri < RARITY_WEIGHTS.length; ri++) {
      if (rVal < RARITY_WEIGHTS[ri]) { rarity = RARITIES[ri]; break; }
    }

    // Higher rarity = more likely particles
    const particles = rarity === 'legendary' ? rng() > 0.1
      : rarity === 'epic' ? rng() > 0.35
      : rarity === 'rare' ? rng() > 0.6
      : rng() > 0.85;

    // Intensity: wider spread with guaranteed floor per rarity
    const baseIntensity = rarity === 'legendary' ? 0.92 : rarity === 'epic' ? 0.75 : rarity === 'rare' ? 0.55 : rarity === 'uncommon' ? 0.38 : 0.2;
    const intensity = Math.min(1, Math.max(0.08, baseIntensity + (rng() - 0.5) * 0.45));

    // Full spectrum hue with much wider spread for complementary/triadic colors
    const hue = Math.floor(rng() * 360);
    const hueSpread = 25 + Math.floor(rng() * 110); // up to 135° spread
    // Dramatic sat/lit variance
    const satBoost = Math.floor((rng() - 0.5) * 35);
    const litBoost = Math.floor((rng() - 0.5) * 28);

    // Generate unique name
    let nameEn = '';
    let attempts = 0;
    while (attempts < 50) {
      const adj = ADJ_EN[Math.floor(rng() * ADJ_EN.length)];
      const noun = NOUN_EN[Math.floor(rng() * NOUN_EN.length)];
      nameEn = `${adj} ${noun}`;
      if (!usedNames.has(nameEn)) { usedNames.add(nameEn); break; }
      attempts++;
    }
    if (attempts >= 50) {
      // Fallback: append number
      nameEn = `Orb #${startId + i}`;
    }

    const adjIdx = Math.floor(rng() * ADJ_HE.length);
    const nounIdx = Math.floor(rng() * NOUN_HE.length);
    const nameHe = `${ADJ_HE[adjIdx]} ${NOUN_HE[nounIdx]}`;

    // Description
    const descTplIdx = Math.floor(rng() * DESC_TEMPLATES_EN.length);
    const descAdjIdx = Math.floor(rng() * DESC_ADJ_EN.length);
    const descEn = DESC_TEMPLATES_EN[descTplIdx].replace('{adj}', DESC_ADJ_EN[descAdjIdx]);
    const descHe = DESC_TEMPLATES_HE[descTplIdx].replace('{adj}', DESC_ADJ_HE[descAdjIdx]);

    const id = `gen-${startId + i}`;

    orbs.push({
      id,
      nameEn,
      nameHe,
      descEn,
      descHe,
      rarity,
      traits: { material: mat, pattern: pat, geometry: geo, glow, particles },
      profile: hueProfile(hue, mat, pat, geo, intensity, particles, hueSpread, satBoost, litBoost),
    });
  }

  return orbs;
}

// Pre-generate and export
export const GENERATED_ORBS: GalleryOrb[] = generateOrbs(900, 101);
