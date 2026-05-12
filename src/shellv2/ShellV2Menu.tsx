/**
 * ShellV2Menu — the only top-level menu in ShellV2.
 *
 * Triggered by the hamburger in `ChromeLayer`. Binds to OverlayKind 'drawer'
 * via `BottomSheet`, so the "one overlay at a time" rule from
 * OverlayController automatically closes any other open sheet.
 *
 * Items are intentionally minimal — no dashboards, no hub modal, no
 * MindOSSheet. Anything richer summons through the artifact bus.
 */
import { useNavigate } from 'react-router-dom';
import { Brain, History, Settings, Globe2, User, LogOut } from 'lucide-react';
import { BottomSheet } from '@/shell/overlay/BottomSheet';
import { useOverlay } from '@/shell/overlay/OverlayController';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onSelect: () => void | Promise<void>;
}

export default function ShellV2Menu() {
  const navigate = useNavigate();
  const overlay = useOverlay();

  const go = (path: string) => {
    overlay.close();
    navigate(path);
  };

  const items: MenuItem[] = [
    { label: 'Brain', icon: Brain, onSelect: () => go('/brain') },
    {
      label: 'History',
      icon: History,
      // Switch overlays — controller closes the menu, opens the chat history.
      onSelect: () => overlay.open('aion'),
    },
    { label: 'Settings', icon: Settings, onSelect: () => go('/subscriptions') },
    { label: 'Outer World', icon: Globe2, onSelect: () => go('/outer-world') },
    { label: 'Account', icon: User, onSelect: () => go('/profile') },
    {
      label: 'Sign out',
      icon: LogOut,
      onSelect: async () => {
        overlay.close();
        await supabase.auth.signOut();
        navigate('/', { replace: true });
      },
    },
  ];

  return (
    <BottomSheet kind="drawer" title="Menu" maxHeightVh={70}>
      <ul className="flex flex-col gap-1 p-2">
        {items.map(({ label, icon: Icon, onSelect }) => (
          <li key={label}>
            <button
              type="button"
              onClick={onSelect}
              className={cn(
                'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-start text-sm',
                'text-foreground/90 transition-colors hover:bg-white/[0.06]',
              )}
            >
              <Icon className="h-5 w-5 text-foreground/70" />
              <span className="flex-1">{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </BottomSheet>
  );
}
