/**
 * @page Admin FM Bounty Claims Review
 * @purpose MVP admin screen to approve/reject pending bounty claims
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle2, XCircle, Loader2, Search, Coins, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';

type ClaimStatus = 'pending' | 'approved' | 'rejected';

export default function AdminFMBounties() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('pending');
  const [search, setSearch] = useState('');
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { data: claims = [], isLoading } = useQuery({
    queryKey: ['admin-fm-claims', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('fm_bounty_claims')
        .select('*, fm_bounties(title, reward_mos, description, category), profiles:user_id(full_name, display_name, email)')
        .order('updated_at', { ascending: false })
        .limit(100);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = claims.filter((c: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const name = c.profiles?.full_name || c.profiles?.display_name || '';
    const title = c.fm_bounties?.title || '';
    return name.toLowerCase().includes(s) || title.toLowerCase().includes(s) || c.user_id.includes(s);
  });

  const handleAction = async (claimId: string, action: 'approve' | 'reject') => {
    setActionLoading(claimId);
    try {
      const { data, error } = await supabase.rpc('fm_approve_bounty_claim', {
        p_claim_id: claimId,
        p_action: action,
      });
      if (error) throw error;
      const result = typeof data === 'string' ? JSON.parse(data) : data;
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(
        action === 'approve'
          ? (isHe ? `אושר! ${result.mos_paid} MOS שולמו` : `Approved! ${result.mos_paid} MOS paid`)
          : (isHe ? 'נדחה' : 'Rejected')
      );
      setSelectedClaim(null);
      setRejectReason('');
      queryClient.invalidateQueries({ queryKey: ['admin-fm-claims'] });
    } catch (e: any) {
      toast.error(e.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const getProfileName = (claim: any) => {
    const p = claim.profiles;
    if (!p) return claim.user_id.slice(0, 8) + '...';
    return p.full_name || p.display_name || p.email || claim.user_id.slice(0, 8);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">{isHe ? 'ניהול באונטי FM' : 'FM Bounty Claims'}</h2>
        <p className="text-xs text-muted-foreground">{isHe ? 'אשר או דחה הגשות באונטי' : 'Review and approve/reject bounty submissions'}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === s
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {s === 'all' ? (isHe ? 'הכל' : 'All') : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            className="pl-8 h-8 w-48 text-xs"
            placeholder={isHe ? 'חפש...' : 'Search...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Claims list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">
          {isHe ? 'אין הגשות.' : 'No claims found.'}
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-xs text-muted-foreground">
                <th className="text-left p-3 font-medium">{isHe ? 'באונטי' : 'Bounty'}</th>
                <th className="text-left p-3 font-medium">{isHe ? 'משתמש' : 'User'}</th>
                <th className="text-left p-3 font-medium">{isHe ? 'תגמול' : 'Reward'}</th>
                <th className="text-left p-3 font-medium">{isHe ? 'סטטוס' : 'Status'}</th>
                <th className="text-left p-3 font-medium">{isHe ? 'תאריך' : 'Date'}</th>
                <th className="text-right p-3 font-medium">{isHe ? 'פעולות' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((claim: any) => (
                <tr key={claim.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium text-foreground max-w-[200px] truncate">
                    {claim.fm_bounties?.title || '—'}
                  </td>
                  <td className="p-3 text-muted-foreground max-w-[150px] truncate">
                    {getProfileName(claim)}
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 text-foreground font-semibold">
                      <Coins className="w-3.5 h-3.5 text-accent" />
                      {claim.fm_bounties?.reward_mos || 0}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      claim.status === 'pending' ? 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400' :
                      claim.status === 'approved' ? 'bg-green-500/15 text-green-600 dark:text-green-400' :
                      'bg-red-500/15 text-red-600 dark:text-red-400'
                    }`}>
                      {claim.status}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {new Date(claim.updated_at).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setSelectedClaim(claim)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {claim.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                            disabled={actionLoading === claim.id}
                            onClick={() => handleAction(claim.id, 'approve')}
                          >
                            {actionLoading === claim.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                            disabled={actionLoading === claim.id}
                            onClick={() => { setSelectedClaim(claim); setRejectReason(''); }}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedClaim} onOpenChange={(open) => { if (!open) { setSelectedClaim(null); setRejectReason(''); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isHe ? 'פרטי הגשה' : 'Claim Details'}</DialogTitle>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">{isHe ? 'באונטי' : 'Bounty'}</p>
                  <p className="font-medium text-sm">{selectedClaim.fm_bounties?.title}</p>
                  {selectedClaim.fm_bounties?.description && (
                    <p className="text-xs text-muted-foreground mt-1">{selectedClaim.fm_bounties.description}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">{isHe ? 'משתמש' : 'User'}: </span>
                    <span className="text-foreground">{getProfileName(selectedClaim)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{isHe ? 'תגמול' : 'Reward'}: </span>
                    <span className="font-semibold text-foreground">{selectedClaim.fm_bounties?.reward_mos} MOS</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{isHe ? 'נוצר' : 'Created'}: </span>
                    <span>{new Date(selectedClaim.created_at).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{isHe ? 'עודכן' : 'Updated'}: </span>
                    <span>{new Date(selectedClaim.updated_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Submission preview */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">{isHe ? 'הגשה' : 'Submission'}</p>
                <pre className="bg-muted/50 rounded-lg p-3 text-xs overflow-auto max-h-48 whitespace-pre-wrap break-words">
                  {selectedClaim.submission_data
                    ? JSON.stringify(selectedClaim.submission_data, null, 2)
                    : (isHe ? 'אין נתוני הגשה' : 'No submission data')}
                </pre>
              </div>

              {/* Actions for pending claims */}
              {selectedClaim.status === 'pending' && (
                <div className="space-y-3 pt-2 border-t border-border">
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 gap-1"
                      disabled={actionLoading === selectedClaim.id}
                      onClick={() => handleAction(selectedClaim.id, 'approve')}
                    >
                      {actionLoading === selectedClaim.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      {isHe ? 'אשר ושלם MOS' : 'Approve & Pay MOS'}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      placeholder={isHe ? 'סיבת דחייה (אופציונלי)...' : 'Rejection reason (optional)...'}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={2}
                      className="text-xs"
                    />
                    <Button
                      variant="destructive"
                      className="w-full gap-1"
                      disabled={actionLoading === selectedClaim.id}
                      onClick={() => handleAction(selectedClaim.id, 'reject')}
                    >
                      {actionLoading === selectedClaim.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      {isHe ? 'דחה' : 'Reject'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
