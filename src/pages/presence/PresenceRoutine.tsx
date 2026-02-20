/**
 * @tab Life
 * @purpose Daily Presence routine with completion tracking.
 * @data usePresenceCoach
 */
import { PageShell } from '@/components/aurora-ui/PageShell';
import { usePresenceCoach } from '@/hooks/usePresenceCoach';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RoutineChecklist from '@/components/presence/RoutineChecklist';
import { buildRoutine } from '@/lib/presence/routineBuilder';
import { toast } from 'sonner';
import type { RoutineIntensity } from '@/lib/presence/types';
import { useState } from 'react';

export default function PresenceRoutine() {
  const navigate = useNavigate();
  const { config, isLoading, isSaving, logRoutineCompletion, saveRoutine } = usePresenceCoach();
  const [intensity, setIntensity] = useState<RoutineIntensity>(config.active_routine?.intensity ?? 'standard');

  const routine = config.active_routine;
  const today = new Date().toISOString().slice(0, 10);
  const todayLog = config.routine_logs?.find(l => l.date === today);

  if (isLoading) return <PageShell><div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></PageShell>;

  if (!routine || !config.latest_assessment) {
    return (
      <PageShell>
        <div className="space-y-6 pb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/life/presence')}><ArrowLeft className="w-5 h-5" /></Button>
            <h1 className="text-xl font-bold text-foreground">Daily Routine</h1>
          </div>
          <div className="text-center py-12 space-y-3">
            <p className="text-muted-foreground">Complete an assessment first to generate your routine.</p>
            <Button onClick={() => navigate('/life/presence/assess')}>Start Assessment</Button>
          </div>
        </div>
      </PageShell>
    );
  }

  const handleIntensityChange = async (newIntensity: RoutineIntensity) => {
    setIntensity(newIntensity);
    const newRoutine = buildRoutine(config.latest_assessment!.top_levers, newIntensity);
    await saveRoutine(newRoutine);
    toast.success(`Routine updated to ${newIntensity}`);
  };

  const handleSave = async (completed: string[]) => {
    await logRoutineCompletion(completed);
    toast.success('Progress saved!');
  };

  return (
    <PageShell>
      <div className="space-y-6 pb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/life/presence')}><ArrowLeft className="w-5 h-5" /></Button>
            <h1 className="text-xl font-bold text-foreground">Daily Routine</h1>
          </div>
          <Settings className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Intensity Toggle */}
        <div className="flex gap-2">
          {(['minimal', 'standard', 'full'] as RoutineIntensity[]).map(i => (
            <Button key={i} variant={intensity === i ? 'default' : 'outline'} size="sm" className="flex-1 capitalize" onClick={() => handleIntensityChange(i)}>{i}</Button>
          ))}
        </div>

        <RoutineChecklist
          items={routine.items}
          completedToday={todayLog?.completed_items ?? []}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </div>
    </PageShell>
  );
}
