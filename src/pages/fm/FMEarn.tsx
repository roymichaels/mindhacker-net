import { useState } from 'react';
import { Clock, Coins, Search, Send, CheckCircle2, Loader2, XCircle } from 'lucide-react';
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
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [submission, setSubmission] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState<'browse' | 'my'>('browse');

  // Map bounty_id to user's claim status
  const claimsByBounty = new Map(claims.map((c: any) => [c.bounty_id, c]));

  const filtered = bounties.filter((b: Bounty) => {
    if (filter !== 'all' && b.category !== filter) return false;
    if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleSubmitClaim = async (bountyId: string) => {
    if (!user?.id || !submission.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('fm_bounty_claims').insert({
        bounty_id: bountyId,
        user_id: user.id,
        submission_data: { text: submission.trim() },
      });
      if (error) throw error;
      toast.success(isHe ? 'הגשה נשלחה! תקבל MOS לאחר אישור.' : 'Submission sent! You\'ll receive MOS after review.');
      setClaimingId(null);
      setSubmission('');
      queryClient.invalidateQueries({ queryKey: ['fm-claims'] });
      queryClient.invalidateQueries({ queryKey: ['fm-bounties'] });
    } catch (e: any) {
      toast.error(e.message || 'Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  const getClaimBadge = (status: string) => {
    switch (status) {
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

  return (
    <div className="space-y-4 max-w-2xl mx-auto w-full py-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">{isHe ? 'הרוויח MOS' : 'Earn MOS'}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isHe ? 'השלם משימות וקבל תגמול' : 'Complete tasks and get rewarded'}
        </p>
      </div>

      {/* Tabs: Browse / My Claims */}
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
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder={isHe ? 'חפש באונטיז...' : 'Search bounties...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filters */}
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

          {/* Bounty list */}
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

                      {claimingId === bounty.id ? (
                        <div className="space-y-2 pt-1">
                          <Textarea
                            placeholder={isHe ? 'הזן את ההגשה שלך...' : 'Enter your submission...'}
                            value={submission}
                            onChange={(e) => setSubmission(e.target.value)}
                            rows={3}
                            className="text-sm"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSubmitClaim(bounty.id)} disabled={!submission.trim() || submitting} className="gap-1">
                              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                              {isHe ? 'שלח' : 'Submit'}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => { setClaimingId(null); setSubmission(''); }}>
                              {isHe ? 'ביטול' : 'Cancel'}
                            </Button>
                          </div>
                        </div>
                      ) : existingClaim ? null : (
                        <Button size="sm" onClick={() => { setClaimingId(bounty.id); setSubmission(''); }}>
                          {isHe ? 'התחל →' : 'Start →'}
                        </Button>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </>
      ) : (
        /* My Claims tab */
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
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
