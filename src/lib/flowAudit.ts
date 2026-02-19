/**
 * FlowAudit — Critical Path Flow Auditor for Mind OS
 * 
 * Activated via: localStorage.FLOW_AUDIT = "true"
 * Logs route transitions, auth/subscription/launchpad state, redirect decisions,
 * and detects breakpoints (redirect loops, session loss, race conditions).
 */

type AuditCategory = 'route' | 'auth' | 'subscription' | 'launchpad' | 'gamestate' | 'redirect' | 'context';

type BreakpointCategory =
  | 'redirect_loop'
  | 'session_lost'
  | 'subscription_race'
  | 'context_hydration_race'
  | 'guest_migration_conflict'
  | 'double_provider_mount';

interface RouteEntry {
  from: string;
  to: string;
  ts: number;
}

const PREFIX = '[FLOW_AUDIT]';
const LOOP_THRESHOLD = 3;
const LOOP_WINDOW_MS = 5_000;

class FlowAuditor {
  private recentRoutes: RouteEntry[] = [];
  private mountedContexts = new Set<string>();
  private lastAuthUserId: string | null | undefined = undefined; // undefined = unknown
  private lastAuthEvent: string | null = null;

  isEnabled(): boolean {
    try {
      return localStorage.getItem('FLOW_AUDIT') === 'true';
    } catch {
      return false;
    }
  }

  // ── Route ──
  route(from: string, to: string): void {
    if (!this.isEnabled()) return;
    const now = Date.now();
    this.recentRoutes.push({ from, to, ts: now });
    // Trim old entries
    this.recentRoutes = this.recentRoutes.filter(r => now - r.ts < LOOP_WINDOW_MS);

    console.groupCollapsed(`${PREFIX} ──── Route: ${from} → ${to} ────`);
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();

    // Detect redirect loop
    const sameTransitions = this.recentRoutes.filter(r => r.from === from && r.to === to);
    if (sameTransitions.length >= LOOP_THRESHOLD) {
      this.breakpoint('Router', 'redirect_loop', `${from} → ${to} occurred ${sameTransitions.length}x in ${LOOP_WINDOW_MS / 1000}s`);
    }
  }

  // ── Auth ──
  auth(event: string, userId?: string | null, hasSession?: boolean): void {
    if (!this.isEnabled()) return;
    const truncId = userId ? userId.slice(0, 8) + '…' : 'none';
    console.log(`${PREFIX} Auth: event=${event} | user=${truncId} | session=${hasSession ?? 'unknown'}`);

    // Detect session_lost: was authenticated, now null, and event is not SIGNED_OUT
    if (
      this.lastAuthUserId !== undefined &&
      this.lastAuthUserId !== null &&
      userId === null &&
      event !== 'SIGNED_OUT'
    ) {
      this.breakpoint('AuthContext', 'session_lost', `User was ${this.lastAuthUserId?.slice(0, 8)}…, now null. Event: ${event}`);
    }

    this.lastAuthUserId = userId;
    this.lastAuthEvent = event;
  }

  // ── Subscription ──
  subscription(data: { tier?: string; isPro?: boolean; isLoading?: boolean; subscriptionEnd?: string | null }): void {
    if (!this.isEnabled()) return;
    console.log(`${PREFIX} Subscription: tier=${data.tier} | isPro=${data.isPro} | loading=${data.isLoading} | end=${data.subscriptionEnd ?? 'none'}`);

    if (data.isLoading && data.tier !== undefined) {
      this.breakpoint('SubscriptionGate', 'subscription_race', 'Subscription data accessed while still loading');
    }
  }

  // ── Launchpad ──
  launchpad(data: { currentStep?: number; isComplete?: boolean; isLoading?: boolean }): void {
    if (!this.isEnabled()) return;
    console.log(`${PREFIX} Launchpad: step=${data.currentStep} | complete=${data.isComplete} | loading=${data.isLoading}`);

    // Detect guest migration conflict: user exists but launchpad returned null
    if (data.currentStep === undefined && !data.isLoading) {
      this.breakpoint('Launchpad', 'guest_migration_conflict', 'User authenticated but launchpad progress is null/undefined');
    }
  }

  // ── GameState ──
  gamestate(data: { level?: number; tokens?: number; loading?: boolean; error?: string | null }): void {
    if (!this.isEnabled()) return;
    console.log(`${PREFIX} GameState: level=${data.level} | tokens=${data.tokens} | loading=${data.loading} | error=${data.error ?? 'none'}`);
  }

  // ── Redirect ──
  redirect(from: string, to: string, reason: string): void {
    if (!this.isEnabled()) return;
    console.log(`${PREFIX} 🔀 Redirect: ${from} → ${to} | reason: ${reason}`);
  }

  // ── Context mount/unmount ──
  context(name: string, event: 'mount' | 'unmount'): void {
    if (!this.isEnabled()) return;
    console.log(`${PREFIX} Context: ${name} ${event === 'mount' ? '🟢 mounted' : '🔴 unmounted'}`);

    if (event === 'mount') {
      if (this.mountedContexts.has(name)) {
        this.breakpoint(name, 'double_provider_mount', `${name} mounted twice without unmount`);
      }
      this.mountedContexts.add(name);
    } else {
      this.mountedContexts.delete(name);
    }
  }

  // ── Breakpoint ──
  breakpoint(location: string, category: BreakpointCategory, detail: string): void {
    if (!this.isEnabled()) return;
    console.group(`${PREFIX} ⚠️ BREAKPOINT DETECTED`);
    console.warn(`  Location: ${location}`);
    console.warn(`  Category: ${category}`);
    console.warn(`  Detail: ${detail}`);
    console.warn(`  Time: ${new Date().toISOString()}`);
    console.groupEnd();
  }

  // ── Context hydration race check ──
  hydrationCheck(contextName: string, isLoading: boolean, route: string): void {
    if (!this.isEnabled()) return;
    if (isLoading) {
      this.breakpoint(contextName, 'context_hydration_race', `${contextName} still loading when ${route} rendered`);
    }
  }
}

export const flowAudit = new FlowAuditor();
