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

  useEffect(() => {
    if (purchaseId) {
      fetchPurchase();
    } else {
      setLoading(false);
    }
  }, [purchaseId]);

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
        handleError(error, "לא ניתן לטעון את פרטי הרכישה", "Success.fetchPurchase");
        setPurchase(null);
      } else {
        setPurchase(purchaseData);
        // Check if booking already exists
        if (purchaseData.booking_status !== "pending" || purchaseData.scheduled_date) {
          setBookingSubmitted(true);
        }
      }
    } catch (error) {
      handleError(error, "שגיאה בטעינת פרטי הרכישה", "Success.fetchPurchase");
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
        title: "🎉 בקשת הפגישה נשלחה בהצלחה!",
        description: "נחזור אליך בהקדם עם אישור. נתראה בפגישה שתשנה הכל!",
      });

      setBookingSubmitted(true);
      fetchPurchase(); // Refresh the purchase data
    } catch (error) {
      handleError(error, "שגיאה בשליחת בקשת הפגישה", "Success.handleBookingSubmit");
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
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]" dir="rtl">
          <Card className="max-w-md w-full glass-panel">
            <CardHeader>
              <CardTitle className="text-2xl text-center cyber-glow">
                ברוך הבא!
              </CardTitle>
              <CardDescription className="text-center">
                אין פרטי רכישה בכתובת זו
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button onClick={() => navigate("/dashboard")} className="w-full">
                לצפייה בכל הרכישות שלי
              </Button>
              <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                חזור לדף הבית
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
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]" dir="rtl">
          <Card className="max-w-md w-full glass-panel">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-destructive">
                שגיאה
              </CardTitle>
              <CardDescription className="text-center">
                לא נמצאו פרטי רכישה
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button onClick={() => navigate("/dashboard")} className="w-full">
                לצפייה בכל הרכישות שלי
              </Button>
              <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                חזור לדף הבית
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <MatrixRain />
      <div className="scanlines" />
      
      <Header />
      
      <div className="relative z-10 flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]" dir="rtl">
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
                🎉 מזל טוב! קיבלת את ההחלטה הנכונה
              </CardTitle>
              <CardDescription className="text-lg">
                הצעד הראשון לשינוי כבר נעשה. המציאות שלך עומדת להשתנות לנצח.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Purchase Details */}
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-2xl">פרטי החבילה שלך</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">סוג חבילה</p>
                  <p className="text-lg font-semibold">
                    {purchase.package_type === "single" ? "פגישה בודדת" : "חבילת 4 פגישות"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">מספר פגישות</p>
                  <p className="text-lg font-semibold">{purchase.sessions_total}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">מחיר</p>
                  <p className="text-lg font-semibold cyber-glow">₪{purchase.price}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">תאריך רכישה</p>
                  <p className="text-lg font-semibold">
                    {new Date(purchase.purchase_date).toLocaleDateString('he-IL')}
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="font-semibold">💳 לגבי התשלום:</p>
                <ul className="space-y-1 text-sm">
                  <li>• התשלום יתבצע לאחר הפגישה הראשונה</li>
                  <li>• ניתן לשלם דרך PayPal או העברה בנקאית</li>
                  <li>• פרטי התשלום ישלחו אליך לאחר הפגישה</li>
                  <li className="font-semibold mt-2">• המחיר הסופי: ₪{purchase.price}</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Booking Section */}
          {!bookingSubmitted ? (
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-2xl text-center cyber-glow">
                  עכשיו בוא נקבע את הפגישה שתשנה הכל
                </CardTitle>
                <CardDescription className="text-center text-base">
                  בחר את התאריך והשעה המועדפים עליך
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                  ✅ בקשת הפגישה נקלטה!
                </CardTitle>
                <CardDescription className="text-center text-base">
                  נחזור אליך בהקדם עם אישור הפגישה. נתראה בפגישה שתשנה הכל! 🚀
                </CardDescription>
              </CardHeader>
              {purchase.scheduled_date && purchase.scheduled_time && (
                <CardContent>
                  <div className="bg-primary/10 p-4 rounded-lg text-center space-y-2">
                    <p className="font-semibold">הבקשה שלך:</p>
                    <p>📅 {new Date(purchase.scheduled_date).toLocaleDateString('he-IL')}</p>
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
              <LayoutDashboard className="ml-2 h-5 w-5" />
              דאשבורד
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <Home className="ml-2 h-5 w-5" />
              חזור לדף הבית
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;
