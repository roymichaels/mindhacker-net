import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Home, LayoutDashboard } from "lucide-react";
import MatrixRain from "@/components/MatrixRain";
import Header from "@/components/Header";
import BookingCalendar from "@/components/BookingCalendar";
import { handleError } from "@/lib/errorHandling";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { formatPrice } from "@/lib/currency";

interface Purchase {
  id: string;
  package_type: string;
  sessions_total: number;
  sessions_remaining: number;
  price: number;
  payment_status: string;
  purchase_date: string;
  booking_status: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
}

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const purchaseId = searchParams.get("purchaseId");
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [calendlyLink, setCalendlyLink] = useState<string>("");
  const { t, isRTL, language } = useTranslation();

  const locale = language === 'he' ? 'he-IL' : 'en-US';

  useEffect(() => {
    fetchCalendlyLink();
    if (purchaseId) {
      fetchPurchase();
    } else {
      setLoading(false);
    }
  }, [purchaseId]);

  const fetchCalendlyLink = async () => {
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["calendly_link", "calendly_enabled"]);
      
      if (data) {
        const settings = data.reduce((acc: any, item) => {
          acc[item.setting_key] = item.setting_value;
          return acc;
        }, {});
        
        if (settings.calendly_enabled === 'true' && settings.calendly_link) {
          setCalendlyLink(settings.calendly_link);
        }
      }
    } catch (error) {
      handleError(error, t('success.calendlyLoadError'), "Success.fetchCalendlyLink");
    }
  };

  const fetchPurchase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: purchaseData, error } = await supabase
        .from("purchases")
        .select("*")
        .eq("id", purchaseId)
        .eq("user_id", user.id)
        .single();

      if (error || !purchaseData) {
        handleError(error, t('messages.loadError'), "Success.fetchPurchase");
        setPurchase(null);
      } else {
        setPurchase(purchaseData);
        if (purchaseData.booking_status !== "pending" || purchaseData.scheduled_date) {
          setBookingSubmitted(true);
        }
      }
    } catch (error) {
      handleError(error, t('messages.loadError'), "Success.fetchPurchase");
      setPurchase(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (date: Date | undefined, time: string, notes: string) => {
    if (!date || !purchaseId) return;

    setIsSubmittingBooking(true);

    try {
      const { error } = await supabase
        .from("purchases")
        .update({
          booking_status: "pending",
          scheduled_date: date.toISOString().split('T')[0],
          scheduled_time: time,
          booking_notes: notes || null,
        })
        .eq("id", purchaseId);

      if (error) throw error;

      toast({
        title: t('success.bookingRequestSuccess'),
        description: t('success.bookingRequestDesc'),
      });

      setBookingSubmitted(true);
      fetchPurchase();
    } catch (error) {
      handleError(error, t('success.bookingSubmitError'), "Success.handleBookingSubmit");
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
          <div className="h-96 w-full max-w-2xl animate-pulse bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (!purchaseId) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]" dir={isRTL ? 'rtl' : 'ltr'}>
          <Card className="max-w-md w-full glass-panel">
            <CardHeader>
              <CardTitle className="text-2xl text-center cyber-glow">
                {t('success.welcome')}
              </CardTitle>
              <CardDescription className="text-center">
                {t('success.noPurchaseId')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button onClick={() => navigate("/dashboard")} className="w-full">
                {t('success.viewPurchases')}
              </Button>
              <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                {t('notFound.goHome')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]" dir={isRTL ? 'rtl' : 'ltr'}>
          <Card className="max-w-md w-full glass-panel">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-destructive">
                {t('common.error')}
              </CardTitle>
              <CardDescription className="text-center">
                {t('success.purchaseNotFound')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button onClick={() => navigate("/dashboard")} className="w-full">
                {t('success.viewPurchases')}
              </Button>
              <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                {t('notFound.goHome')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const packageTypeLabel = purchase.package_type === "single" 
    ? t('sessions.singleSession') 
    : t('sessions.packageOf4');

  return (
    <div className="min-h-screen bg-background relative">
      <MatrixRain />
      
      <Header />
      
      <div className="relative z-10 flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-4xl space-y-6">
          {/* Success Header */}
          <Card className="glass-panel text-center">
            <CardHeader className="space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-primary/20 p-4">
                  <CheckCircle2 className="h-16 w-16 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl md:text-4xl cyber-glow">
                {t('success.congratulations')}
              </CardTitle>
              <CardDescription className="text-lg">
                {t('success.firstStep')}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Purchase Details */}
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-2xl">{t('success.packageDetails')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t('success.packageType')}</p>
                  <p className="text-lg font-semibold">{packageTypeLabel}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t('success.sessionsCount')}</p>
                  <p className="text-lg font-semibold">{purchase.sessions_total}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t('success.price')}</p>
                  <p className="text-lg font-semibold cyber-glow">{formatPrice(purchase.price, language)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t('success.purchaseDate')}</p>
                  <p className="text-lg font-semibold">
                    {new Date(purchase.purchase_date).toLocaleDateString(locale)}
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="font-semibold">{t('success.paymentInfo')}</p>
                <ul className="space-y-1 text-sm">
                  <li>• {t('success.paymentAfterSession')}</li>
                  <li>• {t('success.paymentMethods')}</li>
                  <li>• {t('success.paymentDetailsSent')}</li>
                  <li className="font-semibold mt-2">• {t('success.finalPrice')} {formatPrice(purchase.price, language)}</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Booking Section */}
          {!bookingSubmitted ? (
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-2xl text-center cyber-glow">
                  {t('success.scheduleSession')}
                </CardTitle>
                <CardDescription className="text-center text-base">
                  {calendlyLink ? t('success.scheduleNow') : t('success.selectPreferred')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {calendlyLink && (
                  <div className="text-center space-y-4">
                    <Button
                      onClick={() => window.open(calendlyLink, '_blank')}
                      size="lg"
                      className="w-full max-w-md bg-primary hover:bg-primary/90 text-primary-foreground cyber-glow"
                    >
                      {t('success.scheduleNow')}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      {t('success.orLeaveDetails')}
                    </p>
                  </div>
                )}
                <BookingCalendar 
                  onSubmit={handleBookingSubmit}
                  isSubmitting={isSubmittingBooking}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-2xl text-center cyber-glow">
                  {t('success.requestReceived')}
                </CardTitle>
                <CardDescription className="text-center text-base">
                  {t('success.willContactSoon')}
                </CardDescription>
              </CardHeader>
              {purchase.scheduled_date && purchase.scheduled_time && (
                <CardContent>
                  <div className="bg-primary/10 p-4 rounded-lg text-center space-y-2">
                    <p className="font-semibold">{t('success.yourRequest')}</p>
                    <p>📅 {new Date(purchase.scheduled_date).toLocaleDateString(locale)}</p>
                    <p>🕐 {purchase.scheduled_time}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col md:flex-row gap-4">
            <Button
              onClick={() => navigate("/dashboard")}
              variant="default"
              className="flex-1"
              size="lg"
            >
              <LayoutDashboard className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('common.dashboard')}
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <Home className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('notFound.goHome')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;