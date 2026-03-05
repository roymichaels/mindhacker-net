/**
 * EarnActivitySidebar — Right sidebar for the Earn hub.
 * Shows recent claims, active contributions, and quick stats.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import {
  PanelLeftClose, PanelLeftOpen, Coins, PlayCircle, CheckCircle2,
  Loader2, XCircle, Send, Clock, Shield,
} from 'lucide-react';
import { useFMClaims } from '@/hooks/useFMWallet';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EarnActivitySidebarProps {
  onGoToBounties?: () => void;
}

export function EarnActivitySidebar({ onGoToBounties }: EarnActivitySidebarProps) {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const { data: claims = [] } = useFMClaims();

  const { data: contributions = [] } = useQuery({
    queryKey: ['fm-data-contributions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.from('fm_data_contributions').select('*').eq('user_id', user.id).is('revoked_at', null);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const statusIcon = (status: string) => {
    switch (status) {
      case 'claimed': return <PlayCircle className="w-3 h-3 text-blue-400" />;
      case 'pending': return <Loader2 className="w-3 h-3 text-yellow-400 animate-spin" />;
      case 'approved': return <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
      case 'rejected': return <XCircle className="w-3 h-3 text-red-400" />;
      default: return <Clock className="w-3 h-3 text-muted-foreground" />;
    }
  };

  return (
    <aside className={cn(
      "flex flex-col flex-shrink-0 h-full overflow-y-auto scrollbar-hide transition-all duration-300 relative",
      "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
      "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
      "ltr:border-e rtl:border-s border-border/50 dark:border-amber-500/15",
      collapsed ? "w-[54px] min-w-[54px]" : "w-[260px] min-w-[200px] xl:w-[280px]"
    )}>
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute top-2 z-10 p-1 rounded-md hover:bg-accent/20 transition-colors text-muted-foreground hover:text-foreground",
          collapsed
            ? "ltr:left-1/2 ltr:-translate-x-1/2 rtl:right-1/2 rtl:translate-x-1/2"
            : "ltr:right-2 rtl:left-2"
        )}
        title={collapsed ? "Expand" : "Collapse"}
      >
        {collapsed
          ? (isRTL ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />)
          : (isRTL ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />)
        }
      </button>

      {/* COLLAPSED */}
      {collapsed && (
        <div className="flex flex-col items-center gap-2 h-full pt-8 pb-4">
          <div className="flex flex-col items-center gap-0.5 w-full px-1 rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 p-1">
            <div className="w-9 h-9 rounded-full border-2 border-amber-500/40 flex items-center justify-center bg-background/50">
              <span className="text-[9px] font-bold text-amber-400">{claims.length}</span>
            </div>
            <span className="text-[8px] text-muted-foreground leading-none">{isHe ? 'הגשות' : 'Claims'}</span>
          </div>

          <div className="w-8 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

          {/* Recent claim dots */}
          <div className="flex flex-col items-center gap-1.5">
            {claims.slice(0, 5).map((c: any) => (
              <div key={c.id} className="w-7 h-7 rounded-full flex items-center justify-center bg-amber-500/20 border border-amber-500/20">
                {statusIcon(c.status)}
              </div>
            ))}
          </div>

          {contributions.length > 0 && (
            <>
              <div className="w-8 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent my-1" />
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-[8px] text-muted-foreground">{contributions.length}</span>
            </>
          )}
        </div>
      )}

      {/* EXPANDED */}
      {!collapsed && (
        <div className="flex flex-col h-full overflow-hidden p-3 pt-8">
          {/* Claims header */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {isHe ? 'ההגשות שלי' : 'My Claims'}
            </span>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
              {claims.length}
            </span>
          </div>

          {/* Claims list */}
          <div className="flex-1 overflow-y-auto scrollbar-hide space-y-1.5 mb-3">
            {claims.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-muted-foreground">{isHe ? 'אין הגשות עדיין' : 'No claims yet'}</p>
                <button
                  onClick={onGoToBounties}
                  className="text-[10px] text-amber-400 mt-1 hover:underline"
                >
                  {isHe ? 'עבור לבאונטיז →' : 'Browse Bounties →'}
                </button>
              </div>
            ) : (
              claims.slice(0, 10).map((claim: any) => (
                <div
                  key={claim.id}
                  className="rounded-xl bg-muted/30 dark:bg-muted/15 border border-border/20 p-2.5 space-y-1"
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <p className="text-[11px] font-medium text-foreground truncate flex-1">
                      {claim.fm_bounties?.title || 'Bounty'}
                    </p>
                    {statusIcon(claim.status)}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Coins className="w-3 h-3 text-accent" />
                      {claim.fm_bounties?.reward_mos || 0}
                    </span>
                    <span>{new Date(claim.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Data contributions */}
          {contributions.length > 0 && (
            <>
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent mb-2" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 block">
                {isHe ? 'שיתופי נתונים' : 'Data Shares'}
              </span>
              <div className="space-y-1">
                {contributions.map((c: any) => (
                  <div key={c.id} className="rounded-lg bg-emerald-500/5 border border-emerald-500/15 p-2 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium text-foreground truncate">{c.data_type}</p>
                      <p className="text-[9px] text-muted-foreground">{c.reward_mos} MOS</p>
                    </div>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </aside>
  );
}
