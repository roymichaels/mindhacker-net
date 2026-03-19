/**
 * StoriesStrip — Horizontal scrollable strip of user stories (Instagram-style).
 * Shows stories for the current pillar/topic context.
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface StoriesStripProps {
  pillarFilter?: string;
  topicFilter?: string | null;
  onCreateStory: () => void;
}

interface StoryItem {
  id: string;
  user_id: string;
  media_url: string;
  content: string;
  created_at: string;
  author_name: string;
  author_username: string | null;
}

export default function StoriesStrip({ pillarFilter = 'all', topicFilter, onCreateStory }: StoriesStripProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const [viewingStory, setViewingStory] = useState<StoryItem | null>(null);
  const [storyIndex, setStoryIndex] = useState(0);

  const { data: stories = [] } = useQuery({
    queryKey: ['community-stories', pillarFilter, topicFilter],
    queryFn: async (): Promise<StoryItem[]> => {
      let query = supabase
        .from('community_posts')
        .select('id, user_id, content, media_urls, created_at, pillar, category_id')
        .eq('status', 'approved')
        .eq('post_type' as any, 'story')
        .order('created_at', { ascending: false })
        .limit(30);

      // Filter by pillar - show stories from specific pillar + 'all'
      if (pillarFilter !== 'all') {
        query = query.eq('pillar', pillarFilter);
      }

      // Filter by topic if specified
      if (topicFilter) {
        const helpers = await import('@/lib/communityHelpers');
        const sub = helpers.PILLAR_SUBCATEGORIES[pillarFilter]?.find(s => s.id === topicFilter);
        if (sub) {
          const { data: cat } = await supabase
            .from('community_categories')
            .select('id')
            .eq('name_en', sub.en)
            .maybeSingle();
          if (cat) {
            query = query.eq('category_id', cat.id);
          }
        }
      }

      const { data: posts } = await query;
      if (!posts || posts.length === 0) return [];

      // Get author info
      const userIds = [...new Set(posts.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, community_username')
        .in('id', userIds);

      return posts
        .filter(p => (p as any).media_urls?.length > 0)
        .map(p => {
          const prof = profiles?.find(pr => pr.id === p.user_id);
          return {
            id: p.id,
            user_id: p.user_id,
            media_url: ((p as any).media_urls as string[])[0],
            content: p.content || '',
            created_at: p.created_at || '',
            author_name: prof?.full_name || 'User',
            author_username: prof?.community_username || null,
          };
        });
    },
    staleTime: 30_000,
  });

  const openStory = (story: StoryItem, index: number) => {
    setViewingStory(story);
    setStoryIndex(index);
  };

  const navigateStory = (dir: 1 | -1) => {
    const newIndex = storyIndex + dir;
    if (newIndex >= 0 && newIndex < stories.length) {
      setStoryIndex(newIndex);
      setViewingStory(stories[newIndex]);
    } else {
      setViewingStory(null);
    }
  };

  // Get unique authors for the bubble display
  const authorStories = stories.reduce<{ userId: string; name: string; stories: StoryItem[] }[]>((acc, story) => {
    const existing = acc.find(a => a.userId === story.user_id);
    if (existing) {
      existing.stories.push(story);
    } else {
      acc.push({ userId: story.user_id, name: story.author_name, stories: [story] });
    }
    return acc;
  }, []);

  return (
    <>
      {/* Stories Strip */}
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-1 -mx-1 px-1">
        {/* Create Story Button */}
        <button
          onClick={onCreateStory}
          className="flex flex-col items-center gap-1 flex-shrink-0"
        >
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center bg-primary/5 hover:bg-primary/10 transition-colors">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">
            {isHe ? 'סטורי' : 'Story'}
          </span>
        </button>

        {/* Story Bubbles */}
        {authorStories.map((author) => {
          const latestStory = author.stories[0];
          const firstIndex = stories.findIndex(s => s.id === latestStory.id);
          return (
            <button
              key={author.userId}
              onClick={() => openStory(latestStory, firstIndex)}
              className="flex flex-col items-center gap-1 flex-shrink-0"
            >
              <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-primary via-violet-500 to-pink-500">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-background">
                  <img
                    src={latestStory.media_url}
                    alt={author.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <span className="text-[10px] font-medium text-muted-foreground max-w-[64px] truncate">
                {author.userId === user?.id ? (isHe ? 'שלך' : 'You') : author.name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Full-screen Story Viewer */}
      <AnimatePresence>
        {viewingStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black flex flex-col"
          >
            {/* Progress bars */}
            <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 px-2 pt-2">
              {stories.map((_, i) => (
                <div key={i} className="h-0.5 flex-1 rounded-full bg-white/30 overflow-hidden">
                  <div className={cn("h-full bg-white rounded-full transition-all", i <= storyIndex ? "w-full" : "w-0")} />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-4 left-0 right-0 z-10 flex items-center justify-between px-4 pt-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30">
                  <img src={viewingStory.media_url} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-white text-xs font-bold">{viewingStory.author_name}</p>
                  <p className="text-white/60 text-[10px]">
                    {new Date(viewingStory.created_at).toLocaleDateString(isHe ? 'he-IL' : 'en-US', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
              <button onClick={() => setViewingStory(null)} className="p-2 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Story Image */}
            <div className="flex-1 flex items-center justify-center">
              <img
                src={viewingStory.media_url}
                alt="Story"
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Caption */}
            {viewingStory.content && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-6 pt-12">
                <p className="text-white text-sm">{viewingStory.content}</p>
              </div>
            )}

            {/* Navigation areas */}
            <button
              onClick={() => navigateStory(-1)}
              className="absolute left-0 top-20 bottom-20 w-1/3"
              aria-label="Previous"
            />
            <button
              onClick={() => navigateStory(1)}
              className="absolute right-0 top-20 bottom-20 w-1/3"
              aria-label="Next"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
