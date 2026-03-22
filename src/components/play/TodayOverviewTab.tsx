/**
 * TodayOverviewTab — Adventure-game styled mission card with today's task roadmap.
 * Content dynamically updates based on selected task node.
 */
import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useWeeklyTacticalPlan, type TacticalAction, type DayPlan } from '@/hooks/useWeeklyTacticalPlan';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { getCurrentDayInIsrael } from '@/utils/currentDay';
import {
  Crosshair, CheckCircle2, Target, MessageCircle,
} from 'lucide-react';
import { PlanChatWizard } from '@/components/plan/PlanChatWizard';


/* ── Pillar visuals ── */
const PILLAR_VIS: Record<string, { emoji: string; color: string; bg: string; labelHe: string; labelEn: string }> = {
  vitality:      { emoji: '❤️‍🔥', color: 'text-rose-400',    bg: 'bg-rose-500/15',    labelHe: 'חיוניות',       labelEn: 'Vitality' },
  power:         { emoji: '⚡',    color: 'text-orange-400',  bg: 'bg-orange-500/15',  labelHe: 'כוח',           labelEn: 'Power' },
  focus:         { emoji: '🧠',    color: 'text-sky-400',     bg: 'bg-sky-500/15',     labelHe: 'מיקוד',         labelEn: 'Focus' },
  wealth:        { emoji: '💎',    color: 'text-emerald-400', bg: 'bg-emerald-500/15', labelHe: 'עושר',          labelEn: 'Wealth' },
  consciousness: { emoji: '✨',   color: 'text-violet-400',  bg: 'bg-violet-500/15',  labelHe: 'תודעה',         labelEn: 'Consciousness' },
  combat:        { emoji: '🥊',    color: 'text-red-400',     bg: 'bg-red-500/15',     labelHe: 'לחימה',         labelEn: 'Combat' },
  expansion:     { emoji: '🌀',    color: 'text-indigo-400',  bg: 'bg-indigo-500/15',  labelHe: 'התרחבות',       labelEn: 'Expansion' },
  influence:     { emoji: '📡',    color: 'text-amber-400',   bg: 'bg-amber-500/15',   labelHe: 'השפעה',         labelEn: 'Influence' },
  relationships: { emoji: '🤝',    color: 'text-pink-400',    bg: 'bg-pink-500/15',    labelHe: 'מערכות יחסים', labelEn: 'Relationships' },
  business:      { emoji: '🚀',    color: 'text-cyan-400',    bg: 'bg-cyan-500/15',    labelHe: 'עסקים',         labelEn: 'Business' },
  projects:      { emoji: '🔧',    color: 'text-teal-400',    bg: 'bg-teal-500/15',    labelHe: 'פרויקטים',     labelEn: 'Projects' },
};
const DEFAULT_PILLAR = { emoji: '🎯', color: 'text-primary', bg: 'bg-primary/15', labelHe: 'כללי', labelEn: 'General' };


/* ── Step-by-step guide templates per pillar ── */
interface MissionGuide {
  steps: string[];
  youtubeTip?: string;
}

const MISSION_GUIDES_HE: Record<string, MissionGuide> = {
  vitality: {
    steps: ['הכן בגדי ספורט ובקבוק מים', 'חמם 3-5 דקות (מתיחות קלות או הליכה)', 'בצע את האימון / פעילות לפי ההנחיה', 'סיים עם שתייה ונשימות עמוקות', 'רשום איך הרגשת אחרי'],
    youtubeTip: 'חפש: "אימון HIIT קצר בעברית" או "מתיחות בוקר 10 דקות"',
  },
  power: {
    steps: ['הכן את הציוד הנדרש (משקולות / גומיות / מזרן)', 'חימום 5 דקות — סיבובי כתפיים, סקוואט ריק', 'בצע 3-4 סטים של התרגיל המרכזי', 'מנוחה 60-90 שניות בין סטים', 'שתייה וקירור'],
    youtubeTip: 'חפש: "אימון כוח למתחילים" או "strength training at home"',
  },
  focus: {
    steps: ['השתק את כל ההתראות בטלפון', 'הגדר טיימר לזמן שנקבע', 'בחר משימה אחת בלבד ועבוד עליה', 'אם נתקעת — רשום את החסם והמשך', 'בסיום — סמן מה הושג'],
    youtubeTip: 'חפש: "pomodoro technique tutorial" או "deep work tips"',
  },
  wealth: {
    steps: ['פתח את הגיליון / אפליקציית המעקב הפיננסי', 'רשום הוצאות / הכנסות של היום', 'בדוק התקדמות מול יעד חודשי', 'זהה הוצאה אחת שניתן לצמצם', 'הגדר פעולה אחת ליום הבא'],
  },
  consciousness: {
    steps: ['שב במקום שקט ונוח', 'עצום עיניים ונשום 5 נשימות עמוקות', 'בצע את התרגול — מדיטציה / כתיבה / רפלקציה', 'שים לב למחשבות בלי לשפוט', 'רשום תובנה אחת שעלתה'],
    youtubeTip: 'חפש: "מדיטציה מודרכת בעברית" או "guided meditation 10 min"',
  },
  combat: {
    steps: ['חמם את הגוף — ריצה קלה או קפיצות', 'עבוד על טכניקה בסיסית (מכות / בעיטות / תנועה)', 'תרגל קומבינציות 3-5 דקות', 'סיים עם עבודת ליבה ומתיחות', 'שתה מים והירגע'],
    youtubeTip: 'חפש: "אימון קרב מגע בבית" או "shadow boxing workout"',
  },
  expansion: {
    steps: ['בחר את הנושא / המיומנות החדשה', 'הקדש 15-20 דקות ללמידה מרוכזת', 'תרגל או יישם מה שלמדת', 'רשום 3 דברים חדשים שהבנת', 'תכנן את הצעד הבא'],
    youtubeTip: 'חפש לפי הנושא הספציפי שלך ביוטיוב',
  },
  influence: {
    steps: ['הגדר את המסר שרוצה להעביר', 'בחר את הפלטפורמה / הערוץ המתאים', 'צור / כתוב / הקלט את התוכן', 'שתף ובקש פידבק מאדם אחד', 'נתח מה עבד ומה פחות'],
  },
  relationships: {
    steps: ['בחר אדם אחד שרוצה לחזק איתו קשר', 'שלח הודעה / התקשר / קבע מפגש', 'תן תשומת לב מלאה בשיחה', 'שאל שאלה אמיתית אחת', 'ציין דבר אחד שאתה מעריך בו'],
  },
  business: {
    steps: ['בדוק את רשימת המשימות העסקיות', 'בחר את המשימה הדחופה / חשובה ביותר', 'עבוד עליה ב-focus block של 25-45 דקות', 'שלח / פרסם / סגור — תעשה אקשן', 'עדכן את הסטטוס ותכנן את הבא'],
  },
  projects: {
    steps: ['פתח את הפרויקט ובדוק מה הצעד הבא', 'פרק אותו למשימה קטנה שאפשר לסיים היום', 'בצע ללא הסחות 20-30 דקות', 'בדוק את התוצאה — האם זה עובד?', 'שמור והתקדם לצעד הבא'],
  },
};

const MISSION_GUIDES_EN: Record<string, MissionGuide> = {
  vitality: {
    steps: ['Prepare workout clothes & water', 'Warm up 3-5 min (light stretches or walk)', 'Perform the workout as instructed', 'Cool down with deep breaths & hydration', 'Note how you felt after'],
    youtubeTip: 'Search: "10 min morning stretch" or "quick HIIT workout"',
  },
  power: {
    steps: ['Set up equipment (weights / bands / mat)', 'Warm up 5 min — shoulder circles, bodyweight squats', 'Perform 3-4 sets of main exercise', 'Rest 60-90 sec between sets', 'Hydrate and cool down'],
    youtubeTip: 'Search: "beginner strength training" or "home workout no equipment"',
  },
  focus: {
    steps: ['Silence all phone notifications', 'Set a timer for the designated duration', 'Pick ONE task and work only on it', 'If stuck — note the blocker and continue', 'Mark what was accomplished'],
    youtubeTip: 'Search: "pomodoro technique" or "deep work tips"',
  },
  wealth: {
    steps: ['Open your financial tracker / spreadsheet', 'Log today\'s expenses and income', 'Check progress against monthly goal', 'Identify one expense to reduce', 'Set one action for tomorrow'],
  },
  consciousness: {
    steps: ['Sit in a quiet, comfortable place', 'Close eyes and take 5 deep breaths', 'Perform the practice — meditation / journaling / reflection', 'Observe thoughts without judgment', 'Write down one insight'],
    youtubeTip: 'Search: "guided meditation 10 min" or "mindfulness for beginners"',
  },
  combat: {
    steps: ['Warm up — light jog or jumping jacks', 'Work on basic technique (strikes / kicks / movement)', 'Practice combinations for 3-5 min', 'Finish with core work and stretches', 'Hydrate and recover'],
    youtubeTip: 'Search: "shadow boxing workout" or "martial arts at home"',
  },
  expansion: {
    steps: ['Choose the topic / new skill', 'Dedicate 15-20 min to focused learning', 'Practice or apply what you learned', 'Write 3 new things you understood', 'Plan the next step'],
    youtubeTip: 'Search YouTube for your specific topic',
  },
  influence: {
    steps: ['Define the message you want to deliver', 'Choose the right platform / channel', 'Create / write / record the content', 'Share and ask one person for feedback', 'Analyze what worked'],
  },
  relationships: {
    steps: ['Pick one person to strengthen a bond with', 'Send a message / call / schedule a meetup', 'Give full attention in conversation', 'Ask one genuine question', 'Express one thing you appreciate about them'],
  },
  business: {
    steps: ['Review your business task list', 'Pick the most urgent / important task', 'Work on it in a 25-45 min focus block', 'Ship / publish / close — take action', 'Update status and plan the next move'],
  },
  projects: {
    steps: ['Open the project and check the next step', 'Break it into a small task you can finish today', 'Execute without distractions for 20-30 min', 'Review the result — does it work?', 'Save and move to the next step'],
  },
};

const DEFAULT_GUIDE_HE: MissionGuide = {
  steps: ['קרא את תיאור המשימה בעיון', 'הכן את מה שצריך לפני שמתחילים', 'בצע צעד אחד בכל פעם — בלי למהר', 'בדוק את התוצאה ותקן אם צריך', 'סמן כהושלם וקח נשימה'],
};
const DEFAULT_GUIDE_EN: MissionGuide = {
  steps: ['Read the mission description carefully', 'Prepare what you need before starting', 'Execute one step at a time — no rushing', 'Review the result and adjust if needed', 'Mark as done and take a breath'],
};

function getMissionGuide(pillarKey: string, isHe: boolean): MissionGuide {
  const guides = isHe ? MISSION_GUIDES_HE : MISSION_GUIDES_EN;
  return guides[pillarKey] || (isHe ? DEFAULT_GUIDE_HE : DEFAULT_GUIDE_EN);
}

export function TodayOverviewTab() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const phasePlan = useWeeklyTacticalPlan();
  const { days, isLoading } = phasePlan as any;
  const { plan } = useLifePlanWithMilestones();
  const currentDay = useMemo(() => getCurrentDayInIsrael(plan?.start_date), [plan?.start_date]);

  const [selectedTaskIdx, setSelectedTaskIdx] = useState<number | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const openDayChat = useCallback(() => setChatOpen(true), []);

  const todayPlan: DayPlan | null = useMemo(
    () => (days || []).find((d: DayPlan) => d.isToday) || null, [days],
  );
  const todayActions: TacticalAction[] = useMemo(
    () => (todayPlan ? todayPlan.blocks.flatMap((b) => b.actions) : []), [todayPlan],
  );

  const remainingCount = todayActions.filter((a) => !a.completed).length;
  const totalCount = todayActions.length;
  const completedCount = totalCount - remainingCount;
  const currentActionIdx = todayActions.findIndex((a) => !a.completed);

  // The "active" task is: selected task if picked, else current (first incomplete)
  const activeIdx = selectedTaskIdx ?? currentActionIdx;
  const activeTask = activeIdx >= 0 ? todayActions[activeIdx] : null;
  const activePillarKey = activeTask?.focusArea || '';
  const activePillar = PILLAR_VIS[activePillarKey] || DEFAULT_PILLAR;

  // Get step-by-step guide for the active task's pillar
  const guide = useMemo(() => getMissionGuide(activePillarKey, isHe), [activePillarKey, isHe]);

  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      dir={isHe ? 'rtl' : 'ltr'}
    >
      <div className="relative rounded-2xl overflow-hidden border border-cyan-500/20">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,30%,8%)] via-[hsl(230,25%,12%)] to-[hsl(250,20%,10%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/[0.04] via-transparent to-violet-500/[0.06]" />
        <div className="absolute top-0 end-0 w-40 h-40 rounded-full bg-cyan-500/[0.08] blur-[60px]" />
        <div className="absolute bottom-0 start-0 w-32 h-32 rounded-full bg-violet-500/[0.06] blur-[50px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 p-4 space-y-3">
          {/* ── CTA: Talk to your day ── */}
          <button
            onClick={openDayChat}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500/20 via-violet-500/15 to-cyan-500/20 border border-cyan-400/30 hover:border-cyan-400/50 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] active:scale-[0.98] group"
          >
            <MessageCircle className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            <span className="text-sm font-black text-cyan-200 group-hover:text-cyan-100 transition-colors">
              {isHe ? 'ספר לי מה עשית היום' : 'Tell me what you did today'}
            </span>
          </button>

          {/* ── Today's Task Roadmap ── */}
          {todayActions.length > 0 && (
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-cyan-300/90">
                    {isHe ? 'משימות היום' : "Today's Missions"}
                  </span>
                  <span className="text-xs text-cyan-200/40 font-bold">
                    {completedCount}/{totalCount}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-cyan-200/40">
                  {isHe ? `יום ${currentDay}/100` : `Day ${currentDay}/100`}
                </span>
              </div>

              {/* Progress bar */}
              <div className="relative h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 start-0 rounded-full bg-gradient-to-r from-cyan-500 via-violet-500 to-amber-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>

              {/* Task tags */}
              <div className="flex flex-wrap gap-1.5">
                {todayActions.map((action, idx) => {
                  const pv = PILLAR_VIS[action.focusArea || ''] || DEFAULT_PILLAR;
                  const isSelected = activeIdx === idx;
                  const isDone = action.completed;
                  const label = action.title || (isHe ? pv.labelHe : pv.labelEn);

                  return (
                    <button
                      key={action.id || idx}
                      onClick={() => setSelectedTaskIdx(idx)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all",
                        pv.bg,
                        isDone && "opacity-50 line-through",
                        isSelected
                          ? "ring-2 ring-offset-1 ring-offset-transparent ring-current shadow-sm scale-105"
                          : "hover:brightness-125",
                        pv.color
                      )}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <span className="text-xs">{pv.emoji}</span>
                      )}
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Selected Mission Detail ── */}
          {activeTask ? (
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-start gap-3 py-2.5 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06]"
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                activeTask.completed ? "bg-emerald-500/20" : "bg-cyan-500/15"
              )}>
                {activeTask.completed
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  : <Crosshair className="w-4 h-4 text-cyan-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-[0.12em] px-1.5 py-0.5 rounded",
                    activeTask.completed ? "text-emerald-400/70 bg-emerald-500/10" : `${activePillar.color} ${activePillar.bg}`
                  )}>
                    {isHe ? activePillar.labelHe : activePillar.labelEn}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[0.12em] text-cyan-500/50">
                    {activeTask.completed
                      ? (isHe ? 'הושלם ✓' : 'Completed ✓')
                      : selectedTaskIdx !== null
                        ? (isHe ? `משימה ${activeIdx + 1}` : `Mission ${activeIdx + 1}`)
                        : (isHe ? 'משימה נוכחית' : 'Current Mission')
                    }
                  </span>
                </div>
                <span className={cn(
                  "text-sm font-black leading-tight block",
                  activeTask.completed ? "text-white/30 line-through" : "text-white/90"
                )}>
                  {isHe ? activeTask.title : (activeTask.titleEn || activeTask.title)}
                </span>
                {activeTask.description && (
                  <p className={cn("text-xs text-white/40 leading-snug mt-0.5", activeTask.completed && "line-through opacity-50")}>
                    {isHe ? activeTask.description : (activeTask.descriptionEn || activeTask.description)}
                  </p>
                )}
                {(activeTask as any).timeBlock && (
                  <span className="text-[10px] text-cyan-300/40 mt-1 block">
                    🕐 {(activeTask as any).timeBlock}
                  </span>
                )}
              </div>
            </motion.div>
          ) : totalCount === 0 ? (
            <div className="text-center py-3">
              <span className="text-xl">🌙</span>
              <h3 className="text-sm font-black text-white mt-1">{isHe ? 'יום התאוששות' : 'Recovery Day'}</h3>
              <p className="text-xs text-cyan-200/50">{isHe ? 'מחר חוזרים חדים.' : 'Tomorrow we return sharp.'}</p>
            </div>
          ) : (
            <div className="text-center py-2">
              <span className="text-xl">🏆</span>
              <h3 className="text-sm font-black text-white mt-1">{isHe ? 'כל היעדים הושלמו!' : 'All objectives complete!'}</h3>
            </div>
          )}

          {/* ── Field Briefing — dynamic per active task's pillar ── */}
          <motion.div
            key={`briefing-${activeIdx}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl bg-white/[0.02] border border-white/[0.05] px-3 py-3 space-y-2"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-400/50 flex items-center gap-1.5">
              ✦ {isHe ? 'מדריך שטח' : 'Field Guide'}
            </span>
            <p className="text-sm text-cyan-100/60 leading-relaxed">
              {assessment}
            </p>
            <p className="text-sm font-semibold text-cyan-100/70 leading-relaxed flex gap-1.5">
              <span className="flex-shrink-0">⚔️</span> {doctrine}
            </p>
            <p className="text-xs italic text-cyan-100/40 leading-relaxed flex gap-1.5">
              <span className="flex-shrink-0">🔍</span> {intel}
            </p>
          </motion.div>

          {/* ── Commander sign-off ── */}
          <div className="border-t border-white/[0.06] pt-2 text-center">
            <p className="text-xs font-black uppercase tracking-[0.1em] text-white/15">
              {commander}
            </p>
          </div>
        </div>
      </div>

      {/* Day Chat Wizard */}
      <PlanChatWizard open={chatOpen} onOpenChange={setChatOpen} />
    </motion.div>
  );
}
