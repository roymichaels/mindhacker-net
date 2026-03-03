/**
 * ArenaDomainPage — Individual Arena domain view at /arena/:domainId.
 * Shows config status, action buttons, and navigates to AI assessment.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { getDomainById, ARENA_DOMAINS } from '@/navigation/lifeDomains';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { useDomainAssessment } from '@/hooks/useDomainAssessment';
import { useTranslation } from '@/hooks/useTranslation';
import { usePillarContext } from '@/hooks/usePillarContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Settings, Play, RefreshCw, Map, AlertTriangle, AlertCircle, Sparkles, Target } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DOMAIN_ASSESS_META } from '@/lib/domain-assess/types';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';

function scoreColor(v: number): string {
  if (v >= 70) return 'text-emerald-400';
  if (v >= 40) return 'text-amber-400';
  return 'text-red-400';
}

export default function ArenaDomainPage() {
  const { domainId } = useParams<{ domainId: string }>();
  const navigate = useNavigate();
  const { statusMap, isLoading } = useLifeDomains();
  const { config } = useDomainAssessment(domainId ?? '');
  const { language, isRTL, t } = useTranslation();
  const isHe = language === 'he';

  const domain = domainId ? getDomainById(domainId) : undefined;
  const isArena = domain ? ARENA_DOMAINS.some(d => d.id === domain.id) : false;
  const { startAssessment } = useAuroraChatContext();

  // Scope Aurora chat to this pillar so history persists
  usePillarContext(domainId || '');

  
  const status = statusMap[domain?.id ?? ''] ?? 'unconfigured';

  // Auto-open assessment if unconfigured or needs reassessment
  useEffect(() => {
    if (!isLoading && domain && (status === 'unconfigured' || status === 'needs_reassessment')) {
      startAssessment(domain.id);
    }
  }, [isLoading, domain, status]);

  if (!domain || !isArena) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-muted-foreground">{isHe ? 'תחום לא נמצא' : 'Domain not found'}</p>
          <Button variant="outline" onClick={() => navigate('/life')}>
            {isHe ? 'חזור' : 'Go Back'}
          </Button>
        </div>
      </PageShell>
    );
  }

  const Icon = domain.icon;
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;
  const meta = DOMAIN_ASSESS_META[domain.id];
  const assessment = config.latest_assessment;
  const lang = isHe ? 'he' : 'en';

  return (
    <PageShell>
      <div className="space-y-6 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Back button */}
        <button
          onClick={() => navigate('/arena')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <BackArrow className="w-4 h-4" />
          {isHe ? 'חזרה לזירה' : 'Back to Arena'}
        </button>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isHe ? domain.labelHe : domain.labelEn}
            </h1>
            <p className="text-muted-foreground text-sm">{isHe ? domain.descriptionHe : domain.description}</p>
          </div>
          <Badge variant={status === 'active' ? 'default' : status === 'configured' ? 'secondary' : 'outline'} className="ms-auto">
            {status === 'active' ? (isHe ? 'פעיל' : 'Active') :
             status === 'configured' ? (isHe ? 'הוגדר' : 'Configured') :
             (isHe ? 'לא הוגדר' : 'Not Set Up')}
          </Badge>
        </div>

        {/* Unconfigured state */}
        {!assessment && status === 'unconfigured' && (
          <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-8 flex flex-col items-center gap-4 text-center">
            <Settings className="w-10 h-10 text-primary/60" />
            <h2 className="text-lg font-semibold text-foreground">
              {isHe ? 'התחל הגדרה' : 'Start Configuration'}
            </h2>
            <p className="text-sm text-muted-foreground max-w-md">
              {isHe
                ? 'שיחה קצרה עם AI כדי לאבחן את המצב שלך בתחום הזה.'
                : 'A short AI conversation to diagnose your current state in this domain.'}
            </p>
            <Button onClick={() => startAssessment(domain.id)} size="lg" className="mt-2">
              <Play className="w-4 h-4 me-2" />
              {isHe ? 'התחל אבחון' : 'Start Assessment'}
            </Button>
          </div>
        )}

        {/* Assessment results */}
        {assessment && (
          <>
            {/* Low confidence warning */}
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
              <Card className="p-6 bg-gradient-to-b from-primary/10 to-transparent text-center border-primary/20">
                <p className="text-5xl font-black text-foreground">{assessment.domain_index}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isHe ? (domain.labelHe + ' — ציון כללי') : (domain.labelEn + ' — Overall Score')}
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
                <Card className="p-5 border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-primary">
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
            {meta && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  {isHe ? 'תת-מערכות' : 'Subsystems'}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {meta.subsystems.map(sub => {
                    const val = assessment.subscores?.[sub.id] ?? 0;
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
            )}

            {/* Findings */}
            {assessment.findings && assessment.findings.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  {isHe ? 'ממצאים' : 'Findings'}
                </h3>
                <div className="space-y-2">
                  {assessment.findings.map((f: any) => (
                    <Card key={f.id} className={cn(
                      "p-3 flex items-start gap-3",
                      f.severity === 'high' ? 'border-red-500/30' : f.severity === 'med' ? 'border-amber-500/30' : 'border-border'
                    )}>
                      <AlertTriangle className={cn("w-4 h-4 mt-0.5 shrink-0",
                        f.severity === 'high' ? 'text-red-400' : f.severity === 'med' ? 'text-amber-400' : 'text-muted-foreground'
                      )} />
                      <p className="text-sm text-foreground">{lang === 'he' ? f.text_he : f.text_en}</p>
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
          </>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {assessment && (
            <>
              <Button variant="outline" onClick={() => startAssessment(domain.id)}>
                <RefreshCw className="w-4 h-4 me-2" />
                {isHe ? 'אבחון מחדש' : 'Reassess'}
              </Button>
              <Button variant="outline" onClick={() => navigate(`/arena/${domain.id}/results`)}>
                <Map className="w-4 h-4 me-2" />
                {isHe ? 'צפה בתוצאות' : 'View Results'}
              </Button>
            </>
          )}
        </div>
      </div>

    </PageShell>
  );
}
