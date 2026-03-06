/**
 * traitNameSanitizer — Cleans legacy mission-based skill names into short trait labels.
 * Used both at display time (client) and at insert time (edge function).
 */

// Hebrew imperative verbs that indicate a mission, not a trait
const HE_IMPERATIVE_PREFIXES = [
  'בצע', 'הפעל', 'תרגל', 'התחל', 'צור', 'נהל', 'בנה', 'שלב',
  'הקם', 'פתח', 'הגדר', 'קבע', 'בדוק', 'עקוב', 'למד', 'אמץ',
];

// Words that signal protocol/task/mission text
const HE_TASK_WORDS = [
  'פרוטוקול', 'יומי', 'שבועי', 'דו-שבועי', 'תרגול', 'תוכנית',
  'משימה', 'שגרת', 'מערכת', 'ביצוע', 'הפעלה', 'מדי יום',
  'בוקר', 'ערב', 'דקות', 'פעמים', 'מעקב',
];

const EN_IMPERATIVE_PREFIXES = [
  'execute', 'perform', 'practice', 'start', 'create', 'manage',
  'build', 'integrate', 'establish', 'develop', 'define', 'set',
  'check', 'track', 'learn', 'adopt', 'run', 'implement',
];

const EN_TASK_WORDS = [
  'protocol', 'daily', 'weekly', 'bi-weekly', 'routine', 'plan',
  'task', 'system', 'execution', 'minutes', 'times', 'tracking',
  'morning', 'evening', 'session',
];

/**
 * Checks if a name looks like a mission/protocol string rather than a trait badge.
 */
export function isInvalidTraitName(name: string): boolean {
  if (!name) return true;
  
  const words = name.trim().split(/\s+/);
  
  // More than 4 words = probably a mission sentence
  if (words.length > 4) return true;
  
  const lower = name.toLowerCase().trim();
  const firstWord = words[0]?.toLowerCase() || '';
  
  // Starts with imperative verb
  if (HE_IMPERATIVE_PREFIXES.some(p => firstWord === p || firstWord.startsWith(p))) return true;
  if (EN_IMPERATIVE_PREFIXES.some(p => firstWord === p)) return true;
  
  // Contains task/protocol words
  if (HE_TASK_WORDS.some(w => lower.includes(w))) return true;
  if (EN_TASK_WORDS.some(w => lower.includes(w))) return true;
  
  return false;
}

/**
 * Extracts a short trait name from a mission-like string.
 * Uses heuristics to find the "identity core" of the sentence.
 */
export function sanitizeTraitName(name: string): string {
  if (!name) return 'Unnamed Trait';
  
  // If it's already a valid trait name, return as-is
  if (!isInvalidTraitName(name)) return name;
  
  let cleaned = name;
  
  // Try to extract quoted content first (e.g., "בצע פרוטוקול יומי 'זרימה יצירתית'" → "זרימה יצירתית")
  const quotedMatch = cleaned.match(/['"'"]([^'"'"]+)['"'"]/);
  if (quotedMatch && quotedMatch[1]) {
    const extracted = quotedMatch[1].trim();
    if (extracted.length > 1 && extracted.split(/\s+/).length <= 4) {
      return extracted;
    }
  }
  
  // Remove common Hebrew prefixes
  for (const prefix of HE_IMPERATIVE_PREFIXES) {
    if (cleaned.startsWith(prefix + ' ')) {
      cleaned = cleaned.slice(prefix.length + 1);
      break;
    }
  }
  
  // Remove "את ה" or "את" prefix
  cleaned = cleaned.replace(/^את\s+ה?/, '');
  
  // Remove protocol/task words
  for (const word of HE_TASK_WORDS) {
    cleaned = cleaned.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
  }
  
  // Remove English prefixes
  for (const prefix of EN_IMPERATIVE_PREFIXES) {
    const re = new RegExp(`^${prefix}\\s+`, 'i');
    cleaned = cleaned.replace(re, '');
  }
  
  // Remove English task words
  for (const word of EN_TASK_WORDS) {
    cleaned = cleaned.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
  }
  
  // Clean up dashes, quotes, extra spaces
  cleaned = cleaned
    .replace(/[—–\-]+/g, ' ')
    .replace(/['"'""]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Take first 4 words max
  const words = cleaned.split(/\s+/).filter(w => w.length > 0);
  if (words.length > 4) {
    cleaned = words.slice(0, 3).join(' ');
  } else {
    cleaned = words.join(' ');
  }
  
  return cleaned || 'Unnamed Trait';
}

/**
 * Returns sanitized display name for a trait, preferring Hebrew.
 */
export function getTraitDisplayName(
  name: string,
  name_he: string | null | undefined,
  isHe: boolean,
): string {
  if (isHe) {
    const heName = name_he || name;
    return isInvalidTraitName(heName) ? sanitizeTraitName(heName) : heName;
  }
  return isInvalidTraitName(name) ? sanitizeTraitName(name) : name;
}
