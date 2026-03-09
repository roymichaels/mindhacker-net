/**
 * FMMarket — Earn hub with Services, Bounties, and P2P Marketplace.
 * Route: /fm/earn — all publishing flows use Aurora AI wizard.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, Briefcase, ShoppingBag, BookOpen, Image, Gem,
  Coins, Package, Sparkles, Search, Plus,
  Send, Loader2, Users, Clock, PlayCircle, CheckCircle2, XCircle
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useFMBounties, useFMClaims } from '@/hooks/useFMWallet';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
import FMPublishWizard, { type FMPublishType } from '@/components/fm/FMPublishWizard';

type Bounty = Database['public']['Tables']['fm_bounties']['Row'];
type Gig = Database['public']['Tables']['fm_gigs']['Row'];

type MarketView = 'services' | 'bounties' | 'marketplace';

const GIG_CATEGORIES = ['all', 'design', 'writing', 'translation', 'development', 'content', 'other'];
const BOUNTY_CATEGORIES = ['all', 'writing', 'labeling', 'feedback', 'design', 'translation'];
const CATEGORY_LABELS: Record<string, string> = {
  all: 'הכל', writing: 'כתיבה', labeling: 'תיוג', feedback: 'משוב',
  design: 'עיצוב', translation: 'תרגום', development: 'פיתוח',
  content: 'תוכן', other: 'אחר',
};

export default function FMMarket() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [view, setView] = useState<MarketView>('services');

  // ── Aurora Publish Wizard state ──
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardType, setWizardType] = useState<FMPublishType>('service');

  const openWizard = (type: FMPublishType) => {
    setWizardType(type);
    setWizardOpen(true);
  };

  // ── Data queries ──
  const { data: bounties = [], isLoading: bLoading } = useFMBounties();
  const { data: claims = [] } = useFMClaims();
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

  // ── Services state ──
  const [gFilter, setGFilter] = useState('all');
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [pitch, setPitch] = useState('');
  const [proposedAmount, setProposedAmount] = useState('');
  const [gigSubmitting, setGigSubmitting] = useState(false);

  // ── Bounties state ──
  const [bFilter, setBFilter] = useState('all');
  const [bSearch, setBSearch] = useState('');
  const [submittingClaimId, setSubmittingClaimId] = useState<string | null>(null);
  const [submission, setSubmission] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  // ── Marketplace state ──
  const [mpFilter, setMpFilter] = useState('all');

  const claimsByBounty = new Map(claims.map((c: any) => [c.bounty_id, c]));
  const proposalsByGig = new Map(myProposals.map((p: any) => [p.gig_id, p]));
  const filteredGigs = gigs.filter((g: Gig) => gFilter === 'all' || g.category === gFilter);
  const filteredBounties = bounties.filter((b: Bounty) => {
    if (bFilter !== 'all' && b.category !== bFilter) return false;
    if (bSearch && !b.title.toLowerCase().includes(bSearch.toLowerCase())) return false;
    return true;
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['fm-claims'] });
    queryClient.invalidateQueries({ queryKey: ['fm-bounties'] });
    queryClient.invalidateQueries({ queryKey: ['fm-wallet'] });
  };

  // ── Handlers ──
  const handleClaim = async (bountyId: string) => {
    if (!user?.id) return;
    setLoading(bountyId);
    try {
      const { data, error } = await supabase.rpc('fm_claim_bounty', { p_bounty_id: bountyId });
      if (error) throw error;
      const result = typeof data === 'string' ? JSON.parse(data) : data;
      if (!result.success) { toast.error(result.error); return; }
      toast.success(isHe ? 'נתפס!' : 'Claimed!');
      invalidateAll();
    } catch (e: any) { toast.error(e.message || 'Failed'); }
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

  // ── Helpers ──
  const claimBadge = (status: string) => {
    const m: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
      claimed: { icon: <PlayCircle className="w-3 h-3" />, label: isHe ? 'נתפס' : 'Claimed', cls: 'bg-sky-500/15 text-sky-600 dark:text-sky-400' },
      pending: { icon: <Loader2 className="w-3 h-3 animate-spin" />, label: isHe ? 'ממתין' : 'Pending', cls: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
      approved: { icon: <CheckCircle2 className="w-3 h-3" />, label: isHe ? 'אושר ✓' : 'Approved ✓', cls: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
      rejected: { icon: <XCircle className="w-3 h-3" />, label: isHe ? 'נדחה' : 'Rejected', cls: 'bg-red-500/15 text-red-600 dark:text-red-400' },
    };
    const b = m[status]; if (!b) return null;
    return <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${b.cls}`}>{b.icon} {b.label}</span>;
  };

  const gigStatusBadge = (status: string) => {
    const m: Record<string, { en: string; he: string; cls: string }> = {
      open: { en: 'Open', he: 'פתוח', cls: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
      in_progress: { en: 'In Progress', he: 'בביצוע', cls: 'bg-sky-500/15 text-sky-500' },
      completed: { en: 'Completed', he: 'הושלם', cls: 'bg-muted text-muted-foreground' },
    };
    const s = m[status] || m['open'];
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${s.cls}`}>{isHe ? s.he : s.en}</span>;
  };

  const MARKETPLACE_CATEGORIES = ['all', 'courses', 'digital_products', 'nfts', 'templates'];
  const MP_CATEGORY_LABELS: Record<string, { en: string; he: string; icon: typeof BookOpen }> = {
    all: { en: 'All', he: 'הכל', icon: ShoppingBag },
    courses: { en: 'Courses', he: 'קורסים', icon: BookOpen },
    digital_products: { en: 'Digital Products', he: 'מוצרים דיגיטליים', icon: Package },
    nfts: { en: 'NFTs', he: 'NFTs', icon: Image },
    templates: { en: 'Templates', he: 'תבניות', icon: Sparkles },
  };

  const marketTabs = [
    { id: 'services' as const, icon: Briefcase, labelEn: 'Services', labelHe: 'שירותים' },
    { id: 'bounties' as const, icon: Target, labelEn: 'Bounties', labelHe: 'באונטיז' },
    { id: 'marketplace' as const, icon: ShoppingBag, labelEn: 'Marketplace', labelHe: 'מרקטפלייס' },
  ];

  return (
    <div className="space-y-4 max-w-2xl mx-auto w-full py-4">
      <div className="text-center">
        <h1 className="text-xl font-black text-foreground flex items-center justify-center gap-2 tracking-tight">
          <Coins className="w-5 h-5 text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
          {isHe ? 'הרוויח MOS' : 'Earn MOS'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isHe ? 'שירותים, באונטיז ומסחר P2P' : 'Services, bounties & P2P trading'}
        </p>
      </div>

      {/* In-page tabs */}
      <div className="flex items-center gap-1 rounded-xl bg-amber-500/5 border border-amber-500/15 p-1">
        {marketTabs.map((tab) => {
          const active = view === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                active
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25'
                  : 'text-amber-600/60 dark:text-amber-400/50 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-500/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{isHe ? tab.labelHe : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Services tab content */}
      {view === 'services' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-foreground">{isHe ? 'שירותים' : 'Services'}</h2>
            <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs" onClick={() => openWizard('service')}>
              <Sparkles className="w-3.5 h-3.5" />
              {isHe ? 'פרסם עם Aurora' : 'Publish with Aurora'}
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {GIG_CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setGFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${gFilter === cat ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-transparent text-muted-foreground border-border/50 hover:border-amber-500/20 hover:text-foreground'}`}
              >{cat === 'all' ? (isHe ? 'הכל' : 'All') : (isHe ? CATEGORY_LABELS[cat] || cat : cat.charAt(0).toUpperCase() + cat.slice(1))}</button>
            ))}
          </div>

          {gLoading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-28 bg-muted/50 rounded-xl animate-pulse" />)}</div>
          ) : filteredGigs.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Users className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <p className="text-muted-foreground text-sm">{isHe ? 'אין שירותים בקטגוריה הזו.' : 'No services in this category.'}</p>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openWizard('service')}>
                <Sparkles className="w-3.5 h-3.5" />
                {isHe ? 'פרסם שירות ראשון' : 'Publish first service'}
              </Button>
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
                        <span className="flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-amber-400" /><span className="font-semibold text-foreground">{gig.budget_mos} MOS</span></span>
                        <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium">{isHe ? CATEGORY_LABELS[gig.category] || gig.category : gig.category}</span>
                        {isOwner && <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-medium">{isHe ? 'שלך' : 'Yours'}</span>}
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
                        ep ? <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">{isHe ? 'הצעה נשלחה ✓' : 'Proposal sent ✓'}</span>
                        : <Button size="sm" onClick={() => { setApplyingId(gig.id); setPitch(''); setProposedAmount(''); }}>{isHe ? 'הגש הצעה' : 'Apply'}</Button>
                      ) : null}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Bounties tab content */}
      {view === 'bounties' && (
        <div className="space-y-4">
           <div className="flex items-center justify-between">
            <h2 className="font-bold text-foreground">{isHe ? 'באונטיז' : 'Bounties'}</h2>
            {isAdmin && (
              <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs" onClick={() => openWizard('bounty')}>
                <Sparkles className="w-3.5 h-3.5" />
                {isHe ? 'צור עם Aurora' : 'Create with Aurora'}
              </Button>
            )}
          </div>
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="ps-9" placeholder={isHe ? 'חפש באונטיז...' : 'Search bounties...'} value={bSearch} onChange={(e) => setBSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {BOUNTY_CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setBFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${bFilter === cat ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-transparent text-muted-foreground border-border/50 hover:border-amber-500/20 hover:text-foreground'}`}
              >{cat === 'all' ? (isHe ? 'הכל' : 'All') : (isHe ? CATEGORY_LABELS[cat] || cat : cat.charAt(0).toUpperCase() + cat.slice(1))}</button>
            ))}
          </div>
          {bLoading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />)}</div>
          ) : filteredBounties.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Target className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <p className="text-muted-foreground text-sm">{isHe ? 'אין באונטיז כרגע.' : 'No bounties right now.'}</p>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openWizard('bounty')}>
                <Sparkles className="w-3.5 h-3.5" />
                {isHe ? 'צור באונטי ראשון' : 'Create first bounty'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredBounties.map((bounty: Bounty) => {
                  const ec = claimsByBounty.get(bounty.id);
                  const ld = loading === bounty.id || loading === ec?.id;
                  return (
                    <motion.div key={bounty.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-4 space-y-3 border-2 border-amber-500/15 bg-gradient-to-br from-amber-500/5 to-transparent hover:border-amber-500/30 transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <h3 className="font-bold text-sm text-foreground">{bounty.title}</h3>
                          {bounty.description && <p className="text-xs text-muted-foreground line-clamp-2">{bounty.description}</p>}
                        </div>
                        {ec && claimBadge(ec.status)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-amber-400" /><span className="font-bold text-amber-300">{bounty.reward_mos} MOS</span></span>
                        {bounty.estimated_minutes && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> ~{bounty.estimated_minutes} min</span>}
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/15 text-[10px] font-bold text-amber-400/80">{isHe ? CATEGORY_LABELS[bounty.category] || bounty.category : bounty.category}</span>
                      </div>
                      {!ec ? (
                        <Button size="sm" onClick={() => handleClaim(bounty.id)} disabled={ld} className="gap-1">{ld ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlayCircle className="w-3.5 h-3.5" />} {isHe ? 'התחל →' : 'Start →'}</Button>
                      ) : ec.status === 'claimed' ? (
                        submittingClaimId === ec.id ? (
                          <div className="space-y-2 pt-1">
                            <Textarea placeholder={isHe ? 'הזן את ההגשה שלך...' : 'Enter your submission...'} value={submission} onChange={(e) => setSubmission(e.target.value)} rows={3} className="text-sm" />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleSubmitClaim(ec.id)} disabled={!submission.trim() || ld} className="gap-1">{ld ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} {isHe ? 'שלח' : 'Submit'}</Button>
                              <Button size="sm" variant="ghost" onClick={() => { setSubmittingClaimId(null); setSubmission(''); }}>{isHe ? 'ביטול' : 'Cancel'}</Button>
                            </div>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => { setSubmittingClaimId(ec.id); setSubmission(''); }} className="gap-1"><Send className="w-3.5 h-3.5" /> {isHe ? 'הגש עבודה' : 'Submit Work'}</Button>
                        )
                      ) : null}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Marketplace tab content */}
      {view === 'marketplace' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-foreground">{isHe ? 'מרקטפלייס' : 'Marketplace'}</h2>
            <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs" onClick={() => openWizard('marketplace')}>
              <Sparkles className="w-3.5 h-3.5" />
              {isHe ? 'פרסם עם Aurora' : 'List with Aurora'}
            </Button>
          </div>

          {/* Category filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {MARKETPLACE_CATEGORIES.map((cat) => {
              const meta = MP_CATEGORY_LABELS[cat];
              const CatIcon = meta.icon;
              return (
                <button
                  key={cat}
                  onClick={() => setMpFilter(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    mpFilter === cat
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-transparent text-muted-foreground border-border/50 hover:border-amber-500/20 hover:text-foreground'
                  }`}
                >
                  <CatIcon className="w-3.5 h-3.5" />
                  {isHe ? meta.he : meta.en}
                </button>
              );
            })}
          </div>

          {/* Empty state */}
          <div className="text-center py-12 space-y-3">
            <Gem className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <p className="text-sm font-semibold text-foreground">
              {mpFilter === 'all'
                ? (isHe ? 'מרקטפלייס P2P בקרוב!' : 'P2P Marketplace Coming Soon!')
                : (isHe
                  ? `אין ${MP_CATEGORY_LABELS[mpFilter]?.he || ''} כרגע`
                  : `No ${MP_CATEGORY_LABELS[mpFilter]?.en?.toLowerCase() || 'items'} yet`)}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {isHe ? 'סחרו במוצרים דיגיטליים, קורסים ו-NFTs עם משתמשים אחרים' : 'Trade digital products, courses & NFTs with other users'}
            </p>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openWizard('marketplace')}>
              <Sparkles className="w-3.5 h-3.5" />
              {isHe ? 'פרסם פריט ראשון' : 'List first item'}
            </Button>
          </div>
        </div>
      )}

      {/* Aurora Publish Wizard */}
      <FMPublishWizard open={wizardOpen} onOpenChange={setWizardOpen} type={wizardType} />
    </div>
  );
}
