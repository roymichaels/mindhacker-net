/**
 * Guard utilities for auth/payment/navigation — eliminates silent failures.
 * Each guard logs to flowAudit when activated.
 */
import { flowAudit } from '@/lib/flowAudit';
import { toast } from 'sonner';
import type { User } from '@supabase/supabase-js';
import type { NavigateFunction } from 'react-router-dom';

/**
 * Returns true if user is authenticated.
 * Otherwise opens the auth modal, logs a FLOW_AUDIT breakpoint, and returns false.
 */
export function requireAuthOrOpenModal(
  user: User | null,
  openAuthModal: (view?: 'login' | 'signup', onSuccess?: () => void) => void,
  options?: { reason?: string; nextActionName?: string; onSuccess?: () => void }
): boolean {
  if (user?.id) return true;

  flowAudit.breakpoint(
    options?.nextActionName ?? 'unknown_cta',
    'session_lost',
    `Auth required for: ${options?.reason ?? 'action'} — opening auth modal`
  );
  openAuthModal('signup', options?.onSuccess);
  return false;
}

/**
 * Validates a checkout/portal response.
 * Returns the URL string on success, or null (with toast + flowAudit error) on failure.
 */
export function requireCheckoutUrlOrToast(
  result: { data?: { url?: string } | null; error?: any },
  isHe: boolean
): string | null {
  if (result.error) {
    const msg = result.error.message || 'Checkout failed';
    toast.error(isHe ? 'שגיאה ביצירת תשלום' : msg);
    flowAudit.recordError(`Checkout failed: ${msg}`);
    return null;
  }
  if (!result.data?.url) {
    toast.error(isHe ? 'שגיאה ביצירת תשלום' : 'No checkout URL received');
    flowAudit.recordError('Checkout response missing URL');
    return null;
  }
  flowAudit.markFlag('checkoutUrlReceived', true);
  return result.data.url;
}

/** Known application routes for validation */
const KNOWN_ROUTES = [
  '/', '/dashboard', '/onboarding', '/go',
  '/messages', '/messages/ai',
  '/coaches', '/p/',
  '/launchpad', '/settings',
  '/community', '/content',
  '/success', '/auth',
  '/life',
];

/**
 * Wraps navigate() with route validation.
 * If the target is unknown, logs to flowAudit and navigates to fallback instead.
 */
export function safeNavigate(
  navigate: NavigateFunction,
  target: string,
  fallback: string = '/dashboard'
): void {
  const isKnown = KNOWN_ROUTES.some(r => target === r || target.startsWith(r + '/') || target.startsWith(r + '?'));
  if (!isKnown) {
    flowAudit.recordError(`safeNavigate: unknown target "${target}", using fallback "${fallback}"`);
    navigate(fallback, { replace: true });
    return;
  }
  navigate(target);
}
