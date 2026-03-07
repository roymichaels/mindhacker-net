/**
 * Earn page — unified marketplace for earning MOS.
 * Tabs: Data | Activity | Mining | Partners
 * Route: /fm/earn
 */
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Clock, Coins, Search, Send, CheckCircle2, Loader2, XCircle, PlayCircle,
  BarChart3, ListChecks, Shield, Eye, EyeOff, Lock,
  ArrowRight, Pickaxe,
  Link2, Copy, UserPlus, DollarSign, TrendingUp,
} from 'lucide-react';
import { MiningDashboard } from '@/components/fm/MiningDashboard';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useFMClaims } from '@/hooks/useFMWallet';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

type EarnTab = 'overview' | 'data' | 'activity' | 'mining' | 'partners';

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

interface FMEarnProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  categoryFilter?: string;
  onCategoryChange?: (cat: string) => void;
}

export default function FMEarn({ activeTab: externalTab, onTabChange, categoryFilter: externalCatFilter, onCategoryChange }: FMEarnProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = externalTab || (searchParams.get('tab') as EarnTab) || 'overview';
  const [internalTab, setInternalTab] = useState<EarnTab>(initialTab as EarnTab);
  const tab = (externalTab as EarnTab) || internalTab;

  const switchTab = (t: EarnTab) => {
    if (onTabChange) {
      onTabChange(t);
    } else {
      setInternalTab(t);
      if (t === 'overview') searchParams.delete('tab');
      else searchParams.set('tab', t);
      setSearchParams(searchParams, { replace: true });
    }
  };

  // ──── Claims (for activity tab) ────
  const { data: claims = [] } = useFMClaims();

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

  // ──── Partners / Affiliate state ────
  const { data: affiliateData } = useQuery({
    queryKey: ['fm-affiliate', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase.from('affiliates').select('*').eq('user_id', user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: affiliateReferrals = [] } = useQuery({
    queryKey: ['fm-affiliate-referrals', affiliateData?.id],
    queryFn: async () => {
      if (!affiliateData?.id) return [];
      const { data, error } = await supabase.from('affiliate_referrals').select('*').eq('affiliate_id', affiliateData.id).order('created_at', { ascending: false }).limit(20);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!affiliateData?.id,
  });

  const affiliateLink = affiliateData ? `https://mindos.space/?ref=${affiliateData.affiliate_code}` : '';

  const handleCopyAffiliateLink = () => {
    if (!affiliateLink) return;
    navigator.clipboard.writeText(affiliateLink);
    toast.success(isHe ? 'הקישור הועתק!' : 'Link copied!');
  };

  const handleBecomeAffiliate = async () => {
    if (!user?.id) return;
    try {
      const code = user.id.slice(0, 8);
      const { error } = await supabase.from('affiliates').insert({ user_id: user.id, affiliate_code: code });
      if (error) throw error;
      toast.success(isHe ? 'נרשמת בהצלחה כשותף!' : 'Successfully registered as a partner!');
      queryClient.invalidateQueries({ queryKey: ['fm-affiliate'] });
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

  // ──── TAB CONFIG — MapleStory item rarity style ────
  const TABS: { id: EarnTab; labelEn: string; labelHe: string; icon: React.ReactNode; rarity: string; statValue: number; statLabelEn: string; statLabelHe: string }[] = [
    { id: 'data', labelEn: 'Data', labelHe: 'נתונים', icon: <BarChart3 className="w-6 h-6" />, rarity: 'uncommon', statValue: DATA_OFFERS.length, statLabelEn: 'offers', statLabelHe: 'הצעות' },
    { id: 'activity', labelEn: 'Activity', labelHe: 'פעילות', icon: <ListChecks className="w-6 h-6" />, rarity: 'common', statValue: claims.length, statLabelEn: 'claims', statLabelHe: 'הגשות' },
    { id: 'mining', labelEn: 'Mining', labelHe: 'כרייה', icon: <Pickaxe className="w-6 h-6" />, rarity: 'legendary', statValue: 0, statLabelEn: 'mined today', statLabelHe: 'נכרו היום' },
    { id: 'partners', labelEn: 'Partners', labelHe: 'שותפים', icon: <Link2 className="w-6 h-6" />, rarity: 'common', statValue: affiliateReferrals.length, statLabelEn: 'referrals', statLabelHe: 'הפניות' },
  ];

  const RARITY_STYLES: Record<string, { border: string; bg: string; iconBg: string; glow: string; label: { en: string; he: string; color: string } }> = {
    legendary: { border: 'border-amber-500/50', bg: 'from-amber-500/12 to-orange-500/5', iconBg: 'from-amber-500 to-orange-600', glow: 'hover:shadow-amber-500/15', label: { en: 'LEGENDARY', he: 'אגדי', color: 'text-amber-400' } },
    epic: { border: 'border-purple-500/50', bg: 'from-purple-500/12 to-fuchsia-500/5', iconBg: 'from-purple-500 to-fuchsia-600', glow: 'hover:shadow-purple-500/15', label: { en: 'EPIC', he: 'אפי', color: 'text-purple-400' } },
    rare: { border: 'border-sky-500/50', bg: 'from-sky-500/12 to-blue-500/5', iconBg: 'from-sky-500 to-blue-600', glow: 'hover:shadow-sky-500/15', label: { en: 'RARE', he: 'נדיר', color: 'text-sky-400' } },
    uncommon: { border: 'border-emerald-500/50', bg: 'from-emerald-500/12 to-teal-500/5', iconBg: 'from-emerald-500 to-teal-600', glow: 'hover:shadow-emerald-500/15', label: { en: 'UNCOMMON', he: 'לא שכיח', color: 'text-emerald-400' } },
    common: { border: 'border-zinc-400/40', bg: 'from-zinc-500/10 to-zinc-400/5', iconBg: 'from-zinc-500 to-zinc-600', glow: 'hover:shadow-zinc-500/10', label: { en: 'COMMON', he: 'רגיל', color: 'text-zinc-400' } },
  };

  const showDashboard = tab === 'overview';

  return (
    <div className="space-y-4 max-w-2xl mx-auto w-full py-4">

      {/* ═══════ DASHBOARD OVERVIEW ═══════ */}
      {showDashboard && (
        <div className="space-y-5">
          <div className="text-center">
            <h1 className="text-xl font-black text-foreground flex items-center justify-center gap-2 tracking-tight">
              <Coins className="w-5 h-5 text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
              {isHe ? 'הרוויח MOS' : 'Earn MOS'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isHe ? 'בחר קטגוריה והתחל להרוויח' : 'Pick a category and start earning'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {TABS.map((t, i) => {
              const style = RARITY_STYLES[t.rarity] || RARITY_STYLES.common;
              return (
                <motion.button
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
                  onClick={() => switchTab(t.id)}
                  className={`relative flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 bg-gradient-to-br transition-all hover:scale-[1.03] active:scale-[0.97] hover:shadow-xl ${style.border} ${style.bg} ${style.glow}`}
                >
                  <span className={`absolute top-1.5 end-2 text-[7px] font-black uppercase tracking-[0.15em] ${style.label.color}`}>
                    {isHe ? style.label.he : style.label.en}
                  </span>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${style.iconBg} flex items-center justify-center shadow-lg`}>
                    <span className="text-white/90">{t.icon}</span>
                  </div>
                  <h3 className="font-bold text-sm text-foreground">{isHe ? t.labelHe : t.labelEn}</h3>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {t.statValue} {isHe ? t.statLabelHe : t.statLabelEn}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════ BACK BUTTON (for drill-down views) ═══════ */}
      {!showDashboard && (
        <button onClick={() => switchTab('overview')} className="flex items-center gap-1 text-sm text-amber-400/70 hover:text-amber-300 font-semibold transition-colors">
          <ArrowRight className={`w-4 h-4 ${isHe ? '' : 'rotate-180'}`} />
          {isHe ? 'חזרה' : 'Back'}
        </button>
      )}

      {/* ═══════ DATA TAB ═══════ */}
      {!showDashboard && tab === 'data' && (
        <div className="space-y-4">
          <h2 className="font-bold text-foreground">{isHe ? 'נתונים' : 'Data'}</h2>
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

      {/* ═══════ ACTIVITY TAB ═══════ */}
      {!showDashboard && tab === 'activity' && (
        <div className="space-y-3">
          <h2 className="font-bold text-foreground">{isHe ? 'פעילות' : 'Activity'}</h2>
          {claims.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">{isHe ? 'אין הגשות עדיין.' : 'No claims yet.'}</p>
              <Button size="sm" className="mt-3" onClick={() => navigate('/fm/market')}>{isHe ? 'עבור למרקט' : 'Browse Market'}</Button>
            </div>
          ) : (
            claims.map((claim: any) => (
              <div key={claim.id} className="bg-card border border-border rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-foreground">{claim.fm_bounties?.title || (isHe ? 'באונטי' : 'Bounty')}</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(claim.created_at).toLocaleDateString()}</p>
                  </div>
                  {claimBadge(claim.status)}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Coins className="w-3.5 h-3.5 text-accent" />
                  <span className="font-semibold text-foreground">{claim.fm_bounties?.reward_mos || 0} MOS</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ═══════ MINING TAB ═══════ */}
      {!showDashboard && tab === 'mining' && (
        <div className="space-y-4">
          <h2 className="font-bold text-foreground">{isHe ? 'כרייה' : 'Mining'}</h2>
          <MiningDashboard />
        </div>
      )}

      {/* ═══════ PARTNERS TAB ═══════ */}
      {!showDashboard && tab === 'partners' && (
        <div className="space-y-4">
          <h2 className="font-bold text-foreground">{isHe ? 'שותפים' : 'Partners'}</h2>
          {!affiliateData ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-pink-500/10 flex items-center justify-center mx-auto">
                <Link2 className="w-8 h-8 text-pink-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">{isHe ? 'הצטרף לתוכנית השותפים' : 'Join the Partners Program'}</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  {isHe ? 'שתף את הקישור שלך, הפנה חברים והרוויח עמלות על כל רכישה.' : 'Share your link, refer friends and earn commissions on every purchase.'}
                </p>
              </div>
              <Button onClick={handleBecomeAffiliate} className="gap-2">
                <UserPlus className="w-4 h-4" />
                {isHe ? 'הצטרף עכשיו' : 'Join Now'}
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { labelEn: 'Total Earnings', labelHe: 'סה"כ הכנסות', value: `₪${affiliateData.total_earnings?.toLocaleString() || '0'}`, icon: <DollarSign className="w-4 h-4" />, color: 'text-emerald-500' },
                  { labelEn: 'Total Paid', labelHe: 'שולם', value: `₪${affiliateData.total_paid?.toLocaleString() || '0'}`, icon: <Coins className="w-4 h-4" />, color: 'text-accent' },
                  { labelEn: 'Referrals', labelHe: 'הפניות', value: affiliateReferrals.length.toString(), icon: <UserPlus className="w-4 h-4" />, color: 'text-blue-500' },
                  { labelEn: 'Commission', labelHe: 'עמלה', value: `${affiliateData.commission_rate || 10}%`, icon: <TrendingUp className="w-4 h-4" />, color: 'text-pink-500' },
                ].map((stat, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{isHe ? stat.labelHe : stat.labelEn}</span>
                      <span className={stat.color}>{stat.icon}</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-pink-500" />
                  {isHe ? 'הקישור שלך' : 'Your Link'}
                </h3>
                <div className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg">
                  <code className="flex-1 text-xs break-all text-muted-foreground">{affiliateLink}</code>
                  <Button size="sm" variant="outline" onClick={handleCopyAffiliateLink} className="shrink-0 gap-1">
                    <Copy className="w-3.5 h-3.5" />
                    {isHe ? 'העתק' : 'Copy'}
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {isHe ? 'שתף את הקישור הזה. כל רכישה דרכו תזכה אותך בעמלה.' : 'Share this link. Every purchase through it earns you a commission.'}
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-500" />
                  {isHe ? 'הפניות אחרונות' : 'Recent Referrals'}
                </h3>
                {affiliateReferrals.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">{isHe ? 'אין הפניות עדיין. שתף את הקישור שלך!' : 'No referrals yet. Share your link!'}</p>
                ) : (
                  <div className="space-y-2">
                    {affiliateReferrals.slice(0, 5).map((ref: any) => (
                      <div key={ref.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div className="space-y-0.5">
                          <p className="text-xs font-medium text-foreground">₪{ref.order_amount?.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(ref.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-end space-y-0.5">
                          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">+₪{ref.commission_amount?.toLocaleString()}</p>
                          <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            ref.status === 'approved' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : ref.status === 'paid' ? 'bg-accent/15 text-accent'
                            : 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400'
                          }`}>
                            {isHe ? (ref.status === 'approved' ? 'אושר' : ref.status === 'paid' ? 'שולם' : 'ממתין') : ref.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
