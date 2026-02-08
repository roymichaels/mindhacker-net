import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, DollarSign, TrendingUp, CheckCircle2 } from "lucide-react";

const AffiliateSignup = () => {
  const { user } = useAuth();
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [affiliateCode, setAffiliateCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");

  const signupMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error(t('affiliate.mustBeLoggedIn'));
      
      // Check if already an affiliate
      const { data: existing } = await supabase
        .from("affiliates")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (existing) {
        throw new Error(t('affiliate.alreadyAffiliate'));
      }
      
      // Check if code is unique
      const { data: codeExists } = await supabase
        .from("affiliates")
        .select("id")
        .eq("affiliate_code", affiliateCode.toLowerCase())
        .maybeSingle();
      
      if (codeExists) {
        throw new Error(t('affiliate.codeTaken'));
      }
      
      // Create affiliate
      const { error } = await supabase
        .from("affiliates")
        .insert({
          user_id: user.id,
          affiliate_code: affiliateCode.toLowerCase(),
          payment_method: paymentMethod,
          payment_details: { email: paymentDetails },
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: t('affiliate.signupSuccess'),
        description: t('affiliate.signupSuccessDesc'),
      });
      navigate("/affiliate-dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!affiliateCode || !paymentMethod || !paymentDetails) {
      toast({
        title: t('common.error'),
        description: t('affiliate.fillAllFields'),
        variant: "destructive",
      });
      return;
    }
    signupMutation.mutate();
  };

  if (!user) {
    return (
      <div className="min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
        <Header />
        <main className="container mx-auto px-4 py-20">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <p className="mb-4">{t('affiliate.mustBeLoggedIn')}</p>
              <Button onClick={() => navigate("/login?redirectTo=/affiliate-signup")}>
                {t('common.login')}
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
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 cyber-glow">{t('affiliate.joinProgram')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('affiliate.programDescription')}
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <Card className="glass-panel">
            <CardContent className="pt-6 text-center">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-bold mb-2">{t('affiliate.benefit1Title')}</h3>
              <p className="text-sm text-muted-foreground">{t('affiliate.benefit1Desc')}</p>
            </CardContent>
          </Card>
          <Card className="glass-panel">
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-bold mb-2">{t('affiliate.benefit2Title')}</h3>
              <p className="text-sm text-muted-foreground">{t('affiliate.benefit2Desc')}</p>
            </CardContent>
          </Card>
          <Card className="glass-panel">
            <CardContent className="pt-6 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-bold mb-2">{t('affiliate.benefit3Title')}</h3>
              <p className="text-sm text-muted-foreground">{t('affiliate.benefit3Desc')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Signup Form */}
        <Card className="max-w-lg mx-auto glass-panel">
          <CardHeader>
            <CardTitle>{t('affiliate.signupTitle')}</CardTitle>
            <CardDescription>{t('affiliate.signupSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code">{t('affiliate.yourCode')}</Label>
                <Input
                  id="code"
                  placeholder={t('affiliate.codePlaceholder')}
                  value={affiliateCode}
                  onChange={(e) => setAffiliateCode(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                  maxLength={20}
                />
                <p className="text-xs text-muted-foreground">
                  {t('affiliate.codeHint')} mindos.app?ref={affiliateCode || 'yourcode'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment">{t('affiliate.paymentMethod')}</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('affiliate.selectPaymentMethod')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="bit">Bit</SelectItem>
                    <SelectItem value="paybox">Paybox</SelectItem>
                    <SelectItem value="bank_transfer">{t('affiliate.bankTransfer')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">{t('affiliate.paymentDetails')}</Label>
                <Input
                  id="details"
                  placeholder={paymentMethod === 'paypal' ? 'email@example.com' : t('affiliate.paymentDetailsPlaceholder')}
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                />
              </div>

              {/* Terms */}
              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">{t('affiliate.termsTitle')}</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                    {t('affiliate.term1')}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                    {t('affiliate.term2')}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                    {t('affiliate.term3')}
                  </li>
                </ul>
              </div>

              <Button type="submit" className="w-full" disabled={signupMutation.isPending}>
                {signupMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin me-2" />
                    {t('common.loading')}
                  </>
                ) : (
                  t('affiliate.submitApplication')
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AffiliateSignup;
