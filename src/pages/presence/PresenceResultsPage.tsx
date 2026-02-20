/**
 * @tab Life
 * @purpose Full scoreboard + diagnosis + 90-day ladder.
 * @data usePresenceCoach
 */
import { PageShell } from '@/components/aurora-ui/PageShell';
import { usePresenceCoach } from '@/hooks/usePresenceCoach';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SubScoreCard from '@/components/presence/SubScoreCard';
import PresenceDiagnosis from '@/components/presence/PresenceDiagnosis';
import NinetyDayLadder from '@/components/presence/NinetyDayLadder';
import type { SubScoreKey } from '@/lib/presence/types';

const SUB_KEYS: SubScoreKey[] = ['face_structure', 'posture_frame', 'body_composition', 'skin_routine', 'hair_grooming', 'style_fit', 'dental_smile'];

export default function PresenceResultsPage() {
  const navigate = useNavigate();
  const { config, isLoading, setReassessCadence } = usePresenceCoach();
  const latest = config.latest_assessment;

  if (isLoading) return <PageShell><div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></PageShell>;
  if (!latest) { navigate('/life/presence/assess'); return null; }

  return (
    <PageShell>
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/life/presence')}><ArrowLeft className="w-5 h-5" /></Button>
          <h1 className="text-xl font-bold text-foreground">Presence Results</h1>
        </div>

        {/* Total Score */}
        <div className="p-6 rounded-2xl border border-border bg-card text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Presence Coach Score</p>
          <p className={`text-5xl font-black ${latest.total_score >= 75 ? 'text-emerald-500' : latest.total_score >= 55 ? 'text-amber-500' : 'text-red-500'}`}>{latest.total_score}</p>
          <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground mt-2 inline-block">{latest.confidence} confidence</span>
        </div>

        {/* Sub-scores */}
        <div className="space-y-2">
          {SUB_KEYS.map(key => <SubScoreCard key={key} scoreKey={key} data={latest.scores[key]} />)}
        </div>

        {/* Diagnosis */}
        <PresenceDiagnosis result={latest} />

        {/* 90-Day Ladder */}
        <NinetyDayLadder phases={latest.diagnosis.ninety_day_phases} />

        {/* Reassess */}
        <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
          <h3 className="font-bold text-foreground text-sm">Reassessment Schedule</h3>
          <p className="text-xs text-muted-foreground">Choose when to reassess:</p>
          <div className="flex gap-2">
            {([7, 14, 30] as const).map(d => (
              <Button key={d} variant={config.reassess_cadence === d ? 'default' : 'outline'} size="sm" onClick={() => setReassessCadence(d)}>{d} days</Button>
            ))}
          </div>
        </div>

        <Button onClick={() => navigate('/life/presence/routine')} className="w-full">Start Daily Routine</Button>
      </div>
    </PageShell>
  );
}
