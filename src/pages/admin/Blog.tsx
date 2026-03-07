/**
 * @admin Blog
 * @purpose AI-powered blog article generation and management
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Sparkles, Loader2, Eye, Pencil, Trash2, Globe, Plus, ExternalLink, Zap, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminBlog() {
  const { language } = useTranslation();
  const queryClient = useQueryClient();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [editingPost, setEditingPost] = useState<any>(null);

  // Fetch all posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // AI Generate
  const generateMutation = useMutation({
    mutationFn: async (promptText: string) => {
      const { data, error } = await supabase.functions.invoke('generate-blog-article', {
        body: { prompt: promptText, language: 'both', generateImage: true },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success(language === 'he' ? 'מאמר נוצר בהצלחה!' : 'Article generated successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      setWizardOpen(false);
      setPrompt('');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Publish/Unpublish
  const toggleStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const newStatus = status === 'published' ? 'draft' : 'published';
      const { error } = await supabase
        .from('blog_posts')
        .update({
          status: newStatus,
          published_at: newStatus === 'published' ? new Date().toISOString() : null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast.success('Status updated');
    },
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast.success('Post deleted');
    },
  });

  // Update post
  const updateMutation = useMutation({
    mutationFn: async (post: any) => {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          title: post.title,
          title_he: post.title_he,
          excerpt: post.excerpt,
          excerpt_he: post.excerpt_he,
          content: post.content,
          content_he: post.content_he,
          meta_title: post.meta_title,
          meta_description: post.meta_description,
          meta_keywords: post.meta_keywords,
        })
        .eq('id', post.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      setEditingPost(null);
      toast.success('Post updated');
    },
  });

  // Aurora Codex: Generate next in series
  const codexMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('daily-blog-generator', {
        body: {},
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Aurora Codex #${data.day} published: ${data.title}`);
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const publishedCount = posts?.filter(p => p.slug?.startsWith('aurora-codex-')).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {language === 'he' ? 'ניהול בלוג' : 'Blog Management'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {language === 'he' ? 'צור מאמרים מותאמי SEO עם AI' : 'Create SEO-optimized articles with AI'}
            {' · '}
            <span className="text-primary font-medium">Aurora Codex: {publishedCount}/100</span>
            {' · '}
            <Calendar className="inline h-3 w-3" /> {language === 'he' ? 'יומי ב-8:00' : 'Daily at 8:00 AM'}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => codexMutation.mutate()}
            disabled={codexMutation.isPending}
          >
            {codexMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {language === 'he' ? 'הפעל Aurora Codex' : 'Run Aurora Codex'}
          </Button>

        <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Sparkles className="h-4 w-4" />
              {language === 'he' ? 'מאמר חדש עם AI' : 'New AI Article'}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {language === 'he' ? 'יצירת מאמר עם AI' : 'AI Article Wizard'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                {language === 'he'
                  ? 'תאר את נושא המאמר שתרצה ליצור. ה-AI ייצור מאמר מלא, תמונת כיסוי, ותגיות SEO.'
                  : 'Describe the article topic. AI will generate a full article with cover image and SEO tags.'}
              </p>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={language === 'he'
                  ? 'לדוגמה: 5 טכניקות NLP לשיפור ביטחון עצמי'
                  : 'e.g., 5 NLP techniques to boost self-confidence'}
                rows={4}
                className="resize-none"
              />
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span className="px-2 py-1 rounded bg-muted">SEO optimized</span>
                <span className="px-2 py-1 rounded bg-muted">Cover image</span>
                <span className="px-2 py-1 rounded bg-muted">EN + HE</span>
              </div>
              <Button
                onClick={() => generateMutation.mutate(prompt)}
                disabled={!prompt.trim() || generateMutation.isPending}
                className="w-full gap-2"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {language === 'he' ? 'יוצר מאמר...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {language === 'he' ? 'צור מאמר' : 'Generate Article'}
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Posts list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : !posts?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-3 text-primary/50" />
            <p>{language === 'he' ? 'אין מאמרים עדיין. צור את הראשון!' : 'No articles yet. Create your first one!'}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <div className="flex items-start gap-4 p-4">
                {post.cover_image_url && (
                  <img
                    src={post.cover_image_url}
                    alt=""
                    className="w-20 h-14 rounded-md object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">{post.title}</h3>
                    <Badge variant={post.status === 'published' ? 'default' : 'secondary'} className="shrink-0">
                      {post.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{post.excerpt}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                    <span>{format(new Date(post.created_at), 'MMM d, yyyy')}</span>
                    {post.slug && <span className="text-primary/60">/blog/{post.slug}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {post.status === 'published' && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={`/blog/${post.slug}`} target="_blank" rel="noopener">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleStatus.mutate({ id: post.id, status: post.status })}
                  >
                    <Globe className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setEditingPost(post)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => {
                      if (confirm('Delete this post?')) deleteMutation.mutate(post.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{language === 'he' ? 'עריכת מאמר' : 'Edit Article'}</DialogTitle>
          </DialogHeader>
          {editingPost && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Title (EN)</label>
                  <Input value={editingPost.title} onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Title (HE)</label>
                  <Input value={editingPost.title_he || ''} onChange={(e) => setEditingPost({ ...editingPost, title_he: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Excerpt (EN)</label>
                  <Textarea value={editingPost.excerpt || ''} onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })} rows={2} />
                </div>
                <div>
                  <label className="text-sm font-medium">Excerpt (HE)</label>
                  <Textarea value={editingPost.excerpt_he || ''} onChange={(e) => setEditingPost({ ...editingPost, excerpt_he: e.target.value })} rows={2} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Meta Title</label>
                <Input value={editingPost.meta_title || ''} onChange={(e) => setEditingPost({ ...editingPost, meta_title: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Meta Description</label>
                <Input value={editingPost.meta_description || ''} onChange={(e) => setEditingPost({ ...editingPost, meta_description: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Meta Keywords</label>
                <Input value={editingPost.meta_keywords || ''} onChange={(e) => setEditingPost({ ...editingPost, meta_keywords: e.target.value })} />
              </div>
              <Button onClick={() => updateMutation.mutate(editingPost)} disabled={updateMutation.isPending} className="w-full">
                {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : null}
                {language === 'he' ? 'שמור שינויים' : 'Save Changes'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
