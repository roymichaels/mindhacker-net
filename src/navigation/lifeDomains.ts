/**
 * @module navigation/lifeDomains
 * @purpose Single source of truth for the 8 fixed Life outcome-based domains.
 * Consumed by LifeHub, LifeDomainPage, and future Aurora intake engine.
 */

import {
  Eye,
  Dumbbell,
  Sun,
  Crosshair,
  TrendingUp,
  Swords,
  Brain,
  Crown,
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

export const LIFE_DOMAINS: LifeDomain[] = [
  { id: 'presence',  labelEn: 'Image',     labelHe: 'תדמית',    icon: Eye,        color: 'rose',    description: 'Face, body aesthetics, grooming, posture, style' },
  { id: 'power',     labelEn: 'Power',     labelHe: 'עוצמה',    icon: Dumbbell,   color: 'red',     description: 'Strength, calisthenics, skill progressions' },
  { id: 'vitality',  labelEn: 'Vitality',  labelHe: 'חיוניות',  icon: Sun,        color: 'amber',   description: 'Sleep, nutrition, recovery, hormones' },
  { id: 'focus',     labelEn: 'Focus',     labelHe: 'מיקוד',    icon: Crosshair,  color: 'violet',  description: 'Dopamine control, deep work, meditation' },
  { id: 'wealth',    labelEn: 'Wealth',    labelHe: 'עושר',     icon: TrendingUp, color: 'emerald', description: 'Income, business, career, monetization' },
  { id: 'combat',    labelEn: 'Combat',    labelHe: 'לחימה',    icon: Swords,     color: 'slate',   description: 'Technical exposure, sparring, live pressure, reaction' },
  { id: 'expansion', labelEn: 'Expansion', labelHe: 'התרחבות',  icon: Brain,      color: 'indigo',  description: 'Learning, creativity, languages, philosophy' },
  { id: 'influence', labelEn: 'Influence', labelHe: 'השפעה',    icon: Crown,      color: 'orange',  description: 'Communication, leadership, relationships, charisma' },
];

/** Lookup a domain by id */
export function getDomainById(domainId: string): LifeDomain | undefined {
  return LIFE_DOMAINS.find(d => d.id === domainId);
}
