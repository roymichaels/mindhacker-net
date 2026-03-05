/**
 * Earn page — unified marketplace for earning MOS.
 * Internal tabs: Bounties | Gigs | Data | My Activity
 * Route: /fm/earn — bottom tab label "Earn"
 */
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Clock, Coins, Search, Send, CheckCircle2, Loader2, XCircle, PlayCircle,
  Target, Briefcase, BarChart3, ListChecks, Shield, Eye, EyeOff, Lock,
  Plus, X, Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/useTranslation';
import { useFMBounties, useFMClaims } from '@/hooks/useFMWallet';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import type { Database } from '@/integrations/supabase/types';

type Bounty = Database['public']['Tables']['fm_bounties']['Row'];
type Gig = Database['public']['Tables']['fm_gigs']['Row'];

type EarnTab = 'bounties' | 'gigs' | 'data' | 'activity';

const BOUNTY_CATEGORIES = ['all', 'writing', 'labeling', 'feedback', 'design', 'translation'];
const GIG_CATEGORIES = ['all', 'design', 'writing', 'translation', 'development', 'content', 'other'];

// ──── Data Offers ────
interface DataOffer {
  id: string; type: string; icon: string;
  labelEn: string; labelHe: string; descEn: string; descHe: string;
  days: number; reward: number; fieldsEn: string[]; fieldsHe: string[];
}
const DATA_OFFERS: DataOffer[] = [
  { id: 'sleep', type: 'sleep_patterns', icon: '😴', labelEn: 'Sleep Patterns', labelHe: 'דפוסי שינה', descEn: 'Help researchers understand healthy sleep cycles', descHe: 'עזור לחוקרים להבין מחזורי שינה בריאים', days: 30, reward: 100, fieldsEn: ['Average sleep duration', 'Sleep consistency score', 'Wake frequency'], fieldsHe: ['ממוצע שעות שינה', 'ציון עקביות שינה', 'תדירות התעוררות'] },
  { id: 'habits', type: 'habit_trends', icon: '🎯', labelEn: 'Habit Completion Trends', labelHe: 'מגמות השלמת הרגלים', descEn: 'Improve habit-building algorithms for everyone', descHe: 'שפר אלגוריתמי בניית הרגלים לכולם', days: 90, reward: 250, fieldsEn: ['Completion rates per category', 'Streak patterns', 'Drop-off points'], fieldsHe: ['שיעורי השלמה לפי קטגוריה', 'דפוסי רצף', 'נקודות נשירה'] },
  { id: 'mood', type: 'mood_signals', icon: '🧠', labelEn: 'Mood & Energy Signals', labelHe: 'אותות מצב רוח ואנרגיה', descEn: 'Advance mental wellness research anonymously', descHe: 'קדם מחקר בריאות נפשית באופן אנונימי', days: 60, reward: 150, fieldsEn: ['Daily energy averages', 'Mood trend curves', 'Activity correlations'], fieldsHe: ['ממוצעי אנרגיה יומיים', 'עקומות מגמת מצב רוח', 'מתאמי פעילות'] },
  { id: 'training', type: 'training_results', icon: '💪', labelEn: 'Training & Session Data', labelHe: 'נתוני אימון וסשנים', descEn: 'Help optimize coaching and training programs', descHe: 'עזור לשפר תכניות אימון וקואצ׳ינג', days: 60, reward: 180, fieldsEn: ['Session completion rates', 'Engagement metrics', 'Outcome scores'], fieldsHe: ['שיעורי השלמת סשנים', 'מדדי מעורבות', 'ציוני תוצאה'] },
];

export default function FMEarn() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = (searchParams.get('tab') as EarnTab) || 'bounties';
  const [tab, setTab] = useState<EarnTab>(initialTab);

  const switchTab = (t: EarnTab) => {
    setTab(t);
    if (t === 'bounties') searchParams.delete('tab');
    else searchParams.set('tab', t);
    setSearchParams(searchParams, { replace: true });
  };

  // ──── Bounty state ────
  const { data: bounties = [], isLoading: bLoading } = useFMBounties();
  const { data: claims = [] } = useFMClaims();
  const [bFilter, setBFilter] = useState('all');
  const [bSearch, setBSearch] = useState('');
  const [submittingClaimId, setSubmittingClaimId] = useState<string | null>(null);
  const [submission, setSubmission] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  const claimsByBounty = new Map(claims.map((c: any) => [c.bounty_id, c]));
  const filteredBounties = bounties.filter((b: Bounty) => {
    if (bFilter !== 'all' && b.category !== bFilter) return false;
    if (bSearch && !b.title.toLowerCase().includes(bSearch.toLowerCase())) return false;
    return true;
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['fm-claims'] });
    queryClient.invalidateQueries({ queryKey: ['fm-bounties'] });
    queryClient.invalidateQueries({ queryKey: ['fm-wallet'] });
    queryClient.invalidateQueries({ queryKey: ['fm-transactions'] });
  };

  const handleClaim = async (bountyId: string) => {
    if (!user?.id) return;
    setLoading(bountyId);
    try {
      const { data, error } = await supabase.rpc('fm_claim_bounty', { p_bounty_id: bountyId });
      if (error) throw error;
      const result = typeof data === 'string' ? JSON.parse(data) : data;
      if (!result.success) { toast.error(result.error); return; }
      toast.success(isHe ? 'נתפס! הזן את ההגשה שלך.' : 'Claimed! Enter your submission.');
      invalidateAll();
    } catch (e: any) { toast.error(e.message || 'Failed to claim'); }
    finally { setLoading(null); }
  };

  const handleSubmitClaim = async (claimId: string) => {
    if (!user?.id || !submission.trim()) return;
    setLoading(claimId);
    try {
      const { data, error } = await supabase.rpc('fm_submit_bounty_claim', { p_claim_id: claimId, p_submission: { text: submission.trim() } });
      if (error) throw error;
      const result = typeof data === 'string' ? JSON.parse(data) : data;
      if (!result.success) { toast.error(result.error); return; }
      toast.success(isHe ? 'הגשה נשלחה!' : 'Submitted!');
      setSubmittingClaimId(null); setSubmission(''); invalidateAll();
    } catch (e: any) { toast.error(e.message || 'Failed'); }
    finally { setLoading(null); }
  };

  // ──── Gig state ────
  const [gigMode, setGigMode] = useState<'browse' | 'post'>('browse');
  const [gFilter, setGFilter] = useState('all');
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [pitch, setPitch] = useState('');
  const [proposedAmount, setProposedAmount] = useState('');
  const [gigSubmitting, setGigSubmitting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newCategory, setNewCategory] = useState('other');
  const [posting, setPosting] = useState(false);

  const { data: gigs = [], isLoading: gLoading } = useQuery({
    queryKey: ['fm-gigs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fm_gigs').select('*').in('status', ['open', 'in_progress']).order('created_at', { ascending: false }).limit(30);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: myProposals = [] } = useQuery({
    queryKey: ['fm-my-proposals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.from('fm_gig_proposals').select('*').eq('user_id', user.id);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const proposalsByGig = new Map(myProposals.map((p: any) => [p.gig_id, p]));
  const filteredGigs = gigs.filter((g: Gig) => gFilter === 'all' || g.category === gFilter);

  const handleApply = async (gigId: string) => {
    if (!user?.id || !pitch.trim() || !proposedAmount) return;
    setGigSubmitting(true);
    try {
      const { error } = await supabase.from('fm_gig_proposals').insert({ gig_id: gigId, user_id: user.id, pitch: pitch.trim(), proposed_amount: parseInt(proposedAmount) });
      if (error) throw error;
      toast.success(isHe ? 'ההצעה נשלחה!' : 'Proposal submitted!');
      setApplyingId(null); setPitch(''); setProposedAmount('');
      queryClient.invalidateQueries({ queryKey: ['fm-my-proposals'] });
    } catch (e: any) { toast.error(e.message || 'Failed'); }
    finally { setGigSubmitting(false); }
  };

  const handlePostGig = async () => {
    if (!user?.id || !newTitle.trim() || !newBudget) return;
    setPosting(true);
    try {
      const { error } = await supabase.from('fm_gigs').insert({ title: newTitle.trim(), description: newDesc.trim() || null, budget_mos: parseInt(newBudget), category: newCategory, poster_id: user.id });
      if (error) throw error;
      toast.success(isHe ? 'הפרסום עלה!' : 'Gig posted!');
      setNewTitle(''); setNewDesc(''); setNewBudget(''); setNewCategory('other'); setGigMode('browse');
      queryClient.invalidateQueries({ queryKey: ['fm-gigs'] });
    } catch (e: any) { toast.error(e.message || 'Failed'); }
    finally { setPosting(false); }
  };

  // ──── Data contribution state ────
  const [expandedDataId, setExpandedDataId] = useState<string | null>(null);
  const [confirmDataId, setConfirmDataId] = useState<string | null>(null);

  const { data: existingContributions = [] } = useQuery({
    queryKey: ['fm-data-contributions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.from('fm_data_contributions').select('*').eq('user_id', user.id);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const getContribution = (type: string) => existingContributions.find((c: any) => c.data_type === type && !c.revoked_at);

  const handleShareData = async (offer: DataOffer) => {
    if (!user?.id) return;
    try {
      const { error } = await supabase.from('fm_data_contributions').insert({ user_id: user.id, data_type: offer.type, days_shared: offer.days, reward_mos: offer.reward, consent_hash: `consent_${user.id}_${offer.type}_${Date.now()}`, status: 'active' });
      if (error) throw error;
      toast.success(isHe ? `${offer.reward} MOS יתווספו!` : `${offer.reward} MOS will be added!`);
      setConfirmDataId(null);
      queryClient.invalidateQueries({ queryKey: ['fm-data-contributions'] });
    } catch (e: any) { toast.error(e.message || 'Failed'); }
  };

  const handleRevoke = async (id: string) => {
    try {
      const { error } = await supabase.from('fm_data_contributions').update({ revoked_at: new Date().toISOString(), status: 'revoked' }).eq('id', id);
      if (error) throw error;
      toast.success(isHe ? 'הגישה בוטלה.' : 'Access revoked.');
      queryClient.invalidateQueries({ queryKey: ['fm-data-contributions'] });
    } catch (e: any) { toast.error(e.message || 'Failed'); }
  };

  // ──── Helpers ────
  const claimBadge = (status: string) => {
    const m: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
      claimed: { icon: <PlayCircle className="w-3 h-3" />, label: isHe ? 'נתפס' : 'Claimed', cls: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
      pending: { icon: <Loader2 className="w-3 h-3 animate-spin" />, label: isHe ? 'ממתין' : 'Pending', cls: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400' },
      approved: { icon: <CheckCircle2 className="w-3 h-3" />, label: isHe ? 'אושר ✓' : 'Approved ✓', cls: 'bg-green-500/15 text-green-600 dark:text-green-400' },
      rejected: { icon: <XCircle className="w-3 h-3" />, label: isHe ? 'נדחה' : 'Rejected', cls: 'bg-red-500/15 text-red-600 dark:text-red-400' },
    };
    const b = m[status]; if (!b) return null;
    return <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${b.cls}`}>{b.icon} {b.label}</span>;
  };

  const bountyActions = (bounty: Bounty) => {
    const claim = claimsByBounty.get(bounty.id);
    const ld = loading === bounty.id || loading === claim?.id;
    if (!claim) return <Button size="sm" onClick={() => handleClaim(bounty.id)} disabled={ld} className="gap-1">{ld ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlayCircle className="w-3.5 h-3.5" />} {isHe ? 'התחל →' : 'Start →'}</Button>;
    if (claim.status === 'claimed') {
      if (submittingClaimId === claim.id) return (
        <div className="space-y-2 pt-1">
          <Textarea placeholder={isHe ? 'הזן את ההגשה שלך...' : 'Enter your submission...'} value={submission} onChange={(e) => setSubmission(e.target.value)} rows={3} className="text-sm" />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleSubmitClaim(claim.id)} disabled={!submission.trim() || ld} className="gap-1">{ld ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} {isHe ? 'שלח' : 'Submit'}</Button>
            <Button size="sm" variant="ghost" onClick={() => { setSubmittingClaimId(null); setSubmission(''); }}>{isHe ? 'ביטול' : 'Cancel'}</Button>
          </div>
        </div>
      );
      return <Button size="sm" variant="outline" onClick={() => { setSubmittingClaimId(claim.id); setSubmission(''); }} className="gap-1"><Send className="w-3.5 h-3.5" /> {isHe ? 'הגש עבודה' : 'Submit Work'}</Button>;
    }
    return null;
  };

  const gigStatusBadge = (status: string) => {
    const m: Record<string, { en: string; he: string; cls: string }> = {
      open: { en: 'Open', he: 'פתוח', cls: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
      in_progress: { en: 'In Progress', he: 'בביצוע', cls: 'bg-accent/15 text-accent' },
      completed: { en: 'Completed', he: 'הושלם', cls: 'bg-muted text-muted-foreground' },
    };
    const s = m[status] || m['open'];
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${s.cls}`}>{isHe ? s.he : s.en}</span>;
  };

  // ──── TAB CONFIG ────
  const TABS: { id: EarnTab; labelEn: string; labelHe: string; icon: React.ReactNode }[] = [
    { id: 'bounties', labelEn: 'Bounties', labelHe: 'באונטיז', icon: <Target className="w-3.5 h-3.5" /> },
    { id: 'gigs', labelEn: 'Gigs', labelHe: 'עבודות', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { id: 'data', labelEn: 'Data', labelHe: 'נתונים', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'activity', labelEn: 'My Activity', labelHe: 'פעילות', icon: <ListChecks className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-4 max-w-2xl mx-auto w-full py-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">{isHe ? 'הרוויח MOS' : 'Earn MOS'}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{isHe ? 'באונטיז, עבודות, ושיתוף נתונים' : 'Bounties, gigs, and data sharing'}</p>
      </div>

      {/* Internal tabs */}
      <div className="flex gap-0.5 bg-muted/50 rounded-lg p-1 overflow-x-auto scrollbar-hide">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => switchTab(t.id)}
            className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-colors flex items-center justify-center gap-1 whitespace-nowrap px-2 ${
              tab === t.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            {t.icon} {isHe ? t.labelHe : t.labelEn}
          </button>
        ))}
      </div>

      {/* ═══════ BOUNTIES TAB ═══════ */}
      {tab === 'bounties' && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder={isHe ? 'חפש באונטיז...' : 'Search bounties...'} value={bSearch} onChange={(e) => setBSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {BOUNTY_CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setBFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${bFilter === cat ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
              >{cat === 'all' ? (isHe ? 'הכל' : 'All') : cat.charAt(0).toUpperCase() + cat.slice(1)}</button>
            ))}
          </div>
          {bLoading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />)}</div>
          ) : filteredBounties.length === 0 ? (
            <div className="text-center py-12"><p className="text-muted-foreground text-sm">{isHe ? 'אין באונטיז כרגע.' : 'No bounties right now.'}</p></div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredBounties.map((bounty: Bounty) => {
                  const ec = claimsByBounty.get(bounty.id);
                  return (
                    <motion.div key={bounty.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <h3 className="font-semibold text-sm text-foreground">{bounty.title}</h3>
                          {bounty.description && <p className="text-xs text-muted-foreground line-clamp-2">{bounty.description}</p>}
                        </div>
                        {ec && claimBadge(ec.status)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-accent" /><span className="font-semibold text-foreground">{bounty.reward_mos} MOS</span></span>
                        {bounty.estimated_minutes && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> ~{bounty.estimated_minutes} min</span>}
                        <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium">{bounty.category}</span>
                        <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium">{bounty.difficulty}</span>
                      </div>
                      {bountyActions(bounty)}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* ═══════ GIGS TAB ═══════ */}
      {tab === 'gigs' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{isHe ? 'מצא עבודה או פרסם משימה' : 'Find work or post a gig'}</p>
            <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => setGigMode(gigMode === 'post' ? 'browse' : 'post')}>
              {gigMode === 'post' ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {gigMode === 'post' ? (isHe ? 'ביטול' : 'Cancel') : (isHe ? 'פרסם' : 'Post')}
            </Button>
          </div>

          {gigMode === 'post' ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-sm text-foreground">{isHe ? 'פרסום עבודה חדשה' : 'Post a New Gig'}</h2>
              <div className="space-y-3">
                <Input placeholder={isHe ? 'כותרת העבודה' : 'Gig title'} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                <Textarea placeholder={isHe ? 'תיאור מפורט...' : 'Detailed description...'} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={4} />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">{isHe ? 'תקציב (MOS)' : 'Budget (MOS)'}</label>
                    <Input type="number" placeholder="500" value={newBudget} onChange={(e) => setNewBudget(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">{isHe ? 'קטגוריה' : 'Category'}</label>
                    <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm">
                      {GIG_CATEGORIES.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <Button onClick={handlePostGig} disabled={!newTitle.trim() || !newBudget || posting} className="w-full gap-1.5">
                {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
                {isHe ? 'פרסם עבודה' : 'Publish Gig'}
              </Button>
            </motion.div>
          ) : (
            <>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {GIG_CATEGORIES.map((cat) => (
                  <button key={cat} onClick={() => setGFilter(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${gFilter === cat ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                  >{cat === 'all' ? (isHe ? 'הכל' : 'All') : cat.charAt(0).toUpperCase() + cat.slice(1)}</button>
                ))}
              </div>
              {gLoading ? (
                <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-28 bg-muted/50 rounded-xl animate-pulse" />)}</div>
              ) : filteredGigs.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Users className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                  <p className="text-muted-foreground text-sm">{isHe ? 'אין עבודות בקטגוריה הזו.' : 'No gigs in this category.'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {filteredGigs.map((gig: Gig) => {
                      const ep = proposalsByGig.get(gig.id);
                      const isOwner = gig.poster_id === user?.id;
                      return (
                        <motion.div key={gig.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm text-foreground">{gig.title}</h3>
                            {gigStatusBadge(gig.status)}
                          </div>
                          {gig.description && <p className="text-xs text-muted-foreground line-clamp-2">{gig.description}</p>}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-accent" /><span className="font-semibold text-foreground">{gig.budget_mos} MOS</span></span>
                            <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium">{gig.category}</span>
                            {isOwner && <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-medium">{isHe ? 'שלך' : 'Yours'}</span>}
                          </div>
                          {applyingId === gig.id ? (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 pt-1">
                              <Textarea placeholder={isHe ? 'למה אתה מתאים?' : 'Why are you a good fit?'} value={pitch} onChange={(e) => setPitch(e.target.value)} rows={3} className="text-sm" />
                              <Input type="number" placeholder={isHe ? `הצעת מחיר (${gig.budget_mos} MOS)` : `Your price (${gig.budget_mos} MOS)`} value={proposedAmount} onChange={(e) => setProposedAmount(e.target.value)} />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleApply(gig.id)} disabled={!pitch.trim() || !proposedAmount || gigSubmitting} className="gap-1">{gigSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} {isHe ? 'שלח' : 'Submit'}</Button>
                                <Button size="sm" variant="ghost" onClick={() => { setApplyingId(null); setPitch(''); setProposedAmount(''); }}>{isHe ? 'ביטול' : 'Cancel'}</Button>
                              </div>
                            </motion.div>
                          ) : gig.status === 'open' && !isOwner ? (
                            ep ? <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/15 text-accent">{isHe ? 'הצעה נשלחה ✓' : 'Proposal sent ✓'}</span>
                            : <Button size="sm" onClick={() => { setApplyingId(gig.id); setPitch(''); setProposedAmount(''); }}>{isHe ? 'הגש הצעה' : 'Apply'}</Button>
                          ) : null}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ═══════ DATA TAB ═══════ */}
      {tab === 'data' && (
        <div className="space-y-4">
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-3.5 flex items-start gap-3">
            <BarChart3 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-foreground">{isHe ? 'אנחנו לא לוקחים — אנחנו מבקשים.' : "We don't take — we ask."}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{isHe ? 'כל מידע אנונימי. אתה בוחר מה לשתף ויכול לבטל בכל עת.' : 'All data is anonymized. You choose what to share and can revoke anytime.'}</p>
            </div>
          </div>
          <div className="space-y-3">
            {DATA_OFFERS.map((offer) => {
              const contribution = getContribution(offer.type);
              const isActive = !!contribution;
              const expanded = expandedDataId === offer.id;
              const confirming = confirmDataId === offer.id;
              return (
                <motion.div key={offer.id} layout className="bg-card border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{offer.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-sm text-foreground">{isHe ? offer.labelHe : offer.labelEn}</h3>
                          <p className="text-[11px] text-muted-foreground">{isHe ? offer.descHe : offer.descEn}</p>
                        </div>
                        {isActive && <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0"><CheckCircle2 className="w-3 h-3" /> {isHe ? 'פעיל' : 'Active'}</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-accent" /><span className="font-semibold text-foreground">{offer.reward} MOS</span></span>
                        <span>{offer.days} {isHe ? 'ימים' : 'days'}</span>
                      </div>
                    </div>
                  </div>
                  <AnimatePresence>
                    {expanded && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-muted/50 rounded-lg p-3 space-y-1.5 overflow-hidden">
                        <p className="text-xs font-medium text-foreground flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> {isHe ? 'מה בדיוק משותף:' : "Exactly what's shared:"}</p>
                        <ul className="space-y-1">{(isHe ? offer.fieldsHe : offer.fieldsEn).map((f, i) => <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-accent shrink-0" /> {f}</li>)}</ul>
                        <div className="flex items-center gap-1.5 pt-1.5 border-t border-border/50"><Lock className="w-3 h-3 text-muted-foreground" /><p className="text-[10px] text-muted-foreground">{isHe ? 'ללא מידע מזהה אישי' : 'No personally identifiable info'}</p></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {confirming && !isActive && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-accent/5 border border-accent/20 rounded-lg p-3 space-y-2 overflow-hidden">
                        <p className="text-xs font-medium text-foreground">{isHe ? 'אני מאשר/ת:' : 'I confirm:'}</p>
                        <ul className="space-y-1 text-[11px] text-muted-foreground">
                          <li>✓ {isHe ? 'נתונים אנונימיים' : 'Anonymous data'}</li>
                          <li>✓ {isHe ? 'ביטול בכל עת' : 'Revoke anytime'}</li>
                          <li>✓ {isHe ? `${offer.reward} MOS תגמול` : `${offer.reward} MOS reward`}</li>
                        </ul>
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" onClick={() => handleShareData(offer)} className="gap-1 text-xs"><Shield className="w-3.5 h-3.5" /> {isHe ? 'אישור' : 'Confirm'}</Button>
                          <Button size="sm" variant="ghost" onClick={() => setConfirmDataId(null)} className="text-xs">{isHe ? 'ביטול' : 'Cancel'}</Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setExpandedDataId(expanded ? null : offer.id)} className="gap-1 text-xs text-muted-foreground">
                      {expanded ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {expanded ? (isHe ? 'הסתר' : 'Hide') : (isHe ? 'פרטים' : 'Details')}
                    </Button>
                    {isActive ? (
                      <Button size="sm" variant="ghost" onClick={() => handleRevoke(contribution!.id)} className="gap-1 text-xs text-destructive hover:text-destructive"><XCircle className="w-3.5 h-3.5" /> {isHe ? 'בטל' : 'Revoke'}</Button>
                    ) : confirming ? null : (
                      <Button size="sm" onClick={() => setConfirmDataId(offer.id)} className="gap-1 text-xs"><Coins className="w-3.5 h-3.5" /> {isHe ? 'שתף →' : 'Share →'}</Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground/50 pt-2"><Shield className="w-4 h-4 shrink-0" /><span>{isHe ? 'MindOS לא מוכרת מידע אישי. לעולם.' : 'MindOS never sells personal data. Ever.'}</span></div>
        </div>
      )}

      {/* ═══════ MY ACTIVITY TAB ═══════ */}
      {tab === 'activity' && (
        <div className="space-y-3">
          {claims.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">{isHe ? 'אין הגשות עדיין.' : 'No claims yet.'}</p>
              <Button size="sm" className="mt-3" onClick={() => switchTab('bounties')}>{isHe ? 'עבור לבאונטיז' : 'Browse Bounties'}</Button>
            </div>
          ) : (
            claims.map((claim: any) => (
              <div key={claim.id} className="bg-card border border-border rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-foreground">{claim.fm_bounties?.title || 'Bounty'}</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(claim.created_at).toLocaleDateString()}</p>
                  </div>
                  {claimBadge(claim.status)}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Coins className="w-3.5 h-3.5 text-accent" />
                  <span className="font-semibold text-foreground">{claim.fm_bounties?.reward_mos || 0} MOS</span>
                </div>
                {claim.status === 'claimed' && (
                  <Button size="sm" variant="outline" className="gap-1 mt-1" onClick={() => { switchTab('bounties'); setSubmittingClaimId(claim.id); setSubmission(''); }}>
                    <Send className="w-3.5 h-3.5" /> {isHe ? 'הגש עבודה' : 'Submit Work'}
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
