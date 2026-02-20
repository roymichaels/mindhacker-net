/**
 * @module navigation/lifeDomains
 * @purpose Single source of truth for domain definitions.
 * Split into CORE_DOMAINS (Core/ליבה tab) and ARENA_DOMAINS (Arena/זירה tab).
 */

import {
  Eye,
  Dumbbell,
  Sun,
  Crosshair,
  Swords,
  Brain,
  TrendingUp,
  Crown,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface LifeDomain {
  id: string;
  labelEn: string;
  labelHe: string;
  icon: LucideIcon;
  color: string;
  description: string;
}

/** Core domains — personal transformation (displayed in Core/ליבה hub) */
export const CORE_DOMAINS: LifeDomain[] = [
  { id: 'presence',  labelEn: 'Image',     labelHe: 'תדמית',    icon: Eye,        color: 'fuchsia',  description: 'Face, body aesthetics, grooming, posture, style' },
  { id: 'power',     labelEn: 'Power',     labelHe: 'עוצמה',    icon: Dumbbell,   color: 'red',      description: 'Strength, calisthenics, skill progressions' },
  { id: 'vitality',  labelEn: 'Vitality',  labelHe: 'חיוניות',  icon: Sun,        color: 'amber',    description: 'Sleep, nutrition, recovery, hormones' },
  { id: 'focus',     labelEn: 'Focus',     labelHe: 'מיקוד',    icon: Crosshair,  color: 'cyan',     description: 'Dopamine control, deep work, meditation' },
  { id: 'combat',    labelEn: 'Combat',    labelHe: 'לחימה',    icon: Swords,     color: 'slate',    description: 'Technical exposure, sparring, live pressure, reaction' },
  { id: 'expansion', labelEn: 'Expansion', labelHe: 'התרחבות',  icon: Brain,      color: 'indigo',   description: 'Learning, creativity, languages, philosophy' },
];

/** Arena domains — external impact (displayed in Arena/זירה hub alongside Projects) */
export const ARENA_DOMAINS: LifeDomain[] = [
  { id: 'wealth',        labelEn: 'Wealth',        labelHe: 'עושר',     icon: TrendingUp, color: 'emerald', description: 'Income, business, career, monetization' },
  { id: 'influence',     labelEn: 'Influence',     labelHe: 'השפעה',    icon: Crown,      color: 'purple',  description: 'Communication, leadership, charisma' },
  { id: 'relationships', labelEn: 'Relationships', labelHe: 'קשרים',   icon: Users,      color: 'sky',     description: 'Connections, partnerships, social capital' },
];

/** Combined — backwards compat for anything iterating all domains */
export const LIFE_DOMAINS: LifeDomain[] = [...CORE_DOMAINS, ...ARENA_DOMAINS];

/** Lookup a domain by id */
export function getDomainById(domainId: string): LifeDomain | undefined {
  return LIFE_DOMAINS.find(d => d.id === domainId);
}
