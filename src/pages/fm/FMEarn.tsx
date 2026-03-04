import { useState } from 'react';
import { ArrowLeft, Clock, Coins, Search, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/useTranslation';
import { useFMBounties } from '@/hooks/useFMWallet';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Database } from '@/integrations/supabase/types';

type Bounty = Database['public']['Tables']['fm_bounties']['Row'];

const CATEGORY_FILTERS = ['all', 'writing', 'labeling', 'feedback', 'design', 'translation'];

export default function FMEarn() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: bounties = [], isLoading } = useFMBounties();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [submission, setSubmission] = useState('');

  const filtered = bounties.filter((b: Bounty) => {
    if (filter !== 'all' && b.category !== filter) return false;
    if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleClaim = async (bountyId: string) => {
    if (!user?.id) return;
    setClaimingId(bountyId);
    setSubmission('');
  };

  const handleSubmitClaim = async (bountyId: string) => {
    if (!user?.id || !submission.trim()) return;
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
    } catch (e: any) {
      toast.error(e.message || 'Failed to submit claim');
    }
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto w-full py-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/fm')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">{isHe ? 'הרוויח MOS' : 'Earn MOS'}</h1>
      </div>

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
            {isHe ? 'אין באונטיז כרגע. אורורה תודיע לך כשיהיו חדשים.' : 'No bounties right now. Aurora will notify you when new ones drop.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((bounty: Bounty) => (
              <motion.div
                key={bounty.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground">{bounty.title}</h3>
                    {bounty.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{bounty.description}</p>
                    )}
                  </div>
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
                      <Button size="sm" onClick={() => handleSubmitClaim(bounty.id)} disabled={!submission.trim()} className="gap-1">
                        <Send className="w-3.5 h-3.5" /> {isHe ? 'שלח' : 'Submit'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setClaimingId(null)}>
                        {isHe ? 'ביטול' : 'Cancel'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button size="sm" onClick={() => handleClaim(bounty.id)}>
                    {isHe ? 'התחל →' : 'Start →'}
                  </Button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
