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
      className={cn('max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-6 pb-14', className)}
    >
      {children}
    </div>
  );
}
