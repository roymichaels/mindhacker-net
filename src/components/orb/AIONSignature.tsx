import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { OrganicOrbCanvas } from './OrganicOrbCanvas';
import { IPhoneWidget } from '@/components/ui/IPhoneWidget';

interface AIONHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  icon?: ReactNode;
  onClose?: () => void;
  className?: string;
}

interface AIONActionItem {
  id: string;
  icon: LucideIcon;
  label: string;
  gradient: string;
  onClick: () => void;
}

interface AIONQuickActionsProps {
  actions: AIONActionItem[];
  className?: string;
}

interface AIONContextBadgesProps {
  children: ReactNode;
  className?: string;
}

interface AIONDialogShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  subtitle?: ReactNode;
  description?: string;
  badge?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  preventClose?: boolean;
  dir?: 'rtl' | 'ltr';
}

export function AIONHeader({ title, subtitle, badge, icon, onClose, className }: AIONHeaderProps) {
  const { profile } = useOrbProfile();

  return (
    <div className={cn("flex items-start justify-between gap-3 px-4 py-3 border-b border-border/20 shrink-0", className)}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-full bg-cyan-400/25 blur-xl scale-125" />
          <div className="relative w-10 h-10 rounded-full border border-cyan-300/35 bg-slate-950/80 shadow-[0_0_28px_rgba(34,211,238,0.28)] overflow-hidden">
            <OrganicOrbCanvas profile={profile} size={40} />
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            {icon ? (
              <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-300 shrink-0">
                {icon}
              </div>
            ) : null}
            <div className="min-w-0">
              <div className="text-sm font-bold text-foreground truncate">{title}</div>
              {subtitle ? (
                <div className="text-[11px] text-muted-foreground truncate">{subtitle}</div>
              ) : null}
            </div>
          </div>
          {badge ? <div className="pt-1">{badge}</div> : null}
        </div>
      </div>

      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 p-2 rounded-xl border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

export function AIONContextBadges({ children, className }: AIONContextBadgesProps) {
  if (!children) return null;
  return (
    <div className={cn("flex items-center justify-center gap-1.5 px-4 py-2 shrink-0", className)}>
      {children}
    </div>
  );
}

export function AIONQuickActions({ actions, className }: AIONQuickActionsProps) {
  return (
    <div className={cn("flex justify-center px-3 py-2 shrink-0", className)}>
      <div className="rounded-2xl bg-slate-950/45 border border-white/10 shadow-[0_18px_50px_rgba(8,15,28,0.45)] backdrop-blur-xl px-3 py-1.5 flex gap-3">
        {actions.map((action) => (
          <IPhoneWidget
            key={action.id}
            icon={action.icon}
            label={action.label}
            gradient={action.gradient}
            size="sm"
            onClick={action.onClick}
          />
        ))}
      </div>
    </div>
  );
}

export function AIONDialogShell({
  open,
  onOpenChange,
  title,
  subtitle,
  description,
  badge,
  icon,
  children,
  className,
  contentClassName,
  preventClose = false,
  dir,
}: AIONDialogShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        preventClose={preventClose}
        hideCloseButton
        className={cn(
          "max-w-2xl w-[95vw] h-[85vh] p-0 gap-0 overflow-hidden border-white/10",
          "bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_42%),linear-gradient(180deg,rgba(10,18,34,0.98),rgba(7,11,20,0.96))]",
          "backdrop-blur-2xl shadow-[0_30px_120px_rgba(0,0,0,0.55)] flex flex-col rounded-[28px]",
          className
        )}
        dir={dir}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">
          {description || (typeof subtitle === 'string' ? subtitle : 'AION assistant surface')}
        </DialogDescription>
        <AIONHeader
          title={title}
          subtitle={subtitle}
          badge={badge}
          icon={icon}
          onClose={() => onOpenChange(false)}
        />
        <div className={cn("flex-1 min-h-0 flex flex-col", contentClassName)}>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
