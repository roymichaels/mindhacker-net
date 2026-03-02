/**
 * CoachLandingPagesTab — Aurora-powered landing page builder for coaches.
 * Chat wizard → AI generates → preview/edit → publish.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMyCoachProfile } from '@/domain/coaches';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';
import { Plus, Sparkles, FileText, Eye, Trash2, Globe, Edit, Send, Loader2, ExternalLink, Link2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import LandingPagePreview from './landing-pages/LandingPagePreview';

type Msg = { role: 'user' | 'assistant'; content: string };

interface LandingPage {
  id: string;
  title: string;
  slug: string;
  template_id: string;
  status: string;
  content: any;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  published_at: string | null;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-landing-page`;

export default function CoachLandingPagesTab() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const { data: coachProfile } = useMyCoachProfile();
  const queryClient = useQueryClient();

  const [showWizard, setShowWizard] = useState(false);
  const [previewPage, setPreviewPage] = useState<LandingPage | null>(null);
  const [editingPage, setEditingPage] = useState<LandingPage | null>(null);

  // Fetch existing pages
  const { data: pages, isLoading } = useQuery({
    queryKey: ['coach-landing-pages', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coach_landing_pages')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as LandingPage[];
    },
    enabled: !!user?.id,
  });

  const deletePage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('coach_landing_pages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-landing-pages'] });
      toast.success(isHe ? 'הדף נמחק' : 'Page deleted');
    },
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, publish }: { id: string; publish: boolean }) => {
      const { error } = await supabase
        .from('coach_landing_pages')
        .update({
          status: publish ? 'published' : 'draft',
          published_at: publish ? new Date().toISOString() : null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-landing-pages'] });
      toast.success(isHe ? 'סטטוס עודכן' : 'Status updated');
    },
  });

  const handleWizardComplete = () => {
    setShowWizard(false);
    queryClient.invalidateQueries({ queryKey: ['coach-landing-pages'] });
  };

  const handleEditComplete = (updatedPage: LandingPage) => {
    setEditingPage(null);
    queryClient.invalidateQueries({ queryKey: ['coach-landing-pages'] });
  };

  const copyPageLink = (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success(isHe ? 'הקישור הועתק!' : 'Link copied!');
    });
  };

  const templateLabels: Record<string, { he: string; en: string }> = {
    'lead-capture': { he: 'לכידת לידים', en: 'Lead Capture' },
    'webinar': { he: 'וובינר', en: 'Webinar' },
    'program-launch': { he: 'השקת תוכנית', en: 'Program Launch' },
    'free-resource': { he: 'משאב חינמי', en: 'Free Resource' },
    'consultation': { he: 'ייעוץ', en: 'Consultation' },
    'blank': { he: 'ריק', en: 'Blank' },
  };

  return (
    <div className="space-y-6 pt-6" dir={isHe ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">{isHe ? 'דפי נחיתה' : 'Landing Pages'}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isHe ? 'צרו דפי נחיתה מקצועיים בעזרת Aurora' : 'Create professional landing pages with Aurora'}
          </p>
        </div>
        <Button onClick={() => setShowWizard(true)} className="gap-2 w-full sm:w-auto">
          <Sparkles className="h-4 w-4" />
          {isHe ? 'דף חדש עם Aurora' : 'New Page with Aurora'}
        </Button>
      </div>

      {/* Pages Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">{isHe ? 'טוען...' : 'Loading...'}</div>
      ) : !pages?.length ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center space-y-4">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <div>
              <h3 className="font-semibold">{isHe ? 'אין דפי נחיתה עדיין' : 'No landing pages yet'}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {isHe ? 'Aurora תעזור לכם לבנות דף נחיתה מושלם בכמה דקות' : 'Aurora will help you build the perfect landing page in minutes'}
              </p>
            </div>
            <Button onClick={() => setShowWizard(true)} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              {isHe ? 'צרו את הדף הראשון' : 'Create your first page'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {pages.map(page => (
            <Card key={page.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{page.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1 truncate">/{page.slug}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                      {page.status === 'published' ? (isHe ? 'פורסם' : 'Published') : (isHe ? 'טיוטה' : 'Draft')}
                    </Badge>
                    <Badge variant="outline" className="hidden sm:inline-flex">
                      {templateLabels[page.template_id]?.[isHe ? 'he' : 'en'] || page.template_id}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setPreviewPage(page)}>
                  <Eye className="h-3.5 w-3.5 me-1" />
                  {isHe ? 'תצוגה' : 'Preview'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingPage(page)}>
                  <Wand2 className="h-3.5 w-3.5 me-1" />
                  <span className="hidden sm:inline">{isHe ? 'ערוך עם Aurora' : 'Edit with Aurora'}</span>
                  <span className="sm:hidden">{isHe ? 'ערוך' : 'Edit'}</span>
                </Button>
                <Button size="sm" variant="outline" onClick={() => copyPageLink(page.slug)}>
                  <Link2 className="h-3.5 w-3.5 me-1" />
                  <span className="hidden sm:inline">{isHe ? 'העתק קישור' : 'Copy Link'}</span>
                  <span className="sm:hidden">{isHe ? 'קישור' : 'Link'}</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => togglePublish.mutate({ id: page.id, publish: page.status !== 'published' })}
                >
                  <Globe className="h-3.5 w-3.5 me-1" />
                  <span className="hidden sm:inline">{page.status === 'published' ? (isHe ? 'הסר פרסום' : 'Unpublish') : (isHe ? 'פרסם' : 'Publish')}</span>
                  <span className="sm:hidden">{page.status === 'published' ? '✕' : '✓'}</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => deletePage.mutate(page.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Aurora Wizard Dialog */}
      <Dialog open={showWizard} onOpenChange={setShowWizard}>
        <DialogContent className="max-w-2xl h-[90vh] sm:max-h-[90vh] p-0 overflow-hidden" dir={isHe ? 'rtl' : 'ltr'}>
          <AuroraLandingWizard
            coachProfile={coachProfile}
            onComplete={handleWizardComplete}
            onClose={() => setShowWizard(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingPage} onOpenChange={open => !open && setEditingPage(null)}>
        <DialogContent className="max-w-4xl h-[95vh] sm:max-h-[95vh] p-0 overflow-hidden" dir={isHe ? 'rtl' : 'ltr'}>
          {editingPage && (
            <AuroraPageEditor
              page={editingPage}
              coachProfile={coachProfile}
              onComplete={handleEditComplete}
              onClose={() => setEditingPage(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewPage} onOpenChange={open => !open && setPreviewPage(null)}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0" dir={isHe ? 'rtl' : 'ltr'}>
          {previewPage && <LandingPagePreview page={previewPage} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Aurora Chat Wizard ─────────────────────────────────────────────────────

interface WizardProps {
  coachProfile: any;
  onComplete: () => void;
  onClose: () => void;
}

function AuroraLandingWizard({ coachProfile, onComplete, onClose }: WizardProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [readyToBuild, setReadyToBuild] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-start conversation
  useEffect(() => {
    if (messages.length === 0) {
      const greeting: Msg = {
        role: 'assistant',
        content: isHe
          ? '✨ שלום! אני Aurora, וביחד ניצור דף נחיתה מושלם עבורך.\n\nלפני שנתחיל — מה המטרה של דף הנחיתה?\n\n1. 🎯 **לכידת לידים** — לאסוף פרטי קשר\n2. 🎥 **הרשמה לוובינר** — אירוע מקוון\n3. 🚀 **השקת תוכנית** — מכירת קורס או תוכנית\n4. 📚 **משאב חינמי** — הורדת מדריך/ebook\n5. 💬 **הזמנת ייעוץ** — תיאום שיחה ראשונית'
          : "✨ Hi! I'm Aurora, and together we'll create the perfect landing page for you.\n\nBefore we start — what's the goal of your landing page?\n\n1. 🎯 **Lead Capture** — collect contact info\n2. 🎥 **Webinar Signup** — online event\n3. 🚀 **Program Launch** — sell a course or program\n4. 📚 **Free Resource** — download a guide/ebook\n5. 💬 **Book Consultation** — schedule a call",
      };
      setMessages([greeting]);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return;
    const userMsg: Msg = { role: 'user', content: input.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput('');
    setIsStreaming(true);

    let assistantContent = '';
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && prev.length === allMessages.length + 1) {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
        }
        return [...prev, { role: 'assistant', content: assistantContent }];
      });
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          messages: allMessages.filter(m => m.role !== 'assistant' || allMessages.indexOf(m) > 0),
          coachProfile: coachProfile ? { display_name: coachProfile.display_name, title: coachProfile.title, bio: coachProfile.bio, slug: coachProfile.slug } : null,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${resp.status}`);
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistant(content);
          } catch { /* partial */ }
        }
      }

      // Check if Aurora is ready to build
      if (assistantContent.includes('✨')) {
        setReadyToBuild(true);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to get response');
    } finally {
      setIsStreaming(false);
    }
  }, [input, messages, isStreaming, coachProfile]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          action: 'generate',
          messages: messages,
          coachProfile: coachProfile ? { display_name: coachProfile.display_name, display_name_en: coachProfile.display_name_en, title: coachProfile.title, title_en: coachProfile.title_en, bio: coachProfile.bio, bio_en: coachProfile.bio_en, slug: coachProfile.slug } : null,
        }),
      });

      if (!resp.ok) throw new Error('Generation failed');

      const data = await resp.json();
      if (!data.success || !data.page) throw new Error('Invalid response');

      const page = data.page;

      // Get coach ID — required field
      let coachId = coachProfile?.id;
      if (!coachId) {
        // Auto-create a practitioner profile for the user
        const { data: newCoach, error: coachErr } = await supabase
          .from('practitioners')
          .insert({ user_id: user!.id, display_name: user!.email?.split('@')[0] || 'Coach', title: 'Coach', slug: `coach-${Date.now()}` })
          .select('id')
          .single();
        if (coachErr || !newCoach) throw new Error('Could not create coach profile');
        coachId = newCoach.id;
      }

      // Save to database
      const { error } = await supabase.from('coach_landing_pages').insert({
        coach_id: coachId,
        user_id: user!.id,
        title: page.title || 'Landing Page',
        slug: page.slug || `page-${Date.now()}`,
        template_id: page.template_id || 'lead-capture',
        content: page.content || {},
        meta_title: page.meta_title,
        meta_description: page.meta_description,
        status: 'draft',
      });

      if (error) throw error;

      toast.success(isHe ? '🎉 דף הנחיתה נוצר בהצלחה!' : '🎉 Landing page created!');
      onComplete();
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate page');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-[85vh] sm:h-[80vh]">
      <div className="px-6 py-4 border-b bg-gradient-to-r from-purple-500/10 to-indigo-500/10">
        <h3 className="font-bold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-400" />
          {isHe ? 'Aurora — בונה דפי נחיתה' : 'Aurora — Landing Page Builder'}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {isHe ? 'ענו על כמה שאלות ואורורה תבנה את הדף בשבילכם' : 'Answer a few questions and Aurora will build your page'}
        </p>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 px-4 py-3">
        <div className="space-y-4 max-w-xl mx-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/60 border border-border/50'
              }`}>
                <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex justify-start">
              <div className="bg-muted/60 border border-border/50 rounded-2xl px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input / Generate */}
      <div className="px-4 py-3 border-t space-y-2">
        {readyToBuild && (
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {isGenerating ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> {isHe ? 'Aurora בונה את הדף...' : 'Aurora is building...'}</>
            ) : (
              <><Sparkles className="h-4 w-4" /> {isHe ? '✨ בנה את הדף!' : '✨ Build the page!'}</>
            )}
          </Button>
        )}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={isHe ? 'כתבו את התשובה שלכם...' : 'Type your answer...'}
            disabled={isStreaming || isGenerating}
          />
          <Button size="icon" onClick={sendMessage} disabled={!input.trim() || isStreaming || isGenerating}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Aurora Page Editor (Prompt-based editing) ──────────────────────────────

interface EditorProps {
  page: LandingPage;
  coachProfile: any;
  onComplete: (page: LandingPage) => void;
  onClose: () => void;
}

function AuroraPageEditor({ page, coachProfile, onComplete, onClose }: EditorProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentContent, setCurrentContent] = useState(page.content);
  const [history, setHistory] = useState<any[]>([page.content]);

  const applyEdit = async () => {
    if (!editPrompt.trim() || isEditing) return;
    setIsEditing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          action: 'edit',
          currentContent,
          editPrompt: editPrompt.trim(),
          coachProfile: coachProfile ? { display_name: coachProfile.display_name, title: coachProfile.title, bio: coachProfile.bio } : null,
        }),
      });

      if (!resp.ok) throw new Error('Edit failed');
      const data = await resp.json();
      if (!data.success || !data.content) throw new Error('Invalid response');

      setCurrentContent(data.content);
      setHistory(prev => [...prev, data.content]);
      setEditPrompt('');
      toast.success(isHe ? 'הדף עודכן!' : 'Page updated!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to edit');
    } finally {
      setIsEditing(false);
    }
  };

  const saveChanges = async () => {
    try {
      const { error } = await supabase
        .from('coach_landing_pages')
        .update({ content: currentContent, updated_at: new Date().toISOString() })
        .eq('id', page.id);
      if (error) throw error;
      toast.success(isHe ? 'נשמר בהצלחה!' : 'Saved successfully!');
      onComplete({ ...page, content: currentContent });
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    }
  };

  const undo = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setCurrentContent(newHistory[newHistory.length - 1]);
    }
  };

  return (
    <div className="flex flex-col h-[90vh] sm:h-[90vh]">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gradient-to-r from-primary/10 to-primary/5 flex items-center justify-between">
        <div>
          <h3 className="font-bold flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            {isHe ? 'עריכה עם Aurora' : 'Edit with Aurora'}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">{page.title}</p>
        </div>
        <div className="flex items-center gap-2">
          {history.length > 1 && (
            <Button size="sm" variant="ghost" onClick={undo}>
              {isHe ? 'בטל' : 'Undo'}
            </Button>
          )}
          <Button size="sm" onClick={saveChanges}>
            {isHe ? 'שמור שינויים' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Live Preview */}
      <ScrollArea className="flex-1">
        <LandingPagePreview page={{ ...page, content: currentContent }} />
      </ScrollArea>

      {/* Prompt Input */}
      <div className="px-4 py-3 border-t space-y-2">
        <div className="flex gap-2">
          <Input
            value={editPrompt}
            onChange={e => setEditPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && applyEdit()}
            placeholder={isHe ? 'תארו מה לשנות... (למשל: שנה את הכותרת, הוסף עדות, שנה צבעים)' : 'Describe what to change... (e.g., change headline, add testimonial, update CTA)'}
            disabled={isEditing}
          />
          <Button size="icon" onClick={applyEdit} disabled={!editPrompt.trim() || isEditing}>
            {isEditing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
