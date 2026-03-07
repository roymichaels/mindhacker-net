/**
 * Quest & Campaign naming system.
 * Each day gets a unique Quest name, each week/phase gets a Campaign name.
 * Names are deterministic based on date string (seeded hash).
 */

// ── Quest names (daily) ──
const QUEST_NAMES_EN = [
  'Dawn Forge', 'Summit Push', 'Iron Hour', 'Shadow Break',
  'Ember Trail', 'Vortex Run', 'Steel Tide', 'Pulse Strike',
  'Frost March', 'Blaze Path', 'Echo Hunt', 'Storm Rise',
  'Flint Edge', 'Thorn Gate', 'Spark Dive', 'Drift Core',
  'Apex Walk', 'Night Forge', 'Ember Rift', 'Titan Pulse',
  'Void Bloom', 'Crest Run', 'Surge Point', 'Dusk Blade',
  'Stone Leap', 'Flash Tide', 'Rune Sprint', 'Prism Hold',
  'Wave Break', 'Zenith Call', 'Ash Circuit', 'Nova Grind',
  'Bolt March', 'Grit Surge', 'Peak Drive', 'Core Shift',
  'Flame Step', 'Ridge Push', 'Aether Dash', 'Obsidian Flow',
];

const QUEST_NAMES_HE = [
  'כור השחר', 'דחיפת הפסגה', 'שעת הברזל', 'שבירת הצל',
  'שביל הגחלים', 'ריצת המערבולת', 'גאות הפלדה', 'מכת הדופק',
  'צעדת הקרח', 'נתיב הלהבה', 'ציד ההד', 'עליית הסערה',
  'להב הצור', 'שער הקוצים', 'צלילת הניצוץ', 'ליבת הסחף',
  'הליכת הפסגה', 'כור הלילה', 'סדק הגחלים', 'דופק הטיטאן',
  'פריחת הריק', 'ריצת הרכס', 'נקודת הגאות', 'להב הדמדומים',
  'קפיצת האבן', 'גאות הבזק', 'ספרינט הרונה', 'אחיזת המנסרה',
  'שבירת הגל', 'קריאת השיא', 'מעגל האפר', 'טחינת הנובה',
  'צעדת הברק', 'גל העוצמה', 'נהיגת הפסגה', 'תזוזת הליבה',
  'צעד הלהבה', 'דחיפת הרכס', 'דאש האתר', 'זרימת האובסידיאן',
];

// ── Campaign names (weekly/phase) ──
const CAMPAIGN_NAMES_EN = [
  'Operation Ironclad', 'The Obsidian Protocol', 'Project Vanguard',
  'The Phoenix Sequence', 'Operation Apex', 'The Titan Arc',
  'Project Stormforge', 'The Ember Directive', 'Operation Zenith',
  'The Prism Campaign', 'Project Nightfall', 'The Surge Initiative',
  'Operation Frostbite', 'The Crimson Circuit', 'Project Horizon',
];

const CAMPAIGN_NAMES_HE = [
  'מבצע שריון', 'פרוטוקול אובסידיאן', 'פרויקט חלוץ',
  'רצף הפניקס', 'מבצע שיא', 'קשת הטיטאן',
  'פרויקט כור הסערה', 'הנחיית הגחלים', 'מבצע זנית',
  'מסע המנסרה', 'פרויקט דמדומים', 'יוזמת הגאות',
  'מבצע כפור', 'מעגל הארגמן', 'פרויקט אופק',
];

/** Simple deterministic hash from a string */
function hashStr(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Get a deterministic quest name for a given date string (YYYY-MM-DD) */
export function getQuestName(dateStr: string, lang: 'he' | 'en' = 'en'): string {
  const names = lang === 'he' ? QUEST_NAMES_HE : QUEST_NAMES_EN;
  const idx = hashStr(dateStr) % names.length;
  return names[idx];
}

/** Get a deterministic campaign name for a phase/week (e.g. "2026-W10" or phase number) */
export function getCampaignName(phaseKey: string, lang: 'he' | 'en' = 'en'): string {
  const names = lang === 'he' ? CAMPAIGN_NAMES_HE : CAMPAIGN_NAMES_EN;
  const idx = hashStr(phaseKey) % names.length;
  return names[idx];
}

/** Get campaign key from a date (ISO week) */
export function getCampaignKeyFromDate(dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  // ISO week calculation
  const jan1 = new Date(year, 0, 1);
  const days = Math.floor((d.getTime() - jan1.getTime()) / 86400000);
  const weekNum = Math.ceil((days + jan1.getDay() + 1) / 7);
  return `${year}-W${String(weekNum).padStart(2, '0')}`;
}
