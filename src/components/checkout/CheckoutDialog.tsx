import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CreditCard, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Tables<"content_products">;
}

type PaymentStatus = "instant_success" | "pending" | "failed";

const CheckoutDialog = ({ open, onOpenChange, course }: CheckoutDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("instant_success");
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "נדרש להתחבר",
        description: "יש להתחבר כדי לרכוש קורס",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (paymentStatus === "failed") {
        toast({
          title: "התשלום נכשל",
          description: "אנא נסה שוב או בחר אמצעי תשלום אחר",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Create purchase record
      const { data: purchase, error: purchaseError } = await supabase
        .from("content_purchases")
        .insert({
          user_id: user.id,
          product_id: course.id,
          price_paid: course.price || 0,
          payment_status: paymentStatus === "instant_success" ? "completed" : "pending",
          access_granted_at: paymentStatus === "instant_success" ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Create enrollment record
      const { error: enrollmentError } = await supabase
        .from("course_enrollments")
        .insert({
          user_id: user.id,
          product_id: course.id,
        });

      if (enrollmentError) throw enrollmentError;

      // Update enrollment count
      await supabase
        .from("content_products")
        .update({ enrollment_count: (course.enrollment_count || 0) + 1 })
        .eq("id", course.id);

      setPurchaseComplete(true);

      toast({
        title: paymentStatus === "instant_success" ? "הרכישה בוצעה בהצלחה!" : "התשלום ממתין לאישור",
        description: paymentStatus === "instant_success" 
          ? "כעת תוכל לגשת לכל התוכן של הקורס"
          : "נודיע לך ברגע שהתשלום יאושר",
      });

      if (paymentStatus === "instant_success") {
        setTimeout(() => {
          navigate(`/courses/${course.slug}/watch`);
        }, 1500);
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast({
        title: "שגיאה ברכישה",
        description: "אירעה שגיאה בעת ביצוע הרכישה. אנא נסה שוב.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        {purchaseComplete ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="rounded-full bg-primary/20 p-4">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
            <DialogTitle className="text-2xl text-center">הרכישה הושלמה!</DialogTitle>
            <DialogDescription className="text-center">
              נרשמת בהצלחה לקורס "{course.title}"
            </DialogDescription>
            <Button onClick={() => navigate(`/courses/${course.slug}/watch`)}>
              התחל ללמוד
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">השלמת רכישה</DialogTitle>
              <DialogDescription>
                זהו תהליך רכישה דמה - לא יחויב תשלום אמיתי
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Course Summary */}
              <Card className="glass-panel">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    {course.thumbnail_url && (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-20 h-20 rounded-lg object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {course.instructor_name}
                      </p>
                    </div>
                    <div className="text-left">
                      <div className="text-2xl font-bold cyber-glow">
                        ₪{course.price}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mock Payment Options */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">בחר תוצאת תשלום (דמה)</Label>
                <RadioGroup value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}>
                  <div className="flex items-center space-x-2 space-x-reverse border border-border/30 rounded-lg p-3 cursor-pointer hover:border-primary transition-colors">
                    <RadioGroupItem value="instant_success" id="instant_success" />
                    <Label htmlFor="instant_success" className="flex-1 cursor-pointer">
                      <div className="font-medium">תשלום מיידי מוצלח</div>
                      <div className="text-sm text-muted-foreground">גישה מיידית לקורס</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse border border-border/30 rounded-lg p-3 cursor-pointer hover:border-primary transition-colors">
                    <RadioGroupItem value="pending" id="pending" />
                    <Label htmlFor="pending" className="flex-1 cursor-pointer">
                      <div className="font-medium">תשלום ממתין לאישור</div>
                      <div className="text-sm text-muted-foreground">גישה תינתן לאחר אישור</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse border border-border/30 rounded-lg p-3 cursor-pointer hover:border-primary transition-colors">
                    <RadioGroupItem value="failed" id="failed" />
                    <Label htmlFor="failed" className="flex-1 cursor-pointer">
                      <div className="font-medium">תשלום נכשל</div>
                      <div className="text-sm text-muted-foreground">לבדיקת טיפול בשגיאות</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Info Card */}
              <Card className="bg-muted/50 border-muted">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">מצב דמה</p>
                      <p>זהו מערכת תשלום דמה. לא יחויב תשלום אמיתי ולא נדרשים פרטי כרטיס אשראי.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isProcessing}
              >
                ביטול
              </Button>
              <Button
                onClick={handlePurchase}
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    מעבד...
                  </>
                ) : (
                  <>השלם רכישה</>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
