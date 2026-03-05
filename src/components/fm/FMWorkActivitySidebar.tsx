/**
 * FMWorkActivitySidebar — Right sidebar for FM Work page.
 * Shows resources and tips for professional growth.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import {
  PanelLeftClose, PanelLeftOpen, BookOpen, Lightbulb, ExternalLink,
} from 'lucide-react';

export function FMWorkActivitySidebar() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';

  const tips = [
    { labelEn: 'Complete your profile', labelHe: 'השלם את הפרופיל', icon: '👤' },
    { labelEn: 'Set up your services', labelHe: 'הגדר שירותים', icon: '⚙️' },
    { labelEn: 'Create a landing page', labelHe: 'צור דף נחיתה', icon: '📄' },
    { labelEn: 'Share your expertise', labelHe: 'שתף את המומחיות', icon: '🎯' },
  ];

  return (
    <aside className={cn(
      "flex flex-col flex-shrink-0 h-full overflow-y-auto scrollbar-hide transition-all duration-300 relative",
      "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
      "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
      "ltr:border-s rtl:border-e border-border/50 dark:border-blue-500/15",
      collapsed ? "w-16 min-w-[64px]" : "w-[260px] min-w-[200px] xl:w-[280px]"
    )}>
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
          ? (isRTL ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />)
          : (isRTL ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />)
        }
      </button>

      {collapsed && (
        <div className="flex flex-col items-center gap-2 h-full pt-8 pb-4">
          <Lightbulb className="w-4 h-4 text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground -rotate-90 whitespace-nowrap mt-4">
            {isHe ? 'טיפים' : 'Tips'}
          </span>
        </div>
      )}

      {!collapsed && (
        <div className="flex flex-col gap-3 p-3 pt-8 pb-4 overflow-y-auto scrollbar-hide h-full">
          <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-accent" />
            {isHe ? 'צעדים ראשונים' : 'Getting Started'}
          </h3>

          <div className="flex flex-col gap-1.5">
            {tips.map((tip, i) => (
              <div key={i} className="rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 p-2.5 flex items-center gap-2">
                <span className="text-sm">{tip.icon}</span>
                <span className="text-[11px] text-foreground font-medium">
                  {isHe ? tip.labelHe : tip.labelEn}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
