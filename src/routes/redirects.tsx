/**
 * Centralized redirect map — keeps App.tsx lean.
 * Each entry: [fromPath, toPath]
 */
import { Route, Navigate } from 'react-router-dom';

const SIMPLE_REDIRECTS: [string, string][] = [
  // Auth (modal-based now)
  ['/signup', '/'],
  ['/login', '/'],
  // Legacy products
  ['/personal-hypnosis', '/'],
  ['/consciousness-leap', '/'],
  ['/consciousness-leap/apply/:token', '/'],
  ['/form/:token', '/'],
  // Legacy onboarding
  ['/start', '/onboarding'],
  ['/free-journey', '/onboarding'],
  ['/free-journey/start', '/onboarding'],
  ['/free-journey/complete', '/launchpad/complete'],
  // Coach/practitioner aliases
  ['/practitioners', '/coaches'],
  ['/marketplace', '/coaches'],
  ['/affiliate-dashboard', '/affiliate'],
  // Legacy → /play
  ['/combat-community', '/community'],
  ['/dashboard', '/play'],
  ['/today', '/play'],
  ['/me', '/play'],
  ['/projects', '/play'],
  ['/life', '/play'],
  ['/life/*', '/play'],
  ['/consciousness', '/play'],
  ['/health', '/play'],
  ['/health/*', '/play'],
  ['/relationships', '/play'],
  ['/relationships/*', '/play'],
  ['/finances', '/play'],
  ['/finances/*', '/play'],
  ['/learning', '/play'],
  ['/learning/*', '/play'],
  ['/purpose', '/play'],
  ['/purpose/*', '/play'],
  ['/hobbies', '/play'],
  ['/hobbies/*', '/play'],
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
  ['/now', '/play'],
  ['/plan', '/play'],
  ['/profile', '/play'],
  ['/strategy', '/play'],
  ['/tactics', '/play'],
  ['/arena', '/play'],
  ['/personal-hypnosis/success', '/play'],
  ['/personal-hypnosis/pending', '/play'],
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
  return [...panelRoutes, ...simpleRoutes];
}

export function renderProtectedRedirectRoutes() {
  return PROTECTED_REDIRECTS.map(([from, to]) => (
    <Route key={from} path={from} element={<Navigate to={to} replace />} />
  ));
}
