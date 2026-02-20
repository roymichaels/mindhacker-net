/**
 * @tab Life
 * @purpose Presence Pillar Home — Scan CTA + Last Scan panel. Bilingual + RTL.
 */
import { PageShell } from '@/components/aurora-ui/PageShell';
import { usePresenceCoach } from '@/hooks/usePresenceCoach';
import { usePresenceScans } from '@/hooks/usePresenceScans';
import { useNavigate } from 'react-router-dom';
import { Eye, ArrowLeft, Loader2, ScanLine, ChevronRight, ChevronLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { buildScanResult } from '@/lib/presence/scoring';
import { toast } from 'sonner';

export default function PresenceHome() {
  const navigate = useNavigate();
  const { config, isLoading, saveScanResult } = usePresenceCoach();
  const { recalculate, isAnalyzing } = usePresenceScans();
  const { t, isRTL } = useTranslation();
  const latest = config.latest_scan;

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageShell>
    );
  }

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
          <Button variant="ghost" size="icon" onClick={() => navigate('/life')}>
            <BackIcon className="w-5 h-5" />
          </Button>
          <Eye className="w-6 h-6 text-rose-500" />
          <h1 className="text-2xl font-bold text-foreground">{t('presence.title')}</h1>
        </div>

        {/* Primary CTA — Presence Scan */}
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
          <Button onClick={() => navigate('/life/presence/scan')} className="w-full" size="lg">
            {t('presence.beginScan')} <ChevronIcon className="w-4 h-4 ms-1" />
          </Button>
        </div>

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
      </div>
    </PageShell>
  );
}
