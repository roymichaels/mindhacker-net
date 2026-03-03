/**
 * AdminHudSidebar - Left sidebar for admin navigation.
 * Mirrors CoachHudSidebar pattern with emerald/teal color scheme.
 * Navigation driven by ADMIN_TABS from domain/admin.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { PanelRightClose, PanelRightOpen, Shield, ChevronDown, ChevronRight } from 'lucide-react';
import { ADMIN_TABS } from '@/domain/admin';
import { NotificationBell } from '@/components/admin/NotificationBell';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarOrbWidget } from '@/components/sidebar/SidebarOrbWidget';

interface AdminHudSidebarProps {
  activeTab?: string;
  activeSubTab?: string;
  onTabChange?: (tab: string, sub?: string) => void;
}

export function AdminHudSidebar({ activeTab = 'overview', activeSubTab, onTabChange }: AdminHudSidebarProps) {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';

  const handleNav = (tabId: string, subId?: string) => {
    onTabChange?.(tabId, subId);
  };

  return (
    <aside className={cn(
      "flex flex-col flex-shrink-0 h-full overflow-y-auto scrollbar-hide transition-all duration-300 relative",
      "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
      "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
      "ltr:border-s rtl:border-e border-border/50 dark:border-emerald-500/15",
      collapsed ? "w-16 min-w-[64px]" : "w-[280px] min-w-[220px] xl:w-[300px]"
    )}>
      {/* Collapse toggle */}
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

      {/* ===== COLLAPSED MINI VIEW ===== */}
      {collapsed && (
        <div className="flex flex-col items-center gap-3 h-full pt-10 pb-4 px-0 overflow-hidden">
          <SidebarOrbWidget collapsed />
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
          {/* Tab icons */}
          <div className="flex flex-col items-center gap-1">
            {ADMIN_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleNav(tab.id, tab.subTabs[0]?.id)}
                  className={cn(
                    "p-2 rounded-lg border transition-colors",
                    isActive
                      ? "bg-emerald-500/20 border-emerald-500/30"
                      : "bg-muted/30 dark:bg-muted/15 border-border/20 hover:bg-accent/10"
                  )}
                  title={isHe ? tab.labelHe : tab.labelEn}
                >
                  <Icon className={cn("w-4 h-4", isActive ? 'text-emerald-400' : 'text-muted-foreground')} />
                </button>
              );
            })}
          </div>

          <div className="w-8 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent my-1" />

          {/* Notification bell */}
          <div className="mt-auto">
            <NotificationBell />
          </div>
        </div>
      )}

      {/* ===== EXPANDED FULL VIEW ===== */}
      {!collapsed && (
        <div className="flex flex-col gap-3 p-3 pt-8 pb-4 overflow-y-auto scrollbar-hide h-full">
          <SidebarOrbWidget />
          <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
          {/* Header badge */}
          <div className="w-full rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-500/20 p-3 flex items-center justify-between">
            <div className="text-center flex-1">
              <span className="text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                {isHe ? 'מרכז בקרה' : 'Control Center'}
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {isHe ? 'נהלו את הפלטפורמה' : 'Manage your platform'}
              </p>
            </div>
            <NotificationBell />
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

          {/* Navigation groups */}
          <div className="flex flex-col gap-1 w-full">
            {ADMIN_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const hasSubTabs = tab.subTabs.length > 1;

              if (!hasSubTabs) {
                const sub = tab.subTabs[0];
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleNav(tab.id, sub?.id)}
                    className={cn(
                      "w-full rounded-xl p-2.5 flex items-center gap-2.5 transition-all border text-start",
                      isActive
                        ? "bg-emerald-500/15 border-emerald-500/30 shadow-sm"
                        : "bg-muted/30 dark:bg-muted/15 border-border/20 hover:bg-accent/10"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 shrink-0", isActive ? 'text-emerald-400' : 'text-muted-foreground')} />
                    <span className={cn("text-xs font-medium", isActive ? 'text-emerald-400' : 'text-foreground')}>
                      {isHe ? tab.labelHe : tab.labelEn}
                    </span>
                  </button>
                );
              }

              return (
                <Collapsible key={tab.id} defaultOpen={isActive}>
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        "w-full rounded-xl p-2.5 flex items-center gap-2.5 transition-all border text-start group",
                        isActive
                          ? "bg-emerald-500/10 border-emerald-500/20"
                          : "bg-muted/30 dark:bg-muted/15 border-border/20 hover:bg-accent/10"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 shrink-0", isActive ? 'text-emerald-400' : 'text-muted-foreground')} />
                      <span className={cn("text-xs font-medium flex-1", isActive ? 'text-emerald-400' : 'text-foreground')}>
                        {isHe ? tab.labelHe : tab.labelEn}
                      </span>
                      <ChevronDown className="w-3 h-3 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="flex flex-col gap-0.5 mt-0.5 ms-6">
                      {tab.subTabs.map((sub) => {
                        const isSubActive = isActive && activeSubTab === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleNav(tab.id, sub.id)}
                            className={cn(
                              "w-full rounded-lg px-2.5 py-1.5 text-start transition-colors text-[11px]",
                              isSubActive
                                ? "bg-emerald-500/15 text-emerald-400 font-medium border border-emerald-500/20"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
                            )}
                          >
                            {isHe ? sub.labelHe : sub.labelEn}
                          </button>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
