import { useState } from 'react';
import { Coins, Users, Plus, Briefcase, Send, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Gig = Database['public']['Tables']['fm_gigs']['Row'];

const GIG_CATEGORIES = ['all', 'design', 'writing', 'translation', 'development', 'content', 'other'];

export default function FMWork() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'browse' | 'post'>('browse');
  const [filter, setFilter] = useState('all');
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [pitch, setPitch] = useState('');
  const [proposedAmount, setProposedAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Post gig form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newCategory, setNewCategory] = useState('other');
  const [posting, setPosting] = useState(false);

  const { data: gigs = [], isLoading } = useQuery({
    queryKey: ['fm-gigs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fm_gigs')
        .select('*')
        .in('status', ['open', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: myProposals = [] } = useQuery({
    queryKey: ['fm-my-proposals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('fm_gig_proposals')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const proposalsByGig = new Map(myProposals.map((p: any) => [p.gig_id, p]));

  const filtered = gigs.filter((g: Gig) => {
    if (filter !== 'all' && g.category !== filter) return false;
    return true;
  });

  const handleApply = async (gigId: string) => {
    if (!user?.id || !pitch.trim() || !proposedAmount) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('fm_gig_proposals').insert({
        gig_id: gigId,
        user_id: user.id,
        pitch: pitch.trim(),
        proposed_amount: parseInt(proposedAmount),
      });
      if (error) throw error;
      toast.success(isHe ? 'ההצעה נשלחה!' : 'Proposal submitted!');
      setApplyingId(null);
      setPitch('');
      setProposedAmount('');
      queryClient.invalidateQueries({ queryKey: ['fm-my-proposals'] });
    } catch (e: any) {
      toast.error(e.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostGig = async () => {
    if (!user?.id || !newTitle.trim() || !newBudget) return;
    setPosting(true);
    try {
      const { error } = await supabase.from('fm_gigs').insert({
        title: newTitle.trim(),
        description: newDesc.trim() || null,
        budget_mos: parseInt(newBudget),
        category: newCategory,
        poster_id: user.id,
      });
      if (error) throw error;
      toast.success(isHe ? 'הפרסום עלה!' : 'Gig posted!');
      setNewTitle('');
      setNewDesc('');
      setNewBudget('');
      setNewCategory('other');
      setTab('browse');
      queryClient.invalidateQueries({ queryKey: ['fm-gigs'] });
    } catch (e: any) {
      toast.error(e.message || 'Failed');
    } finally {
      setPosting(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { en: string; he: string; cls: string }> = {
      open: { en: 'Open', he: 'פתוח', cls: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
      in_progress: { en: 'In Progress', he: 'בביצוע', cls: 'bg-accent/15 text-accent' },
      completed: { en: 'Completed', he: 'הושלם', cls: 'bg-muted text-muted-foreground' },
    };
    const s = map[status] || map['open'];
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${s.cls}`}>{isHe ? s.he : s.en}</span>;
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto w-full py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{isHe ? 'שוק עבודה' : 'Marketplace'}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isHe ? 'מצא עבודה או פרסם משימה' : 'Find work or post a gig'}
          </p>
        </div>
        <Button size="sm" className="gap-1" onClick={() => setTab(tab === 'post' ? 'browse' : 'post')}>
          {tab === 'post' ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {tab === 'post' ? (isHe ? 'ביטול' : 'Cancel') : (isHe ? 'פרסם' : 'Post')}
        </Button>
      </div>

      {tab === 'post' ? (
        /* Post a gig form */
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-5 space-y-4"
        >
          <h2 className="font-semibold text-sm text-foreground">{isHe ? 'פרסום עבודה חדשה' : 'Post a New Gig'}</h2>

          <div className="space-y-3">
            <Input
              placeholder={isHe ? 'כותרת העבודה' : 'Gig title'}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Textarea
              placeholder={isHe ? 'תיאור מפורט...' : 'Detailed description...'}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={4}
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">{isHe ? 'תקציב (MOS)' : 'Budget (MOS)'}</label>
                <Input
                  type="number"
                  placeholder="500"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">{isHe ? 'קטגוריה' : 'Category'}</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm"
                >
                  {GIG_CATEGORIES.filter(c => c !== 'all').map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <Button
            onClick={handlePostGig}
            disabled={!newTitle.trim() || !newBudget || posting}
            className="w-full gap-1.5"
          >
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
            {isHe ? 'פרסם עבודה' : 'Publish Gig'}
          </Button>
        </motion.div>
      ) : (
        <>
          {/* Category filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {GIG_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  filter === cat
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat === 'all' ? (isHe ? 'הכל' : 'All') : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Gig list */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-28 bg-muted/50 rounded-xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Users className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <p className="text-muted-foreground text-sm">
                {isHe ? 'אין עבודות בקטגוריה הזו.' : 'No gigs in this category.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filtered.map((gig: Gig) => {
                  const existingProposal = proposalsByGig.get(gig.id);
                  const isOwner = gig.poster_id === user?.id;
                  return (
                    <motion.div
                      key={gig.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card border border-border rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm text-foreground">{gig.title}</h3>
                        {statusBadge(gig.status)}
                      </div>
                      {gig.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{gig.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-accent" />
                          <span className="font-semibold text-foreground">{gig.budget_mos} MOS</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium">{gig.category}</span>
                        {isOwner && (
                          <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-medium">
                            {isHe ? 'שלך' : 'Yours'}
                          </span>
                        )}
                      </div>

                      {/* Apply form */}
                      {applyingId === gig.id ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-2 pt-1"
                        >
                          <Textarea
                            placeholder={isHe ? 'למה אתה מתאים לעבודה הזו?' : 'Why are you a good fit?'}
                            value={pitch}
                            onChange={(e) => setPitch(e.target.value)}
                            rows={3}
                            className="text-sm"
                          />
                          <Input
                            type="number"
                            placeholder={isHe ? `הצעת מחיר (תקציב: ${gig.budget_mos} MOS)` : `Your price (budget: ${gig.budget_mos} MOS)`}
                            value={proposedAmount}
                            onChange={(e) => setProposedAmount(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleApply(gig.id)} disabled={!pitch.trim() || !proposedAmount || submitting} className="gap-1">
                              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                              {isHe ? 'שלח הצעה' : 'Submit'}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => { setApplyingId(null); setPitch(''); setProposedAmount(''); }}>
                              {isHe ? 'ביטול' : 'Cancel'}
                            </Button>
                          </div>
                        </motion.div>
                      ) : gig.status === 'open' && !isOwner ? (
                        existingProposal ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/15 text-accent">
                            {isHe ? 'הצעה נשלחה ✓' : 'Proposal sent ✓'}
                          </span>
                        ) : (
                          <Button size="sm" onClick={() => { setApplyingId(gig.id); setPitch(''); setProposedAmount(''); }}>
                            {isHe ? 'הגש הצעה' : 'Apply'}
                          </Button>
                        )
                      ) : null}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  );
}
