import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Calendar, Package } from "lucide-react";
import MatrixRain from "@/components/MatrixRain";
import Header from "@/components/Header";
import { handleError } from "@/lib/errorHandling";

interface Purchase {
  id: string;
  package_type: string;
  sessions_total: number;
  sessions_remaining: number;
  price: number;
  payment_status: string;
  purchase_date: string;
  booking_link: string | null;
}

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const purchaseId = searchParams.get("purchaseId");
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

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

      setUserEmail(user.email || "");

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
      }
    } catch (error) {
      handleError(error, "שגיאה בטעינת פרטי הרכישה", "Success.fetchPurchase");
      setPurchase(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = () => {
    const bookingUrl = purchase?.booking_link || `https://calendly.com/consciousness-hacker?email=${encodeURIComponent(userEmail)}`;
    window.open(bookingUrl, "_blank");
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
              <CardTitle className="text-2xl text-center cyber-glow">
                רכישה לא נמצאה
              </CardTitle>
              <CardDescription className="text-center">
                לא הצלחנו למצוא את פרטי הרכישה
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button onClick={() => navigate("/dashboard")} className="w-full">
                חזור ללוח הבקרה
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
    <div className="relative min-h-screen">
      {/* Matrix rain background effect */}
      <MatrixRain />
      
      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,240,255,0.02)_50%)] bg-[length:100%_4px] opacity-30" style={{ zIndex: 1 }} />
      
      {/* Header */}
      <Header />
      
      {/* Main content */}
      <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-2xl w-full space-y-8">
          {/* Success Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4">
              <CheckCircle2 className="w-10 h-10 text-primary cyber-glow" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black cyber-glow">
              הרכישה הושלמה בהצלחה! 🎉
            </h1>
            {purchase.payment_status === "demo" && (
              <p className="text-lg text-accent">
                זוהי רכישת דמו - לא בוצע חיוב אמיתי
              </p>
            )}
          </div>

          {/* Purchase Details Card */}
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-2xl cyber-glow">פרטי הרכישה</CardTitle>
              <CardDescription>
                הנה סיכום הרכישה שלך
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span className="text-sm">חבילה</span>
                  </div>
                  <p className="font-semibold">
                    {purchase.package_type === "single" ? "פגישה בודדת" : "חבילת 4 פגישות"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">פגישות כוללות</p>
                  <p className="font-semibold">{purchase.sessions_total}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">פגישות נותרו</p>
                  <p className="font-semibold text-primary">{purchase.sessions_remaining}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">מחיר</p>
                  <p className="font-semibold">₪{purchase.price}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button 
                  onClick={handleBookSession} 
                  className="w-full gap-2"
                  size="lg"
                >
                  <Calendar className="h-5 w-5" />
                  קבע פגישה עכשיו
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => navigate("/dashboard")} 
              variant="outline"
              className="flex-1"
            >
              לוח הבקרה שלי
            </Button>
            <Button 
              onClick={() => navigate("/")} 
              variant="outline"
              className="flex-1"
            >
              חזור לדף הבית
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;
