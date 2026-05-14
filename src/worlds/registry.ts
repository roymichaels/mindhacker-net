/**
 * Cognitive Worlds registry — single source of truth for the 9 worlds.
 *
 * - `live`     : real scene wired to a projection.
 * - `scaffold` : route resolves, ScaffoldScene renders the metaphor +
 *                AION role line. Navigable, not faked.
 * - `coming`   : registered only; SelfWorld lists it as locked.
 */
import {
  Sparkles,
  Repeat,
  CloudRain,
  Anchor,
  Layers as LayersIcon,
  Users,
  Crown,
  Palette,
  Flame,
} from 'lucide-react';
import type { CognitiveWorld, CognitiveWorldId } from './types';

export const COGNITIVE_WORLDS: CognitiveWorld[] = [
  {
    id: 'self',
    labelHe: 'עולם העצמי',
    labelEn: 'SelfWorld',
    hintHe: 'מבט-על על שלוש שכבות הזהות',
    hintEn: 'A view across the three identity layers',
    icon: Sparkles,
    nodeKinds: [
      { id: 'identity', labelHe: 'זהות', labelEn: 'Identity' },
      { id: 'layer', labelHe: 'שכבה', labelEn: 'Layer' },
    ],
    edgeKinds: [
      { id: 'composes', labelHe: 'מרכיב', labelEn: 'composes' },
    ],
    scene: {
      kind: 'band-stack',
      metaphorHe: 'מסע במורד שכבות העצמי',
      metaphorEn: 'A descent through the layers of self',
      accentHsl: '265 85% 66%',
    },
    interaction: {
      verbs: [
        { id: 'reflect', labelHe: 'הרהר', labelEn: 'reflect' },
        { id: 'realign', labelHe: 'יישר מחדש', labelEn: 'realign' },
      ],
    },
    aionRole: 'guide',
    aionLineHe: 'AION מלווה אותך במסע פנימה',
    aionLineEn: 'AION is walking inward with you',
    status: 'live',
  },
  {
    id: 'habits',
    labelHe: 'הרגלים',
    labelEn: 'Habits',
    hintHe: 'לולאות ריטואל וכוח משיכה התנהגותי',
    hintEn: 'Ritual loops and behavioral gravity',
    icon: Repeat,
    nodeKinds: [
      { id: 'ritual', labelHe: 'ריטואל', labelEn: 'Ritual' },
      { id: 'loop', labelHe: 'לולאה', labelEn: 'Loop' },
      { id: 'momentum', labelHe: 'מומנטום', labelEn: 'Momentum' },
      { id: 'decay', labelHe: 'דעיכה', labelEn: 'Decay' },
    ],
    edgeKinds: [
      { id: 'triggers', labelHe: 'מפעיל', labelEn: 'triggers' },
      { id: 'reinforces', labelHe: 'מחזק', labelEn: 'reinforces' },
      { id: 'interrupts', labelHe: 'קוטע', labelEn: 'interrupts' },
    ],
    scene: {
      kind: 'ritual-orbits',
      metaphorHe: 'לוויינים בכוח משיכה של הרגלים',
      metaphorEn: 'Satellites in the gravity of your rituals',
      accentHsl: '188 95% 65%',
    },
    interaction: {
      verbs: [
        { id: 'follow', labelHe: 'עקוב', labelEn: 'follow' },
        { id: 'interrupt', labelHe: 'קטע', labelEn: 'interrupt' },
        { id: 'amplify', labelHe: 'הגבר', labelEn: 'amplify' },
        { id: 'reset', labelHe: 'אפס', labelEn: 'reset' },
      ],
    },
    aionRole: 'orchestrator',
    aionLineHe: 'AION עוקב אחרי הקצב של הלולאות שלך',
    aionLineEn: 'AION is watching the rhythm of your loops',
    status: 'live',
  },
  {
    id: 'emotions',
    labelHe: 'רגשות',
    labelEn: 'Emotions',
    hintHe: 'מזג אוויר אנרגטי ושדות תהודה',
    hintEn: 'Energetic weather and resonance fields',
    icon: CloudRain,
    nodeKinds: [
      { id: 'feeling', labelHe: 'תחושה', labelEn: 'Feeling' },
      { id: 'field', labelHe: 'שדה', labelEn: 'Field' },
      { id: 'climate', labelHe: 'אקלים', labelEn: 'Climate' },
    ],
    edgeKinds: [
      { id: 'resonates', labelHe: 'מהדהד', labelEn: 'resonates' },
      { id: 'shifts', labelHe: 'מסיט', labelEn: 'shifts' },
    ],
    scene: {
      kind: 'weather',
      metaphorHe: 'מזג האוויר הפנימי שלך',
      metaphorEn: 'Your internal weather',
      accentHsl: '210 80% 60%',
    },
    interaction: {
      verbs: [
        { id: 'name', labelHe: 'תן שם', labelEn: 'name' },
        { id: 'breathe', labelHe: 'נשום', labelEn: 'breathe' },
        { id: 'trace', labelHe: 'התחקה', labelEn: 'trace' },
      ],
    },
    aionRole: 'interpreter',
    aionLineHe: 'AION קורא את מזג האוויר של הרגשות שלך',
    aionLineEn: 'AION is reading the weather of your emotions',
    status: 'scaffold',
  },
  {
    id: 'beliefs',
    labelHe: 'אמונות',
    labelEn: 'Beliefs',
    hintHe: 'מבני שורש, סתירות ואמונות צל',
    hintEn: 'Root structures, contradictions, shadow beliefs',
    icon: Anchor,
    nodeKinds: [
      { id: 'root', labelHe: 'שורש', labelEn: 'Root' },
      { id: 'inherited', labelHe: 'מורש', labelEn: 'Inherited' },
      { id: 'contradiction', labelHe: 'סתירה', labelEn: 'Contradiction' },
      { id: 'shadow', labelHe: 'צל', labelEn: 'Shadow' },
    ],
    edgeKinds: [
      { id: 'supports', labelHe: 'תומך', labelEn: 'supports' },
      { id: 'contradicts', labelHe: 'סותר', labelEn: 'contradicts' },
    ],
    scene: {
      kind: 'root-system',
      metaphorHe: 'מערכת השורשים של תפיסת העולם שלך',
      metaphorEn: 'The root system of your worldview',
      accentHsl: '30 70% 55%',
    },
    interaction: {
      verbs: [
        { id: 'unearth', labelHe: 'חשוף', labelEn: 'unearth' },
        { id: 'question', labelHe: 'שאל', labelEn: 'question' },
        { id: 'compose', labelHe: 'הרכב', labelEn: 'compose' },
      ],
    },
    aionRole: 'interpreter',
    aionLineHe: 'AION מתבונן במבני האמונה שמחזיקים אותך',
    aionLineEn: 'AION is examining the structures that hold you',
    status: 'scaffold',
  },
  {
    id: 'memory',
    labelHe: 'זיכרון',
    labelEn: 'Memory',
    hintHe: 'צירי זמן, קונסטלציות וגלקסיות זיכרון',
    hintEn: 'Timelines and constellations of memory',
    icon: LayersIcon,
    nodeKinds: [
      { id: 'moment', labelHe: 'רגע', labelEn: 'Moment' },
      { id: 'era', labelHe: 'תקופה', labelEn: 'Era' },
      { id: 'symbol', labelHe: 'סמל', labelEn: 'Symbol' },
    ],
    edgeKinds: [
      { id: 'precedes', labelHe: 'קודם ל', labelEn: 'precedes' },
      { id: 'echoes', labelHe: 'מהדהד', labelEn: 'echoes' },
    ],
    scene: {
      kind: 'timeline',
      metaphorHe: 'קונסטלציות לאורך ציר הזמן שלך',
      metaphorEn: 'Constellations along your timeline',
      accentHsl: '280 70% 65%',
    },
    interaction: {
      verbs: [
        { id: 'revisit', labelHe: 'שוב', labelEn: 'revisit' },
        { id: 'connect', labelHe: 'חבר', labelEn: 'connect' },
        { id: 'release', labelHe: 'שחרר', labelEn: 'release' },
      ],
    },
    aionRole: 'observer',
    aionLineHe: 'AION עומד יחד איתך בתוך הזמן',
    aionLineEn: 'AION is standing inside time with you',
    status: 'scaffold',
  },
  {
    id: 'relationships',
    labelHe: 'מערכות יחסים',
    labelEn: 'Relationships',
    hintHe: 'גלקסיה חברתית ושדות השפעה',
    hintEn: 'Social galaxy and influence fields',
    icon: Users,
    nodeKinds: [
      { id: 'person', labelHe: 'אדם', labelEn: 'Person' },
      { id: 'bond', labelHe: 'קשר', labelEn: 'Bond' },
      { id: 'pattern', labelHe: 'דפוס', labelEn: 'Pattern' },
    ],
    edgeKinds: [
      { id: 'attaches', labelHe: 'נקשר', labelEn: 'attaches' },
      { id: 'mirrors', labelHe: 'משקף', labelEn: 'mirrors' },
    ],
    scene: {
      kind: 'galaxy',
      metaphorHe: 'הגלקסיה החברתית שלך',
      metaphorEn: 'Your social galaxy',
      accentHsl: '340 75% 65%',
    },
    interaction: {
      verbs: [
        { id: 'orbit', labelHe: 'הקף', labelEn: 'orbit' },
        { id: 'soften', labelHe: 'רכך', labelEn: 'soften' },
        { id: 'release', labelHe: 'שחרר', labelEn: 'release' },
      ],
    },
    aionRole: 'interpreter',
    aionLineHe: 'AION מבחין בכוחות שמושכים את הקשרים שלך',
    aionLineEn: 'AION is sensing the forces moving your bonds',
    status: 'scaffold',
  },
  {
    id: 'archetypes',
    labelHe: 'ארכיטיפים',
    labelEn: 'Archetypes',
    hintHe: 'ישויות פנימיות, מגנים, מסיכות וצללים',
    hintEn: 'Inner entities, protectors, masks, shadows',
    icon: Crown,
    nodeKinds: [
      { id: 'archetype', labelHe: 'ארכיטיפ', labelEn: 'Archetype' },
      { id: 'mask', labelHe: 'מסיכה', labelEn: 'Mask' },
      { id: 'protector', labelHe: 'מגן', labelEn: 'Protector' },
    ],
    edgeKinds: [
      { id: 'embodies', labelHe: 'מגלם', labelEn: 'embodies' },
      { id: 'opposes', labelHe: 'מנוגד ל', labelEn: 'opposes' },
    ],
    scene: {
      kind: 'entity-circle',
      metaphorHe: 'מעגל הישויות הפנימיות שלך',
      metaphorEn: 'The circle of your inner entities',
      accentHsl: '15 80% 60%',
    },
    interaction: {
      verbs: [
        { id: 'meet', labelHe: 'פגוש', labelEn: 'meet' },
        { id: 'inhabit', labelHe: 'גלם', labelEn: 'inhabit' },
        { id: 'integrate', labelHe: 'הטמע', labelEn: 'integrate' },
      ],
    },
    aionRole: 'guide',
    aionLineHe: 'AION מציג בפניך את הישויות שחיות בתוכך',
    aionLineEn: 'AION is introducing the entities living inside you',
    status: 'scaffold',
  },
  {
    id: 'creative',
    labelHe: 'עולם יצירתי',
    labelEn: 'Creative World',
    hintHe: 'מערכת אקולוגית של רעיונות והמצאות',
    hintEn: 'An ecosystem of ideas and inventions',
    icon: Palette,
    nodeKinds: [
      { id: 'idea', labelHe: 'רעיון', labelEn: 'Idea' },
      { id: 'project', labelHe: 'פרויקט', labelEn: 'Project' },
      { id: 'symbol', labelHe: 'סמל', labelEn: 'Symbol' },
    ],
    edgeKinds: [
      { id: 'sparks', labelHe: 'מצית', labelEn: 'sparks' },
      { id: 'evolves', labelHe: 'מתפתח ל', labelEn: 'evolves into' },
    ],
    scene: {
      kind: 'ecosystem',
      metaphorHe: 'אקוסיסטם של דמיון ויצירה',
      metaphorEn: 'An ecosystem of imagination',
      accentHsl: '160 70% 55%',
    },
    interaction: {
      verbs: [
        { id: 'sketch', labelHe: 'שרטט', labelEn: 'sketch' },
        { id: 'cross', labelHe: 'הצלב', labelEn: 'cross-pollinate' },
        { id: 'release', labelHe: 'שחרר', labelEn: 'release' },
      ],
    },
    aionRole: 'orchestrator',
    aionLineHe: 'AION רואה רעיונות שעוד לא נולדו במלואם',
    aionLineEn: 'AION is seeing ideas not yet fully born',
    status: 'scaffold',
  },
  {
    id: 'higher',
    labelHe: 'אני עליון',
    labelEn: 'Higher Self',
    hintHe: 'שכבת התעלות, חלום סמלי, מבני משמעות',
    hintEn: 'Transcendence, symbolic dreamspace, meaning',
    icon: Flame,
    nodeKinds: [
      { id: 'meaning', labelHe: 'משמעות', labelEn: 'Meaning' },
      { id: 'symbol', labelHe: 'סמל', labelEn: 'Symbol' },
      { id: 'vision', labelHe: 'חזון', labelEn: 'Vision' },
    ],
    edgeKinds: [
      { id: 'reveals', labelHe: 'חושף', labelEn: 'reveals' },
    ],
    scene: {
      kind: 'dreamspace',
      metaphorHe: 'מרחב סמלי מעבר לאישיות',
      metaphorEn: 'A symbolic space beyond personality',
      accentHsl: '255 80% 70%',
    },
    interaction: {
      verbs: [
        { id: 'listen', labelHe: 'הקשב', labelEn: 'listen' },
        { id: 'receive', labelHe: 'קבל', labelEn: 'receive' },
        { id: 'translate', labelHe: 'תרגם', labelEn: 'translate' },
      ],
    },
    aionRole: 'observer',
    aionLineHe: 'AION עומד יחד איתך בקצה הסמלי של עצמך',
    aionLineEn: 'AION is standing with you at your symbolic edge',
    status: 'scaffold',
  },
];

export function getWorld(id: CognitiveWorldId | string): CognitiveWorld | undefined {
  return COGNITIVE_WORLDS.find((w) => w.id === id);
}
