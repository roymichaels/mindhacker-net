/**
 * HubPillarsList — Renders the pillar domain cards for a hub (Core or Arena).
 * Shows assessment status and links to each pillar page.
 */
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { CORE_DOMAINS, ARENA_DOMAINS, type LifeDomain } from '@/navigation/lifeDomains';
import { CheckCircle2 } from 'lucide-react';

const domainColorMap: Record<string, string> = {
  blue: 'text-blue-400',
  fuchsia: 'text-fuchsia-400',
  red: 'text-red-400',
  amber: 'text-amber-400',
  cyan: 'text-cyan-400',
  slate: 'text-slate-400',
  indigo: 'text-indigo-400',
  emerald: 'text-emerald-400',
  purple: 'text-purple-400',
  sky: 'text-sky-400',
  rose: 'text-rose-400',
  violet: 'text-violet-400',
};

const activeBgMap: Record<string, string> = {
  blue: 'bg-blue-500/10 border-blue-500/25',
  fuchsia: 'bg-fuchsia-500/10 border-fuchsia-500/25',
  red: 'bg-red-500/10 border-red-500/25',
  amber: 'bg-amber-500/10 border-amber-500/25',
  cyan: 'bg-cyan-500/10 border-cyan-500/25',
  slate: 'bg-slate-500/10 border-slate-500/25',
  indigo: 'bg-indigo-500/10 border-indigo-500/25',
  emerald: 'bg-emerald-500/10 border-emerald-500/25',
  purple: 'bg-purple-500/10 border-purple-500/25',
  sky: 'bg-sky-500/10 border-sky-500/25',
  rose: 'bg-rose-500/10 border-rose-500/25',
  violet: 'bg-violet-500/10 border-violet-500/25',
};

interface HubPillarsListProps {
  hub: 'core' | 'arena';
}

export function HubPillarsList({ hub }: HubPillarsListProps) {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { statusMap } = useLifeDomains();

  const domains: LifeDomain[] = hub === 'core' ? CORE_DOMAINS : ARENA_DOMAINS;
  const basePath = hub === 'core' ? '/life' : '/arena';

  const sectionTitle = hub === 'core'
    ? (isHe ? 'תחומי הליבה' : 'Core Pillars')
    : (isHe ? 'תחומי הזירה' : 'Arena Pillars');

  return (
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        {sectionTitle}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {domains.map((domain, i) => {
          const status = statusMap[domain.id] ?? 'unconfigured';
          const isActive = status === 'active' || status === 'configured';
          const Icon = domain.icon;

          return (
            <motion.button
              key={domain.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              onClick={() => navigate(`${basePath}/${domain.id}`)}
              className={cn(
                'relative flex items-center gap-2.5 p-3 rounded-xl border transition-all text-start',
                isActive
                  ? activeBgMap[domain.color]
                  : 'bg-card/40 border-border/30 hover:bg-accent/10 hover:border-border/50'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', domainColorMap[domain.color])} />
              <span className={cn('text-xs font-medium flex-1', isActive ? domainColorMap[domain.color] : 'text-foreground/80')}>
                {isHe ? domain.labelHe : domain.labelEn}
              </span>
              {isActive && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
