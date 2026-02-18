/**
 * RoadmapSidebar - Desktop-only left sidebar showing the 90-day roadmap.
 * Mirrors HudSidebar on the opposite side.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { VerticalRoadmap } from '@/components/dashboard/VerticalRoadmap';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export function RoadmapSidebar() {
  const { isRTL } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden lg:flex lg:flex-col flex-shrink-0 h-full overflow-hidden transition-all duration-300 relative",
        "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
        "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
        "ltr:border-e rtl:border-s border-border/50 dark:border-primary/15",
        collapsed ? "w-10" : "w-[280px] xl:w-[300px]"
      )}
    >
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

      {/* Content - hidden when collapsed */}
      {!collapsed && (
        <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden p-3 pt-8">
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-2" />
          <VerticalRoadmap />
        </div>
      )}
    </aside>
  );
}
