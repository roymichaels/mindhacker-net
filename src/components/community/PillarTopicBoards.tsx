import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PILLAR_SUBCATEGORIES, type PillarSubcategory } from '@/lib/communityHelpers';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { MessageSquare, ChevronLeft } from 'lucide-react';

interface PillarTopicBoardsProps {
  pillar: string;
  selectedTopic: string | null;
  onSelectTopic: (topicId: string | null) => void;
}

export default function PillarTopicBoards({ pillar, selectedTopic, onSelectTopic }: PillarTopicBoardsProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const subcategories = PILLAR_SUBCATEGORIES[pillar] || [];

  // Fetch thread counts per subcategory for this pillar
  const { data: topicCounts } = useQuery({
    queryKey: ['topic-thread-counts', pillar],
    queryFn: async () => {
      const { data } = await supabase
        .from('community_posts')
        .select('category_id')
        .eq('pillar', pillar)
        .eq('status', 'approved');

      if (!data) return {};

      const counts: Record<string, number> = {};
      for (const post of data) {
        if (post.category_id) {
          counts[post.category_id] = (counts[post.category_id] || 0) + 1;
        }
      }
      return counts;
    },
    staleTime: 60_000,
  });

  if (subcategories.length === 0) return null;

  // If a topic is selected, show a back button
  if (selectedTopic) {
    const topic = subcategories.find(s => s.id === selectedTopic);
    return (
      <button
        onClick={() => onSelectTopic(null)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors w-fit"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>{topic ? `${topic.icon} ${isHe ? topic.he : topic.en}` : ''}</span>
        <span className="text-muted-foreground">— {isHe ? 'חזרה לנושאים' : 'Back to topics'}</span>
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
        {isHe ? '📋 נושאים' : '📋 Topics'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {subcategories.map((sub) => (
          <TopicCard
            key={sub.id}
            sub={sub}
            threadCount={0}
            isHe={isHe}
            onClick={() => onSelectTopic(sub.id)}
          />
        ))}
      </div>
    </div>
  );
}

function TopicCard({ sub, threadCount, isHe, onClick }: {
  sub: PillarSubcategory;
  threadCount: number;
  isHe: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/50",
        "hover:bg-accent/50 hover:border-primary/30 transition-all text-start w-full group"
      )}
    >
      <span className="text-2xl flex-shrink-0">{sub.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
          {isHe ? sub.he : sub.en}
        </p>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
        <MessageSquare className="h-3 w-3" />
        <span>{threadCount}</span>
      </div>
    </button>
  );
}
