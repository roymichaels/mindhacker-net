/**
 * ArenaHub — Body content for the Arena/זירה tab.
 * Displays arena domains (Wealth, Influence, Relationships) + Projects section.
 * Amber/orange color scheme.
 */
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ARENA_DOMAINS } from '@/navigation/lifeDomains';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Swords, ChevronRight, ChevronLeft, Sparkles, Target, Flame, Zap, TrendingUp, Crown, Users, Plus, FolderKanban, Briefcase, Gamepad2 } from 'lucide-react';
import { PlaySummaryCard } from '@/components/arena/PlaySummaryCard';
import { AnalysisProgressBar } from '@/components/hubs/AnalysisProgressBar';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { AddProjectWizard } from '@/components/projects/AddProjectWizard';
import { ProjectDetailModal } from '@/components/projects/ProjectDetailModal';
import { UserProject } from '@/hooks/useProjects';
import { useBusinessJourneys } from '@/hooks/useBusinessJourneys';

/* ───── Color maps ───── */
const colorMap: Record<string, string> = {
  emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 hover:border-emerald-400/60',
  purple:  'from-purple-500/20 to-purple-600/5 border-purple-500/30 hover:border-purple-400/60',
  sky:     'from-sky-500/20 to-sky-600/5 border-sky-500/30 hover:border-sky-400/60',
  amber:   'from-amber-500/20 to-amber-600/5 border-amber-500/30 hover:border-amber-400/60',
  orange:  'from-orange-500/20 to-orange-600/5 border-orange-500/30 hover:border-orange-400/60',
  rose:    'from-rose-500/20 to-rose-600/5 border-rose-500/30 hover:border-rose-400/60',
  violet:  'from-violet-500/20 to-violet-600/5 border-violet-500/30 hover:border-violet-400/60',
};

const iconColorMap: Record<string, string> = {
  emerald: 'text-emerald-400', purple: 'text-purple-400', sky: 'text-sky-400', amber: 'text-amber-400', orange: 'text-orange-400', rose: 'text-rose-400', violet: 'text-violet-400',
};

const statusBadge: Record<string, { label: string; labelHe: string; variant: 'default' | 'secondary' | 'outline' }> = {
  unconfigured: { label: 'Not Set Up', labelHe: 'לא הוגדר', variant: 'outline' },
  configured:   { label: 'Configured', labelHe: 'הוגדר', variant: 'secondary' },
  active:       { label: 'Active', labelHe: 'פעיל', variant: 'default' },
};

/* ───── Banners ───── */
interface Banner { icon: React.ReactNode; textHe: string; textEn: string; gradient: string }
const banners: Banner[] = [
  { icon: <TrendingUp className="w-4 h-4" />, textHe: 'הזירה היא המקום שבו הכוח שלך הופך להשפעה', textEn: 'The Arena is where your power becomes influence', gradient: 'from-amber-500/20 via-amber-500/5 to-transparent' },
  { icon: <Crown className="w-4 h-4" />, textHe: 'בנה עושר, השפעה וקשרים — במקביל', textEn: 'Build wealth, influence, and connections — simultaneously', gradient: 'from-orange-500/20 via-orange-500/5 to-transparent' },
  { icon: <Zap className="w-4 h-4" />, textHe: 'כל פרויקט מוצלח מתחיל בתוכנית ברורה', textEn: 'Every successful project starts with a clear plan', gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent' },
  { icon: <Users className="w-4 h-4" />, textHe: 'הקשרים שלך הם הנכס הגדול ביותר', textEn: 'Your connections are your greatest asset', gradient: 'from-sky-500/20 via-sky-500/5 to-transparent' },
];

function getGreeting(language: string): { emoji: string; text: string } {
  const hour = new Date().getHours();
  const isHe = language === 'he';
  if (hour >= 5 && hour < 12) return { emoji: '🎯', text: isHe ? 'בוקר טוב — מוכן לזירה?' : 'Good morning — ready for the Arena?' };
  if (hour >= 12 && hour < 17) return { emoji: '⚡', text: isHe ? 'זמן לפעולה — הזירה פתוחה' : 'Time for action — the Arena is open' };
  if (hour >= 17 && hour < 21) return { emoji: '🌇', text: isHe ? 'ערב טוב — בדוק את ההשפעה שלך' : 'Good evening — check your impact' };
  return { emoji: '🌙', text: isHe ? 'לילה טוב — תכנן את המהלך הבא' : 'Good night — plan your next move' };
}

interface ArenaHubProps {
  openWizardTrigger?: number;
}

export default function ArenaHub({ openWizardTrigger = 0 }: ArenaHubProps) {
  const navigate = useNavigate();
  const { statusMap } = useLifeDomains();
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const { projects, isLoading } = useProjects();
  const { journeys: businesses, isLoading: businessesLoading } = useBusinessJourneys();
  const isHe = language === 'he';

  const greeting = useMemo(() => getGreeting(language), [language]);
  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name;
  const firstName = displayName ? displayName.split(' ')[0] : null;

  // Banner rotation
  const [bannerIdx, setBannerIdx] = useState(0);
  const nextBanner = useCallback(() => setBannerIdx(i => (i + 1) % banners.length), []);
  useEffect(() => { const t = setInterval(nextBanner, 5000); return () => clearInterval(t); }, [nextBanner]);
  const banner = banners[bannerIdx];

  // Wizard
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<UserProject | null>(null);

  useEffect(() => {
    if (openWizardTrigger > 0) setWizardOpen(true);
  }, [openWizardTrigger]);

  // Arena domain stats
  const arenaDomainIds = ARENA_DOMAINS.map(d => d.id);
  const arenaEntries = Object.entries(statusMap).filter(([id]) => arenaDomainIds.includes(id));
  const activeDomains = arenaEntries.filter(([, s]) => s === 'active').length;
  const configuredDomains = arenaEntries.filter(([, s]) => s === 'configured').length;
  const totalArena = ARENA_DOMAINS.length;
  const completionPct = Math.round(((activeDomains + configuredDomains) / totalArena) * 100);

  const activeProjects = projects.filter(p => p.status === 'active');
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
              <span className="text-amber-400 shrink-0">{banner.icon}</span>
              <span className="text-sm font-medium text-foreground/80 leading-snug">
                {isHe ? banner.textHe : banner.textEn}
              </span>
            </motion.div>
          </AnimatePresence>
          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-1">
            {banners.map((_, i) => (
              <span key={i} className={`w-1 h-1 rounded-full transition-colors ${i === bannerIdx ? 'bg-amber-400' : 'bg-muted-foreground/20'}`} />
            ))}
          </div>
        </div>

        {/* ── Arena Grid (Domains + Projects + Businesses) ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {isHe ? 'תחומי זירה' : 'Arena Domains'}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Domain cards */}
            {ARENA_DOMAINS.map((domain, i) => {
              const status = statusMap[domain.id] ?? 'unconfigured';
              const Icon = domain.icon;
              
              // Custom badges for projects/business
              let badgeContent: string;
              let badgeVariant: 'default' | 'secondary' | 'outline';
              if (domain.id === 'projects') {
                const count = activeProjects.length;
                const domainStatus = statusMap['projects'] ?? 'unconfigured';
                if (count > 0) {
                  badgeContent = isHe ? `${count} פעילים` : `${count} Active`;
                  badgeVariant = 'default';
                } else if (domainStatus === 'configured' || domainStatus === 'active') {
                  const badge = statusBadge[domainStatus] ?? statusBadge.configured;
                  badgeContent = isHe ? badge.labelHe : badge.label;
                  badgeVariant = badge.variant;
                } else {
                  badgeContent = isHe ? 'לא הוגדר' : 'Not Set Up';
                  badgeVariant = 'outline';
                }
              } else if (domain.id === 'business') {
                const count = businesses.length;
                const domainStatus = statusMap['business'] ?? 'unconfigured';
                if (count > 0) {
                  badgeContent = isHe ? `${count} עסקים` : `${count} Active`;
                  badgeVariant = 'default';
                } else if (domainStatus === 'configured' || domainStatus === 'active') {
                  const badge = statusBadge[domainStatus] ?? statusBadge.configured;
                  badgeContent = isHe ? badge.labelHe : badge.label;
                  badgeVariant = badge.variant;
                } else {
                  badgeContent = isHe ? 'לא הוגדר' : 'Not Set Up';
                  badgeVariant = 'outline';
                }
              } else {
                const badge = statusBadge[status] ?? statusBadge.unconfigured;
                badgeContent = isHe ? badge.labelHe : badge.label;
                badgeVariant = badge.variant;
              }

              return (
                <motion.button
                  key={domain.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  onClick={() => navigate(`/arena/${domain.id}`)}
                  className={cn(
                    'relative flex flex-col items-center gap-2.5 p-4 rounded-2xl border bg-gradient-to-b transition-all duration-200 cursor-pointer group',
                    colorMap[domain.color] ?? colorMap.amber
                  )}
                >
                  <Icon className={cn('w-7 h-7 transition-transform group-hover:scale-110', iconColorMap[domain.color])} />
                  <span className="font-semibold text-foreground text-sm">
                    {isHe ? domain.labelHe : domain.labelEn}
                  </span>
                  <p className="text-[10px] text-muted-foreground text-center leading-tight hidden md:block line-clamp-2">
                    {isHe ? domain.descriptionHe : domain.description}
                  </p>
                  <Badge variant={badgeVariant} className="text-[9px]">
                    {badgeContent}
                  </Badge>
                  <ChevronIcon className={cn("absolute top-3 w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-foreground/60 transition-colors", isRTL ? "left-2.5" : "right-2.5")} />
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Play Summary Card ── */}
        <PlaySummaryCard />

        {/* ── Quick Insights Row ── */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: FolderKanban, label: isHe ? 'פרויקטים' : 'Projects', value: `${activeProjects.length}`, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
            { icon: Briefcase, label: isHe ? 'עסקים' : 'Businesses', value: `${businesses.length}`, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
            { icon: Target, label: isHe ? 'תחומים' : 'Domains', value: `${activeDomains}/${totalArena}`, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { icon: Gamepad2, label: isHe ? 'Play' : 'Play', value: `${projects.filter(p => p.project_type === 'play').length}`, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
          ].map((m) => (
            <div key={m.label} className={cn("rounded-xl border p-3 flex flex-col items-center gap-1 text-center", m.bg)}>
              <m.icon className={cn("w-4 h-4", m.color)} />
              <span className="text-sm font-bold leading-none">{m.value}</span>
              <span className="text-[9px] text-muted-foreground">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <AddProjectWizard open={wizardOpen} onOpenChange={setWizardOpen} />
      <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </div>
  );
}
