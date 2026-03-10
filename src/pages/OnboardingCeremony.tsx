/**
 * OnboardingCeremony — 3-step immersive intro after plan generation
 * Step 1: Avatar reveal (personalized orb)
 * Step 2: Identity traits
 * Step 3: Strategy overview
 * Then redirects to /profile
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PersonalizedOrb } from '@/components/orb';
import { ArrowRight, Sparkles, Target, Sword, Shield, Heart, Brain, Flame, Eye, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

const PILLAR_ICONS: Record<string, React.ElementType> = {
  consciousness: Eye,
  presence: Brain,
  power: Flame,
  vitality: Heart,
  focus: Target,
  combat: Sword,
  expansion: Crown,
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
      const [summaryRes, profileRes, domainsRes] = await Promise.all([
        supabase.from('launchpad_summaries').select('summary_data').eq('user_id', user.id).order('generated_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('profiles').select('full_name, level, experience').eq('id', user.id).single(),
        supabase.from('life_domains').select('domain_id, status, domain_config').eq('user_id', user.id),
      ]);
      return {
        summary: summaryRes.data?.summary_data as Record<string, any> | null,
        profile: profileRes.data,
        domains: domainsRes.data || [],
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
        const { data: mData } = await supabase.from('life_plan_milestones').select('title, week_number, focus_area, is_completed').eq('plan_id', planRes.data.id).order('week_number', { ascending: true }).limit(5);
        milestones = mData || [];
      }
      
      const planData = planRes.data?.plan_data as Record<string, any> | null;
      return { 
        plan: planRes.data ? {
          title: planData?.title || planData?.plan_title || (isHe ? 'תוכנית טרנספורמציה' : 'Transformation Plan'),
          description: planData?.description || planData?.summary || null,
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
      navigate('/profile', { replace: true });
    }
  };

  // Extract traits from orb computed_from
  const computed = orbProfile?.computedFrom || {} as any;
  const archetype = computed.dominantArchetype || 'guardian';
  const secondaryArchetype = computed.secondaryArchetype || 'explorer';
  const geometry = computed.geometryFamily || 'sphere';
  const material = computed.visualDNA?.materialType || 'glass';

  // Active domains/pillars
  const activeDomains = (identityData?.domains || [])
    .filter((d: any) => d.status === 'configured' || d.status === 'active')
    .map((d: any) => d.domain_id);

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

  const geometryLabels: Record<string, { he: string; en: string }> = {
    sphere: { he: 'ספירה', en: 'Sphere' },
    torus: { he: 'טורוס', en: 'Torus' },
    octahedron: { he: 'אוקטהדרון', en: 'Octahedron' },
    dodecahedron: { he: 'דודקהדרון', en: 'Dodecahedron' },
    icosahedron: { he: 'איקוסהדרון', en: 'Icosahedron' },
    capsule: { he: 'קפסולה', en: 'Capsule' },
    knot: { he: 'קשר', en: 'Knot' },
    spike: { he: 'חוד', en: 'Spike' },
  };

  const materialLabels: Record<string, { he: string; en: string }> = {
    glass: { he: 'זכוכית', en: 'Glass' },
    metal: { he: 'מתכת', en: 'Metal' },
    crystal: { he: 'קריסטל', en: 'Crystal' },
    obsidian: { he: 'אובסידיאן', en: 'Obsidian' },
    pearl: { he: 'פנינה', en: 'Pearl' },
    ice: { he: 'קרח', en: 'Ice' },
    fire: { he: 'אש', en: 'Fire' },
    nebula: { he: 'ערפילית', en: 'Nebula' },
  };

  const userName = identityData?.profile?.full_name || (isHe ? 'נוסע' : 'Traveler');

  const stepLabels = [
    isHe ? 'האווטאר שלך' : 'Your Avatar',
    isHe ? 'הזהות שלך' : 'Your Identity',
    isHe ? 'האסטרטגיה שלך' : 'Your Strategy',
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
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
            className="flex flex-col items-center gap-6 max-w-sm text-center"
          >
            {/* Orb with glow */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8, type: 'spring', bounce: 0.3 }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl scale-150" />
              <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                <PersonalizedOrb size={224} />
              </div>
            </motion.div>

            {showContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-3"
              >
                <h1 className="text-2xl font-bold text-foreground">
                  {isHe ? `${userName}, הנה האורב שלך` : `${userName}, Meet Your Orb`}
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isHe
                    ? 'ישות אנרגטית ייחודית שנולדה מתוך הזהות שלך. היא תגדל איתך לאורך המסע.'
                    : 'A unique energy entity born from your identity. It will evolve with you throughout your journey.'}
                </p>

                {/* Orb traits */}
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {archetypeLabels[archetype]?.[isHe ? 'he' : 'en'] || archetype}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-accent/10 text-accent-foreground text-xs font-medium">
                    {geometryLabels[geometry]?.[isHe ? 'he' : 'en'] || geometry}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                    {materialLabels[material]?.[isHe ? 'he' : 'en'] || material}
                  </span>
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
            className="flex flex-col items-center gap-6 max-w-sm text-center w-full"
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
                className="space-y-5 w-full"
              >
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-foreground">
                    {isHe ? 'הזהות שלך' : 'Your Identity'}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {isHe ? 'הארכיטיפים והתחומים שמגדירים את המסע שלך' : 'The archetypes and domains that define your journey'}
                  </p>
                </div>

                {/* Archetype card */}
                <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {isHe ? 'ארכיטיפ דומיננטי' : 'Dominant Archetype'}
                    </span>
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-xl font-bold text-primary">
                    {archetypeLabels[archetype]?.[isHe ? 'he' : 'en'] || archetype}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{isHe ? 'ארכיטיפ משני:' : 'Secondary:'}</span>
                    <span className="text-foreground font-medium">
                      {archetypeLabels[secondaryArchetype]?.[isHe ? 'he' : 'en'] || secondaryArchetype}
                    </span>
                  </div>
                </div>

                {/* Active pillars */}
                {activeDomains.length > 0 && (
                  <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {isHe ? 'תחומי חיים פעילים' : 'Active Life Domains'}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {activeDomains.slice(0, 6).map((domain: string) => {
                        const Icon = PILLAR_ICONS[domain] || Target;
                        return (
                          <div key={domain} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                            <Icon className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-sm font-medium capitalize truncate">{domain}</span>
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
            className="flex flex-col items-center gap-6 max-w-sm text-center w-full"
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
                className="space-y-5 w-full"
              >
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-foreground">
                    {isHe ? 'תוכנית 100 הימים שלך' : 'Your 100-Day Plan'}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {isHe ? 'אסטרטגיה מותאמת אישית למסע הטרנספורמציה שלך' : 'A personalized strategy for your transformation journey'}
                  </p>
                </div>

                {strategyData?.plan && (
                  <div className="rounded-2xl bg-card border border-border p-4 space-y-3 text-start">
                    <div className="text-lg font-bold text-foreground">
                      {strategyData.plan.title || (isHe ? 'תוכנית טרנספורמציה' : 'Transformation Plan')}
                    </div>
                    {strategyData.plan.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {strategyData.plan.description}
                      </p>
                    )}
                  </div>
                )}

                {/* First milestones */}
                {strategyData?.milestones && strategyData.milestones.length > 0 && (
                  <div className="rounded-2xl bg-card border border-border p-4 space-y-3 text-start">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {isHe ? 'אבני דרך ראשונות' : 'First Milestones'}
                    </span>
                    <div className="space-y-2">
                      {strategyData.milestones.slice(0, 3).map((m: any, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-primary">{m.week_number || i + 1}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{m.title}</p>
                            {m.focus_area && (
                              <p className="text-xs text-muted-foreground capitalize">{m.focus_area}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue button */}
      <motion.div
        className="fixed bottom-8 left-0 right-0 px-6 flex justify-center"
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
