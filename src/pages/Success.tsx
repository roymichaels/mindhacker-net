import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Home, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import MatrixRain from "@/components/MatrixRain";

interface PurchaseDetails {
  id: string;
  packageType: "single" | "package_4";
  sessions: number;
  price: number;
  customerName: string;
  customerEmail: string;
  purchaseDate: string;
  demo: true;
}

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [purchase, setPurchase] = useState<PurchaseDetails | null>(null);

  useEffect(() => {
    // Try to get purchase from localStorage first
    const currentPurchase = localStorage.getItem("current_demo_purchase");
    if (currentPurchase) {
      setPurchase(JSON.parse(currentPurchase));
    } else {
      // Fallback to URL params
      const packageType = searchParams.get("package") as "single" | "package_4";
      const sessions = parseInt(searchParams.get("sessions") || "1");
      const price = parseInt(searchParams.get("price") || "250");

      if (packageType) {
        setPurchase({
          id: `demo-${Date.now()}`,
          packageType,
          sessions,
          price,
          customerName: "אורח",
          customerEmail: "",
          purchaseDate: new Date().toISOString(),
          demo: true,
        });
      }
    }
  }, [searchParams]);

  const handleGoHome = () => {
    localStorage.removeItem("current_demo_purchase");
    navigate("/");
  };

  const handleContact = () => {
    // Replace with your actual WhatsApp number
    window.open("https://wa.me/972123456789", "_blank");
  };

  if (!purchase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel p-8 text-center">
          <p className="text-muted-foreground">טוען...</p>
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
              זוהי רכישת דמו - לא בוצע חיוב אמיתי
            </p>
          </div>

          {/* Purchase Details */}
          <div className="glass-panel p-8 mb-8" dir="rtl">
            <h2 className="text-2xl font-bold mb-6 text-right">פרטי הרכישה</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-border/30">
                <span className="text-muted-foreground">מספר הזמנה (Demo):</span>
                <span className="font-mono text-primary">{purchase.id}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-border/30">
                <span className="text-muted-foreground">חבילה:</span>
                <span className="font-bold">
                  {purchase.sessions === 1 ? "מפגש בודד" : "חבילת 4 מפגשים"}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-border/30">
                <span className="text-muted-foreground">מספר מפגשים:</span>
                <span className="font-bold">{purchase.sessions}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-border/30">
                <span className="text-muted-foreground">שם:</span>
                <span className="font-medium">{purchase.customerName}</span>
              </div>

              {purchase.customerEmail && (
                <div className="flex justify-between items-center py-3 border-b border-border/30">
                  <span className="text-muted-foreground">אימייל:</span>
                  <span className="font-medium">{purchase.customerEmail}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center py-3">
                <span className="text-muted-foreground">סכום (Demo):</span>
                <span className="text-3xl font-black cyber-glow">₪{purchase.price}</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="glass-panel p-8 mb-8" dir="rtl">
            <h2 className="text-2xl font-bold mb-6 text-right">השלבים הבאים</h2>
            
            <ul className="space-y-4 text-right">
              <li className="flex items-start">
                <span className="text-primary ml-3 text-xl">✓</span>
                <span className="text-muted-foreground">
                  נציג ייצור איתך קשר תוך 24 שעות לתיאום המפגש הראשון
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-primary ml-3 text-xl">✓</span>
                <span className="text-muted-foreground">
                  תקבל אימייל אישור עם כל הפרטים הרלוונטיים
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-primary ml-3 text-xl">✓</span>
                <span className="text-muted-foreground">
                  המפגשים יתקיימו בזום או פנים אל פנים, לפי העדפתך
                </span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4" dir="rtl">
            <Button
              onClick={handleGoHome}
              size="lg"
              className="flex-1"
            >
              <Home className="ml-2 h-5 w-5" />
              חזרה לדף הבית
            </Button>
            
            <Button
              onClick={handleContact}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              <MessageCircle className="ml-2 h-5 w-5" />
              צור קשר עכשיו
            </Button>
          </div>

          {/* Demo Mode Notice */}
          <div className="mt-8 text-center">
            <div className="inline-block glass-panel px-6 py-3 border border-accent/30">
              <p className="text-sm text-accent" dir="rtl">
                🎭 Demo Mode Active - This is a demonstration purchase
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Success;
