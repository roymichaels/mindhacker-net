import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Clock, Video, CheckCircle2, Mail } from "lucide-react";
import { trackCheckoutStart, trackPurchaseComplete, trackDialogOpen, trackDialogClose, trackEvent } from "@/hooks/useAnalytics";
import { getStoredAffiliateCode, clearAffiliateCode } from "@/hooks/useAffiliateTracking";

interface PersonalHypnosisCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRODUCT_SLUG = "personal-hypnosis-video";
const PRODUCT_PRICE = 297;

export const PersonalHypnosisCheckoutDialog = ({
  open,
  onOpenChange,
}: PersonalHypnosisCheckoutDialogProps) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Track checkout start when dialog opens
  useEffect(() => {
    if (open) {
      trackDialogOpen("personal_hypnosis_checkout");
      trackCheckoutStart("personal_hypnosis", PRODUCT_PRICE);
    }
  }, [open]);
  const purchaseMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("לא מחובר");

      // Ensure profile exists before creating order (FK constraint)
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!existingProfile) {
        // Create profile if missing
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({ id: user.id, full_name: user.email });
        
        if (profileError) {
          console.error("Failed to create profile:", profileError);
          throw new Error("שגיאה ביצירת פרופיל");
        }
      }

      // Get product from the new products table
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("id, price")
        .eq("slug", PRODUCT_SLUG)
        .maybeSingle();

      if (productError || !product) {
        throw new Error("המוצר לא נמצא");
      }

      // Check if already has an active order
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .in("payment_status", ["pending", "completed"])
        .maybeSingle();

      if (existingOrder) {
        throw new Error("כבר יש לך הזמנה פעילה למוצר זה");
      }

      // Get affiliate code if exists
      const affiliateCode = getStoredAffiliateCode();

      // Create order in the new orders table with PENDING status
      const { data: newOrder, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          product_id: product.id,
          amount: product.price,
          payment_status: "pending",
          affiliate_code: affiliateCode,
        })
        .select("id")
        .single();

      if (orderError) throw orderError;
      
      // Clear affiliate code after successful order
      if (affiliateCode) clearAffiliateCode();

      // Send email notifications (admin + customer) in parallel
      const emailPromises = [
        supabase.functions.invoke("send-order-notification", {
          body: {
            orderId: newOrder.id,
            userEmail: user.email,
            productName: "אימון תודעתי אישי - סרטון היפנוזה",
            amount: product.price,
          },
        }),
        supabase.functions.invoke("send-order-confirmation", {
          body: {
            orderId: newOrder.id,
            userEmail: user.email,
            productName: language === 'he' ? "אימון תודעתי אישי - סרטון היפנוזה" : "Personal Hypnosis Video",
            amount: product.price,
            language,
          },
        }),
      ];

      try {
        await Promise.all(emailPromises);
      } catch (emailError) {
        // Don't fail the order if emails fail
        console.error("Failed to send order emails:", emailError);
      }

      return { productId: product.id };
    },
    onSuccess: () => {
      trackPurchaseComplete("personal_hypnosis", PRODUCT_PRICE);
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders-pending-payments"] });
      onOpenChange(false);
      navigate("/personal-hypnosis/pending");
    },
    onError: (error: Error) => {
      trackEvent("purchase_failed", "purchase", "personal_hypnosis", { error: error.message });
      toast({
        title: "שגיאה בהזמנה",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      trackDialogClose("personal_hypnosis_checkout");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">אימון תודעתי אישי - סרטון היפנוזה</DialogTitle>
          <DialogDescription>
            סרטון אימון תודעתי מותאם אישית שנוצר עבורך בלבד
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Product Info */}
          <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl border border-primary/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">אימון תודעתי אישי</h3>
                <p className="text-sm text-muted-foreground">סרטון מותאם</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-primary">₪{PRODUCT_PRICE}</span>
          </div>

          {/* Process Info - Updated for manual payment flow */}
          <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-accent mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium text-accent mb-1">איך זה עובד?</h4>
                <p className="text-sm text-muted-foreground">
                  לאחר שליחת הבקשה, תקבל מייל עם הוראות תשלום.
                  לאחר אישור התשלום, אתחיל ליצור עבורך סרטון מותאם אישית.
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-4 bg-muted/30 border border-border rounded-xl">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium mb-1">זמני הכנה</h4>
                <p className="text-sm text-muted-foreground">
                  הסרטון יהיה מוכן תוך 2 ימי עסקים לאחר אישור התשלום.
                  תקבל התראה כשהוא מוכן.
                </p>
              </div>
            </div>
          </div>

          {/* What's Included */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">כלול ברכישה:</h4>
            <ul className="space-y-2">
              {[
                "סרטון אימון תודעתי בהתאמה אישית",
                "גישה לצמיתות מכל מכשיר",
                "תמיכה אישית",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            ביטול
          </Button>
          <Button
            className="flex-1"
            onClick={() => purchaseMutation.mutate()}
            disabled={purchaseMutation.isPending}
          >
            {purchaseMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                שולח בקשה...
              </>
            ) : (
              <>שלח בקשה להזמנה</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
