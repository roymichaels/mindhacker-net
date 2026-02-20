/**
 * LifeHub — Grid of 8 outcome-based domains.
 * Gated behind onboarding completion.
 */
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { LIFE_DOMAINS } from '@/navigation/lifeDomains';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { useTranslation } from '@/hooks/useTranslation';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

export default function LifeHub() {
  const navigate = useNavigate();
  const { statusMap, isLoading } = useLifeDomains();
  const { language } = useTranslation();
  const isHebrew = language === 'he';

  return (
    <PageShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {isHebrew ? 'מערכת חיים' : 'Life System'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isHebrew ? '8 תחומי ביצוע. מבנה קבוע. ביצוע יומי.' : '8 execution domains. Fixed structure. Daily execution.'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {LIFE_DOMAINS.map((domain) => {
            const status = statusMap[domain.id] ?? 'unconfigured';
            const badge = statusBadge[status] ?? statusBadge.unconfigured;
            const Icon = domain.icon;

            return (
              <button
                key={domain.id}
                onClick={() => navigate(`/life/${domain.id}`)}
                className={cn(
                  'relative flex flex-col items-center gap-3 p-5 rounded-2xl border bg-gradient-to-b transition-all duration-200 cursor-pointer group',
                  colorMap[domain.color] ?? colorMap.slate
                )}
              >
                <Icon className={cn('w-8 h-8 transition-transform group-hover:scale-110', iconColorMap[domain.color])} />
                <span className="font-semibold text-foreground text-sm md:text-base">
                  {isHebrew ? domain.labelHe : domain.labelEn}
                </span>
                <p className="text-xs text-muted-foreground text-center leading-tight hidden md:block">
                  {domain.description}
                </p>
                <Badge variant={badge.variant} className="text-[10px]">
                  {isHebrew ? badge.labelHe : badge.label}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
