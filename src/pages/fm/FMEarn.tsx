/**
 * Market page — unified marketplace for earning MOS.
 * Internal tabs: Opportunities (bounties) | Data (contribute) | My Activity (claims)
 * Route: /fm/earn — label shows "Market"
 */
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clock, Coins, Search, Send, CheckCircle2, Loader2, XCircle, PlayCircle, ShoppingBag, BarChart3, ListChecks, Shield, Eye, EyeOff, Lock } from 'lucide-react';
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

const CATEGORY_FILTERS = ['all', 'writing', 'labeling', 'feedback', 'design', 'translation'];

type MarketTab = 'opportunities' | 'data' | 'activity';

// ────────────────────────── Data Offers (from FMContribute) ──────────────────────────
interface DataOffer {
  id: string; type: string; icon: string;
  labelEn: string; labelHe: string;
  descEn: string; descHe: string;
  days: number; reward: number;
  fieldsEn: string[]; fieldsHe: string[];
}

const DATA_OFFERS: DataOffer[] = [
  {
    id: 'sleep', type: 'sleep_patterns', icon: '😴',
    labelEn: 'Sleep Patterns', labelHe: 'דפוסי שינה',
    descEn: 'Help researchers understand healthy sleep cycles',
    descHe: 'עזור לחוקרים להבין מחזורי שינה בריאים',
    days: 30, reward: 100,
    fieldsEn: ['Average sleep duration', 'Sleep consistency score', 'Wake frequency'],
    fieldsHe: ['ממוצע שעות שינה', 'ציון עקביות שינה', 'תדירות התעוררות'],
  },
  {
    id: 'habits', type: 'habit_trends', icon: '🎯',
    labelEn: 'Habit Completion Trends', labelHe: 'מגמות השלמת הרגלים',
    descEn: 'Improve habit-building algorithms for everyone',
    descHe: 'שפר אלגוריתמי בניית הרגלים לכולם',
    days: 90, reward: 250,
    fieldsEn: ['Completion rates per category', 'Streak patterns', 'Drop-off points'],
    fieldsHe: ['שיעורי השלמה לפי קטגוריה', 'דפוסי רצף', 'נקודות נשירה'],
  },
  {
    id: 'mood', type: 'mood_signals', icon: '🧠',
    labelEn: 'Mood & Energy Signals', labelHe: 'אותות מצב רוח ואנרגיה',
    descEn: 'Advance mental wellness research anonymously',
    descHe: 'קדם מחקר בריאות נפשית באופן אנונימי',
    days: 60, reward: 150,
    fieldsEn: ['Daily energy averages', 'Mood trend curves', 'Activity correlations'],
    fieldsHe: ['ממוצעי אנרגיה יומיים', 'עקומות מגמת מצב רוח', 'מתאמי פעילות'],
  },
  {
    id: 'training', type: 'training_results', icon: '💪',
    labelEn: 'Training & Session Data', labelHe: 'נתוני אימון וסשנים',
    descEn: 'Help optimize coaching and training programs',
    descHe: 'עזור לשפר תכניות אימון וקואצ׳ינג',
    days: 60, reward: 180,
    fieldsEn: ['Session completion rates', 'Engagement metrics', 'Outcome scores'],
    fieldsHe: ['שיעורי השלמת סשנים', 'מדדי מעורבות', 'ציוני תוצאה'],
  },
];

export default function FMEarn() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab from URL param or default
  const initialTab = (searchParams.get('tab') as MarketTab) || 'opportunities';
  const [tab, setTab] = useState<MarketTab>(initialTab);

  // Sync tab changes to URL
  const switchTab = (t: MarketTab) => {
    setTab(t);
    if (t === 'opportunities') {
      searchParams.delete('tab');
    } else {
      searchParams.set('tab', t);
    }
    setSearchParams(searchParams, { replace: true });
  };

  // ──── Bounty state ────
  const { data: bounties = [], isLoading } = useFMBounties();
  const { data: claims = [] } = useFMClaims();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [submittingClaimId, setSubmittingClaimId] = useState<string | null>(null);
  const [submission, setSubmission] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  const claimsByBounty = new Map(claims.map((c: any) => [c.bounty_id, c]));

  const filtered = bounties.filter((b: Bounty) => {
    if (filter !== 'all' && b.category !== filter) return false;
    if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false;
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

  const handleSubmit = async (claimId: string) => {
    if (!user?.id || !submission.trim()) return;
    setLoading(claimId);
    try {
      const { data, error } = await supabase.rpc('fm_submit_bounty_claim', {
        p_claim_id: claimId, p_submission: { text: submission.trim() },
      });
      if (error) throw error;
      const result = typeof data === 'string' ? JSON.parse(data) : data;
      if (!result.success) { toast.error(result.error); return; }
      toast.success(isHe ? 'הגשה נשלחה! תקבל MOS לאחר אישור.' : "Submitted! You'll receive MOS after review.");
      setSubmittingClaimId(null); setSubmission(''); invalidateAll();
    } catch (e: any) { toast.error(e.message || 'Failed to submit'); }
    finally { setLoading(null); }
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

  const handleShare = async (offer: DataOffer) => {
    if (!user?.id) return;
    try {
      const { error } = await supabase.from('fm_data_contributions').insert({
        user_id: user.id, data_type: offer.type, days_shared: offer.days,
        reward_mos: offer.reward, consent_hash: `consent_${user.id}_${offer.type}_${Date.now()}`, status: 'active',
      });
      if (error) throw error;
      toast.success(isHe ? `${offer.reward} MOS יתווספו לארנק שלך!` : `${offer.reward} MOS will be added to your wallet!`);
      setConfirmDataId(null);
      queryClient.invalidateQueries({ queryKey: ['fm-data-contributions'] });
    } catch (e: any) { toast.error(e.message || 'Failed'); }
  };

  const handleRevoke = async (contributionId: string) => {
    try {
      const { error } = await supabase.from('fm_data_contributions')
        .update({ revoked_at: new Date().toISOString(), status: 'revoked' })
        .eq('id', contributionId);
      if (error) throw error;
      toast.success(isHe ? 'הגישה בוטלה.' : 'Access revoked.');
      queryClient.invalidateQueries({ queryKey: ['fm-data-contributions'] });
    } catch (e: any) { toast.error(e.message || 'Failed'); }
  };

  // ──── Helpers ────
  const getClaimBadge = (status: string) => {
    const badges: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
      claimed: { icon: <PlayCircle className="w-3 h-3" />, label: isHe ? 'נתפס' : 'Claimed', cls: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
      pending: { icon: <Loader2 className="w-3 h-3 animate-spin" />, label: isHe ? 'ממתין' : 'Pending', cls: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400' },
      approved: { icon: <CheckCircle2 className="w-3 h-3" />, label: isHe ? 'אושר ✓' : 'Approved ✓', cls: 'bg-green-500/15 text-green-600 dark:text-green-400' },
      rejected: { icon: <XCircle className="w-3 h-3" />, label: isHe ? 'נדחה' : 'Rejected', cls: 'bg-red-500/15 text-red-600 dark:text-red-400' },
    };
    const b = badges[status];
    if (!b) return null;
    return <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${b.cls}`}>{b.icon} {b.label}</span>;
  };

  const renderBountyActions = (bounty: Bounty) => {
    const existingClaim = claimsByBounty.get(bounty.id);
    const isLd = loading === bounty.id || loading === existingClaim?.id;
    if (!existingClaim) {
      return (
        <Button size="sm" onClick={() => handleClaim(bounty.id)} disabled={isLd} className="gap-1">
          {isLd ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlayCircle className="w-3.5 h-3.5" />}
          {isHe ? 'התחל →' : 'Start →'}
        </Button>
      );
    }
    if (existingClaim.status === 'claimed') {
      if (submittingClaimId === existingClaim.id) {
        return (
          <div className="space-y-2 pt-1">
            <Textarea placeholder={isHe ? 'הזן את ההגשה שלך...' : 'Enter your submission...'} value={submission} onChange={(e) => setSubmission(e.target.value)} rows={3} className="text-sm" />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleSubmit(existingClaim.id)} disabled={!submission.trim() || isLd} className="gap-1">
                {isLd ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                {isHe ? 'שלח' : 'Submit'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setSubmittingClaimId(null); setSubmission(''); }}>
                {isHe ? 'ביטול' : 'Cancel'}
              </Button>
            </div>
          </div>
        );
      }
      return (
        <Button size="sm" variant="outline" onClick={() => { setSubmittingClaimId(existingClaim.id); setSubmission(''); }} className="gap-1">
          <Send className="w-3.5 h-3.5" /> {isHe ? 'הגש עבודה' : 'Submit Work'}
        </Button>
      );
    }
    return null;
  };

  // ──── TAB CONFIG ────
  const TABS: { id: MarketTab; labelEn: string; labelHe: string; icon: React.ReactNode }[] = [
    { id: 'opportunities', labelEn: 'Opportunities', labelHe: 'הזדמנויות', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { id: 'data', labelEn: 'Data', labelHe: 'נתונים', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'activity', labelEn: 'My Activity', labelHe: 'הפעילות שלי', icon: <ListChecks className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-4 max-w-2xl mx-auto w-full py-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">{isHe ? 'שוק' : 'Market'}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isHe ? 'מצא הזדמנויות להרוויח MOS' : 'Find opportunities to earn MOS'}
        </p>
      </div>

      {/* Internal tabs */}
      <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => switchTab(t.id)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              tab === t.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            {t.icon}
            {isHe ? t.labelHe : t.labelEn}
          </button>
        ))}
      </div>

      {/* ═══════ OPPORTUNITIES TAB ═══════ */}
      {tab === 'opportunities' && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder={isHe ? 'חפש באונטיז...' : 'Search bounties...'} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORY_FILTERS.map((cat) => (
              <button key={cat} onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  filter === cat ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat === 'all' ? (isHe ? 'הכל' : 'All') : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">{isHe ? 'אין באונטיז כרגע.' : 'No bounties right now.'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filtered.map((bounty: Bounty) => {
                  const existingClaim = claimsByBounty.get(bounty.id);
                  return (
                    <motion.div key={bounty.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <h3 className="font-semibold text-sm text-foreground">{bounty.title}</h3>
                          {bounty.description && <p className="text-xs text-muted-foreground line-clamp-2">{bounty.description}</p>}
                        </div>
                        {existingClaim && getClaimBadge(existingClaim.status)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-accent" /><span className="font-semibold text-foreground">{bounty.reward_mos} MOS</span></span>
                        {bounty.estimated_minutes && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> ~{bounty.estimated_minutes} min</span>}
                        <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium">{bounty.category}</span>
                        <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium">{bounty.difficulty}</span>
                      </div>
                      {renderBountyActions(bounty)}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* ═══════ DATA TAB ═══════ */}
      {tab === 'data' && (
        <div className="space-y-4">
          {/* Philosophy callout */}
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-3.5 flex items-start gap-3">
            <BarChart3 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-foreground">{isHe ? 'אנחנו לא לוקחים — אנחנו מבקשים.' : "We don't take — we ask."}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {isHe ? 'כל מידע אנונימי. אתה בוחר מה לשתף ויכול לבטל בכל עת.' : 'All data is anonymized. You choose what to share and can revoke anytime.'}
              </p>
            </div>
          </div>

          {/* Data offers */}
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
                        {isActive && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                            <CheckCircle2 className="w-3 h-3" /> {isHe ? 'פעיל' : 'Active'}
                          </span>
                        )}
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
                        <ul className="space-y-1">
                          {(isHe ? offer.fieldsHe : offer.fieldsEn).map((f, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-accent shrink-0" /> {f}</li>
                          ))}
                        </ul>
                        <div className="flex items-center gap-1.5 pt-1.5 border-t border-border/50">
                          <Lock className="w-3 h-3 text-muted-foreground" />
                          <p className="text-[10px] text-muted-foreground">{isHe ? 'ללא שם, אימייל, או מידע מזהה אישי' : 'No name, email, or personally identifiable info'}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {confirming && !isActive && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-accent/5 border border-accent/20 rounded-lg p-3 space-y-2 overflow-hidden">
                        <p className="text-xs font-medium text-foreground">{isHe ? 'אני מאשר/ת:' : 'I confirm:'}</p>
                        <ul className="space-y-1 text-[11px] text-muted-foreground">
                          <li>✓ {isHe ? 'הנתונים שלי ישותפו באופן אנונימי' : 'My data will be shared anonymously'}</li>
                          <li>✓ {isHe ? 'אני יכול/ה לבטל בכל עת' : 'I can revoke access anytime'}</li>
                          <li>✓ {isHe ? `אקבל ${offer.reward} MOS כתגמול` : `I'll receive ${offer.reward} MOS as reward`}</li>
                        </ul>
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" onClick={() => handleShare(offer)} className="gap-1 text-xs"><Shield className="w-3.5 h-3.5" /> {isHe ? 'אישור ושיתוף' : 'Confirm & Share'}</Button>
                          <Button size="sm" variant="ghost" onClick={() => setConfirmDataId(null)} className="text-xs">{isHe ? 'ביטול' : 'Cancel'}</Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setExpandedDataId(expanded ? null : offer.id)} className="gap-1 text-xs text-muted-foreground">
                      {expanded ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {expanded ? (isHe ? 'הסתר' : 'Hide') : (isHe ? 'מה משותף?' : "What's shared?")}
                    </Button>
                    {isActive ? (
                      <Button size="sm" variant="ghost" onClick={() => handleRevoke(contribution!.id)} className="gap-1 text-xs text-destructive hover:text-destructive">
                        <XCircle className="w-3.5 h-3.5" /> {isHe ? 'בטל גישה' : 'Revoke'}
                      </Button>
                    ) : confirming ? null : (
                      <Button size="sm" onClick={() => setConfirmDataId(offer.id)} className="gap-1 text-xs">
                        <Coins className="w-3.5 h-3.5" /> {isHe ? 'שתף →' : 'Share →'}
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground/50 pt-2">
            <Shield className="w-4 h-4 shrink-0" />
            <span>{isHe ? 'MindOS לא מוכרת מידע אישי. לעולם.' : 'MindOS never sells personal data. Ever.'}</span>
          </div>
        </div>
      )}

      {/* ═══════ MY ACTIVITY TAB ═══════ */}
      {tab === 'activity' && (
        <div className="space-y-3">
          {claims.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">{isHe ? 'אין הגשות עדיין. התחל להרוויח!' : 'No claims yet. Start earning!'}</p>
              <Button size="sm" className="mt-3" onClick={() => switchTab('opportunities')}>{isHe ? 'עבור לשוק' : 'Browse Market'}</Button>
            </div>
          ) : (
            claims.map((claim: any) => (
              <div key={claim.id} className="bg-card border border-border rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-foreground">{claim.fm_bounties?.title || 'Bounty'}</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(claim.created_at).toLocaleDateString()}</p>
                  </div>
                  {getClaimBadge(claim.status)}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Coins className="w-3.5 h-3.5 text-accent" />
                  <span className="font-semibold text-foreground">{claim.fm_bounties?.reward_mos || 0} MOS</span>
                  {claim.fm_bounties?.category && <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium">{claim.fm_bounties.category}</span>}
                </div>
                {claim.status === 'claimed' && (
                  <Button size="sm" variant="outline" className="gap-1 mt-1"
                    onClick={() => { switchTab('opportunities'); setSubmittingClaimId(claim.id); setSubmission(''); }}>
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
