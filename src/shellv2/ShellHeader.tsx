/**
 * ShellHeader — the single header pattern used across every ShellV2 route.
 *
 * Adopted from the Outer World hub style:
 *  - 3xl semibold title
 *  - small muted subtitle
 *  - safe-area top padding, no fixed chrome bar
 *  - optional trailing slot for minimal actions (max 1 small button)
 *
 * No back button, no menu, no breadcrumbs. Content remains route-specific;
 * only this header is shared.
 */
import type { ReactNode } from 'react';

interface ShellHeaderProps {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  children?: ReactNode;
}

export default function ShellHeader({ title, subtitle, trailing, children }: ShellHeaderProps) {
  return (
    <header className="mb-6 flex items-start justify-between gap-3 pt-[max(env(safe-area-inset-top),0.5rem)]">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-3xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-foreground/60">{subtitle}</p>
        )}
        {children}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </header>
  );
}
