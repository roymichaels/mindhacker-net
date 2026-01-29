import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface Commitment {
  id: string;
  title: string;
  description: string | null;
}

interface CommitmentsCardProps {
  commitments: Commitment[];
  className?: string;
}

export function CommitmentsCard({ commitments, className }: CommitmentsCardProps) {
  const { t, isRTL } = useTranslation();

  if (commitments.length === 0) return null;

  return (
    <Card className={cn("", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <CheckCircle2 className="h-5 w-5 text-indigo-500" />
          {t('unified.commitments.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {commitments.slice(0, 4).map((c) => (
            <li key={c.id} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{c.title}</p>
                {c.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{c.description}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
        {commitments.length > 4 && (
          <p className="text-xs text-muted-foreground mt-2">
            +{commitments.length - 4} {t('unified.commitments.more')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
