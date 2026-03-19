/**
 * @page BlogPost
 * @purpose Individual blog post page with full SEO meta tags, JSON-LD, and premium styling
 */
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { ArrowLeft, ArrowRight, Calendar, Clock, Sparkles, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { language, isRTL } = useTranslation();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const isHe = language === 'he';

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  useEffect(() => {
    if (!post) return;
    const title = isHe && post.title_he ? post.title_he : (post.meta_title || post.title);
    document.title = `${title} | MindOS Blog`;

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(name.startsWith('og:') ? 'property' : 'name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    if (post.meta_description) setMeta('description', post.meta_description);
    if (post.meta_keywords) setMeta('keywords', post.meta_keywords);
    setMeta('og:title', title);
    if (post.meta_description) setMeta('og:description', post.meta_description);
    if (post.cover_image_url) setMeta('og:image', post.cover_image_url);
    setMeta('og:type', 'article');

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.meta_description || post.excerpt,
      image: post.cover_image_url,
      datePublished: post.published_at,
      dateModified: post.updated_at,
      publisher: { '@type': 'Organization', name: 'MindOS' },
    };
    let script = document.getElementById('blog-jsonld');
    if (!script) {
      script = document.createElement('script');
      script.id = 'blog-jsonld';
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd);

    return () => {
      const el = document.getElementById('blog-jsonld');
      el?.remove();
    };
  }, [post, language, isHe]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: post?.title, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{isHe ? 'המאמר לא נמצא' : 'Article not found'}</p>
        <Link to="/blog" className="text-primary hover:underline">← {isHe ? 'חזרה לבלוג' : 'Back to Blog'}</Link>
      </div>
    );
  }

  const title = isHe && post.title_he ? post.title_he : post.title;
  const content = isHe && post.content_he ? post.content_he : post.content;
  const excerpt = isHe && post.excerpt_he ? post.excerpt_he : post.excerpt;

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ═══ HERO SECTION ═══ */}
      <div className="relative w-full overflow-hidden">
        {/* Background image with gradient overlay */}
        {post.cover_image_url ? (
          <>
            <img
              src={post.cover_image_url}
              alt={title}
              className="w-full h-[50vh] md:h-[60vh] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          </>
        ) : (
          <div className="w-full h-[30vh] bg-gradient-to-br from-primary/20 via-background to-background" />
        )}

        {/* Hero content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container mx-auto max-w-4xl px-4 pb-8 md:pb-12">
            {/* Back link */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors mb-6 backdrop-blur-sm bg-white/10 rounded-full px-3 py-1.5">
                <BackIcon className="h-3.5 w-3.5" />
                {isHe ? 'חזרה לבלוג' : 'Back to Blog'}
              </Link>
            </motion.div>

            {/* Tags */}
            {post.tags?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap gap-2 mb-4">
                {post.tags.slice(0, 5).map((tag: string) => (
                  <span key={tag} className="text-[10px] uppercase tracking-widest px-3 py-1 rounded-full bg-primary/20 text-primary font-semibold border border-primary/30 backdrop-blur-sm">
                    {tag.replace(/-/g, ' ')}
                  </span>
                ))}
              </motion.div>
            )}

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-[1.15] tracking-tight"
            >
              {title}
            </motion.h1>

            {/* Meta row */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-center gap-4 text-sm text-muted-foreground">
              {post.published_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(post.published_at), 'MMMM d, yyyy')}
                </span>
              )}
              {post.reading_time_minutes && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {post.reading_time_minutes} {isHe ? 'דק\' קריאה' : 'min read'}
                </span>
              )}
              <button onClick={handleShare} className="ms-auto flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                <Share2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{isHe ? 'שיתוף' : 'Share'}</span>
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ═══ EXCERPT / TL;DR ═══ */}
      {excerpt && (
        <div className="container mx-auto max-w-4xl px-4 mt-8">
          <div className="relative rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-5 md:p-6">
            <Sparkles className="absolute top-4 end-4 h-5 w-5 text-primary/40" />
            <p className="text-sm md:text-base text-foreground/90 leading-relaxed font-medium italic">
              {excerpt}
            </p>
          </div>
        </div>
      )}

      {/* ═══ ARTICLE CONTENT ═══ */}
      <article className="container mx-auto max-w-3xl px-6 sm:px-8 py-12 md:py-20">
        <div
          className={cn(
            "blog-article-content",
            "prose prose-lg dark:prose-invert max-w-none",
            // Headings — generous whitespace
            "prose-headings:text-foreground prose-headings:font-bold prose-headings:tracking-tight",
            "prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b prose-h2:border-border/30",
            "prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mt-12 prose-h3:mb-4",
            "prose-h4:text-lg prose-h4:mt-10 prose-h4:mb-3",
            // Body text — comfortable reading measure & line height
            "prose-p:text-foreground/85 prose-p:leading-[1.9] prose-p:text-[17px] prose-p:md:text-[18px] prose-p:mb-6",
            // Links
            "prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-a:transition-colors",
            // Bold & emphasis
            "prose-strong:text-foreground prose-strong:font-bold",
            "prose-em:text-foreground/70",
            // Lists — breathing room between items
            "prose-li:text-foreground/85 prose-li:leading-[1.8] prose-li:marker:text-primary prose-li:mb-2",
            "prose-ul:my-6 prose-ol:my-6 prose-ul:ps-5 prose-ol:ps-5",
            // Blockquotes — elegant callout
            "prose-blockquote:border-s-4 prose-blockquote:border-primary/50 prose-blockquote:bg-primary/5 prose-blockquote:rounded-e-xl prose-blockquote:px-6 prose-blockquote:py-5 prose-blockquote:my-8 prose-blockquote:not-italic prose-blockquote:text-foreground/85 prose-blockquote:font-medium prose-blockquote:text-[17px]",
            // Images
            "prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8",
            // Code
            "prose-code:text-primary prose-code:bg-primary/10 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-mono",
            "prose-pre:bg-muted prose-pre:rounded-xl prose-pre:p-5 prose-pre:my-8",
            // Horizontal rules
            "prose-hr:border-border/30 prose-hr:my-12",
          )}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content, { USE_PROFILES: { html: true } }) }}
        />

        {/* ═══ BOTTOM CTA CARD ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
          <div className="relative p-8 md:p-12 text-center border border-primary/20 rounded-3xl">
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              {isHe ? 'מוכנים להתחיל את המסע?' : 'Ready to Start Your Journey?'}
            </h3>
            <p className="text-muted-foreground max-w-lg mx-auto mb-6 text-sm md:text-base">
              {isHe
                ? 'הצטרפו לאלפי אנשים שכבר משתמשים ב-MindOS כדי לשנות את החיים שלהם עם AI, גיימיפיקציה וכלים מבוססי מדע.'
                : 'Join thousands already using MindOS to transform their lives with AI coaching, gamification, and science-backed tools.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://mindos.space/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 active:scale-[0.98]"
              >
                <Sparkles className="h-4 w-4" />
                {isHe ? 'התחילו בחינם' : 'Start Free'}
              </a>
              <Link
                to="/blog"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-muted/60 text-foreground font-medium text-sm hover:bg-muted transition-all border border-border/50"
              >
                {isHe ? 'עוד מאמרים' : 'More Articles'}
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ═══ BACK TO BLOG ═══ */}
        <div className="mt-10 text-center">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            <BackIcon className="h-4 w-4" />
            {isHe ? 'חזרה לבלוג' : 'Back to Blog'}
          </Link>
        </div>
      </article>

      {/* Global styles for CTA links inside article content */}
      <style>{`
        .blog-article-content a[href*="mindos.space"] {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.875rem;
          border-radius: 0.625rem;
          background: hsl(var(--primary) / 0.12);
          border: 1px solid hsl(var(--primary) / 0.25);
          font-weight: 600;
          font-size: 0.875rem;
          transition: all 0.2s;
          text-decoration: none !important;
          white-space: nowrap;
        }
        .blog-article-content a[href*="mindos.space"]:hover {
          background: hsl(var(--primary) / 0.2);
          border-color: hsl(var(--primary) / 0.4);
        }
        .blog-article-content a[href*="mindos.space"]::before {
          content: "✦";
          font-size: 0.75rem;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}
