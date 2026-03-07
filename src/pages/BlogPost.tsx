/**
 * @page BlogPost
 * @purpose Individual blog post page with full SEO meta tags and JSON-LD
 */
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { ArrowLeft, ArrowRight, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { language, isRTL } = useTranslation();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

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
    const title = language === 'he' && post.title_he ? post.title_he : (post.meta_title || post.title);
    document.title = `${title} | MindOS Blog`;

    // Set meta tags
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

    // JSON-LD
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
  }, [post, language]);

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
        <p className="text-muted-foreground">Article not found</p>
        <Link to="/blog" className="text-primary hover:underline">← Back to Blog</Link>
      </div>
    );
  }

  const title = language === 'he' && post.title_he ? post.title_he : post.title;
  const content = language === 'he' && post.content_he ? post.content_he : post.content;

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header image */}
      {post.cover_image_url && (
        <div className="w-full max-h-[400px] overflow-hidden">
          <img
            src={post.cover_image_url}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <article className="container mx-auto max-w-3xl px-4 py-10">
        {/* Back link */}
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <BackIcon className="h-4 w-4" />
          {language === 'he' ? 'חזרה לבלוג' : 'Back to Blog'}
        </Link>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag: string) => (
              <span key={tag} className="text-xs uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
          {title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-10 pb-6 border-b border-border">
          {post.published_at && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {format(new Date(post.published_at), 'MMMM d, yyyy')}
            </span>
          )}
          {post.reading_time_minutes && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.reading_time_minutes} {language === 'he' ? 'דק\' קריאה' : 'min read'}
            </span>
          )}
        </div>

        {/* Content */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-blockquote:border-primary/50"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </article>
    </div>
  );
}
