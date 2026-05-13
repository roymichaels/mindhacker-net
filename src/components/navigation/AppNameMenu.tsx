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
import { Menu, ChevronDown, Home } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTranslation } from '@/hooks/useTranslation';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { OS_TABS } from '@/navigation/osNav';
import { AppNameDropdown } from '@/components/navigation/AppNameDropdown';
import { useHubModal, type HubId } from '@/contexts/HubModalContext';
import { cn } from '@/lib/utils';

interface AppNameMenuProps {
  onOpenSettings?: () => void;
  compact?: boolean;
}

function AppNameMenuImpl({ onOpenSettings, compact = false }: AppNameMenuProps) {
  const { language, isRTL } = useTranslation();
  const { theme: brandTheme } = useThemeSettings();
  const [open, setOpen] = useState(false);
  const { openHub } = useHubModal();

  const go = (id: HubId) => {
    setOpen(false);
    openHub(id);
  };

  const navItems = [
    { id: 'home' as HubId, icon: Home, labelEn: 'Home', labelHe: 'בית' },
    ...OS_TABS.map((t) => ({
      id: t.id as HubId,
      icon: t.icon,
      labelEn: t.labelEn,
      labelHe: t.labelHe,
    })),
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
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
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="p-0 w-[300px] max-w-[calc(100vw-1.5rem)] rounded-2xl bg-card/95 backdrop-blur-2xl ring-1 ring-white/[0.08] border-0 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.55)] overflow-hidden"
      >
        <div
          className="flex flex-col max-h-[min(560px,calc(100dvh-5rem))]"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Nested: full avatar dropdown component AS-IS (self-contained) */}
          <div className="px-3 pt-3 pb-2 flex items-center justify-start">
            <AppNameDropdown onOpenSettings={onOpenSettings} />
          </div>

          <div className="mx-3 my-1 h-px bg-white/[0.08]" />

          {/* Separate block: app navigation */}
          <div className="px-2 pt-2 pb-2 overflow-y-auto">
            <div className="px-2.5 pb-1 text-[10px] tracking-[0.16em] uppercase text-muted-foreground/60 font-medium">
              {language === 'he' ? 'ניווט' : 'Navigation'}
            </div>
            <div className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => go(item.id)}
                    className="w-full h-9 flex items-center gap-2.5 px-2.5 rounded-lg text-[13.5px] font-medium transition-colors text-start text-foreground/90 hover:bg-white/[0.05]"
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-75" />
                    <span className="flex-1 truncate">
                      {language === 'he' ? item.labelHe : item.labelEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

import { withLegacyGuard } from '@/shellv2/LegacyMountGuard';
export const AppNameMenu = withLegacyGuard('AppNameMenu', AppNameMenuImpl);
export default AppNameMenu;