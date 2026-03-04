/**
 * OnboardingPresenceScan — Wraps the existing GuidedCapture + analysis flow
 * for use inside the onboarding assessment sequence.
 */
import { useState, useRef, useEffect } from 'react';
import GuidedCapture from '@/components/presence/GuidedCapture';
import { usePresenceScans } from '@/hooks/usePresenceScans';
import { usePresenceCoach } from '@/hooks/usePresenceCoach';
import { buildScanResult } from '@/lib/presence/scoring';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';

interface OnboardingPresenceScanProps {
  onComplete: () => void;
  onCancel: () => void;
}

export default function OnboardingPresenceScan({ onComplete, onCancel }: OnboardingPresenceScanProps) {
  const { analyze } = usePresenceScans();
  const { saveScanResult } = usePresenceCoach();
  const { t, isRTL } = useTranslation();
  const [phase, setPhase] = useState<'capture' | 'analyzing'>('capture');
  const [messageIndex, setMessageIndex] = useState(0);
  const started = useRef(false);

  const STATUS_MESSAGES = [
    t('presence.analyzingMapping'),
    t('presence.analyzingSymmetry'),
    t('presence.analyzingPosture'),
    t('presence.analyzingFrame'),
    t('presence.analyzingRecommendations'),
  ];

  // Cycle status messages during analysis
  useEffect(() => {
    if (phase !== 'analyzing') return;
    const interval = setInterval(() => {
      setMessageIndex(i => (i + 1) % STATUS_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [phase]);

  const handleCaptureComplete = async (images: Record<string, string>) => {
    if (started.current) return;
    started.current = true;
    setPhase('analyzing');

    try {
      const scanData = await analyze(images);
      const result = buildScanResult(scanData.scores, scanData.derived_metrics, scanData.id);
      await saveScanResult(result);
      toast.success(t('presence.scanComplete') || 'Presence scan complete!');
      onComplete();
    } catch (err: any) {
      toast.error(err.message || 'Analysis failed. Please try again.');
      started.current = false;
      setPhase('capture');
    }
  };

  if (phase === 'analyzing') {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-2 border-primary/20 flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-primary/10 animate-ping" />
        </div>
        <div className="text-center space-y-2 min-h-[3rem]">
          <p className="text-foreground font-medium animate-pulse">
            {STATUS_MESSAGES[messageIndex]}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('presence.analyzingWait')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <GuidedCapture
        onComplete={handleCaptureComplete}
        onCancel={onCancel}
      />
    </div>
  );
}
