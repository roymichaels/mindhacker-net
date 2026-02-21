/**
 * CoreHub — Body content rendered inside LifeLayoutWrapper.
 * Renamed from LifeHub. Displays Core/ליבה domains (personal transformation).
 */
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CORE_DOMAINS, getDomainById } from '@/navigation/lifeDomains';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Flame, ArrowRight, ArrowLeft, ChevronRight, ChevronLeft, Sparkles, Target, Shield, Brain, Zap, Eye, Waves } from 'lucide-react';
import { AnalysisProgressBar } from '@/components/hubs/AnalysisProgressBar';

/* ───── Color maps ───── */
const colorMap: Record<string, string> = {
  fuchsia: 'from-fuchsia-500/25 to-fuchsia-600/5 border-fuchsia-500/40 hover:border-fuchsia-400/70',
  red:     'from-red-500/25 to-red-600/5 border-red-500/40 hover:border-red-400/70',
  amber:   'from-amber-500/25 to-amber-600/5 border-amber-500/40 hover:border-amber-400/70',
  cyan:    'from-cyan-500/25 to-cyan-600/5 border-cyan-500/40 hover:border-cyan-400/70',
  slate:   'from-slate-400/20 to-slate-600/5 border-slate-400/35 hover:border-slate-300/60',
  indigo:  'from-indigo-500/25 to-indigo-600/5 border-indigo-500/40 hover:border-indigo-400/70',
  emerald: 'from-emerald-500/25 to-emerald-600/5 border-emerald-500/40 hover:border-emerald-400/70',
  purple:  'from-purple-500/25 to-purple-600/5 border-purple-500/40 hover:border-purple-400/70',
  sky:     'from-sky-500/25 to-sky-600/5 border-sky-500/40 hover:border-sky-400/70',
  rose:    'from-rose-500/25 to-rose-600/5 border-rose-500/40 hover:border-rose-400/70',
  violet:  'from-violet-500/25 to-violet-600/5 border-violet-500/40 hover:border-violet-400/70',
  orange:  'from-orange-500/25 to-orange-600/5 border-orange-500/40 hover:border-orange-400/70',
};

const iconColorMap: Record<string, string> = {
  fuchsia: 'text-fuchsia-400', red: 'text-red-400', amber: 'text-amber-400',
  cyan: 'text-cyan-400', slate: 'text-slate-300', indigo: 'text-indigo-400',
  emerald: 'text-emerald-400', purple: 'text-purple-400', sky: 'text-sky-400',
  rose: 'text-rose-400', violet: 'text-violet-400', orange: 'text-orange-400',
};

const statusBadge: Record<string, { label: string; labelHe: string; variant: 'default' | 'secondary' | 'outline' }> = {
  unconfigured: { label: 'Not Set Up', labelHe: 'לא הוגדר', variant: 'outline' },
  configured:   { label: 'Configured', labelHe: 'הוגדר', variant: 'secondary' },
  active:       { label: 'Active', labelHe: 'פעיל', variant: 'default' },
};

/* ───── Motivational banners ───── */
interface Banner { icon: React.ReactNode; textHe: string; textEn: string; gradient: string }
const banners: Banner[] = [
  { icon: <Sparkles className="w-4 h-4" />, textHe: 'כל תחום שאתה מפעיל — מקרב אותך לגרסה המלאה', textEn: 'Every domain you activate brings you closer to your full version', gradient: 'from-rose-500/20 via-rose-500/5 to-transparent' },
  { icon: <Target className="w-4 h-4" />, textHe: 'התחל מהתחום שהכי מפריע לך — שם השינוי הגדול', textEn: 'Start with what bothers you most — that\'s where the big shift is', gradient: 'from-violet-500/20 via-violet-500/5 to-transparent' },
  { icon: <Flame className="w-4 h-4" />, textHe: 'עקביות יומית בליבה — זה מה שמייצר שינוי אמיתי', textEn: 'Daily consistency in your Core — that\'s what creates real change', gradient: 'from-amber-500/20 via-amber-500/5 to-transparent' },
  { icon: <Shield className="w-4 h-4" />, textHe: 'לא צריך להיות מושלם — צריך להיות בתנועה', textEn: 'You don\'t need to be perfect — you need to be in motion', gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent' },
  { icon: <Brain className="w-4 h-4" />, textHe: 'הגוף, הנפש והשליטה — הכל מתחבר בליבה', textEn: 'Body, mind, and control — it all connects in your Core', gradient: 'from-indigo-500/20 via-indigo-500/5 to-transparent' },
  { icon: <Zap className="w-4 h-4" />, textHe: 'הכוח שלך נמדד ביכולת לפעול בו-זמנית על כל החזיתות', textEn: 'Your power is measured by your ability to operate on all fronts', gradient: 'from-red-500/20 via-red-500/5 to-transparent' },
];

/* ───── Greeting helper ───── */
function getGreeting(language: string): { emoji: string; text: string } {
  const hour = new Date().getHours();
  const isHe = language === 'he';
  if (hour >= 5 && hour < 12) return { emoji: '🌅', text: isHe ? 'בוקר טוב — מה התחום שלך להיום?' : 'Good morning — what\'s your domain today?' };
  if (hour >= 12 && hour < 17) return { emoji: '⚡', text: isHe ? 'אמצע היום — זמן מושלם לפעולה ממוקדת' : 'Midday — perfect time for focused action' };
  if (hour >= 17 && hour < 21) return { emoji: '🌇', text: isHe ? 'ערב טוב — בדוק את ההתקדמות שלך' : 'Good evening — review your progress' };
  return { emoji: '🌙', text: isHe ? 'לילה טוב — תכנן את המחר שלך' : 'Good night — plan your tomorrow' };
}

export default function LifeHub() {
  const navigate = useNavigate();
  const { statusMap, getDomain } = useLifeDomains();
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const isHe = language === 'he';

  const greeting = useMemo(() => getGreeting(language), [language]);
  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name;
  const firstName = displayName ? displayName.split(' ')[0] : null;

  // Banner rotation
  const [bannerIdx, setBannerIdx] = useState(0);
  const nextBanner = useCallback(() => setBannerIdx(i => (i + 1) % banners.length), []);
  useEffect(() => { const t = setInterval(nextBanner, 5000); return () => clearInterval(t); }, [nextBanner]);
  const banner = banners[bannerIdx];

  // Stats — only count core domains (6)
  const coreDomainIds = CORE_DOMAINS.map(d => d.id);
  const coreEntries = Object.entries(statusMap).filter(([id]) => coreDomainIds.includes(id));
  const activeDomains = coreEntries.filter(([, s]) => s === 'active').length;
  const configuredDomains = coreEntries.filter(([, s]) => s === 'configured').length;
  const totalCore = CORE_DOMAINS.length;
  const completionPct = Math.round(((activeDomains + configuredDomains) / totalCore) * 100);

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-4 flex-1 px-1">
        <div className="pt-1" />

        {/* ── Unified Progress Bar ── */}
        <AnalysisProgressBar />

        {/* ── Motivational Banner ── */}
        <div
          className="relative w-full overflow-hidden rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm cursor-pointer select-none shadow-sm"
          onClick={nextBanner}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={bannerIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${banner.gradient}`}
            >
              <span className="text-rose-400 shrink-0">{banner.icon}</span>
              <span className="text-sm font-medium text-foreground/80 leading-snug">
                {isHe ? banner.textHe : banner.textEn}
              </span>
            </motion.div>
          </AnimatePresence>
          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-1">
            {banners.map((_, i) => (
              <span key={i} className={`w-1 h-1 rounded-full transition-colors ${i === bannerIdx ? 'bg-rose-400' : 'bg-muted-foreground/20'}`} />
            ))}
          </div>
        </div>

        {/* ── Consciousness Hero Card (2-col) ── */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => navigate('/life/consciousness')}
          className={cn(
            'relative flex items-center gap-4 p-5 rounded-2xl border bg-gradient-to-b transition-all duration-200 cursor-pointer group col-span-2',
            'from-violet-500/25 to-violet-600/5 border-violet-500/40 hover:border-violet-400/70'
          )}
        >
          <Waves className="w-9 h-9 text-violet-400 transition-transform group-hover:scale-110 shrink-0" />
          <div className="flex-1 min-w-0 text-start">
            <span className="font-bold text-foreground text-base">{isHe ? 'תודעה' : 'Consciousness'}</span>
            <p className="text-xs text-muted-foreground leading-tight mt-0.5">
              {isHe ? 'תדר נשמה, זיהוי מסכות, יושרה פנימית' : 'Soul frequency, identity unmasking, inner integrity'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(() => {
              const cRow = getDomain('consciousness');
              const cStatus = cRow?.status ?? 'unconfigured';
              const cBadge = statusBadge[cStatus] ?? statusBadge.unconfigured;
              return (
                <Badge variant={cBadge.variant} className="text-[9px]">
                  {isHe ? cBadge.labelHe : cBadge.label}
                </Badge>
              );
            })()}
            <ChevronIcon className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground/60 transition-colors" />
          </div>
        </motion.button>

        {/* ── Domain Grid ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {isHe ? 'תחומי ליבה' : 'Core Domains'}
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CORE_DOMAINS.filter(d => d.id !== 'consciousness').map((domain, i) => {
              const status = statusMap[domain.id] ?? 'unconfigured';
              const badge = statusBadge[status] ?? statusBadge.unconfigured;
              const Icon = domain.icon;
              return (
                <motion.button
                  key={domain.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  onClick={() => navigate(`/life/${domain.id}`)}
                  className={cn(
                    'relative flex flex-col items-center gap-2.5 p-4 rounded-2xl border bg-gradient-to-b transition-all duration-200 cursor-pointer group',
                    colorMap[domain.color] ?? colorMap.slate
                  )}
                >
                  <Icon className={cn('w-7 h-7 transition-transform group-hover:scale-110', iconColorMap[domain.color])} />
                  <span className="font-semibold text-foreground text-sm">
                    {isHe ? domain.labelHe : domain.labelEn}
                  </span>
                  <p className="text-[10px] text-muted-foreground text-center leading-tight hidden md:block line-clamp-2">
                    {isHe ? domain.descriptionHe : domain.description}
                  </p>
                  <Badge variant={badge.variant} className="text-[9px]">
                    {isHe ? badge.labelHe : badge.label}
                  </Badge>
                  <ChevronIcon className={cn("absolute top-3 w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-foreground/60 transition-colors", isRTL ? "left-2.5" : "right-2.5")} />
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Quick Insights Row ── */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Eye, label: isHe ? 'תדמית' : 'Image', value: statusMap['presence'] === 'active' ? (isHe ? 'פעיל' : 'Active') : (isHe ? 'ממתין' : 'Pending'), color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
            { icon: Target, label: isHe ? 'פעילים' : 'Active', value: `${activeDomains}/${totalCore}`, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { icon: Flame, label: isHe ? 'מוכנות' : 'Readiness', value: `${completionPct}%`, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          ].map((m) => (
            <div key={m.label} className={cn("rounded-xl border p-3 flex flex-col items-center gap-1 text-center", m.bg)}>
              <m.icon className={cn("w-4 h-4", m.color)} />
              <span className="text-sm font-bold leading-none">{m.value}</span>
              <span className="text-[9px] text-muted-foreground">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
