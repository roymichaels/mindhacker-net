/**
 * BottomSheet — single bottom-sheet primitive for the mobile shell.
 *
 * All secondary surfaces (settings, profile, hubs, AION command, env switcher)
 * use this exact shape: rounded top, grab handle, dim scrim, content scrolls.
 * Single-overlay enforcement is delegated to OverlayController via
 * `useOverlayBinding(kind)`.
 *
 * Visual rules (from the architecture spec):
 *  - Rounded top corners (rounded-t-3xl)
 *  - Sticky grab handle
 *  - Max height capped (default 80vh)
 *  - pb-safe respected
 *  - No nested cards inside; consumers render a flat list / plain content
 *  - Background one shade lighter than the body (`bg-card`)
 *  - No overlap with another overlay (controller closes the previous one)
 */
import { ReactNode } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useOverlayBinding, type OverlayKind } from './OverlayController';
import { cn } from '@/lib/utils';

export interface BottomSheetProps {
  /** The overlay kind this sheet binds to. Must be unique per overlay. */
  kind: OverlayKind;
  /** Optional title row. Hidden visually if omitted; still rendered for a11y. */
  title?: string;
  /** Max height as a viewport fraction. Defaults to 80vh. */
  maxHeightVh?: number;
  /** Sheet body. Should be a flat list / plain content — no nested cards. */
  children: ReactNode;
  className?: string;
}

export function BottomSheet({
  kind,
  title,
  maxHeightVh = 80,
  children,
  className,
}: BottomSheetProps) {
  const binding = useOverlayBinding(kind);

  return (
    <Drawer open={binding.open} onOpenChange={binding.onOpenChange}>
      <DrawerContent
        className={cn(
          'bg-card border-0 ring-1 ring-white/[0.06]',
          'rounded-t-3xl',
          'pb-safe',
          className,
        )}
        style={{ maxHeight: `${maxHeightVh}vh` }}
      >
        {/* a11y: every sheet has a title, but we visually hide it unless provided */}
        <DrawerHeader className={cn('p-0', title ? 'px-5 pt-3 pb-2' : 'sr-only')}>
          <DrawerTitle className={cn(title ? 'text-base font-semibold text-foreground' : '')}>
            {title ?? 'Sheet'}
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-1 pb-2">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default BottomSheet;