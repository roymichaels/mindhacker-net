import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import ThreadCard from './ThreadCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useCommunityFeed } from '@/hooks/useCommunityFeed';
import { cn } from '@/lib/utils';

interface ThreadListProps {
  pillarFilter: string;
  topicFilter?: string | null;
  mode?: 'latest' | 'trending';
  onProfileClick: (userId: string) => void;
}

export default function ThreadList({ pillarFilter, topicFilter, mode = 'latest', onProfileClick }: ThreadListProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();

  const { data: threads, isLoading } = useCommunityFeed({ pillarFilter, topicFilter: topicFilter || undefined, mode });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/50 p-4 space-y-2">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!threads || threads.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">🌐</p>
        <p className="text-muted-foreground font-medium">
          {isHe ? 'אין שרשורים עדיין' : 'No threads yet'}
        </p>
        <p className="text-sm text-muted-foreground/60 mt-1">
          {isHe ? 'היה הראשון לפתוח שרשור' : 'Be the first to start a thread'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {threads.map((thread) => (
        <ThreadCard
          key={thread.id}
          thread={thread}
          onProfileClick={onProfileClick}
          showTrendingBadge={mode === 'trending'}
        />
      ))}
    </div>
  );
}
