import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Home, Calendar, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MatrixRain from "@/components/MatrixRain";
import { supabase } from "@/integrations/supabase/client";

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
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    fetchPurchase();
  }, [searchParams]);

  const fetchPurchase = async () => {
    try {
      const purchaseId = searchParams.get("purchaseId");
      
      if (!purchaseId) {
        navigate("/");
        return;
      }

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
        console.error("Error fetching purchase:", error);
        navigate("/");
        return;
      }

      setPurchase(purchaseData);
    } catch (error) {
      console.error("Error:", error);
      navigate("/");
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
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-96 w-full max-w-2xl" />
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel p-8 text-center">
          <p className="text-muted-foreground">רכישה לא נמצאה</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            חזור לעמוד הראשי
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <MatrixRain />
      
      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,240,255,0.02)_50%)] bg-[length:100%_4px] opacity-30" style={{ zIndex: 1 }} />
      
      <main className="relative min-h-screen flex items-center justify-center px-4 py-20" style={{ zIndex: 2 }}>
        <div className="max-w-2xl w-full">
          {/* Success Icon */}
          <div className="text-center mb-8 animate-scale-in">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/20 mb-6">
              <CheckCircle className="w-12 h-12 text-primary cyber-glow" />
            </div>
            <h1 className="text-5xl font-black mb-4 cyber-glow" dir="rtl">
              הרכישה הושלמה בהצלחה! 🎉
            </h1>
            <p className="text-xl text-accent mb-2" dir="rtl">
              {purchase.payment_status === "demo" && "זוהי רכישת דמו - לא בוצע חיוב אמיתי"}
            </p>
          </div>

          {/* Purchase Details */}
          <div className="glass-panel p-8 mb-8" dir="rtl">
            <h2 className="text-2xl font-bold mb-6 text-right">פרטי הרכישה</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-border/30">
                <span className="text-muted-foreground">מספר הזמנה:</span>
                <span className="font-mono text-primary text-sm">{purchase.id.slice(0, 13)}...</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-border/30">
                <span className="text-muted-foreground">חבילה:</span>
                <span className="font-bold">
                  {purchase.package_type === "single" ? "מפגש בודד" : "חבילת 4 מפגשים"}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-border/30">
                <span className="text-muted-foreground">מספר מפגשים:</span>
                <span className="font-bold">{purchase.sessions_total}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-border/30">
                <span className="text-muted-foreground">סכום:</span>
                <span className="font-bold text-primary cyber-glow">₪{purchase.price}</span>
              </div>
              
              <div className="flex justify-between items-center py-3">
                <span className="text-muted-foreground">תאריך רכישה:</span>
                <span>{new Date(purchase.purchase_date).toLocaleDateString("he-IL")}</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="glass-panel p-8 mb-8" dir="rtl">
            <h2 className="text-2xl font-bold mb-6 text-right">השלבים הבאים</h2>
            
            <div className="space-y-4 text-right">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center cyber-glow">
                  1
                </div>
                <div>
                  <h3 className="font-bold mb-1">קבע את המפגש הראשון שלך</h3>
                  <p className="text-muted-foreground text-sm">
                    לחץ על כפתור "קבע מפגש" למטה כדי לתאם את הזמן המתאים לך
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center cyber-glow">
                  2
                </div>
                <div>
                  <h3 className="font-bold mb-1">היכנס ללוח הבקרה שלך</h3>
                  <p className="text-muted-foreground text-sm">
                    בלוח הבקרה תוכל לראות את כל המפגשים שלך ולנהל את החבילה
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center cyber-glow">
                  3
                </div>
                <div>
                  <h3 className="font-bold mb-1">התכונן למפגש</h3>
                  <p className="text-muted-foreground text-sm">
                    תקבל אימייל עם פרטים נוספים ומה להכין לקראת המפגש
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 flex-col sm:flex-row" dir="rtl">
            <Button
              onClick={handleBookSession}
              size="lg"
              className="flex-1"
            >
              <Calendar className="ml-2" />
              קבע מפגש
            </Button>
            
            <Link to="/dashboard" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                <LayoutDashboard className="ml-2" />
                לוח הבקרה שלי
              </Button>
            </Link>
            
            <Link to="/" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                <Home className="ml-2" />
                עמוד הבית
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Success;
