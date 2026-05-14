/**
 * Centralized redirect map — keeps App.tsx lean.
 * Each entry: [fromPath, toPath].
 *
 * Rule: every entry must point at a CANONICAL destination
 * (one of: /, /aurora, /brain, /strategy, /outer-world, /coaches,
 * /creator, /freelancer, /admin-hub, /launchpad/complete, /journal).
 * Never chain through another redirect target like /mindos/* — those
 * legacy paths are themselves redirected and create double-hops.
 */
import { Route, Navigate } from 'react-router-dom';

/** Public-shell redirects (rendered above the protected outlet). */
const PUBLIC_REDIRECTS: [string, string][] = [
  ['/index', '/'],
  ['/home', '/'],
  ['/onboarding', '/'],
];

const SIMPLE_REDIRECTS: [string, string][] = [
  // Auth (modal-based now)
  ['/auth', '/'],
  ['/signup', '/'],
  ['/login', '/'],
  // Legacy products
  ['/personal-hypnosis', '/'],
  ['/consciousness-leap', '/'],
  ['/consciousness-leap/apply/:token', '/'],
  ['/form/:token', '/'],
  // Legacy onboarding — onboarding flow removed; route everything to Home (AION chat)
  ['/start', '/'],
  ['/free-journey', '/'],
  ['/free-journey/start', '/'],
  ['/free-journey/complete', '/launchpad/complete'],
  // Coach/practitioner aliases
  ['/practitioners', '/coaches'],
  ['/marketplace', '/coaches'],
  ['/affiliate-dashboard', '/affiliate'],
  // Legacy life-domain pages → Strategy missions (canonical)
  ['/combat-community', '/community'],
  ['/today', '/journey'],
  ['/projects', '/journey'],
  ['/consciousness', '/journey'],
  ['/health', '/journey'],
  ['/health/*', '/journey'],
  ['/relationships', '/journey'],
  ['/relationships/*', '/journey'],
  ['/finances', '/journey'],
  ['/finances/*', '/journey'],
  ['/learning', '/journey'],
  ['/learning/*', '/journey'],
  ['/purpose', '/journey'],
  ['/purpose/*', '/journey'],
  ['/hobbies', '/journey'],
  ['/hobbies/*', '/journey'],
  ['/messages/ai', '/aurora'],
  // Admin
  ['/admin', '/admin-hub'],
  ['/admin/*', '/admin-hub'],
  // Legacy panel → admin-hub
  ['/panel', '/admin-hub'],
  ['/panel/*', '/admin-hub'],
  // Coach
  ['/coach', '/coaches'],
  ['/coach/*', '/coaches'],
];

const PANEL_REDIRECTS: [string, string][] = [
  ['/panel/analytics', '/admin-hub?tab=overview&sub=analytics'],
  ['/panel/notifications', '/admin-hub?tab=overview&sub=notifications'],
  ['/panel/users', '/admin-hub?tab=admin&sub=users'],
  ['/panel/roles', '/admin-hub?tab=admin&sub=roles'],
  ['/panel/leads', '/admin-hub?tab=admin&sub=leads'],
  ['/panel/businesses', '/admin-hub?tab=admin&sub=businesses'],
  ['/panel/aurora-insights', '/admin-hub?tab=admin&sub=aurora-insights'],
  ['/panel/affiliates', '/admin-hub?tab=campaigns&sub=affiliates'],
  ['/panel/newsletter', '/admin-hub?tab=campaigns&sub=newsletter'],
  ['/panel/offers', '/admin-hub?tab=campaigns&sub=offers'],
  ['/panel/purchases', '/admin-hub?tab=campaigns&sub=purchases'],
  ['/panel/products', '/admin-hub?tab=content&sub=products'],
  ['/panel/content', '/admin-hub?tab=content&sub=content-mgmt'],
  ['/panel/videos', '/admin-hub?tab=content&sub=videos'],
  ['/panel/recordings', '/admin-hub?tab=content&sub=recordings'],
  ['/panel/forms', '/admin-hub?tab=content&sub=forms'],
  ['/panel/landing-pages', '/admin-hub?tab=site&sub=landing-pages'],
  ['/panel/homepage', '/admin-hub?tab=site&sub=homepage'],
  ['/panel/theme', '/admin-hub?tab=site&sub=theme'],
  ['/panel/faqs', '/admin-hub?tab=site&sub=faqs'],
  ['/panel/testimonials', '/admin-hub?tab=site&sub=testimonials'],
  ['/panel/bug-reports', '/admin-hub?tab=system&sub=bug-reports'],
  ['/panel/chat-assistant', '/admin-hub?tab=system&sub=chat-assistant'],
  ['/panel/settings', '/admin-hub?tab=system&sub=settings'],
];

/** Protected-shell redirects (rendered inside ProtectedAppShell) */
export const PROTECTED_REDIRECTS: [string, string][] = [
  // Strategy (missions) aliases — point straight at canonical
  ['/now', '/journey'],
  ['/plan', '/journey'],
  ['/play', '/journey'],
  ['/play-hub', '/journey'],
  ['/tactics', '/journey'],
  ['/arena', '/strategy'],
  // Phase D — /journey is the canonical action surface and renders directly
  // (see App.tsx). Legacy /journey deep-paths fall back to it.
  ['/journey/*', '/journey'],
  ['/personal-hypnosis/success', '/journey'],
  ['/personal-hypnosis/pending', '/journey'],
  // Legacy hub aliases
  ['/dashboard', '/'],
  ['/hallway', '/'],
  ['/hallway/:slug', '/'],
  ['/work', '/'],
  ['/work-hub', '/'],
  ['/journal-hub', '/journal'],
  ['/life', '/'],
  ['/life-plan', '/strategy'],
  ['/career', '/outer-world'],
  // Phase E — /profile is the lightweight account/profile surface inside Brain.
  // BrainPage reads ?panel=profile and opens the profile overlay.
  ['/profile', '/brain?panel=profile'],
  ['/profile-hub', '/brain?panel=profile'],
  ['/coach-hub', '/coaches'],
  ['/creator-hub', '/creator'],
  ['/freelancer-hub', '/freelancer'],
  ['/me', '/aurora'],
  // Legacy AION namespace → flat canonical
  ['/mindos', '/aurora'],
  ['/mindos/chat', '/aurora'],
  ['/mindos/strategy', '/strategy'],
  ['/mindos/tactics', '/journey'],
  ['/mindos/work', '/'],
  ['/mindos/journal', '/journal'],
];

export function renderRedirectRoutes() {
  // Panel-specific redirects first (more specific paths)
  const panelRoutes = PANEL_REDIRECTS.map(([from, to]) => (
    <Route key={from} path={from} element={<Navigate to={to} replace />} />
  ));
  // Then simple redirects
  const simpleRoutes = SIMPLE_REDIRECTS.map(([from, to]) => (
    <Route key={from} path={from} element={<Navigate to={to} replace />} />
  ));
  // Public-shell flat redirects (e.g. /index → /)
  const publicRoutes = PUBLIC_REDIRECTS.map(([from, to]) => (
    <Route key={from} path={from} element={<Navigate to={to} replace />} />
  ));
  return [...panelRoutes, ...simpleRoutes, ...publicRoutes];
}

export function renderProtectedRedirectRoutes() {
  return PROTECTED_REDIRECTS.map(([from, to]) => (
    <Route key={from} path={from} element={<Navigate to={to} replace />} />
  ));
}
