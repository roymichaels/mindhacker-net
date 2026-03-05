/**
 * EarnActivitySidebar — Right sidebar for the Earn hub.
 * Shows category filters for the active tab + recent claims.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import {
  PanelLeftClose, PanelLeftOpen, Coins, PlayCircle, CheckCircle2,
  Loader2, XCircle, Clock, Shield, Filter,
  PenTool, Tag, MessageSquare, Palette, Languages, Code, Package, Layers,
} from 'lucide-react';
import { useFMClaims } from '@/hooks/useFMWallet';

const BOUNTY_CATEGORIES = [
  { id: 'all', labelEn: 'All', labelHe: 'הכל', icon: Layers },
  { id: 'writing', labelEn: 'Writing', labelHe: 'כתיבה', icon: PenTool },
  { id: 'labeling', labelEn: 'Labeling', labelHe: 'תיוג', icon: Tag },
  { id: 'feedback', labelEn: 'Feedback', labelHe: 'פידבק', icon: MessageSquare },
  { id: 'design', labelEn: 'Design', labelHe: 'עיצוב', icon: Palette },
  { id: 'translation', labelEn: 'Translation', labelHe: 'תרגום', icon: Languages },
];

const GIG_CATEGORIES = [
  { id: 'all', labelEn: 'All', labelHe: 'הכל', icon: Layers },
  { id: 'design', labelEn: 'Design', labelHe: 'עיצוב', icon: Palette },
  { id: 'writing', labelEn: 'Writing', labelHe: 'כתיבה', icon: PenTool },
  { id: 'translation', labelEn: 'Translation', labelHe: 'תרגום', icon: Languages },
  { id: 'development', labelEn: 'Development', labelHe: 'פיתוח', icon: Code },
  { id: 'content', labelEn: 'Content', labelHe: 'תוכן', icon: MessageSquare },
  { id: 'other', labelEn: 'Other', labelHe: 'אחר', icon: Package },
];

const DATA_CATEGORIES = [
  { id: 'all', labelEn: 'All Types', labelHe: 'כל הסוגים', icon: Layers },
  { id: 'sleep', labelEn: 'Sleep', labelHe: 'שינה', icon: Clock },
  { id: 'habits', labelEn: 'Habits', labelHe: 'הרגלים', icon: CheckCircle2 },
  { id: 'mood', labelEn: 'Mood', labelHe: 'מצב רוח', icon: MessageSquare },
  { id: 'training', labelEn: 'Training', labelHe: 'אימון', icon: Shield },
];

interface EarnActivitySidebarProps {
  activeTab?: string;
  categoryFilter?: string;
  onCategoryChange?: (cat: string) => void;
  onGoToBounties?: () => void;
}

export function EarnActivitySidebar({ activeTab = 'bounties', categoryFilter = 'all', onCategoryChange, onGoToBounties }: EarnActivitySidebarProps) {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { data: claims = [] } = useFMClaims();

  const categories = activeTab === 'bounties' ? BOUNTY_CATEGORIES
    : activeTab === 'gigs' ? GIG_CATEGORIES
    : activeTab === 'data' ? DATA_CATEGORIES
    : [];

  const tabLabel = activeTab === 'bounties' ? (isHe ? 'קטגוריות באונטי' : 'Bounty Categories')
    : activeTab === 'gigs' ? (isHe ? 'קטגוריות עבודות' : 'Gig Categories')
    : activeTab === 'data' ? (isHe ? 'סוגי נתונים' : 'Data Types')
    : (isHe ? 'סינון' : 'Filters');

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
      collapsed ? "w-[54px] min-w-[54px]" : "w-full md:w-[260px] md:min-w-[200px] xl:w-[280px] fixed md:relative inset-x-0 top-14 bottom-0 z-[55] md:z-auto md:top-auto md:inset-x-auto bg-background md:bg-transparent"
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
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
          </div>

          <div className="w-8 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

          {/* Category icons */}
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange?.(cat.id)}
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center transition-colors",
                categoryFilter === cat.id
                  ? "bg-amber-500/20 border border-amber-500/30"
                  : "bg-muted/30 border border-border/20 hover:bg-accent/10"
              )}
              title={isHe ? cat.labelHe : cat.labelEn}
            >
              <cat.icon className={cn("w-3 h-3", categoryFilter === cat.id ? "text-amber-400" : "text-muted-foreground")} />
            </button>
          ))}

          <div className="w-8 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent my-1" />

          {/* Claims count */}
          <div className="flex flex-col items-center gap-0.5 px-1 rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 p-1">
            <span className="text-[9px] font-bold text-amber-400">{claims.length}</span>
            <span className="text-[8px] text-muted-foreground">{isHe ? 'הגשות' : 'Claims'}</span>
          </div>
        </div>
      )}

      {/* EXPANDED */}
      {!collapsed && (
        <div className="flex flex-col h-full overflow-hidden p-3 pt-8">
          {/* Category filters */}
          {categories.length > 0 && (
            <>
              <div className="flex items-center gap-1.5 mb-2">
                <Filter className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {tabLabel}
                </span>
              </div>

              <div className="flex flex-col gap-1 mb-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => onCategoryChange?.(cat.id)}
                    className={cn(
                      "w-full rounded-xl p-2 flex items-center gap-2 transition-all border text-start",
                      categoryFilter === cat.id
                        ? "bg-amber-500/15 border-amber-500/30 shadow-sm"
                        : "bg-muted/30 dark:bg-muted/15 border-border/20 hover:bg-accent/10"
                    )}
                  >
                    <cat.icon className={cn("w-3.5 h-3.5 shrink-0", categoryFilter === cat.id ? 'text-amber-400' : 'text-muted-foreground')} />
                    <span className={cn(
                      "text-xs font-medium",
                      categoryFilter === cat.id ? 'text-amber-400' : 'text-foreground'
                    )}>
                      {isHe ? cat.labelHe : cat.labelEn}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent mb-2" />

          {/* Claims section */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {isHe ? 'ההגשות שלי' : 'My Claims'}
            </span>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
              {claims.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide space-y-1.5">
            {claims.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground">{isHe ? 'אין הגשות עדיין' : 'No claims yet'}</p>
                <button onClick={onGoToBounties} className="text-[10px] text-amber-400 mt-1 hover:underline">
                  {isHe ? 'עבור לבאונטיז →' : 'Browse Bounties →'}
                </button>
              </div>
            ) : (
              claims.slice(0, 8).map((claim: any) => (
                <div key={claim.id} className="rounded-xl bg-muted/30 dark:bg-muted/15 border border-border/20 p-2 space-y-0.5">
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
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
