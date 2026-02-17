import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { ReactNode } from 'react';

interface GradientCTAButtonProps {
  onClick: () => void;
  label: string;
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function GradientCTAButton({ onClick, label, icon, className, disabled }: GradientCTAButtonProps) {
  const { isRTL } = useTranslation();

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full h-11 text-sm bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold shadow-xl shadow-primary/30',
        className
      )}
    >
      {icon && <span className={cn('shrink-0', isRTL ? 'ms-2' : 'me-2')}>{icon}</span>}
      {label}
      <ArrowRight className={cn('w-4 h-4 shrink-0', isRTL ? 'me-2 rotate-180' : 'ms-2')} />
    </Button>
  );
}
