/**
 * useWorldAnchors — Phase 5D.1.
 *
 * Adapts the existing Outer-World portal data into the AnchorField
 * contract. We reuse the destinations already shipped in
 * `AlignedRealities` so no new data sources are introduced. When the
 * data is empty (or before it loads), seed anchors keep the place
 * alive so the user never sees a dead world.
 */
import { Compass, GraduationCap, MessageSquare, Sparkles, Users } from 'lucide-react';
import type { ComponentType } from 'react';

export interface WorldAnchor {
  id: string;
  /** Normalised viewport coords (0..1). */
  x: number;
  y: number;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  labelHe: string;
  labelEn: string;
  metaHe?: string;
  metaEn?: string;
  hueHsl: string;
  /** Existing route to navigate to on tap. */
  to: string;
  /** IDs of related anchors — drives EnergyPath connections. */
  links?: string[];
}

/**
 * Hand-tuned constellation positions on a 0..1 viewport. The layout
 * matches the reference: a soft, downward-flowing scatter that reads
 * as terrain over a horizon.
 */
const SEED_ANCHORS: WorldAnchor[] = [
  {
    id: 'people',
    x: 0.32,
    y: 0.30,
    icon: Users,
    labelHe: 'אנשים',
    labelEn: 'People',
    metaHe: 'קשרים פעילים',
    metaEn: 'Active connections',
    hueHsl: 'var(--aion-violet)',
    to: '/community',
    links: ['opportunities', 'environment'],
  },
  {
    id: 'opportunities',
    x: 0.62,
    y: 0.40,
    icon: Sparkles,
    labelHe: 'הזדמנויות',
    labelEn: 'Opportunities',
    metaHe: 'פוטנציאל פתוח',
    metaEn: 'Open potential',
    hueHsl: 'var(--aion-cyan)',
    to: '/coaches',
    links: ['practices'],
  },
  {
    id: 'places',
    x: 0.18,
    y: 0.52,
    icon: Compass,
    labelHe: 'מקומות',
    labelEn: 'Places',
    metaHe: 'מיקומים חשובים',
    metaEn: 'Significant places',
    hueHsl: '160 70% 60%',
    to: '/learn',
    links: ['environment'],
  },
  {
    id: 'practices',
    x: 0.74,
    y: 0.62,
    icon: GraduationCap,
    labelHe: 'תרגולים',
    labelEn: 'Practices',
    metaHe: 'תרגולי עתיד',
    metaEn: 'Future practices',
    hueHsl: '24 88% 65%',
    to: '/learn',
    links: ['environment'],
  },
  {
    id: 'environment',
    x: 0.46,
    y: 0.72,
    icon: MessageSquare,
    labelHe: 'סביבה',
    labelEn: 'Environment',
    metaHe: 'אקלים חברתי יציב',
    metaEn: 'Stable social climate',
    hueHsl: '188 95% 65%',
    to: '/community',
    links: [],
  },
];

export function useWorldAnchors(): WorldAnchor[] {
  // Seed-only for Phase 5D.1. Future phases can derive coordinates from
  // user state (e.g. cluster sizes from social graph).
  return SEED_ANCHORS;
}