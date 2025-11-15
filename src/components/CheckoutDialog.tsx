import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Loader2 } from "lucide-react";

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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!packageData) return;

    // Validate form
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות",
        variant: "destructive",
      });
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "שגיאה",
        description: "כתובת אימייל לא תקינה",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create demo purchase
    const purchase: DemoPurchase = {
      id: `demo-${Date.now()}`,
      packageType: packageData.id,
      sessions: packageData.sessions,
      price: packageData.price,
      customerName: formData.name,
      customerEmail: formData.email,
      purchaseDate: new Date().toISOString(),
      demo: true,
    };

    // Store in localStorage
    const existingPurchases = JSON.parse(
      localStorage.getItem("demo_purchases") || "[]"
    );
    existingPurchases.push(purchase);
    // Keep only last 10 purchases
    const recentPurchases = existingPurchases.slice(-10);
    localStorage.setItem("demo_purchases", JSON.stringify(recentPurchases));

    // Store current purchase for success page
    localStorage.setItem("current_demo_purchase", JSON.stringify(purchase));

    console.log("🎭 Demo purchase completed:", purchase);

    toast({
      title: "רכישה הושלמה בהצלחה!",
      description: "מעביר אותך לעמוד האישור...",
    });

    // Navigate to success page
    setTimeout(() => {
      navigate(
        `/success?package=${packageData.id}&sessions=${packageData.sessions}&price=${packageData.price}`
      );
      onClose();
      setIsProcessing(false);
      // Reset form
      setFormData({ name: "", email: "" });
    }, 500);
  };

  if (!packageData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] glass-panel" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl cyber-glow">אישור רכישה</DialogTitle>
          <DialogDescription className="text-right">
            אנא מלא את הפרטים שלך להשלמת הרכישה (Demo Mode)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Package Details */}
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

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">שם מלא</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="הכנס שם מלא"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  disabled={isProcessing}
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">אימייל</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  disabled={isProcessing}
                  className="text-right"
                />
              </div>
            </div>

            <div className="text-center text-xs text-muted-foreground bg-accent/10 p-3 rounded-lg">
              ⚠️ זוהי רכישת דמו - לא יתבצע חיוב אמיתי
            </div>
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
            <Button type="submit" disabled={isProcessing} className="min-w-[150px]">
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
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
