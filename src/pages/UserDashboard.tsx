import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Calendar, LogOut, Package, User, Clock, CheckCircle, BookOpen, Crown } from "lucide-react";
import Header from "@/components/Header";
import BookingDialog from "@/components/BookingDialog";
import MyCourses from "@/components/dashboard/MyCourses";
import MySubscriptions from "@/components/dashboard/MySubscriptions";
import { MyRecordings } from "@/components/dashboard/MyRecordings";
import MyAffiliatePanel from "@/components/dashboard/MyAffiliatePanel";
import { handleError } from "@/lib/errorHandling";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator";
import { useSEO } from "@/hooks/useSEO";
import { getBreadcrumbSchema } from "@/lib/seo";
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
  booking_notes: string | null;
}

interface Profile {
  full_name: string | null;
}

const UserDashboard = () => {
  const { t, isRTL, language } = useTranslation();
  
  // SEO Configuration
  useSEO({
    title: t('seo.dashboardTitle'),
    description: t('seo.dashboardDescription'),
    url: `${window.location.origin}/dashboard`,
    type: "website",
    structuredData: [
      getBreadcrumbSchema([
        { name: t('seo.breadcrumbHome'), url: window.location.origin },
        { name: t('seo.breadcrumbDashboard'), url: `${window.location.origin}/dashboard` },
      ]),
    ],
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);

  const dateLocale = language === 'he' ? 'he-IL' : 'en-US';

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      setUserEmail(user.email || "");

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch purchases
      const { data: purchasesData, error } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", user.id)
        .order("purchase_date", { ascending: false });

      if (error) throw error;

      setPurchases(purchasesData || []);
    } catch (error: any) {
      handleError(error, t('messages.loadError'), "UserDashboard.fetchUserData");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: t('messages.logoutSuccess'),
      description: t('messages.goodbye'),
    });
    navigate("/");
  };

  const handleOpenBooking = (purchaseId: string) => {
    setSelectedPurchaseId(purchaseId);
    setBookingDialogOpen(true);
  };

  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">{t('sessions.statusPending')}</Badge>;
      case "scheduled":
        return <Badge variant="default">{t('sessions.statusScheduled')}</Badge>;
      case "completed":
        return <Badge variant="secondary">{t('sessions.statusCompleted')}</Badge>;
      case "cancelled":
        return <Badge variant="destructive">{t('sessions.statusCancelled')}</Badge>;
      default:
        return <Badge variant="outline">{t('sessions.statusPending')}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "pending_session":
        return <Badge variant="outline">{t('sessions.paymentPending')}</Badge>;
      case "completed":
        return <Badge variant="default">{t('sessions.paymentCompleted')}</Badge>;
      case "cancelled":
        return <Badge variant="destructive">{t('sessions.statusCancelled')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pullToRefresh = usePullToRefresh({
    onRefresh: async () => {
      await fetchUserData();
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="p-8" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <PullToRefreshIndicator {...pullToRefresh} />
      <Header />
      <div className="p-4 md:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-panel p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1 min-w-0 max-w-full">
            <h1 className="text-lg sm:text-xl md:text-2xl font-black cyber-glow mb-1.5 truncate">
              {t('dashboard.welcome')}, <span className="truncate inline-block max-w-[140px] sm:max-w-[200px] md:max-w-sm align-bottom">{profile?.full_name || userEmail}</span>! 👋
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t('dashboard.welcomeBack')}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="w-full md:w-auto shrink-0">
            <LogOut className={isRTL ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
            {t('common.logout')}
          </Button>
        </div>

        {/* Dashboard Content - Organized with Tabs */}
        <Tabs defaultValue="courses" className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="overflow-x-auto pb-2 mb-6 sm:mb-8">
            <TabsList className="inline-flex min-w-full sm:grid sm:grid-cols-3 glass-panel h-auto">
              <TabsTrigger value="courses" className="flex items-center gap-1 sm:gap-2 whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4">
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                {t('dashboard.myProducts')}
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="flex items-center gap-1 sm:gap-2 whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4">
                <Crown className="h-3 w-3 sm:h-4 sm:w-4" />
                {t('dashboard.mySubscriptions')}
              </TabsTrigger>
              <TabsTrigger value="sessions" className="flex items-center gap-1 sm:gap-2 whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4">
                <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                {t('dashboard.mySessions')}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* My Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <MyCourses />
            <MyRecordings />
            <MyAffiliatePanel />
          </TabsContent>

          {/* My Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-6">
            <MySubscriptions />
          </TabsContent>

          {/* Sessions/Purchases Tab */}
          <TabsContent value="sessions" className="space-y-6">
            {/* Purchases Section */}
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                  <Package className="h-5 w-5 md:h-6 md:w-6" />
                  {t('sessions.myPackages')}
                </CardTitle>
                <CardDescription>
                  {t('sessions.packagesSubtitle')}
                </CardDescription>
              </CardHeader>
          <CardContent className="space-y-4">
            {purchases.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <Package className="h-16 w-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">{t('sessions.noPackages')}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t('sessions.buyPackageBtn')}
                  </p>
                  <Button asChild>
                    <Link to="/#pricing">
                      {t('sessions.buyPackage')}
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {purchases.map((purchase) => (
                  <Card key={purchase.id} className="bg-muted/30">
                    <CardHeader>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-2 flex-1">
                          <CardTitle className="text-lg">
                            {purchase.package_type === "single" 
                              ? t('sessions.singleSession')
                              : t('sessions.packageOf4')
                            }
                          </CardTitle>
                          <div className="flex flex-wrap gap-2">
                            {getBookingStatusBadge(purchase.booking_status)}
                            {getPaymentStatusBadge(purchase.payment_status)}
                          </div>
                        </div>
                        <div className={`${isRTL ? 'text-left' : 'text-right'} space-y-1`}>
                          <p className="text-2xl font-black cyber-glow">{formatPrice(purchase.price, language)}</p>
                          <p className="text-xs text-muted-foreground">
                            {t('sessions.purchasedOn')}{new Date(purchase.purchase_date).toLocaleDateString(dateLocale)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <p className="text-muted-foreground">{t('sessions.totalSessions')}</p>
                          <p className="font-semibold text-lg">{purchase.sessions_total}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground">{t('sessions.remainingSessions')}</p>
                          <p className="font-semibold text-lg">{purchase.sessions_remaining}</p>
                        </div>
                      </div>

                      {/* Booking Info */}
                      {purchase.scheduled_date && purchase.scheduled_time ? (
                        <div className="bg-primary/10 p-4 rounded-lg space-y-2">
                          <div className="flex items-center gap-2 font-semibold">
                            <CheckCircle className="h-4 w-4" />
                            <span>{t('sessions.yourSession')}</span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {new Date(purchase.scheduled_date).toLocaleDateString(dateLocale)}
                            </p>
                            <p className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {purchase.scheduled_time}
                            </p>
                          </div>
                          {purchase.booking_status === "pending" && (
                            <p className="text-xs text-muted-foreground">
                              {t('sessions.waitingApproval')}
                            </p>
                          )}
                        </div>
                      ) : (
                        <Button 
                          onClick={() => handleOpenBooking(purchase.id)}
                          className="w-full"
                          variant="default"
                        >
                          <Calendar className={isRTL ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
                          {t('sessions.scheduleSession')}
                        </Button>
                      )}

                      {/* Payment Info */}
                      {purchase.payment_status === "pending_session" && (
                        <div className="bg-muted/50 p-3 rounded-lg text-xs space-y-1">
                          <p className="font-semibold">{t('sessions.paymentInfo')}</p>
                          <p>{t('sessions.paymentAfterSession')}</p>
                          <p>{t('sessions.paymentMethods')}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>
        </Tabs>

        {/* Profile Section */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
              <User className="h-5 w-5 md:h-6 md:w-6" />
              {t('profile.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{t('profile.fullName')}</p>
                <p className="text-base md:text-lg font-semibold">
                  {profile?.full_name || t('profile.notDefined')}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{t('profile.email')}</p>
                <p className="text-base md:text-lg font-semibold">{userEmail}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>

      {/* Booking Dialog */}
      {selectedPurchaseId && (
        <BookingDialog
          isOpen={bookingDialogOpen}
          onClose={() => {
            setBookingDialogOpen(false);
            setSelectedPurchaseId(null);
          }}
          purchaseId={selectedPurchaseId}
          onBookingSuccess={fetchUserData}
        />
      )}
    </div>
  );
};

export default UserDashboard;
