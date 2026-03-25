import { createClient } from '@supabase/supabase-js';

type Json = Record<string, unknown>;

function getSupabaseUrl() {
  return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
}

function getAnonKey() {
  return (
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  );
}

function getServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function createAdminSupabaseClient() {
  const url = getSupabaseUrl();
  const key = getServiceRoleKey();

  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createAuthSupabaseClient() {
  const url = getSupabaseUrl();
  const key = getAnonKey();

  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required');
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export interface AuthContext {
  token: string | null;
  userId: string | null;
}

export async function authenticateBearerToken(authHeader?: string | null): Promise<AuthContext> {
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return { token: null, userId: null };
  }

  try {
    const supabase = createAuthSupabaseClient();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return { token, userId: null };
    }

    return { token, userId: data.user.id };
  } catch {
    return { token, userId: null };
  }
}

async function safeSelect<T = Json>(fn: () => PromiseLike<{ data: T | null; error: unknown }>, fallback: T) {
  try {
    const { data, error } = await fn();
    if (error || data == null) return fallback;
    return data;
  } catch {
    return fallback;
  }
}

function summarizeList(items: string[], emptyLabel: string) {
  return items.length > 0 ? items.join(', ') : emptyLabel;
}

export async function buildAuroraContextSummary(params: {
  userId: string | null;
  language: string;
  timezone?: string | null;
}) {
  const { userId, language, timezone } = params;
  if (!userId) {
    return language === 'he'
      ? 'אין פרטי משתמש מאומתים. תענה באופן כללי, חם ומדויק.'
      : 'No authenticated user context is available. Respond generally, warmly, and precisely.';
  }

  const supabase = createAdminSupabaseClient();

  const profile = await safeSelect(
    async () =>
      supabase
        .from('profiles')
        .select('full_name, bio, gender, preferred_tone, challenge_intensity')
        .eq('id', userId)
        .maybeSingle(),
    null as Json | null
  );

  const recentMessages = await safeSelect(
    async () =>
      supabase
        .from('messages')
        .select('content, is_ai_message, created_at')
        .or(`sender_id.eq.${userId},and(sender_id.is.null,is_ai_message.eq.true)`)
        .order('created_at', { ascending: false })
        .limit(6),
    [] as Json[]
  );

  const todayTasks = await safeSelect(
    async () =>
      supabase
        .from('action_items')
        .select('title, status, pillar, scheduled_date')
        .eq('user_id', userId)
        .in('status', ['pending', 'in_progress'])
        .order('scheduled_date', { ascending: true })
        .limit(8),
    [] as Json[]
  );

  const completedToday = await safeSelect(
    async () =>
      supabase
        .from('action_items')
        .select('title, pillar, completed_at')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(5),
    [] as Json[]
  );

  const plan = await safeSelect(
    async () =>
      supabase
        .from('ai_life_plans')
        .select('plan_summary, start_date, end_date, progress_percentage')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    null as Json | null
  );

  const subscription = await safeSelect(
    async () =>
      supabase
        .from('user_subscriptions')
        .select('product_id, status')
        .eq('user_id', userId)
        .in('status', ['active', 'trialing'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    null as Json | null
  );

  const taskTitles = todayTasks.map((item) => String(item.title || '')).filter(Boolean);
  const doneTitles = completedToday.map((item) => String(item.title || '')).filter(Boolean);
  const recentUserLines = recentMessages
    .filter((item) => !item.is_ai_message && item.content)
    .slice(0, 4)
    .map((item) => String(item.content));

  const tier = typeof subscription?.product_id === 'string' ? subscription.product_id : 'free';
  const planSummary = typeof plan?.plan_summary === 'string' ? plan.plan_summary : '';
  const name = typeof profile?.full_name === 'string' ? profile.full_name : '';
  const bio = typeof profile?.bio === 'string' ? profile.bio : '';
  const tone = typeof profile?.preferred_tone === 'string' ? profile.preferred_tone : '';
  const challenge = typeof profile?.challenge_intensity === 'string' ? profile.challenge_intensity : '';

  if (language === 'he') {
    return [
      `משתמש: ${name || 'לא ידוע'}`,
      `אזור זמן: ${timezone || 'לא ידוע'}`,
      `מנוי: ${tier || 'free'}`,
      tone ? `טון מועדף: ${tone}` : '',
      challenge ? `עוצמת אתגר מועדפת: ${challenge}` : '',
      bio ? `ביו: ${bio}` : '',
      `משימות פתוחות: ${summarizeList(taskTitles, 'אין כרגע')}`,
      `הושלם לאחרונה: ${summarizeList(doneTitles, 'אין נתונים')}`,
      planSummary ? `סיכום תכנית: ${planSummary}` : '',
      recentUserLines.length > 0 ? `מסרים אחרונים של המשתמש: ${recentUserLines.join(' | ')}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }

  return [
    `User: ${name || 'unknown'}`,
    `Timezone: ${timezone || 'unknown'}`,
    `Subscription: ${tier || 'free'}`,
    tone ? `Preferred tone: ${tone}` : '',
    challenge ? `Challenge intensity: ${challenge}` : '',
    bio ? `Bio: ${bio}` : '',
    `Open tasks: ${summarizeList(taskTitles, 'none right now')}`,
    `Recently completed: ${summarizeList(doneTitles, 'no recent completions')}`,
    planSummary ? `Plan summary: ${planSummary}` : '',
    recentUserLines.length > 0 ? `Recent user messages: ${recentUserLines.join(' | ')}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export async function executeSupabaseTool(query: string, args: Record<string, unknown>) {
  if (query === 'aurora_context') {
    return {
      ok: true,
      query,
      result: await buildAuroraContextSummary({
        userId: typeof args.userId === 'string' ? args.userId : null,
        language: typeof args.language === 'string' ? args.language : 'en',
        timezone: typeof args.timezone === 'string' ? args.timezone : null,
      }),
    };
  }

  if (query === 'recent_messages') {
    const userId = typeof args.userId === 'string' ? args.userId : null;
    if (!userId) {
      return { ok: false, query, error: 'userId is required' };
    }

    const supabase = createAdminSupabaseClient();
    const messages = await safeSelect(
      async () =>
        supabase
          .from('messages')
          .select('content, is_ai_message, created_at')
          .or(`sender_id.eq.${userId},and(sender_id.is.null,is_ai_message.eq.true)`)
          .order('created_at', { ascending: false })
          .limit(typeof args.limit === 'number' ? args.limit : 10),
      [] as Json[]
    );

    return { ok: true, query, result: messages };
  }

  return { ok: false, query, error: `Unsupported query: ${query}` };
}
