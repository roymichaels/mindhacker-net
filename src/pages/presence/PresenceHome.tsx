/**
 * @tab Life
 * @purpose Presence (תדמית) Pillar Home — Scan-first flow: 4-step guided capture → analyzing → Aurora chat for results.
 */
import { PageShell } from '@/components/aurora-ui/PageShell';
import { usePresenceCoach } from '@/hooks/usePresenceCoach';
import { usePresenceScans } from '@/hooks/usePresenceScans';
import { useNavigate } from 'react-router-dom';
import { Eye, ArrowLeft, Loader2, ScanLine, ChevronRight, ChevronLeft, RefreshCw, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { buildScanResult } from '@/lib/presence/scoring';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import GuidedCapture from '@/components/presence/GuidedCapture';
import { DomainAssessModal } from '@/components/domain-assess/DomainAssessModal';

type Phase = 'home' | 'capture' | 'analyzing';

export default function PresenceHome() {
  const navigate = useNavigate();
  const { config, isLoading, saveScanResult } = usePresenceCoach();
  const { analyze, recalculate, isAnalyzing } = usePresenceScans();
  const { t, isRTL } = useTranslation();
  const latest = config.latest_scan;
  const [phase, setPhase] = useState<Phase>('home');
  const [chatOpen, setChatOpen] = useState(false);
  const [analyzeMessageIdx, setAnalyzeMessageIdx] = useState(0);

  const STATUS_MESSAGES = [
    t('presence.analyzingMapping'),
    t('presence.analyzingSymmetry'),
    t('presence.analyzingPosture'),
    t('presence.analyzingFrame'),
    t('presence.analyzingRecommendations'),
  ];

  // Cycle analyzing messages
  useEffect(() => {
    if (phase !== 'analyzing') return;
    const interval = setInterval(() => {
      setAnalyzeMessageIdx(i => (i + 1) % STATUS_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [phase]);

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageShell>
    );
  }

  const handleCaptureDone = async (images: Record<string, string>) => {
    setPhase('analyzing');
    try {
      const scanData = await analyze(images);
      const result = buildScanResult(scanData.scores, scanData.derived_metrics, scanData.id);
      await saveScanResult(result);
      toast.success(t('presence.recalculateSuccess'));
      setPhase('home');
      // After scan completes, open the Aurora chat for analysis discussion
      setChatOpen(true);
    } catch (err: any) {
      toast.error(err.message || 'Analysis failed. Please try again.');
      setPhase('home');
    }
  };

  const handleRecalculate = async () => {
    try {
      const scanData = await recalculate();
      const result = buildScanResult(scanData.scores, scanData.derived_metrics, scanData.id);
      await saveScanResult(result);
      toast.success(t('presence.recalculateSuccess'));
    } catch (err: any) {
      toast.error(err.message || 'Recalculation failed.');
    }
  };

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;
  const BackIcon = isRTL ? ChevronRight : ArrowLeft;

  return (
    <PageShell>
      <div className="space-y-6 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => phase === 'home' ? navigate('/life') : setPhase('home')}>
            <BackIcon className="w-5 h-5" />
          </Button>
          <Eye className="w-6 h-6 text-rose-500" />
          <h1 className="text-2xl font-bold text-foreground">{t('presence.title')}</h1>
        </div>

        {/* Phase: Home */}
        {phase === 'home' && (
          <>
            {/* Primary CTA — Start Scan */}
            <div className="p-6 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ScanLine className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-foreground">{t('presence.presenceScan')}</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {t('presence.scanDescription')}
              </p>
              <Button onClick={() => setPhase('capture')} className="w-full" size="lg">
                {t('presence.beginScan')} <ChevronIcon className="w-4 h-4 ms-1" />
              </Button>
            </div>

            {/* Chat with Aurora about results */}
            {latest && (
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => setChatOpen(true)}
              >
                <MessageCircle className="w-4 h-4" />
                {isRTL ? 'שוחח/י עם אורורה על התוצאות' : 'Discuss results with Aurora'}
              </Button>
            )}

            {/* Last Scan Panel */}
            {latest && (
              <div className="p-4 rounded-2xl border border-border bg-card">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{t('presence.yourLastScan')}</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-black ${latest.presence_index >= 70 ? 'text-emerald-500' : latest.presence_index >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                      {latest.presence_index}
                    </span>
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {latest.confidence} {t('presence.confidence')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(latest.assessed_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRecalculate}
                    disabled={isAnalyzing}
                    className="flex-1"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="w-3 h-3 animate-spin me-1" />
                    ) : (
                      <RefreshCw className="w-3 h-3 me-1" />
                    )}
                    {t('presence.rescan')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate('/life/presence/results')} className="flex-1">
                    {t('presence.viewResults')}
                  </Button>
                </div>
              </div>
            )}

            {/* Completion badge */}
            {config.completed && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-sm font-medium text-emerald-600">{t('presence.assessmentComplete')}</p>
              </div>
            )}

            {/* Info note */}
            <p className="text-xs text-muted-foreground text-center">
              {t('presence.plansNote')}
            </p>
          </>
        )}

        {/* Phase: Capture — 4-step guided photo scan */}
        {phase === 'capture' && (
          <GuidedCapture
            onComplete={handleCaptureDone}
            onCancel={() => setPhase('home')}
          />
        )}

        {/* Phase: Analyzing */}
        {phase === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-2 border-primary/20 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-primary/10 animate-ping" />
            </div>
            <div className="text-center space-y-2 min-h-[3rem]">
              <p className="text-foreground font-medium animate-pulse">
                {STATUS_MESSAGES[analyzeMessageIdx]}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('presence.analyzingWait')}
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground max-w-xs text-center">
              {t('presence.analyzingDisclaimer')}
            </p>
          </div>
        )}
      </div>

      {/* Aurora Chat Modal — opens after scan or on demand */}
      <DomainAssessModal open={chatOpen} onOpenChange={setChatOpen} domainId="presence" />
    </PageShell>
  );
}
