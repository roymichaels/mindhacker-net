/**
 * Admin Career Applications — Review, approve, reject career applications.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  CheckCircle2, XCircle, Eye, Clock, Briefcase, GraduationCap, Heart, Palette, Code,
  RefreshCw, Loader2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const PATH_ICONS: Record<string, typeof Briefcase> = {
  business: Briefcase, coach: GraduationCap, therapist: Heart, creator: Palette, freelancer: Code,
};
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  approved: 'bg-green-500/15 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
  revision_requested: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
};

export default function AdminCareerApplications() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const qc = useQueryClient();
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filter, setFilter] = useState<string>('pending');

  const { data: apps = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-career-apps', filter],
    queryFn: async () => {
      let query = supabase.from('career_applications' as any).select('*, profiles:user_id(full_name, avatar_url, email)');
      if (filter !== 'all') query = query.eq('status', filter);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('career_applications' as any)
        .update({
          status,
          admin_notes: adminNotes,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-career-apps'] });
      toast.success(isHe ? 'עודכן בהצלחה' : 'Updated successfully');
      setSelectedApp(null);
      setAdminNotes('');
    },
  });

  const filters = [
    { id: 'pending', label: isHe ? 'ממתין' : 'Pending' },
    { id: 'approved', label: isHe ? 'מאושר' : 'Approved' },
    { id: 'rejected', label: isHe ? 'נדחה' : 'Rejected' },
    { id: 'all', label: isHe ? 'הכל' : 'All' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">{isHe ? 'בקשות קריירה' : 'Career Applications'}</h2>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map(f => (
          <Button key={f.id} variant={filter === f.id ? 'default' : 'outline'} size="sm"
            onClick={() => setFilter(f.id)}>
            {f.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : apps.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">{isHe ? 'אין בקשות' : 'No applications'}</p>
      ) : (
        <div className="space-y-3">
          {(apps as any[]).map((app) => {
            const PathIcon = PATH_ICONS[app.career_path] || Briefcase;
            const profile = (app as any).profiles;
            return (
              <div key={app.id} className="rounded-xl border border-border/50 bg-card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <PathIcon className="w-5 h-5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground truncate">{profile?.full_name || 'Unknown'}</span>
                    <Badge variant="outline" className={STATUS_COLORS[app.status]}>{app.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{app.career_path} · {new Date(app.created_at).toLocaleDateString()}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { setSelectedApp(app); setAdminNotes(app.admin_notes || ''); }}>
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={(o) => !o && setSelectedApp(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedApp && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {(() => { const I = PATH_ICONS[selectedApp.career_path] || Briefcase; return <I className="w-5 h-5" />; })()}
                  {(selectedApp as any).profiles?.full_name} — {selectedApp.career_path}
                </DialogTitle>
              </DialogHeader>

              {/* Structured Answers */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground">{isHe ? 'תשובות מובנות' : 'Structured Answers'}</h3>
                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  {Object.entries(selectedApp.structured_answers || {}).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="font-medium text-muted-foreground">{k}:</span>
                      <span className="text-foreground">{Array.isArray(v) ? (v as string[]).join(', ') : String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Conversation */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground">{isHe ? 'שיחת AI' : 'AI Conversation'}</h3>
                <div className="bg-muted/50 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                  {((selectedApp.ai_conversation || []) as any[]).filter((m: any) => m.role !== 'system').map((msg: any, i: number) => (
                    <div key={i} className={`text-xs ${msg.role === 'user' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      <span className="font-bold">{msg.role === 'user' ? '👤' : '🤖'} </span>
                      {msg.content.length > 200 ? msg.content.slice(0, 200) + '...' : msg.content}
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Summary */}
              {selectedApp.ai_summary && (
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground">{isHe ? 'סיכום AI' : 'AI Summary'}</h3>
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">{selectedApp.ai_summary}</p>
                </div>
              )}

              {/* Admin Notes */}
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">{isHe ? 'הערות אדמין' : 'Admin Notes'}</h3>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={isHe ? 'הוסף הערות...' : 'Add notes...'}
                  className="text-sm"
                  rows={3}
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <Button className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700"
                  onClick={() => updateMutation.mutate({ id: selectedApp.id, status: 'approved' })}
                  disabled={updateMutation.isPending}>
                  <CheckCircle2 className="w-4 h-4" /> {isHe ? 'אשר' : 'Approve'}
                </Button>
                <Button variant="destructive" className="flex-1 gap-1.5"
                  onClick={() => updateMutation.mutate({ id: selectedApp.id, status: 'rejected' })}
                  disabled={updateMutation.isPending}>
                  <XCircle className="w-4 h-4" /> {isHe ? 'דחה' : 'Reject'}
                </Button>
                <Button variant="outline" className="gap-1.5"
                  onClick={() => updateMutation.mutate({ id: selectedApp.id, status: 'revision_requested' })}
                  disabled={updateMutation.isPending}>
                  <Clock className="w-4 h-4" /> {isHe ? 'תיקון' : 'Revise'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
