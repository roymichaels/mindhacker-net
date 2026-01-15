import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Copy, Link, DollarSign, Users, TrendingUp, CheckCircle2, 
  Clock, AlertCircle, Loader2, ExternalLink 
} from "lucide-react";
import { format } from "date-fns";

const AffiliateDashboard = () => {
  const { user } = useAuth();
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  // Fetch affiliate data
  const { data: affiliate, isLoading: affiliateLoading } = useQuery({
    queryKey: ["affiliate", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("affiliates")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch referrals
  const { data: referrals = [] } = useQuery({
    queryKey: ["affiliate-referrals", affiliate?.id],
    queryFn: async () => {
      if (!affiliate) return [];
      const { data, error } = await supabase
        .from("affiliate_referrals")
        .select("*, orders(id, amount, created_at)")
        .eq("affiliate_id", affiliate.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!affiliate,
  });

  // Fetch payouts
  const { data: payouts = [] } = useQuery({
    queryKey: ["affiliate-payouts", affiliate?.id],
    queryFn: async () => {
      if (!affiliate) return [];
      const { data, error } = await supabase
        .from("affiliate_payouts")
        .select("*")
        .eq("affiliate_id", affiliate.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!affiliate,
  });

  const affiliateLink = affiliate 
    ? `${window.location.origin}?ref=${affiliate.affiliate_code}` 
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    toast({ title: t('affiliate.linkCopied') });
    setTimeout(() => setCopied(false), 2000);
  };

  const pendingEarnings = referrals
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + Number(r.commission_amount), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 me-1" />{t('affiliate.statusPending')}</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircle2 className="h-3 w-3 me-1" />{t('affiliate.statusApproved')}</Badge>;
      case 'paid':
        return <Badge className="bg-green-500"><DollarSign className="h-3 w-3 me-1" />{t('affiliate.statusPaid')}</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 me-1" />{t('affiliate.statusRejected')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
        <Header />
        <main className="container mx-auto px-4 py-20">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <p className="mb-4">{t('affiliate.mustBeLoggedIn')}</p>
              <Button onClick={() => navigate("/login?redirectTo=/affiliate-dashboard")}>
                {t('common.login')}
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (affiliateLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
        <Header />
        <main className="container mx-auto px-4 py-20">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-6">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-bold mb-2">{t('affiliate.notAffiliate')}</h2>
              <p className="text-muted-foreground mb-6">{t('affiliate.joinToStart')}</p>
              <Button onClick={() => navigate("/affiliate-signup")}>
                {t('affiliate.joinProgram')}
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold cyber-glow">{t('affiliate.dashboard')}</h1>
              <p className="text-muted-foreground">{t('affiliate.welcomeBack')}</p>
            </div>
            {affiliate.status === 'pending' && (
              <Badge variant="secondary" className="text-sm">
                <Clock className="h-4 w-4 me-1" />
                {t('affiliate.pendingApproval')}
              </Badge>
            )}
            {affiliate.status === 'suspended' && (
              <Badge variant="destructive" className="text-sm">
                <AlertCircle className="h-4 w-4 me-1" />
                {t('affiliate.suspended')}
              </Badge>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="glass-panel">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{t('affiliate.totalReferrals')}</span>
                </div>
                <p className="text-3xl font-bold">{referrals.length}</p>
              </CardContent>
            </Card>
            <Card className="glass-panel">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">{t('affiliate.totalEarnings')}</span>
                </div>
                <p className="text-3xl font-bold">₪{Number(affiliate.total_earnings).toFixed(0)}</p>
              </CardContent>
            </Card>
            <Card className="glass-panel">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{t('affiliate.pendingEarnings')}</span>
                </div>
                <p className="text-3xl font-bold text-amber-500">₪{pendingEarnings.toFixed(0)}</p>
              </CardContent>
            </Card>
            <Card className="glass-panel">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">{t('affiliate.paidEarnings')}</span>
                </div>
                <p className="text-3xl font-bold text-green-500">₪{Number(affiliate.total_paid).toFixed(0)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Referral Link */}
          <Card className="glass-panel mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                {t('affiliate.yourReferralLink')}
              </CardTitle>
              <CardDescription>{t('affiliate.shareToEarn')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={affiliateLink}
                  className="font-mono text-sm"
                  dir="ltr"
                />
                <Button onClick={copyLink} variant={copied ? "default" : "outline"}>
                  {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {t('affiliate.commissionRate')}: <span className="font-bold text-primary">{affiliate.commission_rate}%</span>
              </p>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="referrals" className="space-y-4">
            <TabsList>
              <TabsTrigger value="referrals">{t('affiliate.referrals')}</TabsTrigger>
              <TabsTrigger value="payouts">{t('affiliate.payouts')}</TabsTrigger>
              <TabsTrigger value="settings">{t('common.settings')}</TabsTrigger>
            </TabsList>

            <TabsContent value="referrals">
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle>{t('affiliate.yourReferrals')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {referrals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{t('affiliate.noReferralsYet')}</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('common.date')}</TableHead>
                          <TableHead>{t('affiliate.orderAmount')}</TableHead>
                          <TableHead>{t('affiliate.commission')}</TableHead>
                          <TableHead>{t('common.status')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {referrals.map((referral) => (
                          <TableRow key={referral.id}>
                            <TableCell>
                              {format(new Date(referral.created_at), 'dd/MM/yyyy')}
                            </TableCell>
                            <TableCell>₪{Number(referral.order_amount).toFixed(0)}</TableCell>
                            <TableCell className="font-bold text-primary">
                              ₪{Number(referral.commission_amount).toFixed(0)}
                            </TableCell>
                            <TableCell>{getStatusBadge(referral.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payouts">
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle>{t('affiliate.paymentHistory')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {payouts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{t('affiliate.noPayoutsYet')}</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('common.date')}</TableHead>
                          <TableHead>{t('affiliate.amount')}</TableHead>
                          <TableHead>{t('affiliate.method')}</TableHead>
                          <TableHead>{t('common.status')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payouts.map((payout) => (
                          <TableRow key={payout.id}>
                            <TableCell>
                              {format(new Date(payout.created_at), 'dd/MM/yyyy')}
                            </TableCell>
                            <TableCell className="font-bold">₪{Number(payout.amount).toFixed(0)}</TableCell>
                            <TableCell>{payout.payment_method}</TableCell>
                            <TableCell>
                              {payout.status === 'completed' ? (
                                <Badge className="bg-green-500">{t('affiliate.completed')}</Badge>
                              ) : payout.status === 'pending' ? (
                                <Badge variant="secondary">{t('affiliate.processing')}</Badge>
                              ) : (
                                <Badge variant="destructive">{t('affiliate.failed')}</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle>{t('affiliate.accountSettings')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{t('affiliate.yourCode')}</Label>
                    <Input readOnly value={affiliate.affiliate_code} className="mt-1" />
                  </div>
                  <div>
                    <Label>{t('affiliate.paymentMethod')}</Label>
                    <Input readOnly value={affiliate.payment_method || '-'} className="mt-1" />
                  </div>
                  <div>
                    <Label>{t('affiliate.paymentDetails')}</Label>
                    <Input 
                      readOnly 
                      value={(affiliate.payment_details as any)?.email || '-'} 
                      className="mt-1" 
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('affiliate.contactToUpdate')}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AffiliateDashboard;
