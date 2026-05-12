/**
 * AppNameMenu — Outer container opened from "☰ MindOS ⌄" header trigger.
 *
 * Nested composition (NOT a merged flat list):
 *   ┌─ AppName Menu (Sheet) ────────────┐
 *   │ [AppNameDropdown — AS-IS]         │  ← independent dropdown component
 *   │ ─────────                          │
 *   │ Navigation (Home + OS tabs)       │  ← separate block
 *   └────────────────────────────────────┘
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, ChevronDown, Home } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTranslation } from '@/hooks/useTranslation';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { OS_TABS } from '@/navigation/osNav';
import { AppNameDropdown } from '@/components/navigation/AppNameDropdown';
import { cn } from '@/lib/utils';

interface AppNameMenuProps {
  onOpenSettings?: () => void;
  compact?: boolean;
}

export function AppNameMenu({ onOpenSettings, compact = false }: AppNameMenuProps) {
  const { language, isRTL } = useTranslation();
  const { theme: brandTheme } = useThemeSettings();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const navItems = [
    { id: 'home', path: '/dashboard', icon: Home, labelEn: 'Home', labelHe: 'בית' },
    ...OS_TABS.map((t) => ({
      id: t.id,
      path: t.path,
      icon: t.icon,
      labelEn: t.labelEn,
      labelHe: t.labelHe,
    })),
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open app menu"
          className={cn(
            'flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0 focus:outline-none',
            compact ? 'gap-1.5' : 'gap-2'
          )}
        >
          <Menu className={cn(compact ? 'h-4 w-4' : 'h-5 w-5', 'text-foreground')} />
          <span
            className={cn(
              'font-bold text-foreground',
              compact ? 'text-sm' : 'text-base'
            )}
          >
            {language === 'he' ? brandTheme.brand_name : brandTheme.brand_name_en}
          </span>
          <ChevronDown
            className={cn(compact ? 'h-3.5 w-3.5' : 'h-4 w-4', 'text-muted-foreground')}
          />
        </button>
      </SheetTrigger>

      <SheetContent
        side={isRTL ? 'right' : 'left'}
        className="p-0 w-[88vw] max-w-[360px] bg-transparent border-0 shadow-none"
      >
        <div
          className="flex flex-col my-3 mx-2 rounded-[28px] bg-card/85 backdrop-blur-2xl shadow-[0_24px_80px_-12px_rgba(0,0,0,0.6)] ring-1 ring-white/[0.06] overflow-hidden max-h-[calc(100dvh-1.5rem)]"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Nested: full avatar dropdown component AS-IS */}
          <div className="px-4 pt-4 pb-3 flex items-center justify-start">
            <AppNameDropdown onOpenSettings={onOpenSettings} />
          </div>

          <div className="mx-4 h-px bg-white/[0.08]" />

          {/* Separate block: app navigation */}
          <div className="flex-1 min-h-0 overflow-y-auto px-2 py-3">
            <div className="px-3 pb-2 text-[10px] tracking-[0.16em] uppercase text-muted-foreground/60 font-medium">
              {language === 'he' ? 'ניווט' : 'Navigation'}
            </div>
            <div className="space-y-px">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => go(item.path)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors text-start text-foreground/90 hover:bg-white/[0.05]"
                  >
                    <Icon className="h-[17px] w-[17px] shrink-0 opacity-80" />
                    <span className="flex-1 truncate">
                      {language === 'he' ? item.labelHe : item.labelEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default AppNameMenu;