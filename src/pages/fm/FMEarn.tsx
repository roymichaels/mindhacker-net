import { useState } from 'react';
import { Clock, Coins, Search, Send, CheckCircle2, Loader2, XCircle, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/useTranslation';
import { useFMBounties, useFMClaims } from '@/hooks/useFMWallet';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import type { Database } from '@/integrations/supabase/types';

type Bounty = Database['public']['Tables']['fm_bounties']['Row'];

const CATEGORY_FILTERS = ['all', 'writing', 'labeling', 'feedback', 'design', 'translation'];

export default function FMEarn() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: bounties = [], isLoading } = useFMBounties();
  const { data: claims = [] } = useFMClaims();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [submittingClaimId, setSubmittingClaimId] = useState<string | null>(null);
  const [submission, setSubmission] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [tab, setTab] = useState<'browse' | 'my'>('browse');

  // Map bounty_id to user's claim
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

  // Step 1: Claim a bounty (reserves a slot)
  const handleClaim = async (bountyId: string) => {
    if (!user?.id) return;
    setLoading(bountyId);
    try {
      const { data, error } = await supabase.rpc('fm_claim_bounty', { p_bounty_id: bountyId });
      if (error) throw error;
      const result = typeof data === 'string' ? JSON.parse(data) : data;
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isHe ? 'נתפס! הזן את ההגשה שלך.' : 'Claimed! Enter your submission.');
      invalidateAll();
    } catch (e: any) {
      toast.error(e.message || 'Failed to claim');
    } finally {
      setLoading(null);
    }
  };

  // Step 2: Submit work for a claimed bounty
  const handleSubmit = async (claimId: string) => {
    if (!user?.id || !submission.trim()) return;
    setLoading(claimId);
    try {
      const { data, error } = await supabase.rpc('fm_submit_bounty_claim', {
        p_claim_id: claimId,
        p_submission: { text: submission.trim() },
      });
      if (error) throw error;
      const result = typeof data === 'string' ? JSON.parse(data) : data;
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isHe ? 'הגשה נשלחה! תקבל MOS לאחר אישור.' : 'Submitted! You\'ll receive MOS after review.');
      setSubmittingClaimId(null);
      setSubmission('');
      invalidateAll();
    } catch (e: any) {
      toast.error(e.message || 'Failed to submit');
    } finally {
      setLoading(null);
    }
  };

  const getClaimBadge = (status: string) => {
    switch (status) {
      case 'claimed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400">
            <PlayCircle className="w-3 h-3" /> {isHe ? 'נתפס - ממתין להגשה' : 'Claimed'}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-600 dark:text-yellow-400">
            <Loader2 className="w-3 h-3 animate-spin" /> {isHe ? 'ממתין לאישור' : 'Pending review'}
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-3 h-3" /> {isHe ? 'אושר ✓' : 'Approved ✓'}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400">
            <XCircle className="w-3 h-3" /> {isHe ? 'נדחה' : 'Rejected'}
          </span>
        );
      default:
        return null;
    }
  };

  const renderBountyActions = (bounty: Bounty) => {
    const existingClaim = claimsByBounty.get(bounty.id);
    const isLoading = loading === bounty.id || loading === existingClaim?.id;

    // No claim yet → show "Start" to claim
    if (!existingClaim) {
      return (
        <Button size="sm" onClick={() => handleClaim(bounty.id)} disabled={isLoading} className="gap-1">
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlayCircle className="w-3.5 h-3.5" />}
          {isHe ? 'התחל →' : 'Start →'}
        </Button>
      );
    }

    // Claimed but not submitted → show submission form
    if (existingClaim.status === 'claimed') {
      if (submittingClaimId === existingClaim.id) {
        return (
          <div className="space-y-2 pt-1">
            <Textarea
              placeholder={isHe ? 'הזן את ההגשה שלך...' : 'Enter your submission...'}
              value={submission}
              onChange={(e) => setSubmission(e.target.value)}
              rows={3}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleSubmit(existingClaim.id)} disabled={!submission.trim() || isLoading} className="gap-1">
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
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
          <Send className="w-3.5 h-3.5" />
          {isHe ? 'הגש עבודה' : 'Submit Work'}
        </Button>
      );
    }

    // Pending/approved/rejected → no action, badge shown
    return null;
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto w-full py-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">{isHe ? 'הרוויח MOS' : 'Earn MOS'}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isHe ? 'השלם משימות וקבל תגמול' : 'Complete tasks and get rewarded'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
        <button
          onClick={() => setTab('browse')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
            tab === 'browse' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          {isHe ? 'באונטיז' : 'Bounties'} ({bounties.length})
        </button>
        <button
          onClick={() => setTab('my')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
            tab === 'my' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          {isHe ? 'ההגשות שלי' : 'My Claims'} ({claims.length})
        </button>
      </div>

      {tab === 'browse' ? (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder={isHe ? 'חפש באונטיז...' : 'Search bounties...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORY_FILTERS.map((cat) => (
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

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">
                {isHe ? 'אין באונטיז כרגע.' : 'No bounties right now.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filtered.map((bounty: Bounty) => {
                  const existingClaim = claimsByBounty.get(bounty.id);
                  return (
                    <motion.div
                      key={bounty.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card border border-border rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <h3 className="font-semibold text-sm text-foreground">{bounty.title}</h3>
                          {bounty.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{bounty.description}</p>
                          )}
                        </div>
                        {existingClaim && getClaimBadge(existingClaim.status)}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-accent" />
                          <span className="font-semibold text-foreground">{bounty.reward_mos} MOS</span>
                        </span>
                        {bounty.estimated_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> ~{bounty.estimated_minutes} min
                          </span>
                        )}
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
      ) : (
        <div className="space-y-3">
          {claims.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">
                {isHe ? 'אין הגשות עדיין. התחל להרוויח!' : 'No claims yet. Start earning!'}
              </p>
              <Button size="sm" className="mt-3" onClick={() => setTab('browse')}>
                {isHe ? 'עבור לבאונטיז' : 'Browse Bounties'}
              </Button>
            </div>
          ) : (
            claims.map((claim: any) => (
              <div key={claim.id} className="bg-card border border-border rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-foreground">
                      {claim.fm_bounties?.title || 'Bounty'}
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(claim.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {getClaimBadge(claim.status)}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Coins className="w-3.5 h-3.5 text-accent" />
                  <span className="font-semibold text-foreground">
                    {claim.fm_bounties?.reward_mos || 0} MOS
                  </span>
                  {claim.fm_bounties?.category && (
                    <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium">
                      {claim.fm_bounties.category}
                    </span>
                  )}
                </div>
                {/* Show submit button for claimed-but-not-submitted */}
                {claim.status === 'claimed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 mt-1"
                    onClick={() => {
                      setTab('browse');
                      setSubmittingClaimId(claim.id);
                      setSubmission('');
                    }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isHe ? 'הגש עבודה' : 'Submit Work'}
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
