import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, DollarSign, TrendingUp, CheckCircle2, Clock, 
  AlertCircle, Loader2, Search, MoreHorizontal, Ban, Check,
  CreditCard, Plus, UserPlus
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminAffiliates = () => {
  const { t, isRTL } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<any>(null);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutNotes, setPayoutNotes] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");

  // Fetch affiliates with profiles
  const { data: affiliates = [], isLoading } = useQuery({
    queryKey: ["admin-affiliates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliates")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch all users (for creating affiliates)
  const { data: allUsers = [] } = useQuery({
    queryKey: ["admin-all-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .order("full_name", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Filter out users who are already affiliates
  const availableUsers = allUsers.filter(
    user => !affiliates.some(a => a.user_id === user.id)
  ).filter(
    user => (user.full_name || '').toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  // Fetch all referrals
  const { data: referrals = [] } = useQuery({
    queryKey: ["admin-referrals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliate_referrals")
        .select("*, affiliates(affiliate_code, profiles(full_name)), orders(amount)")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch all payouts
  const { data: payouts = [] } = useQuery({
    queryKey: ["admin-payouts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliate_payouts")
        .select("*, affiliates(affiliate_code, profiles(full_name))")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Update affiliate status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("affiliates")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-affiliates"] });
      toast({ title: t('common.success'), description: t('admin.affiliate.statusUpdated') });
    },
  });

  // Update referral status
  const updateReferralMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updateData: any = { status };
      if (status === 'approved') updateData.approved_at = new Date().toISOString();
      if (status === 'paid') updateData.paid_at = new Date().toISOString();
      
      const { error } = await supabase
        .from("affiliate_referrals")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-referrals"] });
      queryClient.invalidateQueries({ queryKey: ["admin-affiliates"] });
      toast({ title: t('common.success'), description: t('admin.affiliate.referralUpdated') });
    },
  });

  // Create payout
  const createPayoutMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAffiliate) return;
      
      const { error } = await supabase
        .from("affiliate_payouts")
        .insert({
          affiliate_id: selectedAffiliate.id,
          amount: parseFloat(payoutAmount),
          payment_method: selectedAffiliate.payment_method || 'bank_transfer',
          notes: payoutNotes,
          status: 'completed',
          completed_at: new Date().toISOString(),
        });
      
      if (error) throw error;

      // Update affiliate total_paid
      const { error: updateError } = await supabase
        .from("affiliates")
        .update({ 
          total_paid: (parseFloat(selectedAffiliate.total_paid) + parseFloat(payoutAmount))
        })
        .eq("id", selectedAffiliate.id);
      
      if (updateError) throw updateError;

      // Mark approved referrals as paid
      const { error: referralError } = await supabase
        .from("affiliate_referrals")
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq("affiliate_id", selectedAffiliate.id)
        .eq("status", 'approved');
      
      if (referralError) throw referralError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-affiliates"] });
      queryClient.invalidateQueries({ queryKey: ["admin-referrals"] });
      queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
      setPayoutDialogOpen(false);
      setPayoutAmount("");
      setPayoutNotes("");
      toast({ title: t('common.success'), description: t('admin.affiliate.payoutCreated') });
    },
  });

  // Generate unique affiliate code
  const generateAffiliateCode = (name: string) => {
    const baseName = (name || 'affiliate').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8);
    const randomNum = Math.floor(Math.random() * 100);
    return `${baseName}${randomNum}`;
  };

  // Create affiliate mutation
  const createAffiliateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUserId) throw new Error("No user selected");
      
      const selectedUser = allUsers.find(u => u.id === selectedUserId);
      const affiliateCode = generateAffiliateCode(selectedUser?.full_name || '');
      
      const { error } = await supabase
        .from("affiliates")
        .insert({
          user_id: selectedUserId,
          affiliate_code: affiliateCode,
          commission_rate: 20,
          status: 'active',
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-affiliates"] });
      setCreateDialogOpen(false);
      setSelectedUserId("");
      setUserSearchTerm("");
      toast({ title: t('common.success'), description: t('admin.affiliate.created') });
    },
    onError: (error: any) => {
      toast({ 
        title: t('common.error'), 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const filteredAffiliates = affiliates.filter(a =>
    a.affiliate_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.profiles?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEarnings = affiliates.reduce((sum, a) => sum + Number(a.total_earnings), 0);
  const totalPaid = affiliates.reduce((sum, a) => sum + Number(a.total_paid), 0);
  const pendingReferrals = referrals.filter(r => r.status === 'pending').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 me-1" />{t('admin.affiliate.active')}</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 me-1" />{t('admin.affiliate.pending')}</Badge>;
      case 'suspended':
        return <Badge variant="destructive"><Ban className="h-3 w-3 me-1" />{t('admin.affiliate.suspended')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const openPayoutDialog = (affiliate: any) => {
    setSelectedAffiliate(affiliate);
    const pendingAmount = Number(affiliate.total_earnings) - Number(affiliate.total_paid);
    setPayoutAmount(pendingAmount.toFixed(2));
    setPayoutDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('admin.affiliate.title')}</h1>
          <p className="text-muted-foreground">{t('admin.affiliate.subtitle')}</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <UserPlus className="h-4 w-4 me-2" />
          {t('admin.affiliate.createAffiliate')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="h-4 w-4" />
              <span className="text-sm">{t('admin.affiliate.totalAffiliates')}</span>
            </div>
            <p className="text-3xl font-bold">{affiliates.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">{t('admin.affiliate.totalCommissions')}</span>
            </div>
            <p className="text-3xl font-bold">₪{totalEarnings.toFixed(0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">{t('admin.affiliate.totalPaid')}</span>
            </div>
            <p className="text-3xl font-bold text-green-500">₪{totalPaid.toFixed(0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{t('admin.affiliate.pendingReferrals')}</span>
            </div>
            <p className="text-3xl font-bold text-amber-500">{pendingReferrals}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="affiliates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="affiliates">{t('admin.affiliate.affiliates')}</TabsTrigger>
          <TabsTrigger value="referrals">
            {t('admin.affiliate.referrals')}
            {pendingReferrals > 0 && (
              <Badge variant="destructive" className="ms-2">{pendingReferrals}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="payouts">{t('admin.affiliate.payouts')}</TabsTrigger>
        </TabsList>

        <TabsContent value="affiliates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('admin.affiliate.allAffiliates')}</CardTitle>
              <div className="relative w-64">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('common.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ps-9"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.affiliate.code')}</TableHead>
                    <TableHead>{t('admin.affiliate.name')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead>{t('admin.affiliate.commission')}</TableHead>
                    <TableHead>{t('admin.affiliate.earnings')}</TableHead>
                    <TableHead>{t('admin.affiliate.paid')}</TableHead>
                    <TableHead>{t('admin.affiliate.pending')}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAffiliates.map((affiliate) => {
                    const pending = Number(affiliate.total_earnings) - Number(affiliate.total_paid);
                    return (
                      <TableRow key={affiliate.id}>
                        <TableCell className="font-mono font-bold">{affiliate.affiliate_code}</TableCell>
                        <TableCell>{affiliate.profiles?.full_name || '-'}</TableCell>
                        <TableCell>{getStatusBadge(affiliate.status)}</TableCell>
                        <TableCell>{affiliate.commission_rate}%</TableCell>
                        <TableCell>₪{Number(affiliate.total_earnings).toFixed(0)}</TableCell>
                        <TableCell className="text-green-500">₪{Number(affiliate.total_paid).toFixed(0)}</TableCell>
                        <TableCell className="text-amber-500">₪{pending.toFixed(0)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {affiliate.status === 'pending' && (
                                <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: affiliate.id, status: 'active' })}>
                                  <Check className="h-4 w-4 me-2" />
                                  {t('admin.affiliate.approve')}
                                </DropdownMenuItem>
                              )}
                              {affiliate.status === 'active' && (
                                <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: affiliate.id, status: 'suspended' })}>
                                  <Ban className="h-4 w-4 me-2" />
                                  {t('admin.affiliate.suspend')}
                                </DropdownMenuItem>
                              )}
                              {affiliate.status === 'suspended' && (
                                <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: affiliate.id, status: 'active' })}>
                                  <Check className="h-4 w-4 me-2" />
                                  {t('admin.affiliate.reactivate')}
                                </DropdownMenuItem>
                              )}
                              {pending > 0 && (
                                <DropdownMenuItem onClick={() => openPayoutDialog(affiliate)}>
                                  <CreditCard className="h-4 w-4 me-2" />
                                  {t('admin.affiliate.createPayout')}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.affiliate.allReferrals')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.date')}</TableHead>
                    <TableHead>{t('admin.affiliate.affiliateCode')}</TableHead>
                    <TableHead>{t('admin.affiliate.orderAmount')}</TableHead>
                    <TableHead>{t('admin.affiliate.commission')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell>{format(new Date(referral.created_at), 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="font-mono">{referral.affiliates?.affiliate_code}</TableCell>
                      <TableCell>₪{Number(referral.order_amount).toFixed(0)}</TableCell>
                      <TableCell className="font-bold text-primary">₪{Number(referral.commission_amount).toFixed(0)}</TableCell>
                      <TableCell>
                        {referral.status === 'pending' && <Badge variant="secondary">{t('admin.affiliate.pending')}</Badge>}
                        {referral.status === 'approved' && <Badge className="bg-blue-500">{t('admin.affiliate.approved')}</Badge>}
                        {referral.status === 'paid' && <Badge className="bg-green-500">{t('admin.affiliate.paid')}</Badge>}
                        {referral.status === 'rejected' && <Badge variant="destructive">{t('admin.affiliate.rejected')}</Badge>}
                      </TableCell>
                      <TableCell>
                        {referral.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => updateReferralMutation.mutate({ id: referral.id, status: 'approved' })}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => updateReferralMutation.mutate({ id: referral.id, status: 'rejected' })}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.affiliate.payoutHistory')}</CardTitle>
            </CardHeader>
            <CardContent>
              {payouts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('admin.affiliate.noPayoutsYet')}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('common.date')}</TableHead>
                      <TableHead>{t('admin.affiliate.affiliateCode')}</TableHead>
                      <TableHead>{t('admin.affiliate.amount')}</TableHead>
                      <TableHead>{t('admin.affiliate.method')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead>{t('admin.affiliate.notes')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell>{format(new Date(payout.created_at), 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="font-mono">{payout.affiliates?.affiliate_code}</TableCell>
                        <TableCell className="font-bold">₪{Number(payout.amount).toFixed(0)}</TableCell>
                        <TableCell>{payout.payment_method}</TableCell>
                        <TableCell>
                          {payout.status === 'completed' && <Badge className="bg-green-500">{t('admin.affiliate.completed')}</Badge>}
                          {payout.status === 'pending' && <Badge variant="secondary">{t('admin.affiliate.processing')}</Badge>}
                          {payout.status === 'failed' && <Badge variant="destructive">{t('admin.affiliate.failed')}</Badge>}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{payout.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payout Dialog */}
      <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
        <DialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{t('admin.affiliate.createPayout')}</DialogTitle>
            <DialogDescription>
              {t('admin.affiliate.createPayoutFor')} {selectedAffiliate?.affiliate_code}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('admin.affiliate.amount')}</Label>
              <Input
                type="number"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t('admin.affiliate.notes')}</Label>
              <Textarea
                value={payoutNotes}
                onChange={(e) => setPayoutNotes(e.target.value)}
                placeholder={t('admin.affiliate.notesPlaceholder')}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayoutDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={() => createPayoutMutation.mutate()} disabled={createPayoutMutation.isPending}>
              {createPayoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin me-2" />
              ) : (
                <CreditCard className="h-4 w-4 me-2" />
              )}
              {t('admin.affiliate.confirmPayout')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Affiliate Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{t('admin.affiliate.createAffiliate')}</DialogTitle>
            <DialogDescription>
              {t('admin.affiliate.createAffiliateDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('admin.affiliate.selectUser')}</Label>
              <div className="mt-2 space-y-2">
                <div className="relative">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('common.search')}
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="ps-9"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto border rounded-md">
                  {availableUsers.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      {t('admin.affiliate.noUsersAvailable')}
                    </div>
                  ) : (
                    availableUsers.slice(0, 20).map((user) => (
                      <div 
                        key={user.id}
                        onClick={() => setSelectedUserId(user.id)}
                        className={`p-3 cursor-pointer hover:bg-muted transition-colors border-b last:border-b-0 ${
                          selectedUserId === user.id ? 'bg-primary/10 border-primary' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {selectedUserId === user.id && <Check className="h-4 w-4 text-primary" />}
                          <span className="font-medium">{user.full_name || t('common.unknown')}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setCreateDialogOpen(false);
              setSelectedUserId("");
              setUserSearchTerm("");
            }}>
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={() => createAffiliateMutation.mutate()} 
              disabled={!selectedUserId || createAffiliateMutation.isPending}
            >
              {createAffiliateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin me-2" />
              ) : (
                <UserPlus className="h-4 w-4 me-2" />
              )}
              {t('admin.affiliate.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAffiliates;
