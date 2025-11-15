import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, UserPlus, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { handleError } from "@/lib/errorHandling";

interface PackageData {
  id: "single" | "package_4";
  sessions: number;
  price: number;
}

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  packageData: PackageData | null;
}

interface DemoPurchase {
  id: string;
  packageType: "single" | "package_4";
  sessions: number;
  price: number;
  customerName: string;
  customerEmail: string;
  purchaseDate: string;
  demo: true;
}

const CheckoutDialog = ({ isOpen, onClose, packageData }: CheckoutDialogProps) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [calendlyLink, setCalendlyLink] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      checkAuth();
      fetchCalendlyLink();
    }
  }, [isOpen]);

  const fetchCalendlyLink = async () => {
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("setting_value")
        .eq("setting_key", "calendly_link")
        .single();
      
      if (data?.setting_value) {
        setCalendlyLink(data.setting_value);
      }
    } catch (error) {
      handleError(error, "שגיאה בטעינת קישור Calendly", "CheckoutDialog.fetchCalendlyLink");
    }
  };

  const checkAuth = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    } catch (error) {
      handleError(error, "לא ניתן לבדוק אימות", "CheckoutDialog");
    } finally {
      setCheckingAuth(false);
    }
  };

  const handlePurchase = async () => {
    if (!packageData || !user) return;

    setIsProcessing(true);

    try {
      const { data: purchase, error } = await supabase
        .from("purchases")
        .insert({
          user_id: user.id,
          package_type: packageData.id,
          sessions_total: packageData.sessions,
          sessions_remaining: packageData.sessions,
          price: packageData.price,
          payment_status: "demo",
          payment_method: "demo",
          booking_link: calendlyLink || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "רכישה הושלמה בהצלחה!",
        description: "מעביר אותך לעמוד האישור...",
      });

      setTimeout(() => {
        navigate(`/success?purchaseId=${purchase.id}`);
        onClose();
        setIsProcessing(false);
      }, 500);
    } catch (error: any) {
      handleError(error, "אירעה שגיאה ביצירת הרכישה", "CheckoutDialog");
      setIsProcessing(false);
    }
  };

  if (!packageData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] glass-panel" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl cyber-glow">אישור רכישה</DialogTitle>
          <DialogDescription className="text-right">
            {user ? "אישור פרטי הרכישה" : "נדרשת התחברות להשלמת הרכישה"}
          </DialogDescription>
        </DialogHeader>

        {checkingAuth ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !user ? (
          <div className="space-y-6 py-4">
            <div className="glass-panel p-4 border border-primary/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">חבילה:</span>
                <span className="font-bold">
                  {packageData.sessions === 1 ? "מפגש בודד" : "חבילת 4 מפגשים"}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">מפגשים:</span>
                <span className="font-bold">{packageData.sessions}</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-muted-foreground">סה"כ לתשלום:</span>
                <span className="font-black cyber-glow">₪{packageData.price}</span>
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                כדי להשלים את הרכישה, עליך להתחבר או ליצור חשבון
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => {
                    onClose();
                    const redirectUrl = encodeURIComponent(`/?package=${packageData.id}`);
                    navigate(`/login?redirect=${redirectUrl}`);
                  }}
                  size="lg"
                  className="w-full"
                >
                  <LogIn className="ml-2 h-4 w-4" />
                  התחבר
                </Button>
                <Button
                  onClick={() => {
                    onClose();
                    const redirectUrl = encodeURIComponent(`/?package=${packageData.id}`);
                    navigate(`/signup?redirect=${redirectUrl}`);
                  }}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  <UserPlus className="ml-2 h-4 w-4" />
                  הרשם עכשיו
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="glass-panel p-4 border border-primary/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">חבילה:</span>
                <span className="font-bold">
                  {packageData.sessions === 1 ? "מפגש בודד" : "חבילת 4 מפגשים"}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">מפגשים:</span>
                <span className="font-bold">{packageData.sessions}</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-muted-foreground">סה"כ לתשלום:</span>
                <span className="font-black cyber-glow">₪{packageData.price}</span>
              </div>
            </div>

            <div className="text-center text-xs text-muted-foreground bg-accent/10 p-3 rounded-lg">
              ⚠️ זוהי רכישת דמו - לא יתבצע חיוב אמיתי
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isProcessing}
              >
                ביטול
              </Button>
              <Button
                onClick={handlePurchase}
                disabled={isProcessing}
                className="min-w-[150px]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    מעבד רכישה...
                  </>
                ) : (
                  "השלם רכישה"
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
