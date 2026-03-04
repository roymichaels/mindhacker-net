/**
 * OnboardingPresenceScan — Wraps the existing GuidedCapture + analysis flow
 * then opens the presence assessment chat, for use inside onboarding.
 * Persists captured image paths so they survive errors/retries.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import GuidedCapture from '@/components/presence/GuidedCapture';
import DomainAssessChat from '@/components/domain-assess/DomainAssessChat';
import { usePresenceScans } from '@/hooks/usePresenceScans';
import { usePresenceCoach } from '@/hooks/usePresenceCoach';
import { buildScanResult } from '@/lib/presence/scoring';
import { Loader2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'onboarding_presence_images';

interface OnboardingPresenceScanProps {
  onComplete: () => void;
  onCancel: () => void;
}

export default function OnboardingPresenceScan({ onComplete, onCancel }: OnboardingPresenceScanProps) {
  const { analyze } = usePresenceScans();
  const { saveScanResult } = usePresenceCoach();
  const { t, isRTL } = useTranslation();
  const [phase, setPhase] = useState<'capture' | 'analyzing' | 'chat'>('capture');
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  // Load persisted images on mount — skip capture if already saved
  const savedImages = useRef<Record<string, string> | null>(null);
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Object.keys(parsed).length === 4) {
          savedImages.current = parsed;
          // Auto-trigger analysis with saved images
          handleCaptureComplete(parsed);
        }
      }
    } catch {
      // ignore corrupt data
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleCaptureComplete = useCallback(async (images: Record<string, string>) => {
    if (started.current) return;
    started.current = true;
    setPhase('analyzing');
    setError(null);

    // Persist images so they survive errors/retries
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(images));
      savedImages.current = images;
    } catch {
      // storage full — continue anyway
    }

    try {
      const scanData = await analyze(images);
      const result = buildScanResult(scanData.scores, scanData.derived_metrics, scanData.id);
      await saveScanResult(result);
      // Clean up persisted images on success
      sessionStorage.removeItem(STORAGE_KEY);
      // Move to the chat assessment phase
      setPhase('chat');
    } catch (err: any) {
      const msg = err.message || 'Analysis failed. Please try again.';
      setError(msg);
      toast.error(msg);
      started.current = false;
      setPhase('analyzing'); // stay on analyzing screen with retry button
    }
  }, [analyze, saveScanResult]);

  const handleRetry = () => {
    started.current = false;
    setError(null);
    if (savedImages.current) {
      handleCaptureComplete(savedImages.current);
    } else {
      setPhase('capture');
    }
  };

  const handleRetake = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    savedImages.current = null;
    started.current = false;
    setError(null);
    setPhase('capture');
  };

  if (phase === 'chat') {
    return (
      <DomainAssessChat
        domainId="presence"
        asModal
        onClose={onComplete}
      />
    );
  }

  if (phase === 'analyzing') {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {error ? (
          <>
            <div className="w-20 h-20 rounded-full border-2 border-destructive/30 flex items-center justify-center">
              <RotateCcw className="w-10 h-10 text-destructive" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-foreground font-medium">{error}</p>
              <p className="text-xs text-muted-foreground">
                {isRTL ? 'התמונות נשמרו — אפשר לנסות שוב' : 'Your photos are saved — you can retry'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleRetake}>
                {isRTL ? 'צלם מחדש' : 'Retake Photos'}
              </Button>
              <Button onClick={handleRetry}>
                {isRTL ? 'נסה שוב' : 'Retry Analysis'}
              </Button>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
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
