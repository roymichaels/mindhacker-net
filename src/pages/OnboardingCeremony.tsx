/**
 * OnboardingCeremony — 3-step immersive intro after plan generation
 * Step 1: Avatar reveal (personalized orb) with rich lore
 * Step 2: Identity deep-dive (archetypes, traits, behavioral patterns)
 * Step 3: Strategy overview (plan, milestones, daily structure, domains)
 * Then redirects to /mindos/tactics
 */
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PersonalizedOrb } from '@/components/orb';
import {
  ArrowRight, Sparkles, Target, Sword, Shield, Heart, Brain,
  Flame, Eye, Crown, Zap, Clock, TrendingUp, Star, Activity,
  Compass, Award, BarChart3, Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PILLAR_ICONS: Record<string, React.ElementType> = {
  consciousness: Eye,
  presence: Brain,
  power: Flame,
  vitality: Heart,
  focus: Target,
  combat: Sword,
  expansion: Crown,
  wealth: TrendingUp,
  influence: Star,
  romantics: Heart,
  business: BarChart3,
  projects: Compass,
  play: Zap,
  order: Calendar,
};

const PILLAR_LABELS: Record<string, { he: string; en: string }> = {
  consciousness: { he: 'תודעה', en: 'Consciousness' },
  presence: { he: 'דימוי', en: 'Presence' },
  power: { he: 'עוצמה', en: 'Power' },
  vitality: { he: 'חיוניות', en: 'Vitality' },
  focus: { he: 'מיקוד', en: 'Focus' },
  combat: { he: 'קרב', en: 'Combat' },
  expansion: { he: 'התרחבות', en: 'Expansion' },
  wealth: { he: 'עושר', en: 'Wealth' },
  influence: { he: 'השפעה', en: 'Influence' },
  romantics: { he: 'מערכות יחסים', en: 'Relationships' },
  business: { he: 'עסקים', en: 'Business' },
  projects: { he: 'פרויקטים', en: 'Projects' },
  play: { he: 'משחק', en: 'Play' },
  order: { he: 'סדר', en: 'Order' },
};

const archetypeLabels: Record<string, { he: string; en: string }> = {
  guardian: { he: 'שומר', en: 'Guardian' },
  explorer: { he: 'חוקר', en: 'Explorer' },
  sage: { he: 'חכם', en: 'Sage' },
  creator: { he: 'יוצר', en: 'Creator' },
  warrior: { he: 'לוחם', en: 'Warrior' },
  healer: { he: 'מרפא', en: 'Healer' },
  mystic: { he: 'מיסטיקן', en: 'Mystic' },
  sovereign: { he: 'ריבון', en: 'Sovereign' },
};

const archetypeDescriptions: Record<string, { he: string; en: string }> = {
  guardian: {
    he: 'אתה מונע מהצורך להגן, לשמור ולבנות יציבות. הכוח שלך נמצא בעקביות ובנאמנות.',
    en: 'You are driven by the need to protect, preserve, and build stability. Your strength lies in consistency and loyalty.',
  },
  explorer: {
    he: 'אתה מונע מסקרנות ומהצורך לגלות. הכוח שלך בהסתגלות ובחופש.',
    en: 'You are driven by curiosity and discovery. Your strength is in adaptability and freedom.',
  },
  sage: {
    he: 'אתה מונע מהחיפוש אחר אמת וידע עמוק. הכוח שלך במודעות עצמית ותובנה.',
    en: 'You are driven by the pursuit of truth and deep knowledge. Your strength is in self-awareness and insight.',
  },
  creator: {
    he: 'אתה מונע מהצורך ליצור ולבנות. הכוח שלך בדמיון ובחדשנות.',
    en: 'You are driven by the need to create and build. Your strength is in imagination and innovation.',
  },
  warrior: {
    he: 'אתה מונע מהרצון לנצח ולהתגבר. הכוח שלך באומץ ובנחישות.',
    en: 'You are driven by the will to overcome. Your strength is in courage and determination.',
  },
  healer: {
    he: 'אתה מונע מאמפתיה ומהרצון לתקן. הכוח שלך בחמלה ובחיבור.',
    en: 'You are driven by empathy and the desire to restore. Your strength is in compassion and connection.',
  },
  mystic: {
    he: 'אתה מונע מהחיבור לעומק הלא-נודע. הכוח שלך באינטואיציה ובתפיסה רחבה.',
    en: 'You are drawn to the unknown depths. Your strength is in intuition and expansive perception.',
  },
  sovereign: {
    he: 'אתה מונע מהצורך להוביל ולכוון. הכוח שלך בשליטה עצמית ובאחריות.',
    en: 'You are driven by the need to lead and direct. Your strength is in self-mastery and responsibility.',
  },
};

const geometryLabels: Record<string, { he: string; en: string }> = {
  sphere: { he: 'ספירה', en: 'Sphere' },
  torus: { he: 'טורוס', en: 'Torus' },
  octa: { he: 'אוקטהדרון', en: 'Octahedron' },
  dodeca: { he: 'דודקהדרון', en: 'Dodecahedron' },
  icosa: { he: 'איקוסהדרון', en: 'Icosahedron' },
  capsule: { he: 'קפסולה', en: 'Capsule' },
  knot: { he: 'קשר', en: 'Knot' },
  spike: { he: 'חוד', en: 'Spike' },
  tetra: { he: 'טטרהדרון', en: 'Tetrahedron' },
  cube: { he: 'קוביה', en: 'Cube' },
  cylinder: { he: 'צילינדר', en: 'Cylinder' },
  cone: { he: 'חרוט', en: 'Cone' },
  spiky: { he: 'קוצני', en: 'Spiky' },
};

const materialLabels: Record<string, { he: string; en: string }> = {
  glass: { he: 'זכוכית', en: 'Glass' },
  metal: { he: 'מתכת', en: 'Metal' },
  crystal: { he: 'קריסטל', en: 'Crystal' },
  obsidian: { he: 'אובסידיאן', en: 'Obsidian' },
  plasma: { he: 'פלזמה', en: 'Plasma' },
  ice: { he: 'קרח', en: 'Ice' },
  lava: { he: 'לבה', en: 'Lava' },
  nebula: { he: 'ערפילית', en: 'Nebula' },
  iridescent: { he: 'אירידסנט', en: 'Iridescent' },
  matte: { he: 'מאט', en: 'Matte' },
  holographic: { he: 'הולוגרפי', en: 'Holographic' },
  ember: { he: 'גחלת', en: 'Ember' },
  void: { he: 'ריקות', en: 'Void' },
  bone: { he: 'עצם', en: 'Bone' },
  tiger: { he: 'נמר', en: 'Tiger' },
  thorny: { he: 'קוצני', en: 'Thorny' },
  wire: { he: 'חוט', en: 'Wire' },
};

export default function OnboardingCeremony() {
  const [step, setStep] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const navigate = useNavigate();
  const { t, language, isRTL } = useTranslation();
  const { user } = useAuth();
  const { profile: orbProfile } = useOrbProfile();
  const isHe = language === 'he';

  // Fetch identity data
  const { data: identityData } = useQuery({
    queryKey: ['ceremony-identity', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const [summaryRes, profileRes, domainsRes, launchpadRes] = await Promise.all([
        supabase.from('launchpad_summaries').select('summary_data').eq('user_id', user.id).order('generated_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('profiles').select('full_name, level, experience').eq('id', user.id).single(),
        supabase.from('life_domains').select('domain_id, status, domain_config').eq('user_id', user.id),
        supabase.from('launchpad_progress').select('step_1_intention, step_2_profile_data').eq('user_id', user.id).single(),
      ]);
      return {
        summary: summaryRes.data?.summary_data as Record<string, any> | null,
        profile: profileRes.data,
        domains: domainsRes.data || [],
        launchpad: {
          step1: launchpadRes.data?.step_1_intention as unknown as Record<string, any> | null,
          step2: launchpadRes.data?.step_2_profile_data as unknown as Record<string, any> | null,
        },
      };
    },
    enabled: !!user?.id,
  });

  // Fetch strategy data
  const { data: strategyData } = useQuery({
    queryKey: ['ceremony-strategy', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const planRes = await supabase.from('life_plans').select('id, plan_data, progress_percentage').eq('user_id', user.id).eq('status', 'active').order('created_at', { ascending: false }).limit(1).maybeSingle();

      let milestones: any[] = [];
      if (planRes.data?.id) {
        const { data: mData } = await supabase.from('life_plan_milestones').select('title, week_number, focus_area, is_completed').eq('plan_id', planRes.data.id).order('week_number', { ascending: true }).limit(6);
        milestones = mData || [];
      }

      const planData = planRes.data?.plan_data as Record<string, any> | null;
      return {
        plan: planRes.data ? {
          title: planData?.title || planData?.plan_title || (isHe ? 'תוכנית טרנספורמציה' : 'Transformation Plan'),
          description: planData?.description || planData?.summary || null,
          mission: planData?.mission || planData?.north_star || null,
          progress: planRes.data.progress_percentage,
        } : null,
        milestones,
      };
    },
    enabled: !!user?.id,
  });

  // Delay content reveal for dramatic effect
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(timer);
  }, [step]);

  const handleNext = () => {
    setShowContent(false);
    if (step < 2) {
      setTimeout(() => setStep(s => s + 1), 300);
    } else {
      sessionStorage.setItem('just_completed_onboarding', '1');
      navigate('/mindos/tactics', { replace: true });
    }
  };

  // Extract traits from orb computed_from
  const computed = orbProfile?.computedFrom || {} as any;
  const archetype = computed.dominantArchetype || 'guardian';
  const secondaryArchetype = computed.secondaryArchetype || 'explorer';
  const geometry = orbProfile?.geometryFamily || computed.geometryFamily || 'sphere';
  const material = orbProfile?.materialType || computed.visualDNA?.materialType || 'glass';

  // Active domains/pillars
  const activeDomains = useMemo(() =>
    (identityData?.domains || [])
      .filter((d: any) => d.status === 'configured' || d.status === 'active')
      .map((d: any) => d.domain_id),
    [identityData?.domains]
  );

  // Extract user data from launchpad for richer reveal
  const launchpad = identityData?.launchpad;
  const target90 = launchpad?.step1?.target_90_days || launchpad?.step2?.target_90_days;
  const whyMatters = launchpad?.step1?.why_matters || launchpad?.step2?.why_matters;
  const wakeTime = launchpad?.step2?.wake_time;
  const sleepTime = launchpad?.step2?.sleep_time;
  const peakEnergy = launchpad?.step2?.energy_peak_time;
  const executionPattern = launchpad?.step2?.execution_pattern;
  const motivationDriver = launchpad?.step2?.motivation_driver;

  const userName = identityData?.profile?.full_name || (isHe ? 'נוסע' : 'Traveler');

  const stepLabels = [
    isHe ? 'האווטאר שלך' : 'Your Avatar',
    isHe ? 'הזהות שלך' : 'Your Identity',
    isHe ? 'האסטרטגיה שלך' : 'Your Strategy',
  ];

  const executionLabels: Record<string, { he: string; en: string }> = {
    start_strong_quit: { he: 'מתחיל חזק — נוטה לוותר', en: 'Strong starter — tends to quit' },
    overplan_delay: { he: 'מתכנן יתר — מתעכב', en: 'Over-planner — delays action' },
    avoid_hard_tasks: { he: 'נמנע ממשימות קשות', en: 'Avoids hard tasks' },
    burn_out_fast: { he: 'נשרף מהר', en: 'Burns out fast' },
    intense_inconsistent: { he: 'אינטנסיבי אך לא עקבי', en: 'Intense but inconsistent' },
    consistent_plateaued: { he: 'עקבי אך תקוע', en: 'Consistent but plateaued' },
  };

  const motivationLabels: Record<string, { he: string; en: string }> = {
    freedom: { he: 'חופש', en: 'Freedom' },
    mastery: { he: 'שליטה', en: 'Mastery' },
    legacy: { he: 'מורשת', en: 'Legacy' },
    connection: { he: 'חיבור', en: 'Connection' },
    impact: { he: 'השפעה', en: 'Impact' },
    security: { he: 'ביטחון', en: 'Security' },
    growth: { he: 'צמיחה', en: 'Growth' },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8 overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Progress dots */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        {[0, 1, 2].map(i => (
          <div key={i} className={cn(
            "h-2 rounded-full transition-all duration-500",
            i === step ? "w-8 bg-primary" : i < step ? "w-2 bg-primary/60" : "w-2 bg-muted-foreground/30"
          )} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ─── Step 1: Avatar Reveal ─── */}
        {step === 0 && (
          <motion.div
            key="avatar"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, y: -40 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-center gap-6 max-w-md text-center pb-24"
          >
            {/* Orb with glow — force CSS to avoid WebGL initial render bugs */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8, type: 'spring', bounce: 0.3 }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl scale-150" />
              <PersonalizedOrb size={260} renderer="css" />
            </motion.div>

            {showContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {isHe ? `${userName}, הנה האורב שלך` : `${userName}, Meet Your Orb`}
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {isHe
                    ? 'ישות אנרגטית ייחודית שנולדה מתוך הזהות, ההרגלים והשאיפות שלך. היא תגדל איתך לאורך 100 הימים הקרובים ומעבר להם.'
                    : 'A unique energy entity born from your identity, habits, and aspirations. It will grow alongside you throughout your 100-day journey and beyond.'}
                </p>

                {/* Orb DNA traits */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                      ✦ {archetypeLabels[archetype]?.[isHe ? 'he' : 'en'] || archetype}
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-accent/10 text-accent-foreground text-xs font-semibold border border-accent/20">
                      ◇ {geometryLabels[geometry]?.[isHe ? 'he' : 'en'] || geometry}
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold border border-border">
                      ◈ {materialLabels[material]?.[isHe ? 'he' : 'en'] || material}
                    </span>
                  </div>

                  {/* Archetype description */}
                  <p className="text-xs text-muted-foreground italic leading-relaxed max-w-xs mx-auto">
                    {archetypeDescriptions[archetype]?.[isHe ? 'he' : 'en'] || ''}
                  </p>
                </div>

                {/* Orb evolution hint */}
                <div className="rounded-xl bg-primary/5 border border-primary/15 p-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-primary" />
                    <span>
                      {isHe
                        ? 'האורב שלך ישנה צורה כל 25 רמות. השלם משימות כדי להתפתח.'
                        : 'Your orb morphs into new shapes every 25 levels. Complete missions to evolve.'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ─── Step 2: Identity & Traits ─── */}
        {step === 1 && (
          <motion.div
            key="traits"
            initial={{ opacity: 0, x: isRTL ? -60 : 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 60 : -60 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-5 max-w-md text-center w-full pb-24"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <Sparkles className="w-12 h-12 text-primary" />
            </motion.div>

            {showContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 w-full"
              >
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {isHe ? 'הזהות שלך' : 'Your Identity'}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {isHe ? 'המערכת ניתחה את התשובות שלך וזיהתה את הדפוסים הבאים' : 'The system analyzed your answers and identified these patterns'}
                  </p>
                </div>

                {/* Archetype card — expanded */}
                <div className="rounded-2xl bg-card border border-border p-4 space-y-3 text-start">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {isHe ? 'ארכיטיפ דומיננטי' : 'Dominant Archetype'}
                    </span>
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-xl font-bold text-primary">
                    {archetypeLabels[archetype]?.[isHe ? 'he' : 'en'] || archetype}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {archetypeDescriptions[archetype]?.[isHe ? 'he' : 'en'] || ''}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                    <span>{isHe ? 'ארכיטיפ משני:' : 'Secondary:'}</span>
                    <span className="text-foreground font-medium">
                      {archetypeLabels[secondaryArchetype]?.[isHe ? 'he' : 'en'] || secondaryArchetype}
                    </span>
                  </div>
                </div>

                {/* Behavioral patterns */}
                {(executionPattern || motivationDriver) && (
                  <div className="rounded-2xl bg-card border border-border p-4 space-y-3 text-start">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {isHe ? 'דפוסי התנהגות' : 'Behavioral Patterns'}
                    </span>
                    <div className="space-y-2">
                      {executionPattern && (
                        <div className="flex items-center gap-3">
                          <Activity className="w-4 h-4 text-amber-500 shrink-0" />
                          <div>
                            <span className="text-[11px] text-muted-foreground">{isHe ? 'סגנון ביצוע' : 'Execution Style'}</span>
                            <p className="text-sm font-medium">
                              {executionLabels[executionPattern]?.[isHe ? 'he' : 'en'] || executionPattern}
                            </p>
                          </div>
                        </div>
                      )}
                      {motivationDriver && (
                        <div className="flex items-center gap-3">
                          <Flame className="w-4 h-4 text-red-500 shrink-0" />
                          <div>
                            <span className="text-[11px] text-muted-foreground">{isHe ? 'מניע מרכזי' : 'Core Driver'}</span>
                            <p className="text-sm font-medium">
                              {motivationLabels[motivationDriver]?.[isHe ? 'he' : 'en'] || motivationDriver}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* User's goal */}
                {target90 && (
                  <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4 space-y-2 text-start">
                    <span className="text-xs text-primary font-semibold uppercase tracking-wider">
                      {isHe ? '🎯 היעד שלך ל-100 יום' : '🎯 Your 100-Day Target'}
                    </span>
                    <p className="text-sm text-foreground leading-relaxed">"{target90}"</p>
                    {whyMatters && (
                      <p className="text-xs text-muted-foreground italic">
                        {isHe ? 'למה זה חשוב: ' : 'Why it matters: '}{whyMatters}
                      </p>
                    )}
                  </div>
                )}

                {/* Active pillars */}
                {activeDomains.length > 0 && (
                  <div className="rounded-2xl bg-card border border-border p-4 space-y-3 text-start">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {isHe ? `${activeDomains.length} תחומי חיים פעילים` : `${activeDomains.length} Active Life Domains`}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {activeDomains.map((domain: string) => {
                        const Icon = PILLAR_ICONS[domain] || Target;
                        const label = PILLAR_LABELS[domain]?.[isHe ? 'he' : 'en'] || domain;
                        return (
                          <div key={domain} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                            <Icon className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-sm font-medium truncate">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ─── Step 3: Strategy Overview ─── */}
        {step === 2 && (
          <motion.div
            key="strategy"
            initial={{ opacity: 0, x: isRTL ? -60 : 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 60 : -60 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-5 max-w-md text-center w-full pb-24"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <Target className="w-12 h-12 text-primary" />
            </motion.div>

            {showContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 w-full"
              >
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {isHe ? 'תוכנית 100 הימים שלך' : 'Your 100-Day Plan'}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {isHe
                      ? 'אסטרטגיה מותאמת אישית שנבנתה מתוך הנתונים שלך'
                      : 'A personalized strategy built from your data'}
                  </p>
                </div>

                {/* Plan mission / north star */}
                {strategyData?.plan && (
                  <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-4 space-y-3 text-start">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary" />
                      <span className="text-xs text-primary font-semibold uppercase tracking-wider">
                        {isHe ? 'המשימה שלך' : 'Your Mission'}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {strategyData.plan.title}
                    </div>
                    {strategyData.plan.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {strategyData.plan.description}
                      </p>
                    )}
                    {strategyData.plan.mission && (
                      <p className="text-sm text-foreground/80 italic border-t border-border/30 pt-2">
                        "{strategyData.plan.mission}"
                      </p>
                    )}
                  </div>
                )}

                {/* Daily rhythm */}
                {(wakeTime || sleepTime || peakEnergy) && (
                  <div className="rounded-2xl bg-card border border-border p-4 space-y-3 text-start">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {isHe ? 'מקצב יומי' : 'Daily Rhythm'}
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {wakeTime && (
                        <div className="rounded-lg bg-amber-500/10 p-2 text-center">
                          <span className="text-lg">☀️</span>
                          <p className="text-xs text-muted-foreground">{isHe ? 'השכמה' : 'Wake'}</p>
                          <p className="text-sm font-bold font-mono">{wakeTime}</p>
                        </div>
                      )}
                      {peakEnergy && (
                        <div className="rounded-lg bg-primary/10 p-2 text-center">
                          <span className="text-lg">⚡</span>
                          <p className="text-xs text-muted-foreground">{isHe ? 'שיא אנרגיה' : 'Peak'}</p>
                          <p className="text-sm font-bold capitalize">{peakEnergy}</p>
                        </div>
                      )}
                      {sleepTime && (
                        <div className="rounded-lg bg-indigo-500/10 p-2 text-center">
                          <span className="text-lg">🌙</span>
                          <p className="text-xs text-muted-foreground">{isHe ? 'שינה' : 'Sleep'}</p>
                          <p className="text-sm font-bold font-mono">{sleepTime}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Milestones */}
                {strategyData?.milestones && strategyData.milestones.length > 0 && (
                  <div className="rounded-2xl bg-card border border-border p-4 space-y-3 text-start">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        {isHe ? 'אבני דרך ראשונות' : 'First Milestones'}
                      </span>
                      <span className="text-[10px] text-primary font-mono">
                        {strategyData.milestones.length} {isHe ? 'שלבים' : 'phases'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {strategyData.milestones.slice(0, 5).map((m: any, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: isRTL ? 15 : -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * i }}
                          className="flex items-start gap-3"
                        >
                          <div className="mt-0.5 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                            <span className="text-[10px] font-bold text-primary">W{m.week_number || i + 1}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium leading-tight">{m.title}</p>
                            {m.focus_area && (
                              <p className="text-xs text-muted-foreground capitalize mt-0.5">
                                {PILLAR_LABELS[m.focus_area]?.[isHe ? 'he' : 'en'] || m.focus_area}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-card border border-border p-3 text-center">
                    <p className="text-xl font-bold text-primary">100</p>
                    <p className="text-[10px] text-muted-foreground">{isHe ? 'ימים' : 'Days'}</p>
                  </div>
                  <div className="rounded-xl bg-card border border-border p-3 text-center">
                    <p className="text-xl font-bold text-primary">{activeDomains.length || '—'}</p>
                    <p className="text-[10px] text-muted-foreground">{isHe ? 'תחומים' : 'Domains'}</p>
                  </div>
                  <div className="rounded-xl bg-card border border-border p-3 text-center">
                    <p className="text-xl font-bold text-primary">{strategyData?.milestones?.length || '—'}</p>
                    <p className="text-[10px] text-muted-foreground">{isHe ? 'אבני דרך' : 'Milestones'}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue button */}
      <motion.div
        className="fixed bottom-8 left-0 right-0 px-6 flex justify-center z-40"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <button
          onClick={handleNext}
          className="w-full max-w-sm py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
        >
          {step < 2 ? (
            <>
              {stepLabels[step + 1]}
              <ArrowRight className="w-5 h-5" />
            </>
          ) : (
            <>
              {isHe ? 'בוא נתחיל! 🚀' : "Let's Begin! 🚀"}
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
