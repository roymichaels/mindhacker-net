/**
 * @tab Life
 * @purpose Animated analysis screen — calls edge function, navigates to results.
 */
import { PageShell } from '@/components/aurora-ui/PageShell';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePresenceScans } from '@/hooks/usePresenceScans';
import { usePresenceCoach } from '@/hooks/usePresenceCoach';
import { buildScanResult } from '@/lib/presence/scoring';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_MESSAGES = [
  'Mapping facial structure signals...',
  'Estimating symmetry & definition...',
  'Detecting posture alignment patterns...',
  'Inferring grooming baseline...',
  'Generating recommendations...',
];

export default function PresenceAnalyzing() {
  const navigate = useNavigate();
  const { analyze } = usePresenceScans();
  const { config, saveScanResult } = usePresenceCoach();
  const [messageIndex, setMessageIndex] = useState(0);
  const started = useRef(false);

  // Cycle status messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(i => (i + 1) % STATUS_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Run analysis
  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const raw = sessionStorage.getItem('presence_scan_images');
    if (!raw) {
      toast.error('No scan images found. Please try again.');
      navigate('/life/presence');
      return;
    }

    const images = JSON.parse(raw) as Record<string, string>;
    sessionStorage.removeItem('presence_scan_images');

    analyze(images)
      .then(async (scanData) => {
        // Map raw scan data to our bio-scan result model
        const result = buildScanResult(
          scanData.scores,
          scanData.derived_metrics,
          config.manual_inputs,
          scanData.id,
        );
        await saveScanResult(result);
        navigate('/life/presence/results', { replace: true });
      })
      .catch((err: any) => {
        toast.error(err.message || 'Analysis failed. Please try again.');
        navigate('/life/presence');
      });
  }, []);

  return (
    <PageShell>
      <div className="flex flex-col items-center justify-center py-24 gap-6">
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
            This may take 15–30 seconds.
          </p>
        </div>

        <p className="text-[10px] text-muted-foreground max-w-xs text-center">
          This is an estimate. Not medical advice. Lighting and angle affect results.
        </p>
      </div>
    </PageShell>
  );
}
