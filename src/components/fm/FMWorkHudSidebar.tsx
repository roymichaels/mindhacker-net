/**
 * FMWorkHudSidebar — Left sidebar for FM Work page.
 * Professional path navigation and stats.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import {
  PanelRightClose, PanelRightOpen, GraduationCap, Briefcase,
  Code, Palette, Sparkles, Rocket,
} from 'lucide-react';

export function FMWorkHudSidebar() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();

  const paths = [
    { id: 'coach', icon: GraduationCap, label: isHe ? 'מאמן' : 'Coach', color: 'text-amber-400', path: '/coaches' },
    { id: 'business', icon: Briefcase, label: isHe ? 'עסק' : 'Business', color: 'text-blue-400', path: '/business' },
    { id: 'freelancer', icon: Code, label: isHe ? 'פרילנס' : 'Freelance', color: 'text-emerald-400', path: '/projects' },
    { id: 'creator', icon: Palette, label: isHe ? 'יוצר' : 'Creator', color: 'text-purple-400', path: '/coaches' },
  ];

  return (
    <aside className={cn(
      "flex flex-col flex-shrink-0 h-full overflow-y-auto scrollbar-hide transition-all duration-300 relative",
      "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
      "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
      "ltr:border-e rtl:border-s border-border/50 dark:border-blue-500/15",
      collapsed ? "w-16 min-w-[64px]" : "w-[260px] min-w-[200px] xl:w-[280px]"
    )}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute top-2 z-10 p-1 rounded-md hover:bg-accent/20 transition-colors text-muted-foreground hover:text-foreground",
          collapsed
            ? "ltr:left-1/2 ltr:-translate-x-1/2 rtl:right-1/2 rtl:translate-x-1/2"
            : "ltr:left-2 rtl:right-2"
        )}
        title={collapsed ? "Expand" : "Collapse"}
      >
        {collapsed
          ? (isRTL ? <PanelRightOpen className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />)
          : (isRTL ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />)
        }
      </button>

      {collapsed && (
        <div className="flex flex-col items-center gap-2 h-full pt-8 pb-4">
          <div className="flex flex-col items-center gap-1">
            {paths.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="p-2 rounded-lg border bg-muted/30 dark:bg-muted/15 border-border/20 hover:bg-accent/10 transition-colors"
                title={item.label}
              >
                <item.icon className={cn("w-4 h-4", item.color)} />
              </button>
            ))}
          </div>
        </div>
      )}

      {!collapsed && (
        <div className="flex flex-col gap-3 p-3 pt-8 pb-4 overflow-y-auto scrollbar-hide h-full">
          <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            {isHe ? 'מסלולים מקצועיים' : 'Professional Paths'}
          </h3>

          <div className="flex flex-col gap-1.5 w-full">
            {paths.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="w-full rounded-xl p-2.5 flex items-center gap-2.5 transition-all border text-start bg-muted/30 dark:bg-muted/15 border-border/20 hover:bg-accent/10"
              >
                <item.icon className={cn("w-4 h-4 shrink-0", item.color)} />
                <span className="text-xs font-medium text-foreground">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

          <div className="rounded-xl bg-blue-500/5 border border-blue-500/15 p-3 text-center">
            <Rocket className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">
              {isHe ? 'בחר מסלול ובנה את הקריירה שלך' : 'Choose a path and build your career'}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
