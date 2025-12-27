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
import { Loader2, Clock, Headphones, CheckCircle2, Shield } from "lucide-react";

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

      // Create purchase record - access_granted_at stays NULL until admin assigns recording
      const { error: purchaseError } = await supabase
        .from("content_purchases")
        .insert({
          user_id: user.id,
          product_id: product.id,
          price_paid: PRODUCT_PRICE,
          payment_status: "completed",
          access_granted_at: null, // Will be set when admin assigns recording
        });

      if (purchaseError) throw purchaseError;

      return { productId: product.id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-purchases"] });
      queryClient.invalidateQueries({ queryKey: ["pending-audio-orders"] });
      onOpenChange(false);
      navigate("/personal-hypnosis/success");
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה ברכישה",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">היפנוזה אישית - שחרור וחופש פנימי</DialogTitle>
          <DialogDescription>
            הקלטה מותאמת אישית שנוצרת עבורך בלבד
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Product Info */}
          <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl border border-primary/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Headphones className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">היפנוזה אישית</h3>
                <p className="text-sm text-muted-foreground">הקלטה מותאמת</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-primary">₪{PRODUCT_PRICE}</span>
          </div>

          {/* Process Info */}
          <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-accent mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium text-accent mb-1">מה קורה אחרי הרכישה?</h4>
                <p className="text-sm text-muted-foreground">
                  אני יוצר לך הקלטה אישית ומותאמת במיוחד עבורך.
                  ההקלטה תהיה מוכנה תוך 2 ימי עסקים ותקבל התראה כשהיא מוכנה.
                </p>
              </div>
            </div>
          </div>

          {/* What's Included */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">כלול ברכישה:</h4>
            <ul className="space-y-2">
              {[
                "הקלטה בהתאמה אישית",
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

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>תשלום מאובטח ומוגן</span>
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
                מעבד...
              </>
            ) : (
              <>אישור רכישה - ₪{PRODUCT_PRICE}</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
