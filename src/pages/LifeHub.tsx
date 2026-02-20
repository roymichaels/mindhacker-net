/**
 * CoreHub — Body content rendered inside LifeLayoutWrapper.
 * Renamed from LifeHub. Displays Core/ליבה domains (personal transformation).
 */
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CORE_DOMAINS } from '@/navigation/lifeDomains';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Flame, ArrowRight, ArrowLeft, ChevronRight, ChevronLeft, Sparkles, Target, Shield, Brain, Zap, Eye } from 'lucide-react';

/* ───── Color maps ───── */
const colorMap: Record<string, string> = {
  rose:    'from-rose-500/20 to-rose-600/5 border-rose-500/30 hover:border-rose-400/60',
  red:     'from-red-500/20 to-red-600/5 border-red-500/30 hover:border-red-400/60',
  amber:   'from-amber-500/20 to-amber-600/5 border-amber-500/30 hover:border-amber-400/60',
  violet:  'from-violet-500/20 to-violet-600/5 border-violet-500/30 hover:border-violet-400/60',
  emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 hover:border-emerald-400/60',
  slate:   'from-slate-500/20 to-slate-600/5 border-slate-500/30 hover:border-slate-400/60',
  indigo:  'from-indigo-500/20 to-indigo-600/5 border-indigo-500/30 hover:border-indigo-400/60',
  orange:  'from-orange-500/20 to-orange-600/5 border-orange-500/30 hover:border-orange-400/60',
};

const iconColorMap: Record<string, string> = {
  rose: 'text-rose-400', red: 'text-red-400', amber: 'text-amber-400',
  violet: 'text-violet-400', emerald: 'text-emerald-400', slate: 'text-slate-400',
  indigo: 'text-indigo-400', orange: 'text-orange-400',
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
  const { statusMap } = useLifeDomains();
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

        {/* ── Greeting ── */}
        <div className="text-center px-3 mb-0">
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            <span>{greeting.emoji} </span>
            {firstName && <span className="font-semibold text-foreground">{firstName}</span>}
            {firstName && <span className="text-muted-foreground">, </span>}
            <span>{greeting.text}</span>
          </p>
        </div>

        {/* ── Progress Overview Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-2xl border border-rose-500/20 bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-transparent p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/25">
                <Flame className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  {isHe ? 'הליבה שלך' : 'Your Core'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isHe ? `${activeDomains} מתוך ${totalCore} תחומים פעילים` : `${activeDomains} of ${totalCore} domains active`}
                </p>
              </div>
            </div>
            <span className="text-2xl font-black text-rose-400">{completionPct}%</span>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-rose-400 to-pink-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

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

        {/* ── Domain Grid ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {isHe ? 'תחומי ליבה' : 'Core Domains'}
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CORE_DOMAINS.map((domain, i) => {
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
                    {domain.description}
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
