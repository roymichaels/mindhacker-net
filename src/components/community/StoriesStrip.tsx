/**
 * StoriesStrip — Horizontal scrollable strip with AI stories (MindOS/Aurora) + user stories.
 * AI-generated stories appear first with branded bubbles; user stories follow.
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { StandaloneMorphOrb } from '@/components/orb/GalleryMorphOrb';
import { AURORA_ORB_PROFILE } from '@/components/aurora/AuroraHoloOrb';
import AIStoryViewer, { type AIStoryData } from './AIStoryViewer';

interface StoriesStripProps {
  pillarFilter?: string;
  topicFilter?: string | null;
  onCreateStory: () => void;
}

interface UserStoryItem {
  id: string;
  user_id: string;
  media_url: string;
  content: string;
  created_at: string;
  author_name: string;
}

function parseAIContent(content: string): { source: string; title_en: string; title_he: string; body_en: string; body_he: string; subtitle_en: string; subtitle_he: string } | null {
  try {
    const parsed = JSON.parse(content);
    if (parsed.source) return parsed;
  } catch { /* not JSON */ }
  return null;
}

export default function StoriesStrip({ pillarFilter = 'all', topicFilter, onCreateStory }: StoriesStripProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const [viewingUserStory, setViewingUserStory] = useState<UserStoryItem | null>(null);
  const [userStoryIndex, setUserStoryIndex] = useState(0);
  const [aiViewerOpen, setAiViewerOpen] = useState(false);
  const [aiViewerIndex, setAiViewerIndex] = useState(0);

  const { data: rawPosts = [] } = useQuery({
    queryKey: ['community-stories', pillarFilter, topicFilter],
    queryFn: async () => {
      const baseQuery: any = supabase
        .from('community_posts')
        .select('id, user_id, content, media_urls, created_at, pillar, category_id, is_system')
        .eq('status', 'approved')
        .eq('post_type', 'story')
        .order('created_at', { ascending: false })
        .limit(50);

      let query = baseQuery;
      if (pillarFilter !== 'all') query = query.eq('pillar', pillarFilter);
      if (topicFilter) {
        const helpers = await import('@/lib/communityHelpers');
        const sub = helpers.PILLAR_SUBCATEGORIES[pillarFilter]?.find((s: any) => s.id === topicFilter);
        if (sub) {
          const { data: cat } = await supabase.from('community_categories').select('id').eq('name_en', sub.en).maybeSingle();
          if (cat) query = query.eq('category_id', cat.id);
        }
      }

      const { data: posts } = await query;
      if (!posts) return [];

      const userIds = [...new Set((posts as any[]).map((p: any) => p.user_id))] as string[];
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', userIds);

      return (posts as any[]).map((p: any) => ({
        ...p,
        author_name: profiles?.find(pr => pr.id === p.user_id)?.full_name || 'User',
      }));
    },
    staleTime: 30_000,
  });

  // Separate AI stories and user stories
  const aiStories: AIStoryData[] = rawPosts
    .filter((p: any) => p.is_system && p.media_urls?.length > 0)
    .map((p: any) => {
      const parsed = parseAIContent(p.content);
      return {
        id: p.id,
        source: (parsed?.source as 'mindos' | 'aurora') || 'mindos',
        media_url: p.media_urls[0],
        title_en: parsed?.title_en || '',
        title_he: parsed?.title_he || '',
        body_en: parsed?.body_en || '',
        body_he: parsed?.body_he || '',
        subtitle_en: parsed?.subtitle_en || '',
        subtitle_he: parsed?.subtitle_he || '',
        created_at: p.created_at,
        pillar: p.pillar || '',
      };
    });

  const userStories: UserStoryItem[] = rawPosts
    .filter((p: any) => !p.is_system && p.media_urls?.length > 0)
    .map((p: any) => ({
      id: p.id,
      user_id: p.user_id,
      media_url: p.media_urls[0],
      content: p.content || '',
      created_at: p.created_at,
      author_name: p.author_name,
    }));

  // Group user stories by author
  const authorStories = userStories.reduce<{ userId: string; name: string; stories: UserStoryItem[] }[]>((acc, story) => {
    const existing = acc.find(a => a.userId === story.user_id);
    if (existing) existing.stories.push(story);
    else acc.push({ userId: story.user_id, name: story.author_name, stories: [story] });
    return acc;
  }, []);

  // Get latest MindOS and Aurora stories
  const latestMindOS = aiStories.find(s => s.source === 'mindos');
  const latestAurora = aiStories.find(s => s.source === 'aurora');

  const navigateUserStory = (dir: 1 | -1) => {
    const newIndex = userStoryIndex + dir;
    if (newIndex >= 0 && newIndex < userStories.length) {
      setUserStoryIndex(newIndex);
      setViewingUserStory(userStories[newIndex]);
    } else {
      setViewingUserStory(null);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-1 -mx-1 px-1">
        {/* Create Story Button */}
        <button onClick={onCreateStory} className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center bg-primary/5 hover:bg-primary/10 transition-colors">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">{isHe ? 'סטורי' : 'Story'}</span>
        </button>

        {/* MindOS AI Story Bubble */}
        {latestMindOS && (
          <button
            onClick={() => {
              setAiViewerIndex(0);
              setAiViewerOpen(true);
            }}
            className="flex flex-col items-center gap-1 flex-shrink-0"
          >
            <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-primary via-violet-500 to-fuchsia-500 relative">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-background relative">
                <img src={latestMindOS.media_url} alt="MindOS" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="text-white font-black text-lg">M</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-primary">MindOS</span>
          </button>
        )}

        {/* Aurora AI Story Bubble */}
        {latestAurora && (
          <button
            onClick={() => {
              const auroraIdx = aiStories.findIndex(s => s.source === 'aurora');
              setAiViewerIndex(auroraIdx >= 0 ? auroraIdx : 0);
              setAiViewerOpen(true);
            }}
            className="flex flex-col items-center gap-1 flex-shrink-0"
          >
            <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-violet-400 via-cyan-400 to-fuchsia-400 relative">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-background flex items-center justify-center bg-background">
                <StandaloneMorphOrb size={40} profile={AURORA_ORB_PROFILE} geometryFamily="octa" level={100} />
              </div>
            </div>
            <span className="text-[10px] font-bold text-violet-400">Aurora</span>
          </button>
        )}

        {/* User Story Bubbles */}
        {authorStories.map((author) => {
          const latestStory = author.stories[0];
          const firstIndex = userStories.findIndex(s => s.id === latestStory.id);
          return (
            <button
              key={author.userId}
              onClick={() => { setViewingUserStory(latestStory); setUserStoryIndex(firstIndex); }}
              className="flex flex-col items-center gap-1 flex-shrink-0"
            >
              <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-primary via-violet-500 to-pink-500">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-background">
                  <img src={latestStory.media_url} alt={author.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <span className="text-[10px] font-medium text-muted-foreground max-w-[64px] truncate">
                {author.userId === user?.id ? (isHe ? 'שלך' : 'You') : author.name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* AI Story Viewer */}
      <AIStoryViewer
        stories={aiStories}
        initialIndex={aiViewerIndex}
        open={aiViewerOpen}
        onClose={() => setAiViewerOpen(false)}
      />

      {/* User Story Viewer (simple full-screen) */}
      <AnimatePresence>
        {viewingUserStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black flex flex-col"
          >
            <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 px-2 pt-2">
              {userStories.map((_, i) => (
                <div key={i} className="h-0.5 flex-1 rounded-full bg-white/30 overflow-hidden">
                  <div className={cn("h-full bg-white rounded-full transition-all", i <= userStoryIndex ? "w-full" : "w-0")} />
                </div>
              ))}
            </div>
            <div className="absolute top-4 left-0 right-0 z-10 flex items-center justify-between px-4 pt-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30">
                  <img src={viewingUserStory.media_url} alt="" className="w-full h-full object-cover" />
                </div>
                <p className="text-white text-xs font-bold">{viewingUserStory.author_name}</p>
              </div>
              <button onClick={() => setViewingUserStory(null)} className="p-2 text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <img src={viewingUserStory.media_url} alt="Story" className="max-w-full max-h-full object-contain" />
            </div>
            {viewingUserStory.content && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-6 pt-12">
                <p className="text-white text-sm">{viewingUserStory.content}</p>
              </div>
            )}
            <button onClick={() => navigateUserStory(-1)} className="absolute left-0 top-20 bottom-20 w-1/3" aria-label="Previous" />
            <button onClick={() => navigateUserStory(1)} className="absolute right-0 top-20 bottom-20 w-1/3" aria-label="Next" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
