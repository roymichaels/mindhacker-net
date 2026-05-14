/**
 * Canonical Surfaces — the ONLY source of truth for top-level navigation.
 *
 * AION has exactly 5 surfaces. Everything else is an overlay, artifact,
 * room, or capability output summoned by AION. Do not add a 6th entry here
 * without an architectural decision.
 *
 * See `.lovable/plan.md` (System Consolidation Plan) for rationale.
 */
import {
  MessageCircle,
  Brain,
  Compass,
  Globe,
  User,
  type LucideIcon,
} from 'lucide-react';

export interface CanonicalSurface {
  id: 'chat' | 'brain' | 'journey' | 'outer-world' | 'profile';
  path: string;
  icon: LucideIcon;
  labelEn: string;
  labelHe: string;
}

export const CANONICAL_SURFACES: readonly CanonicalSurface[] = [
  { id: 'chat',        path: '/',            icon: MessageCircle, labelEn: 'Chat',        labelHe: 'צ׳אט' },
  { id: 'brain',       path: '/brain',       icon: Brain,         labelEn: 'Brain',       labelHe: 'מוח' },
  { id: 'journey',     path: '/journey',     icon: Compass,       labelEn: 'Journey',     labelHe: 'מסע' },
  { id: 'outer-world', path: '/outer-world', icon: Globe,         labelEn: 'Outer World', labelHe: 'עולם' },
  { id: 'profile',     path: '/profile',     icon: User,          labelEn: 'Profile',     labelHe: 'פרופיל' },
] as const;

export type CanonicalSurfaceId = (typeof CANONICAL_SURFACES)[number]['id'];

/**
 * Map a legacy path → canonical surface + optional artifact intent.
 * Used by redirect tables and AION's intent router.
 */
export const LEGACY_TO_SURFACE: Record<string, { path: string; artifact?: string }> = {
  '/aurora':    { path: '/' },
  '/strategy':  { path: '/journey', artifact: 'plan' },
  '/hypnosis':  { path: '/journey', artifact: 'hypnosis' },
  '/journal':   { path: '/journey', artifact: 'journal' },
  '/work':      { path: '/journey', artifact: 'work' },
  '/play':      { path: '/journey', artifact: 'missions' },
  '/now':       { path: '/journey', artifact: 'missions' },
  '/plan':      { path: '/journey', artifact: 'plan' },
  '/community': { path: '/outer-world', artifact: 'community' },
  '/coaches':   { path: '/outer-world', artifact: 'coaches' },
  '/fm':        { path: '/outer-world', artifact: 'market' },
  '/messages':  { path: '/outer-world', artifact: 'messages' },
  '/learn':     { path: '/outer-world', artifact: 'learn' },
  '/me':        { path: '/profile' },
  '/dashboard': { path: '/' },
  '/hallway':   { path: '/' },
};
