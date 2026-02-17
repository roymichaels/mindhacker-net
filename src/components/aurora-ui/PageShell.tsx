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
      className={cn('max-w-6xl mx-auto px-4 md:px-8 py-2 md:py-4 w-full flex-1 flex flex-col min-h-0', className)}
    >
      {children}
    </div>
  );
}
