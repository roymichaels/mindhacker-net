import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export function PageShell({ children, className }: PageShellProps) {
  const { isRTL } = useTranslation();

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={cn('max-w-6xl mx-auto px-4 md:px-6 pt-0 sm:pt-6 pb-8', className)}
    >
      {children}
    </div>
  );
}
