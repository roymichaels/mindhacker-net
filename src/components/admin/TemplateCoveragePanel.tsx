/**
 * TemplateCoveragePanel — Admin debug view.
 * Shows % of action_items with execution_template per day (last 14 days).
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

export function TemplateCoveragePanel() {
  const { data, isLoading } = useQuery({
    queryKey: ['template-coverage-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_template_coverage_stats', { p_days: 14 });
      if (error) throw error;
      return (data || []) as { day: string; total_items: number; with_template: number; coverage_pct: number }[];
    },
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const rows = data || [];
  const todayRow = rows[0];
  const overallCoverage = rows.length > 0
    ? Math.round(rows.reduce((s, r) => s + (r.total_items > 0 ? r.coverage_pct : 100), 0) / rows.length)
    : 0;

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
        <h3 className="font-semibold text-sm text-foreground">📋 Template Coverage</h3>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          overallCoverage >= 95 ? 'bg-green-500/10 text-green-600' :
          overallCoverage >= 70 ? 'bg-yellow-500/10 text-yellow-600' :
          'bg-red-500/10 text-red-600'
        }`}>
          {overallCoverage}% avg
        </span>
      </div>

      <div className="p-3 space-y-1 max-h-64 overflow-y-auto">
        {rows.map((row) => (
          <div key={row.day} className="flex items-center justify-between text-xs py-1 px-2 rounded-md hover:bg-muted/30">
            <span className="text-muted-foreground font-mono">
              {new Date(row.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{row.with_template}/{row.total_items}</span>
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    row.coverage_pct >= 95 ? 'bg-green-500' :
                    row.coverage_pct >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(row.coverage_pct, 100)}%` }}
                />
              </div>
              <span className={`font-semibold w-8 text-right ${
                row.coverage_pct >= 95 ? 'text-green-600' :
                row.coverage_pct >= 70 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {row.coverage_pct}%
              </span>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">No data yet</p>
        )}
      </div>
    </div>
  );
}

export default TemplateCoveragePanel;
