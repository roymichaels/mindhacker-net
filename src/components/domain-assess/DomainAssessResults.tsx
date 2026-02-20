/**
 * DomainAssessResults — Generic results display for AI domain assessments.
 */
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useDomainAssessment } from '@/hooks/useDomainAssessment';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, AlertTriangle, AlertCircle, Sparkles, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDomainById, CORE_DOMAINS } from '@/navigation/lifeDomains';
import { DOMAIN_ASSESS_META } from '@/lib/domain-assess/types';

const COLOR_MAP: Record<string, { border: string; bg: string; text: string }> = {
  emerald:  { border: 'border-emerald-500/30',  bg: 'from-emerald-500/10',  text: 'text-emerald-400' },
  purple:   { border: 'border-purple-500/30',   bg: 'from-purple-500/10',   text: 'text-purple-400' },
  sky:      { border: 'border-sky-500/30',      bg: 'from-sky-500/10',      text: 'text-sky-400' },
  rose:     { border: 'border-rose-500/30',     bg: 'from-rose-500/10',     text: 'text-rose-400' },
  amber:    { border: 'border-amber-500/30',    bg: 'from-amber-500/10',    text: 'text-amber-400' },
  fuchsia:  { border: 'border-fuchsia-500/30',  bg: 'from-fuchsia-500/10',  text: 'text-fuchsia-400' },
  red:      { border: 'border-red-500/30',      bg: 'from-red-500/10',      text: 'text-red-400' },
  cyan:     { border: 'border-cyan-500/30',     bg: 'from-cyan-500/10',     text: 'text-cyan-400' },
  slate:    { border: 'border-slate-500/30',    bg: 'from-slate-500/10',    text: 'text-slate-400' },
  indigo:   { border: 'border-indigo-500/30',   bg: 'from-indigo-500/10',   text: 'text-indigo-400' },
};

function isCoreDomain(id: string) { return CORE_DOMAINS.some(d => d.id === id); }
function getBasePath(id: string) { return isCoreDomain(id) ? '/life' : '/arena'; }

function scoreColor(v: number): string {
  if (v >= 70) return 'text-emerald-400';
  if (v >= 40) return 'text-amber-400';
  return 'text-red-400';
}

interface Props {
  domainId: string;
}

export default function DomainAssessResults({ domainId }: Props) {
  const navigate = useNavigate();
  const { t, language, isRTL } = useTranslation();
  const { config } = useDomainAssessment(domainId);

  const meta = DOMAIN_ASSESS_META[domainId];
  const domain = getDomainById(domainId);
  const colors = COLOR_MAP[meta?.color ?? 'emerald'];
  const lang = language === 'he' ? 'he' : 'en';
  const isHe = language === 'he';
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const assessment = config.latest_assessment;

  if (!assessment) {
    return (
      <PageShell>
        <div className="text-center py-20" dir={isRTL ? 'rtl' : 'ltr'}>
          <p className="text-muted-foreground">{isHe ? 'אין תוצאות עדיין' : 'No results yet'}</p>
          <Button onClick={() => navigate(`${getBasePath(domainId)}/${domainId}/assess`)} className="mt-4">
            {isHe ? 'התחל אבחון' : 'Start Assessment'}
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-6 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/life/${domainId}`)}>
            <BackIcon className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">
            {isHe ? `תוצאות — ${domain?.labelHe}` : `Results — ${domain?.labelEn}`}
          </h1>
        </div>

        {/* Low confidence */}
        {assessment.confidence === 'low' && (
          <Card className="p-3 border-amber-500/30 bg-amber-500/5 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-400">
              {isHe ? 'רמת ביטחון נמוכה — השיחה הייתה קצרה. שקול לעשות אבחון נוסף.' : 'Low confidence — conversation was short. Consider retaking.'}
            </p>
          </Card>
        )}

        {/* Overall Index */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className={cn("p-6 bg-gradient-to-b to-transparent text-center", colors.bg, colors.border)}>
            <p className="text-5xl font-black text-foreground">{assessment.domain_index}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {isHe ? (domain?.labelHe ?? '') + ' — ציון כללי' : (domain?.labelEn ?? '') + ' — Overall Score'}
            </p>
            <Badge variant={assessment.confidence === 'high' ? 'default' : 'secondary'} className="mt-2">
              {assessment.confidence === 'high' ? (isHe ? 'ביטחון גבוה' : 'High confidence') :
               assessment.confidence === 'med' ? (isHe ? 'ביטחון בינוני' : 'Medium confidence') :
               (isHe ? 'ביטחון נמוך' : 'Low confidence')}
            </Badge>
          </Card>
        </motion.div>

        {/* Mirror Statement */}
        {assessment.mirror_statement && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className={cn("p-5", colors.border, `${colors.bg.replace('from-', 'bg-')}`)}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className={cn("w-4 h-4", colors.text)} />
                <h3 className={cn("text-sm font-semibold", colors.text)}>
                  {isHe ? 'מה שאני רואה' : 'What I See'}
                </h3>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {assessment.mirror_statement[lang]}
              </p>
            </Card>
          </motion.div>
        )}

        {/* Subscores grid */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            {isHe ? 'תת-מערכות' : 'Subsystems'}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {meta.subsystems.map(sub => {
              const val = assessment.subscores[sub.id] ?? 0;
              return (
                <Card key={sub.id} className="p-3 bg-card border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{sub.icon}</span>
                    <span className="text-xs text-muted-foreground">{t(sub.nameKey)}</span>
                  </div>
                  <p className={cn("text-2xl font-black", scoreColor(val))}>{val}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Findings */}
        {assessment.findings.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              {isHe ? 'ממצאים' : 'Findings'}
            </h3>
            <div className="space-y-2">
              {assessment.findings.map(f => (
                <Card key={f.id} className={cn(
                  "p-3 flex items-start gap-3",
                  f.severity === 'high' ? 'border-red-500/30' : f.severity === 'med' ? 'border-amber-500/30' : 'border-border'
                )}>
                  <AlertTriangle className={cn("w-4 h-4 mt-0.5 shrink-0",
                    f.severity === 'high' ? 'text-red-400' : f.severity === 'med' ? 'text-amber-400' : 'text-muted-foreground'
                  )} />
                  <div>
                    <p className="text-sm text-foreground">{lang === 'he' ? f.text_he : f.text_en}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* One Next Step */}
        {assessment.one_next_step && (
          <Card className="p-4 border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-emerald-400">
                {isHe ? 'הצעד הבא' : 'One Next Step'}
              </h3>
            </div>
            <p className="text-sm text-foreground">{assessment.one_next_step[lang]}</p>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(`${getBasePath(domainId)}/${domainId}/assess`)} className="flex-1">
            {isHe ? 'עשה שוב' : 'Retake'}
          </Button>
          <Button onClick={() => navigate(getBasePath(domainId))} className="flex-1">
            {isHe ? (isCoreDomain(domainId) ? 'חזור לליבה' : 'חזור לזירה') : (isCoreDomain(domainId) ? 'Back to Core' : 'Back to Arena')}
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
