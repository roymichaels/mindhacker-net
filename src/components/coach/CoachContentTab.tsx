import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useMyCoachProfile } from '@/domain/coaches';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, FileText, Video, Headphones, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';

const CoachContentTab = () => {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const { data: myProfile } = useMyCoachProfile();
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'article' as string, content_url: '', status: 'draft' as string });

  // Fetch coach's content products
  const { data: content, isLoading } = useQuery({
    queryKey: ['coach-content', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('content_products')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      const slug = form.title.toLowerCase().replace(/[^a-z0-9א-ת]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
      const { error } = await supabase.from('content_products').insert({
        title: form.title,
        description: form.description,
        type: form.type,
        content_url: form.content_url || null,
        status: form.status,
        slug,
        created_by: user.id,
        access_level: 'free',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-content'] });
      toast.success(isHe ? 'תוכן נוצר!' : 'Content created!');
      setAddOpen(false);
      setForm({ title: '', description: '', type: 'article', content_url: '', status: 'draft' });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('content_products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-content'] });
      toast.success(isHe ? 'תוכן נמחק' : 'Content deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const typeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4 text-purple-400" />;
      case 'audio': case 'recording': return <Headphones className="h-4 w-4 text-amber-400" />;
      default: return <FileText className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{isHe ? 'ניהול תוכן' : 'Content Management'}</h2>
          <p className="text-sm text-muted-foreground">{isHe ? 'צרו ונהלו תכנים עבור הלקוחות שלכם' : 'Create and manage content for your clients'}</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 me-2" />{isHe ? 'תוכן חדש' : 'New Content'}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{isHe ? 'צור תוכן חדש' : 'Create New Content'}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>{isHe ? 'כותרת' : 'Title'}</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div><Label>{isHe ? 'תיאור' : 'Description'}</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{isHe ? 'סוג' : 'Type'}</Label>
                  <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="article">{isHe ? 'מאמר' : 'Article'}</SelectItem>
                      <SelectItem value="video">{isHe ? 'וידאו' : 'Video'}</SelectItem>
                      <SelectItem value="course">{isHe ? 'קורס' : 'Course'}</SelectItem>
                      <SelectItem value="recording">{isHe ? 'הקלטה' : 'Recording'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{isHe ? 'סטטוס' : 'Status'}</Label>
                  <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">{isHe ? 'טיוטה' : 'Draft'}</SelectItem>
                      <SelectItem value="published">{isHe ? 'פורסם' : 'Published'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>{isHe ? 'קישור לתוכן' : 'Content URL'}</Label><Input value={form.content_url} onChange={e => setForm(p => ({ ...p, content_url: e.target.value }))} placeholder="https://..." /></div>
              <Button onClick={() => createMutation.mutate()} disabled={!form.title || createMutation.isPending} className="w-full">
                {createMutation.isPending ? '...' : isHe ? 'צור' : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border/50 p-3 text-center">
          <div className="text-xl font-bold">{content?.length || 0}</div>
          <div className="text-xs text-muted-foreground">{isHe ? 'סה"כ' : 'Total'}</div>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-center">
          <div className="text-xl font-bold">{content?.filter(c => c.status === 'published').length || 0}</div>
          <div className="text-xs text-muted-foreground">{isHe ? 'מפורסם' : 'Published'}</div>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-center">
          <div className="text-xl font-bold">{content?.filter(c => c.status === 'draft').length || 0}</div>
          <div className="text-xs text-muted-foreground">{isHe ? 'טיוטה' : 'Draft'}</div>
        </div>
      </div>

      {/* Content list */}
      <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-5">
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
        ) : !content?.length ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{isHe ? 'אין תוכן עדיין' : 'No content yet'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {content.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  {typeIcon(item.type)}
                  <div className="min-w-0">
                    <h4 className="font-medium text-sm truncate">{item.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>{item.type}</span>
                      <span>•</span>
                      <span>{format(new Date(item.created_at), 'PP', { locale: isHe ? he : undefined })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                    {item.status === 'published' ? (isHe ? 'פורסם' : 'Published') : (isHe ? 'טיוטה' : 'Draft')}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {item.slug && (
                        <DropdownMenuItem asChild>
                          <a href={`/courses/${item.slug}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 me-2" />{isHe ? 'צפה' : 'View'}
                          </a>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(item.id)}>
                        <Trash2 className="h-4 w-4 me-2" />{isHe ? 'מחק' : 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachContentTab;
