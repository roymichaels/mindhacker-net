/**
 * @tab Life
 * @purpose Presence Home — hero score, sub-score cards, Next Best Action, CTAs.
 * @data usePresenceCoach hook
 */
import { PageShell } from '@/components/aurora-ui/PageShell';
import { usePresenceCoach } from '@/hooks/usePresenceCoach';
import { useNavigate } from 'react-router-dom';
import { Eye, ArrowLeft, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SubScoreCard from '@/components/presence/SubScoreCard';
import type { SubScoreKey } from '@/lib/presence/types';

const SUB_KEYS: SubScoreKey[] = ['face_structure', 'posture_frame', 'body_composition', 'skin_routine', 'hair_grooming', 'style_fit', 'dental_smile'];

export default function PresenceHome() {
  const navigate = useNavigate();
  const { config, isLoading } = usePresenceCoach();
  const latest = config.latest_assessment;

  if (isLoading) return <PageShell><div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></PageShell>;

  return (
    <PageShell>
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/life')}><ArrowLeft className="w-5 h-5" /></Button>
          <Eye className="w-6 h-6 text-rose-500" />
          <h1 className="text-2xl font-bold text-foreground">Presence Coach</h1>
        </div>

        {!latest ? (
          <div className="text-center space-y-4 py-12">
            <Eye className="w-16 h-16 mx-auto text-muted-foreground/30" />
            <h2 className="text-xl font-bold text-foreground">Start Your Presence Assessment</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">Get your Presence Coach Score, personalized diagnosis, and daily routine.</p>
            <Button onClick={() => navigate('/life/presence/assess')} size="lg">Start Assessment <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
        ) : (
          <>
            {/* Hero Score */}
            <div className="p-6 rounded-2xl border border-border bg-card text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Presence Coach Score</p>
              <p className={`text-5xl font-black ${latest.total_score >= 75 ? 'text-emerald-500' : latest.total_score >= 55 ? 'text-amber-500' : 'text-red-500'}`}>{latest.total_score}</p>
              <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground mt-2 inline-block">{latest.confidence} confidence</span>
              <p className="text-xs text-muted-foreground mt-2">Assessed: {new Date(latest.assessed_at).toLocaleDateString()}</p>
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => navigate('/life/presence/routine')} className="h-auto py-3">Today's Routine</Button>
              <Button onClick={() => navigate('/life/presence/assess')}>Reassess <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>

            {/* Next Best Action */}
            {latest.top_levers[0] && (
              <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5">
                <p className="text-xs text-primary font-medium mb-1">Next Best Action</p>
                <p className="text-sm font-bold text-foreground">{latest.top_levers[0].title}</p>
                <p className="text-xs text-muted-foreground mt-1">{latest.top_levers[0].why}</p>
              </div>
            )}

            {/* Sub-score Cards */}
            <div className="space-y-2">
              <h3 className="font-bold text-foreground">Component Scores</h3>
              {SUB_KEYS.map(key => (
                <SubScoreCard key={key} scoreKey={key} data={latest.scores[key]} />
              ))}
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => navigate('/life/presence/results')}>Full Results</Button>
              <Button variant="outline" onClick={() => navigate('/life/presence/history')}>History</Button>
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}
