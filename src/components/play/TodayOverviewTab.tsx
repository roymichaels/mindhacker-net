/**
 * TodayOverviewTab — CIA-style emotional mission briefing.
 * Narrative-first by request: no stats, no pillars, no task list.
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useWeeklyTacticalPlan, type TacticalAction, type DayPlan } from '@/hooks/useWeeklyTacticalPlan';
import { ShieldAlert, Radar, Crosshair, Lock, Flag, Sparkles } from 'lucide-react';

const FOCUS_INTEL: Record<string, { codename: string; aimHe: string; aimEn: string; whyHe: string; whyEn: string }> = {
  vitality: {
    codename: 'PULSE',
    aimHe: 'לייצב את הגוף כדי לייצר מוח חד לאורך כל היום.',
    aimEn: 'Stabilize your body to unlock a sharp, reliable mind all day.',
    whyHe: 'המשימה הזו בונה עמידות — לא עוד התחלה חזקה ונפילה באמצע.',
    whyEn: 'This operation builds resilience, not just short-lived motivation.',
  },
  focus: {
    codename: 'LASER',
    aimHe: 'לסגור רעש חיצוני ולהחזיר שליטה מנטלית למשימה אחת.',
    aimEn: 'Shut down external noise and reclaim mental command on one objective.',
    whyHe: 'כל דקת ריכוז כאן מייצרת יתרון מצטבר שלא רואים מיד — אבל מרגישים מהר.',
    whyEn: 'Every focused minute compounds into an edge you feel before you can measure.',
  },
  wealth: {
    codename: 'LEVER',
    aimHe: 'להתקדם במשימה שמגדילה חופש כלכלי ולא רק עומס עבודה.',
    aimEn: 'Advance a move that increases financial freedom, not just workload.',
    whyHe: 'זה מהלך אסטרטגי — לא כיבוי שריפות, אלא בניית מנוע.',
    whyEn: 'This is strategic positioning: building an engine, not just fighting fires.',
  },
  influence: {
    codename: 'ECHO',
    aimHe: 'לזקק מסר חד ולהפעיל השפעה מדויקת במקום רעש.',
    aimEn: 'Sharpen your message and create precise influence instead of noise.',
    whyHe: 'השפעה עקבית מייצרת הזדמנויות לפני שבכלל מבקשים אותן.',
    whyEn: 'Consistent influence creates opportunities before you even ask for them.',
  },
  relationships: {
    codename: 'BOND',
    aimHe: 'לבנות אמון עמוק דרך פעולה קטנה אך מכוונת.',
    aimEn: 'Build deep trust through one small but deliberate action.',
    whyHe: 'מערכות יחסים חזקות הן כוח אסטרטגי, לא רק רגש.',
    whyEn: 'Strong relationships are strategic leverage, not only emotion.',
  },
  business: {
    codename: 'VECTOR',
    aimHe: 'להזיז את העסק קדימה בצעד שיוצר מומנטום אמיתי.',
    aimEn: 'Move the business forward with an action that creates real momentum.',
    whyHe: 'כשאתה פועל נכון, המציאות העסקית מתחילה ליישר קו איתך.',
    whyEn: 'When you execute the right move, business reality starts aligning with you.',
  },
  projects: {
    codename: 'FORGE',
    aimHe: 'לסיים מהלך קריטי אחד שמוריד עומס ומעלה קצב.',
    aimEn: 'Finish one critical move that reduces friction and increases velocity.',
    whyHe: 'התקדמות אמיתית מגיעה מסגירות, לא רק מהתחלות.',
    whyEn: 'Real progress comes from closures, not endless starts.',
  },
};

const DEFAULT_INTEL = {
  codename: 'PRIME',
  aimHe: 'לבצע את המשימה המרכזית של היום בלי פיצול קשב.',
  aimEn: 'Execute the day’s primary mission without attention fragmentation.',
  whyHe: 'היום הזה מגדיר זהות — לא מצב רוח.',
  whyEn: 'Today defines identity, not mood.',
};

const OPENING_EN = [
  'Agent, this is not a to-do list. This is your identity test for today.',
  'Your mission today is simple: act before doubt gets a vote.',
  'No drama. No excuses. Precision execution wins this day.',
];

const OPENING_HE = [
  'סוכן, זו לא רשימת משימות — זה מבחן הזהות שלך להיום.',
  'המשימה שלך ברורה: לפעול לפני שהספק מקבל זכות דיבור.',
  'בלי דרמה, בלי תירוצים — ביצוע מדויק מנצח את היום הזה.',
];

const CLOSING_EN = [
  'Win condition: complete the objective cleanly, then move to the next target without negotiation.',
  'Rule of engagement: do not seek motivation first — action creates motivation.',
  'Remember: discipline now buys freedom later.',
];

const CLOSING_HE = [
  'תנאי ניצחון: לסיים את היעד נקי, ואז לעבור ליעד הבא בלי משא ומתן פנימי.',
  'כלל הפעלה: לא מחכים למוטיבציה — פעולה מייצרת מוטיבציה.',
  'תזכור: משמעת עכשיו קונה לך חופש אחר כך.',
];

function pick<T>(arr: T[], seed: number) {
  return arr[Math.abs(seed) % arr.length];
}

export function TodayOverviewTab() {
  const { language } = useTranslation();
  const isHe = language === 'he';

  const phasePlan = useWeeklyTacticalPlan();
  const { days, isLoading } = phasePlan as any;

  const todayPlan: DayPlan | null = useMemo(
    () => (days || []).find((d: DayPlan) => d.isToday) || null,
    [days],
  );

  const todayActions: TacticalAction[] = useMemo(
    () => (todayPlan ? todayPlan.blocks.flatMap((b) => b.actions) : []),
    [todayPlan],
  );

  const completedCount = todayActions.filter((a) => a.completed).length;
  const totalCount = todayActions.length;
  const remainingCount = Math.max(0, totalCount - completedCount);
  const currentAction = todayActions.find((a) => !a.completed) || todayActions[todayActions.length - 1] || null;
  const totalMinutes = todayActions.reduce((sum, a) => sum + (a.estimatedMinutes || 0), 0);

  const now = new Date();
  const weekday = now.toLocaleDateString(isHe ? 'he-IL' : 'en-US', { weekday: 'long' });
  const seed = now.getDate() + remainingCount + totalCount;

  const intel = FOCUS_INTEL[currentAction?.focusArea || ''] || DEFAULT_INTEL;
  const opening = isHe ? pick(OPENING_HE, seed) : pick(OPENING_EN, seed);
  const closing = isHe ? pick(CLOSING_HE, seed + 3) : pick(CLOSING_EN, seed + 3);

  const classification =
    totalCount === 0
      ? isHe
        ? 'RECOVERY PROTOCOL'
        : 'RECOVERY PROTOCOL'
      : remainingCount === 0
        ? isHe
          ? 'MISSION ACCOMPLISHED'
          : 'MISSION ACCOMPLISHED'
        : remainingCount <= 2
          ? isHe
            ? 'FINAL EXECUTION WINDOW'
            : 'FINAL EXECUTION WINDOW'
          : isHe
            ? 'ACTIVE FIELD OPERATION'
            : 'ACTIVE FIELD OPERATION';

  const missionTitle =
    totalCount === 0
      ? isHe
        ? 'אין יעד ביצועי להיום — המשימה היא התאוששות מכוונת.'
        : 'No execution target today — the mission is deliberate recovery.'
      : remainingCount === 0
        ? isHe
          ? 'היעדים של היום הושלמו. אתה שולט בקצב.'
          : 'Today’s objectives are completed. You own the tempo.'
        : isHe
          ? `יעד נוכחי: ${currentAction?.title || 'משימה מרכזית'}`
          : `Current objective: ${currentAction?.titleEn || currentAction?.title || 'Primary mission'}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      dir={isHe ? 'rtl' : 'ltr'}
      className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-background"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsla(var(--primary)/0.15),transparent_55%)]" />
      <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 p-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-background/40 px-2 py-1 text-[10px] font-bold tracking-[0.14em] text-muted-foreground">
              <ShieldAlert className="h-3 w-3 text-primary" />
              {classification}
            </div>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {isHe ? `תדריך שטח // ${weekday}` : `Field Briefing // ${weekday}`}
            </p>
          </div>
          <div className="rounded-md border border-border/70 bg-background/40 px-2 py-1 text-[10px] font-bold text-primary">
            {intel.codename}-{Math.max(1, remainingCount)}
          </div>
        </div>

        <h2 className="text-lg font-black leading-tight text-foreground">
          {missionTitle}
        </h2>

        <p className="text-sm leading-relaxed text-foreground/90">
          {opening}
        </p>

        <div className="space-y-2 rounded-xl border border-border bg-background/35 p-3">
          <div className="flex items-start gap-2">
            <Crosshair className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {isHe ? 'Strategic Aim' : 'Strategic Aim'}
              </p>
              <p className="text-sm font-semibold text-foreground">
                {isHe ? intel.aimHe : intel.aimEn}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Radar className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {isHe ? 'Operational Impact' : 'Operational Impact'}
              </p>
              <p className="text-sm text-foreground/90">
                {isHe ? intel.whyHe : intel.whyEn}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Lock className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {isHe ? 'Rule of Execution' : 'Rule of Execution'}
              </p>
              <p className="text-sm text-foreground/90">{closing}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            <Flag className="h-3.5 w-3.5 text-primary" />
            {isHe ? 'Today Aim' : 'Today Aim'}
          </div>
          <p className="mt-1 text-sm text-foreground/90">
            {totalCount === 0
              ? isHe
                ? 'היעד היום: לטעון אנרגיה בצורה מכוונת כדי להגיע חד יותר למחר.'
                : 'Today’s aim: deliberate recovery so tomorrow starts with sharper force.'
              : isHe
                ? `להשלים ${remainingCount} יעדים שנותרו בלי פיצול קשב ובלי משא ומתן פנימי.${totalMinutes ? ` חלון משוער: ${totalMinutes} דק׳.` : ''}`
                : `Complete the remaining ${remainingCount} objectives with zero attention leakage and zero self-negotiation.${totalMinutes ? ` Estimated window: ${totalMinutes} min.` : ''}`}
          </p>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          {isHe ? 'כשתהיה מוכן — עבור לבקרת משימות ובצע.' : 'When ready, switch to Mission Control and execute.'}
        </div>
      </div>
    </motion.section>
  );
}
