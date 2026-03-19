/**
 * IPhoneWidget — iOS-style app icon widget with gradient background.
 * Rounded square icon with label underneath. Used across Play, Community, Study.
 */
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface IPhoneWidgetProps {
  icon?: LucideIcon;
  emoji?: string;
  label: string;
  gradient: string; // e.g. "from-amber-500 to-orange-600"
  iconColor?: string;
  onClick?: () => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function IPhoneWidget({
  icon: Icon,
  emoji,
  label,
  gradient,
  iconColor = 'text-white',
  onClick,
  size = 'md',
  className,
}: IPhoneWidgetProps) {
  const iconSize = size === 'sm' ? 'w-10 h-10 rounded-xl' : 'w-12 h-12 rounded-2xl';
  const iconInner = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 transition-all active:scale-[0.93]",
        className,
      )}
    >
      <div className={cn(
        "flex items-center justify-center bg-gradient-to-br shadow-lg",
        iconSize,
        gradient,
      )}>
        {Icon ? (
          <Icon className={cn(iconInner, iconColor)} />
        ) : emoji ? (
          <span className={size === 'sm' ? 'text-lg' : 'text-xl'}>{emoji}</span>
        ) : null}
      </div>
      <span className="text-[10px] font-semibold text-foreground/80 leading-tight text-center line-clamp-2 max-w-[64px]">
        {label}
      </span>
    </button>
  );
}
