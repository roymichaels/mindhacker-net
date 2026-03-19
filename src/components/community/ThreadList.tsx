import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import ThreadCard from './ThreadCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useCommunityFeed } from '@/hooks/useCommunityFeed';

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
      <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/40 bg-card/70 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-56 w-full rounded-none" />
            <div className="px-4 py-3 space-y-2">
              <div className="flex gap-4">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-full" />
            </div>
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
    <div className="space-y-5">
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
