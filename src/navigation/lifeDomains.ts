/**
 * @module navigation/lifeDomains
 * @purpose Single source of truth for domain definitions.
 * Split into CORE_DOMAINS (Core/ליבה tab) and ARENA_DOMAINS (Arena/זירה tab).
 * Consciousness is a meta-pillar at the top of Core.
 */

import {
  Orbit,
  Eye,
  Dumbbell,
  Sun,
  Crosshair,
  Swords,
  Brain,
  TrendingUp,
  Crown,
  Users,
  Briefcase,
  FolderKanban,
  Gamepad2,
  type LucideIcon,
} from 'lucide-react';

export interface LifeDomain {
  id: string;
  labelEn: string;
  labelHe: string;
  icon: LucideIcon;
  color: string;
  description: string;
  descriptionHe: string;
}

/** Core domains — personal transformation (displayed in Core/ליבה hub) */
export const CORE_DOMAINS: LifeDomain[] = [
  { id: 'consciousness', labelEn: 'Consciousness', labelHe: 'תודעה', icon: Orbit, color: 'blue', description: 'Identity map, traits, consciousness patterns, self-awareness', descriptionHe: 'מפת זהות, תכונות, דפוסי תודעה, מודעות עצמית' },
  { id: 'presence',  labelEn: 'Image',     labelHe: 'תדמית',    icon: Eye,        color: 'fuchsia',  description: 'Face, body aesthetics, grooming, posture, style',                    descriptionHe: 'פנים, אסתטיקה גופנית, טיפוח, יציבה, סגנון' },
  { id: 'power',     labelEn: 'Power',     labelHe: 'עוצמה',    icon: Dumbbell,   color: 'red',      description: 'Strength, calisthenics, skill progressions',                        descriptionHe: 'כוח, קליסטניקס, התקדמות מיומנויות' },
  { id: 'vitality',  labelEn: 'Vitality',  labelHe: 'חיוניות',  icon: Sun,        color: 'amber',    description: 'Sleep, nutrition, recovery, hormones',                              descriptionHe: 'שינה, תזונה, התאוששות, הורמונים' },
  { id: 'focus',     labelEn: 'Focus',     labelHe: 'מיקוד',    icon: Crosshair,  color: 'cyan',     description: 'Dopamine control, deep work, meditation',                           descriptionHe: 'שליטה בדופמין, עבודה עמוקה, מדיטציה' },
  { id: 'combat',    labelEn: 'Combat',    labelHe: 'לחימה',    icon: Swords,     color: 'slate',    description: 'Technical exposure, sparring, live pressure, reaction',              descriptionHe: 'חשיפה טכנית, ספארינג, לחץ חי, תגובה' },
  { id: 'expansion', labelEn: 'Expansion', labelHe: 'התרחבות',  icon: Brain,      color: 'indigo',   description: 'Learning, creativity, languages, philosophy',                       descriptionHe: 'למידה, יצירתיות, שפות, פילוסופיה' },
];

/** Arena domains — external impact (displayed in Arena/זירה hub alongside Projects) */
export const ARENA_DOMAINS: LifeDomain[] = [
  { id: 'wealth',        labelEn: 'Wealth',        labelHe: 'עושר',       icon: TrendingUp,   color: 'emerald', description: 'Income, business, career, monetization',    descriptionHe: 'הכנסה, עסקים, קריירה, מוניטיזציה' },
  { id: 'influence',     labelEn: 'Influence',     labelHe: 'השפעה',      icon: Crown,        color: 'purple',  description: 'Communication, leadership, charisma',       descriptionHe: 'תקשורת, מנהיגות, כריזמה' },
  { id: 'relationships', labelEn: 'Relationships', labelHe: 'קשרים',     icon: Users,        color: 'sky',     description: 'Connections, partnerships, social capital',  descriptionHe: 'קשרים, שותפויות, הון חברתי' },
  { id: 'business',      labelEn: 'Business',      labelHe: 'עסקים',     icon: Briefcase,    color: 'rose',    description: 'Build & manage businesses',                  descriptionHe: 'בנייה וניהול עסקים' },
  { id: 'projects',      labelEn: 'Projects',      labelHe: 'פרויקטים',  icon: FolderKanban, color: 'amber',   description: 'Manage projects & goals',                    descriptionHe: 'ניהול פרויקטים ויעדים' },
  { id: 'play',          labelEn: 'Play',          labelHe: 'משחק',      icon: Gamepad2,     color: 'violet',  description: 'Intentional regeneration & joyful movement', descriptionHe: 'התחדשות מכוונת ותנועה משמחת' },
];

/** Combined — backwards compat for anything iterating all domains */
export const LIFE_DOMAINS: LifeDomain[] = [...CORE_DOMAINS, ...ARENA_DOMAINS];

/** Lookup a domain by id */
export function getDomainById(domainId: string): LifeDomain | undefined {
  return LIFE_DOMAINS.find(d => d.id === domainId);
}
