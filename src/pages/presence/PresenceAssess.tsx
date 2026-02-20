/**
 * @tab Life
 * @purpose Assessment setup + runner page.
 * @data usePresenceCoach
 */
import { useState } from 'react';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { usePresenceCoach } from '@/hooks/usePresenceCoach';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AssessmentSetup from '@/components/presence/AssessmentSetup';
import AssessmentRunner from '@/components/presence/AssessmentRunner';
import type { AssessmentMode, PresencePreferences } from '@/lib/presence/types';
import { buildAssessmentResult } from '@/lib/presence/scoring';
import { buildRoutine } from '@/lib/presence/routineBuilder';
import { toast } from 'sonner';

export default function PresenceAssess() {
  const navigate = useNavigate();
  const { saveAssessment, saveRoutine, isSaving } = usePresenceCoach();
  const [mode, setMode] = useState<AssessmentMode | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleComplete = async (prefs: PresencePreferences) => {
    if (!mode) return;
    setProcessing(true);
    try {
      const result = buildAssessmentResult(mode, prefs);
      const routine = buildRoutine(result.top_levers, 'standard');
      await saveAssessment(result, prefs);
      await saveRoutine(routine);
      toast.success('Assessment complete!');
      navigate('/life/presence/results');
    } catch (e: any) {
      toast.error(e.message || 'Failed to save assessment');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <PageShell>
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => mode ? setMode(null) : navigate('/life/presence')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Presence Assessment</h1>
        </div>

        {processing ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-foreground font-medium">Computing your Presence Score...</p>
          </div>
        ) : !mode ? (
          <AssessmentSetup onSelect={setMode} />
        ) : (
          <AssessmentRunner mode={mode} onComplete={handleComplete} onCancel={() => setMode(null)} />
        )}
      </div>
    </PageShell>
  );
}
