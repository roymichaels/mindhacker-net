/**
 * FMHudSidebar — Left sidebar for FM (Free Market) hub.
 * Shows wallet balance, FM tab navigation, and earning stats.
 * Amber/gold color scheme matching FM economic identity.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate, useLocation } from 'react-router-dom';
import { PanelRightClose, PanelRightOpen, Home, Target, Briefcase, BarChart3, Wallet, Coins, TrendingUp, Users } from 'lucide-react';
import { useFMWallet } from '@/hooks/useFMWallet';
import { SidebarOrbWidget } from '@/components/sidebar/SidebarOrbWidget';

const FM_NAV = [
  { id: 'home',    path: '/fm/home',   icon: Home,       labelEn: 'Home',     labelHe: 'בית' },
  { id: 'earn',    path: '/fm/earn',   icon: Target,     labelEn: 'Earn',     labelHe: 'הרוויח' },
  { id: 'work',    path: '/fm/work',   icon: Briefcase,  labelEn: 'Work',     labelHe: 'עבודה' },
  { id: 'coaches', path: '/coaches',   icon: Users,      labelEn: 'Coaches',  labelHe: 'מאמנים' },
  { id: 'share',   path: '/fm/share',  icon: BarChart3,  labelEn: 'Share',    labelHe: 'שתף' },
  { id: 'wallet',  path: '/fm/wallet', icon: Wallet,     labelEn: 'Wallet',   labelHe: 'ארנק' },
] as const;

const MOS_TO_USD = 0.01;

export function FMHudSidebar() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();
  const location = useLocation();
  const { wallet } = useFMWallet();

  const balance = wallet?.mos_balance ?? 0;
  const earned = wallet?.lifetime_earned ?? 0;
  const activePath = location.pathname;

  return (
    <aside className={cn(
      "flex flex-col flex-shrink-0 h-full overflow-y-auto scrollbar-hide transition-all duration-300 relative",
      "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
      "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
      "ltr:border-e rtl:border-s border-border/50 dark:border-amber-500/15",
      collapsed ? "w-16 min-w-[64px]" : "w-[260px] min-w-[220px] xl:w-[280px]"
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
          ? (isRTL ? <PanelRightOpen className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />)
          : (isRTL ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />)
        }
      </button>

      {/* ===== COLLAPSED ===== */}
      {collapsed && (
        <div className="flex flex-col items-center gap-3 h-full pt-10 pb-4 px-0 overflow-hidden">
          <SidebarOrbWidget collapsed />
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
          
          {/* Balance mini */}
          <div className="flex flex-col items-center gap-0.5">
            <Coins className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-bold text-foreground">{balance >= 1000 ? `${(balance / 1000).toFixed(1)}k` : balance}</span>
          </div>

          <div className="w-8 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

          {/* Nav icons */}
          <div className="flex flex-col items-center gap-1 overflow-y-auto scrollbar-hide">
            {FM_NAV.map((item) => {
              const isActive = activePath === item.path || (item.id === 'home' && activePath === '/fm');
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "p-2 rounded-lg border transition-colors",
                    isActive
                      ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
                      : "bg-muted/30 border-border/20 hover:bg-amber-500/10 text-muted-foreground hover:text-amber-400"
                  )}
                  title={isHe ? item.labelHe : item.labelEn}
                >
                  <item.icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== EXPANDED ===== */}
      {!collapsed && (
        <div className="flex flex-col gap-3 p-3 pt-8 pb-4 overflow-y-auto scrollbar-hide h-full">
          <SidebarOrbWidget />
          <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

          {/* Hub badge */}
          <div className="w-full rounded-xl bg-gradient-to-br from-amber-500/15 to-yellow-500/15 border border-amber-500/20 p-3">
            <div className="text-center">
              <span className="text-sm font-bold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                Free Market
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {isHe ? 'כלכלה דיגיטלית' : 'Digital Economy'}
              </p>
            </div>
          </div>

          {/* Wallet summary card */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-muted-foreground">{isHe ? 'יתרה' : 'Balance'}</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {balance.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">MOS</span>
            </p>
            <p className="text-[10px] text-muted-foreground">≈ ${(balance * MOS_TO_USD).toFixed(2)} USD</p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-500">
              <TrendingUp className="w-3 h-3" />
              <span>{isHe ? 'הרווחת' : 'Earned'}: {earned.toLocaleString()} MOS</span>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

          {/* Navigation items */}
          <div className="flex flex-col gap-1 w-full">
            {FM_NAV.map((item) => {
              const isActive = activePath === item.path || (item.id === 'home' && activePath === '/fm');
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "w-full rounded-xl p-2.5 flex items-center gap-2.5 transition-all border text-start",
                    isActive
                      ? "bg-amber-500/20 border-amber-500/30 shadow-sm"
                      : "bg-muted/30 border-border/20 hover:bg-amber-500/10"
                  )}
                >
                  <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-amber-400" : "text-muted-foreground")} />
                  <span className={cn("text-xs font-semibold", isActive ? "text-amber-400" : "text-foreground")}>
                    {isHe ? item.labelHe : item.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
