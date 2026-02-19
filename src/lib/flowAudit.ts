/**
 * FlowAudit — Critical Path Flow Auditor for Mind OS
 * 
 * Activated via: localStorage.FLOW_AUDIT = "true"
 * Logs route transitions, auth/subscription/launchpad state, redirect decisions,
 * and detects breakpoints (redirect loops, session loss, race conditions).
 * 
 * Golden Flow Scenario Runner:
 *   localStorage.FLOW_AUDIT_SCENARIO = "free_anon" | "paid_anon" | "returning_user" | "coach_storefront"
 *   Then call window.__flowAudit.summary() in console for PASS/FAIL report.
 */

type AuditCategory = 'route' | 'auth' | 'subscription' | 'launchpad' | 'gamestate' | 'redirect' | 'context';

type BreakpointCategory =
  | 'redirect_loop'
  | 'session_lost'
  | 'subscription_race'
  | 'context_hydration_race'
  | 'guest_migration_conflict'
  | 'double_provider_mount';

// ── Scenario types ──

export type ScenarioId = 'free_anon' | 'paid_anon' | 'returning_user' | 'coach_storefront';

export interface ScenarioSummary {
  scenario: ScenarioId | null;
  reachedDashboard: boolean;
  onboardingSaved: boolean;
  authStateStable: boolean;
  subscriptionResolved: boolean;
  xpChangedOnFirstAction: boolean;
  errors: string[];
  pass: boolean;
}

type ScenarioFlag =
  | 'reachedDashboard'
  | 'onboardingSaved'
  | 'authStateStable'
  | 'subscriptionResolved'
  | 'xpChangedOnFirstAction'
  | 'authModalOpened'
  | 'checkoutUrlReceived';

// Per-scenario required checks
const SCENARIO_REQUIREMENTS: Record<ScenarioId, Record<string, 'required' | 'optional' | 'skip'>> = {
  free_anon: {
    reachedDashboard: 'required',
    onboardingSaved: 'required',
    authStateStable: 'required',
    subscriptionResolved: 'required',
    xpChangedOnFirstAction: 'required',
  },
  paid_anon: {
    reachedDashboard: 'required',
    onboardingSaved: 'required',
    authStateStable: 'required',
    subscriptionResolved: 'required',
    xpChangedOnFirstAction: 'optional',
  },
  returning_user: {
    reachedDashboard: 'required',
    onboardingSaved: 'skip',
    authStateStable: 'required',
    subscriptionResolved: 'required',
    xpChangedOnFirstAction: 'required',
  },
  coach_storefront: {
    reachedDashboard: 'required',
    onboardingSaved: 'skip',
    authStateStable: 'required',
    subscriptionResolved: 'skip',
    xpChangedOnFirstAction: 'skip',
  },
};

interface RouteEntry {
  from: string;
  to: string;
  ts: number;
}

const PREFIX = '[FLOW_AUDIT]';
const LOOP_THRESHOLD = 3;
const LOOP_WINDOW_MS = 5_000;
const SCENARIO_TIMEOUT_MS = 60_000;
const AUTH_WAIT_MS = 30_000;
const SUB_STUCK_MS = 10_000;

class FlowAuditor {
  private recentRoutes: RouteEntry[] = [];
  private mountedContexts = new Set<string>();
  private lastAuthUserId: string | null | undefined = undefined;
  private lastAuthEvent: string | null = null;

  // ── Scenario state ──
  private activeScenario: ScenarioId | null = null;
  private scenarioErrors: string[] = [];
  private flags: Record<ScenarioFlag, boolean> = {
    reachedDashboard: false,
    onboardingSaved: false,
    authStateStable: true, // assume stable until proven otherwise
    subscriptionResolved: false,
    xpChangedOnFirstAction: false,
    authModalOpened: false,
    checkoutUrlReceived: false,
  };
  private initialXp: number | null = null;
  private scenarioTimer: ReturnType<typeof setTimeout> | null = null;
  private scenarioStartTs: number = 0;
  private authSignInReceived = false;
  private authWaitTimer: ReturnType<typeof setTimeout> | null = null;

  isEnabled(): boolean {
    try {
      return localStorage.getItem('FLOW_AUDIT') === 'true';
    } catch {
      return false;
    }
  }

  // ── Scenario lifecycle ──

  startScenario(): void {
    if (!this.isEnabled()) return;
    try {
      const raw = localStorage.getItem('FLOW_AUDIT_SCENARIO');
      if (!raw) return;
      const id = raw as ScenarioId;
      if (!SCENARIO_REQUIREMENTS[id]) {
        console.warn(`${PREFIX} Unknown scenario: ${raw}`);
        return;
      }
      this.activeScenario = id;
      this.scenarioErrors = [];
      this.initialXp = null;
      this.authSignInReceived = false;
      this.flags = {
        reachedDashboard: false,
        onboardingSaved: false,
        authStateStable: true,
        subscriptionResolved: false,
        xpChangedOnFirstAction: false,
        authModalOpened: false,
        checkoutUrlReceived: false,
      };
      this.scenarioStartTs = Date.now();

      // Clear previous timers
      if (this.scenarioTimer) clearTimeout(this.scenarioTimer);
      if (this.authWaitTimer) clearTimeout(this.authWaitTimer);

      // Auto-summary after timeout
      this.scenarioTimer = setTimeout(() => {
        console.log(`${PREFIX} ⏱ Scenario timeout (${SCENARIO_TIMEOUT_MS / 1000}s) — auto-printing summary`);
        this.summary();
      }, SCENARIO_TIMEOUT_MS);

      // Auth wait detection for scenarios that require auth
      if (id === 'free_anon' || id === 'paid_anon') {
        this.authWaitTimer = setTimeout(() => {
          if (!this.authSignInReceived) {
            this.recordError('No SIGNED_IN event received within 30s — auth modal may not have opened');
          }
        }, AUTH_WAIT_MS);
      }

      console.log(`${PREFIX} 🎬 Scenario started: ${id}`);
    } catch {
      // localStorage unavailable
    }
  }

  markFlag(key: ScenarioFlag, value: boolean): void {
    if (!this.activeScenario) return;
    this.flags[key] = value;
    if (this.isEnabled()) {
      console.log(`${PREFIX} 🏁 Flag: ${key} = ${value}`);
    }
  }

  recordError(msg: string): void {
    if (!this.activeScenario) return;
    this.scenarioErrors.push(msg);
    if (this.isEnabled()) {
      console.warn(`${PREFIX} ❌ Scenario error: ${msg}`);
    }
  }

  summary(): ScenarioSummary {
    const scenario = this.activeScenario;
    const reqs = scenario ? SCENARIO_REQUIREMENTS[scenario] : null;

    const result: ScenarioSummary = {
      scenario,
      reachedDashboard: this.flags.reachedDashboard,
      onboardingSaved: this.flags.onboardingSaved,
      authStateStable: this.flags.authStateStable,
      subscriptionResolved: this.flags.subscriptionResolved,
      xpChangedOnFirstAction: this.flags.xpChangedOnFirstAction,
      errors: [...this.scenarioErrors],
      pass: true,
    };

    // Evaluate pass/fail per scenario requirements
    if (reqs) {
      const checks: Array<{ key: string; value: boolean; req: string }> = [
        { key: 'reachedDashboard', value: result.reachedDashboard, req: reqs.reachedDashboard ?? 'skip' },
        { key: 'onboardingSaved', value: result.onboardingSaved, req: reqs.onboardingSaved ?? 'skip' },
        { key: 'authStateStable', value: result.authStateStable, req: reqs.authStateStable ?? 'skip' },
        { key: 'subscriptionResolved', value: result.subscriptionResolved, req: reqs.subscriptionResolved ?? 'skip' },
        { key: 'xpChangedOnFirstAction', value: result.xpChangedOnFirstAction, req: reqs.xpChangedOnFirstAction ?? 'skip' },
      ];

      for (const c of checks) {
        if (c.req === 'required' && !c.value) {
          result.pass = false;
          if (!result.errors.some(e => e.includes(c.key))) {
            result.errors.push(`${c.key} never triggered`);
          }
        }
      }
    }

    if (result.errors.length > 0) result.pass = false;

    // Print formatted summary
    const status = (val: boolean, req: string) => {
      if (req === 'skip') return 'SKIP';
      return val ? 'PASS' : 'FAIL';
    };

    console.log(`\n${PREFIX} ═══ GOLDEN FLOW SUMMARY ═══`);
    console.log(`  Scenario:              ${scenario ?? 'none'}`);
    if (reqs) {
      console.log(`  Reached Dashboard:     ${status(result.reachedDashboard, reqs.reachedDashboard ?? 'skip')}`);
      console.log(`  Onboarding Saved:      ${status(result.onboardingSaved, reqs.onboardingSaved ?? 'skip')}`);
      console.log(`  Auth State Stable:     ${status(result.authStateStable, reqs.authStateStable ?? 'skip')}`);
      console.log(`  Subscription Resolved: ${status(result.subscriptionResolved, reqs.subscriptionResolved ?? 'skip')}`);
      console.log(`  XP Changed on Action:  ${status(result.xpChangedOnFirstAction, reqs.xpChangedOnFirstAction ?? 'skip')}`);
    }
    if (result.errors.length > 0) {
      console.log(`  Errors (${result.errors.length}):`);
      result.errors.forEach(e => console.log(`    - ${e}`));
    }
    console.log(`  ─────────────────────────`);
    console.log(`  RESULT: ${result.pass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`═════════════════════════════\n`);

    return result;
  }

  // ── Route ──
  route(from: string, to: string): void {
    if (!this.isEnabled()) return;
    const now = Date.now();
    this.recentRoutes.push({ from, to, ts: now });
    this.recentRoutes = this.recentRoutes.filter(r => now - r.ts < LOOP_WINDOW_MS);

    console.groupCollapsed(`${PREFIX} ──── Route: ${from} → ${to} ────`);
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();

    // Detect redirect loop
    const sameTransitions = this.recentRoutes.filter(r => r.from === from && r.to === to);
    if (sameTransitions.length >= LOOP_THRESHOLD) {
      this.breakpoint('Router', 'redirect_loop', `${from} → ${to} occurred ${sameTransitions.length}x in ${LOOP_WINDOW_MS / 1000}s`);
    }

    // ── Scenario flags ──
    if (to === '/dashboard') {
      this.markFlag('reachedDashboard', true);
    }
    if (this.activeScenario === 'returning_user' && from === '/dashboard' && to === '/onboarding') {
      this.recordError('Onboarding loop detected for returning user');
    }
  }

  // ── Auth ──
  auth(event: string, userId?: string | null, hasSession?: boolean): void {
    if (!this.isEnabled()) return;
    const truncId = userId ? userId.slice(0, 8) + '…' : 'none';
    console.log(`${PREFIX} Auth: event=${event} | user=${truncId} | session=${hasSession ?? 'unknown'}`);

    // Detect session_lost
    if (
      this.lastAuthUserId !== undefined &&
      this.lastAuthUserId !== null &&
      userId === null &&
      event !== 'SIGNED_OUT'
    ) {
      this.breakpoint('AuthContext', 'session_lost', `User was ${this.lastAuthUserId?.slice(0, 8)}…, now null. Event: ${event}`);
      this.markFlag('authStateStable', false);
    }

    // Track SIGNED_IN for scenario
    if (event === 'SIGNED_IN' && userId) {
      this.authSignInReceived = true;
      if (this.authWaitTimer) {
        clearTimeout(this.authWaitTimer);
        this.authWaitTimer = null;
      }
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

    // ── Scenario flags ──
    if (data.isLoading === false && data.tier !== undefined) {
      this.markFlag('subscriptionResolved', true);
    }
  }

  // ── Launchpad ──
  launchpad(data: { currentStep?: number; isComplete?: boolean; isLoading?: boolean }): void {
    if (!this.isEnabled()) return;
    console.log(`${PREFIX} Launchpad: step=${data.currentStep} | complete=${data.isComplete} | loading=${data.isLoading}`);

    if (data.currentStep === undefined && !data.isLoading) {
      this.breakpoint('Launchpad', 'guest_migration_conflict', 'User authenticated but launchpad progress is null/undefined');
    }

    // ── Scenario flag ──
    if (data.isComplete === true) {
      this.markFlag('onboardingSaved', true);
    }
  }

  // ── GameState ──
  gamestate(data: { level?: number; tokens?: number; loading?: boolean; error?: string | null }): void {
    if (!this.isEnabled()) return;
    console.log(`${PREFIX} GameState: level=${data.level} | tokens=${data.tokens} | loading=${data.loading} | error=${data.error ?? 'none'}`);

    // ── Scenario: track XP changes ──
    if (this.activeScenario && data.tokens !== undefined) {
      if (this.initialXp === null) {
        this.initialXp = data.tokens;
      } else if (data.tokens !== this.initialXp) {
        this.markFlag('xpChangedOnFirstAction', true);
      }
    }
  }

  // ── Redirect ──
  redirect(from: string, to: string, reason: string): void {
    if (!this.isEnabled()) return;
    console.log(`${PREFIX} 🔀 Redirect: ${from} → ${to} | reason: ${reason}`);

    // Detect navigation to missing routes
    if (to === '/aurora') {
      this.recordError(`Redirect to /aurora — route may not exist (missing_route_target)`);
    }
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

    // Push to scenario errors
    this.recordError(`[${category}] ${location}: ${detail}`);
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

// Expose on window for console access
if (typeof window !== 'undefined') {
  (window as any).__flowAudit = flowAudit;
}
