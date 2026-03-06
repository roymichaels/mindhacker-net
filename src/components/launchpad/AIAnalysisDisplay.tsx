import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, User, Briefcase, RefreshCw, Rocket } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface AIAnalysisDisplayProps {
  language: string;
  refreshKey?: number;
}

interface SummaryData {
  consciousness_analysis?: {
    current_state?: string;
    dominant_patterns?: string[];
    strengths?: string[];
    blind_spots?: string[];
    growth_edges?: string[];
  };
  life_direction?: {
    core_aspiration?: string;
    clarity_score?: number;
    vision_summary?: string;
  };
  identity_profile?: {
    suggested_ego_state?: string;
    dominant_traits?: string[];
    values_hierarchy?: string[];
  };
  behavioral_insights?: {
    habits_to_transform?: string[];
    habits_to_cultivate?: string[];
    resistance_patterns?: string[];
  };
  career_path?: {
    current_status?: string;
    aspiration?: string;
    key_steps?: string[];
  };
  transformation_potential?: {
    readiness_score?: number;
    primary_focus?: string;
    secondary_focus?: string;
  };
}

const EGO_STATE_ICONS: Record<string, string> = {
  warrior: '⚔️', guardian: '🛡️', creator: '🎨', seeker: '🔍', sage: '🧙',
};
const EGO_STATE_LABELS: Record<string, { en: string; he: string }> = {
  warrior: { en: 'Warrior', he: 'לוחם' },
  guardian: { en: 'Guardian', he: 'שומר' },
  creator: { en: 'Creator', he: 'יוצר' },
  seeker: { en: 'Seeker', he: 'מחפש' },
  sage: { en: 'Sage', he: 'חכם' },
};

export function AIAnalysisDisplay({ language, refreshKey }: AIAnalysisDisplayProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [scores, setScores] = useState({ consciousness: 0, clarity: 0, readiness: 0 });

  useEffect(() => {
    async function fetchSummary() {
      if (!user?.id) { setLoading(false); return; }
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('launchpad_summaries')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (!error && data) {
          setSummary(data.summary_data as SummaryData);
          setScores({
            consciousness: data.consciousness_score || 0,
            clarity: data.clarity_score || 0,
            readiness: data.transformation_readiness || 0,
          });
        }
      } catch {} finally { setLoading(false); }
    }
    fetchSummary();
  }, [user?.id, refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400/50" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-12 space-y-4">
        <Brain className="w-16 h-16 mx-auto text-white/10" />
        <p className="text-white/30 text-sm">
          {language === 'he' 
            ? 'אין ניתוח AI עדיין. לחץ על "חשב מחדש" ליצירת ניתוח.'
            : 'No AI analysis yet. Click "Regenerate" to create analysis.'}
        </p>
      </div>
    );
  }

  const isHebrew = language === 'he';
  const egoState = summary.identity_profile?.suggested_ego_state?.toLowerCase() || '';
  const egoIcon = EGO_STATE_ICONS[egoState] || '🛡️';
  const egoLabel = EGO_STATE_LABELS[egoState];

  return (
    <div className="space-y-3">
      {/* Scores moved to StatWheel in profile header */}

      {/* Consciousness Analysis */}
      {summary.consciousness_analysis && (
        <GlassCard>
          <CardHeader icon={<Brain className="h-4 w-4 text-purple-400" />} title={isHebrew ? 'ניתוח תודעה' : 'Consciousness Analysis'} accent="bg-purple-500/10" />
          {summary.consciousness_analysis.current_state && (
            <p className="text-sm text-white/50 leading-relaxed mb-3">{summary.consciousness_analysis.current_state}</p>
          )}
          <div className="grid grid-cols-2 gap-2.5">
            {summary.consciousness_analysis.strengths?.length ? <ChipGroup icon="✨" label={isHebrew ? 'חוזקות' : 'Strengths'} items={summary.consciousness_analysis.strengths} variant="green" /> : null}
            {summary.consciousness_analysis.dominant_patterns?.length ? <ChipGroup icon="👁" label={isHebrew ? 'דפוסים' : 'Patterns'} items={summary.consciousness_analysis.dominant_patterns} variant="blue" /> : null}
          </div>
          <div className="grid grid-cols-2 gap-2.5 mt-2.5">
            {summary.consciousness_analysis.blind_spots?.length ? <ChipGroup icon="⚠" label={isHebrew ? 'נקודות עיוורות' : 'Blind Spots'} items={summary.consciousness_analysis.blind_spots} variant="amber" /> : null}
            {summary.consciousness_analysis.growth_edges?.length ? <ChipGroup icon="📈" label={isHebrew ? 'צמיחה' : 'Growth'} items={summary.consciousness_analysis.growth_edges} variant="emerald" /> : null}
          </div>
        </GlassCard>
      )}

      {/* Identity Profile moved to 3-col row below */}

      {/* Behavioral Insights */}
      {summary.behavioral_insights && (
        <GlassCard>
          <CardHeader icon={<RefreshCw className="h-4 w-4 text-cyan-400" />} title={isHebrew ? 'תובנות התנהגותיות' : 'Behavioral Insights'} accent="bg-cyan-500/10" />
          <div className="space-y-3">
            {summary.behavioral_insights.habits_to_cultivate?.length ? <ChipGroup icon="✅" label={isHebrew ? 'לטפח' : 'Cultivate'} items={summary.behavioral_insights.habits_to_cultivate} variant="green" /> : null}
            {summary.behavioral_insights.habits_to_transform?.length ? <ChipGroup icon="🔄" label={isHebrew ? 'לשנות' : 'Transform'} items={summary.behavioral_insights.habits_to_transform} variant="amber" /> : null}
            {summary.behavioral_insights.resistance_patterns?.length ? <ChipGroup icon="⚠" label={isHebrew ? 'התנגדויות' : 'Resistance'} items={summary.behavioral_insights.resistance_patterns} variant="red" /> : null}
          </div>
        </GlassCard>
      )}

      {/* Identity Profile + Career + Transformation — 3-col row */}
      {(summary.identity_profile || summary.career_path || summary.transformation_potential) && (
        <div className="grid grid-cols-3 gap-3">
          {summary.identity_profile && (
            <GlassCard>
              <CardHeader icon={<User className="h-4 w-4 text-rose-400" />} title={isHebrew ? 'פרופיל זהות' : 'Identity'} accent="bg-rose-500/10" />
              {summary.identity_profile.suggested_ego_state && (
                <div className="flex items-center gap-1.5 mb-2 p-1.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <span className="text-lg">{egoIcon}</span>
                  <span className="text-xs font-bold text-amber-400">
                    {egoLabel ? (isHebrew ? egoLabel.he : egoLabel.en) : summary.identity_profile.suggested_ego_state}
                  </span>
                </div>
              )}
              {summary.identity_profile.dominant_traits?.length ? (
                <div className="flex flex-wrap gap-1">
                  {summary.identity_profile.dominant_traits.slice(0, 3).map((t, i) => (
                    <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/15">{t}</span>
                  ))}
                </div>
              ) : null}
            </GlassCard>
          )}
          {summary.career_path && (
            <GlassCard>
              <CardHeader icon={<Briefcase className="h-4 w-4 text-blue-400" />} title={isHebrew ? 'קריירה' : 'Career'} accent="bg-blue-500/10" />
              {summary.career_path.aspiration && <p className="text-xs text-white/60 mb-2 line-clamp-3">{summary.career_path.aspiration}</p>}
              {summary.career_path.key_steps?.length ? (
                <div className="flex flex-wrap gap-1">
                  {summary.career_path.key_steps.slice(0, 2).map((s, i) => (
                    <span key={i} className="text-[10px] font-medium px-1.5 py-0.5 rounded-lg bg-white/[0.04] text-white/50 border border-white/[0.06]">{s}</span>
                  ))}
                </div>
              ) : null}
            </GlassCard>
          )}
          {summary.transformation_potential && (
            <GlassCard>
              <CardHeader icon={<Rocket className="h-4 w-4 text-amber-400" />} title={isHebrew ? 'טרנספורמציה' : 'Transform'} accent="bg-amber-500/10" />
              <div className="flex flex-wrap gap-1">
                {summary.transformation_potential.primary_focus && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/20">{summary.transformation_potential.primary_focus}</span>
                )}
                {summary.transformation_potential.secondary_focus && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-white/[0.04] text-amber-400/60 border border-amber-500/10">{summary.transformation_potential.secondary_focus}</span>
                )}
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}

// ── Empire helpers ──

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border border-white/[0.06] p-4"
      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
    >
      {children}
    </div>
  );
}

function CardHeader({ icon, title, accent }: { icon: React.ReactNode; title: string; accent: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className={cn("p-1.5 rounded-lg", accent)}>{icon}</div>
      <h4 className="text-sm font-bold text-white/90 tracking-wide">{title}</h4>
    </div>
  );
}

const CHIP_COLORS: Record<string, string> = {
  green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/15',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/15',
  red: 'bg-red-500/10 text-red-400 border-red-500/15',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15',
};

function ChipGroup({ icon, label, items, variant }: { icon: string; label: string; items: string[]; variant: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-xs">{icon}</span>
        <span className="text-[10px] text-white/30 uppercase tracking-[0.12em] font-semibold">{label}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.slice(0, 4).map((item, i) => (
          <span key={i} className={cn("text-xs font-medium px-2 py-0.5 rounded-lg border", CHIP_COLORS[variant] || CHIP_COLORS.blue)}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function ScoreCircle({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-2"
        style={{
          borderColor: `hsl(${color})`,
          color: `hsl(${color})`,
          background: `radial-gradient(circle, hsla(${color}, 0.1) 0%, transparent 70%)`,
          boxShadow: `0 0 20px hsla(${color}, 0.12)`,
        }}
      >
        {value}
      </div>
      <span className="text-[10px] text-white/35 font-medium uppercase tracking-wider">{label}</span>
    </div>
  );
}
