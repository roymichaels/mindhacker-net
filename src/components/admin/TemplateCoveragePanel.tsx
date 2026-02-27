/**
 * TemplateCoveragePanel — Admin debug view.
 * Shows % of action_items with execution_template per day (last 14 days)
 * + breakdown by source/type/pillar.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

type CoverageRow = { day: string; total_items: number; with_template: number; coverage_pct: number };
type BreakdownRow = { dimension: string; dimension_value: string; total_items: number; missing_template: number; coverage_pct: number };

export function TemplateCoveragePanel() {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['template-coverage-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_template_coverage_stats', { p_days: 14 });
      if (error) throw error;
      return (data || []) as CoverageRow[];
    },
    refetchInterval: 60_000,
  });

  const { data: breakdown, isLoading: breakdownLoading } = useQuery({
    queryKey: ['template-breakdown'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_template_missing_breakdown', { p_days: 14 });
      if (error) throw error;
      return (data || []) as BreakdownRow[];
    },
    enabled: showBreakdown,
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
  const overallCoverage = rows.length > 0
    ? Math.round(rows.reduce((s, r) => s + (r.total_items > 0 ? r.coverage_pct : 100), 0) / rows.length)
    : 0;

  const groupedBreakdown = (breakdown || []).reduce<Record<string, BreakdownRow[]>>((acc, row) => {
    (acc[row.dimension] = acc[row.dimension] || []).push(row);
    return acc;
  }, {});

  const dimensionLabels: Record<string, string> = { source: '📦 By Source', type: '🏷️ By Type', pillar: '🎯 By Pillar' };

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
        <h3 className="font-semibold text-sm text-foreground">📋 Template Coverage</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="text-xs text-primary hover:underline"
          >
            {showBreakdown ? 'Hide' : 'Show'} Breakdown
          </button>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            overallCoverage >= 95 ? 'bg-green-500/10 text-green-600' :
            overallCoverage >= 70 ? 'bg-yellow-500/10 text-yellow-600' :
            'bg-red-500/10 text-red-600'
          }`}>
            {overallCoverage}% avg
          </span>
        </div>
      </div>

      {/* Daily rows */}
      <div className="p-3 space-y-1 max-h-48 overflow-y-auto">
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

      {/* Breakdown section */}
      {showBreakdown && (
        <div className="border-t border-border/50 p-3 space-y-3">
          {breakdownLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
          ) : (
            Object.entries(groupedBreakdown).map(([dim, dimRows]) => (
              <div key={dim}>
                <h4 className="text-xs font-semibold text-muted-foreground mb-1">{dimensionLabels[dim] || dim}</h4>
                <div className="space-y-0.5">
                  {dimRows.map((r) => (
                    <div key={r.dimension_value} className="flex items-center justify-between text-xs py-0.5 px-2">
                      <span className="text-foreground font-mono">{r.dimension_value}</span>
                      <div className="flex items-center gap-2">
                        {r.missing_template > 0 && (
                          <span className="text-red-500 text-[10px]">{r.missing_template} missing</span>
                        )}
                        <span className={`font-semibold w-8 text-right ${
                          r.coverage_pct >= 95 ? 'text-green-600' :
                          r.coverage_pct >= 70 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {r.coverage_pct}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default TemplateCoveragePanel;
