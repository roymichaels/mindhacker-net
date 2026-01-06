import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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

interface PersonalHypnosisCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRODUCT_SLUG = "personal-hypnosis";
const PRODUCT_PRICE = 297;

export const PersonalHypnosisCheckoutDialog = ({
  open,
  onOpenChange,
}: PersonalHypnosisCheckoutDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("לא מחובר");

      // Get product ID by slug
      const { data: product, error: productError } = await supabase
        .from("content_products")
        .select("id")
        .eq("slug", PRODUCT_SLUG)
        .single();

      if (productError || !product) {
        throw new Error("המוצר לא נמצא");
      }

      // Check if already purchased
      const { data: existingPurchase } = await supabase
        .from("content_purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .single();

      if (existingPurchase) {
        throw new Error("כבר רכשת מוצר זה");
      }

      // Create purchase record with PENDING status - requires admin approval
      const { error: purchaseError } = await supabase
        .from("content_purchases")
        .insert({
          user_id: user.id,
          product_id: product.id,
          price_paid: PRODUCT_PRICE,
          payment_status: "pending", // Changed from "completed" to "pending"
          access_granted_at: null, // Will be set when admin approves payment and assigns recording
        });

      if (purchaseError) throw purchaseError;

      return { productId: product.id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-purchases"] });
      queryClient.invalidateQueries({ queryKey: ["pending-audio-orders"] });
      onOpenChange(false);
      navigate("/personal-hypnosis/pending");
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה בהזמנה",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
