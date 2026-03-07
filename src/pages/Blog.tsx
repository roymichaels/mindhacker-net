/**
 * @page Blog
 * @purpose Public blog listing page for SEO organic traffic
 */
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Blog() {
  const { language, isRTL } = useTranslation();
  const navigate = useNavigate();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const isHe = language === 'he';

  useEffect(() => {
    document.title = language === 'he' ? 'בלוג | MindOS' : 'Blog | MindOS - Personal Growth & AI Coaching';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Explore articles on personal development, AI coaching, gamified growth, and consciousness expansion.');
  }, [language]);

  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog-posts-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, title_he, slug, excerpt, excerpt_he, cover_image_url, published_at, reading_time_minutes, tags')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative container mx-auto max-w-5xl px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-foreground mb-4"
          >
            {language === 'he' ? 'הבלוג' : 'The Blog'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            {language === 'he'
              ? 'תובנות, מדריכים וכלים לצמיחה אישית, אימון AI וגיימיפיקציה'
              : 'Insights, guides and tools for personal growth, AI coaching & gamified development'}
          </motion.p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="container mx-auto max-w-6xl px-4 pb-20">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card animate-pulse h-80" />
            ))}
          </div>
        ) : !posts?.length ? (
          <div className="text-center py-20 text-muted-foreground">
            {language === 'he' ? 'עדיין אין מאמרים. בקרוב!' : 'No articles yet. Coming soon!'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => {
              const title = language === 'he' && post.title_he ? post.title_he : post.title;
              const excerpt = language === 'he' && post.excerpt_he ? post.excerpt_he : post.excerpt;

              return (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group block rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300 overflow-hidden h-full"
                  >
                    {post.cover_image_url && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={post.cover_image_url}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="p-5 space-y-3">
                      {post.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {post.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {title}
                      </h2>
                      {excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-3">{excerpt}</p>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {post.published_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(post.published_at), 'MMM d, yyyy')}
                            </span>
                          )}
                          {post.reading_time_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.reading_time_minutes} min
                            </span>
                          )}
                        </div>
                        <ArrowIcon className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </Link>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
