import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, Gift, CreditCard, BookOpen, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface AdminGrantPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    email: string;
    full_name: string | null;
  } | null;
  onSuccess?: () => void;
}

type GrantType = "sessions" | "content" | "subscription";

const AdminGrantPurchaseDialog = ({
  open,
  onOpenChange,
  user,
  onSuccess,
}: AdminGrantPurchaseDialogProps) => {
  const [grantType, setGrantType] = useState<GrantType>("sessions");
  const [loading, setLoading] = useState(false);
  
  // Session grant fields
  const [packageType, setPackageType] = useState("single");
  const [sessionsTotal, setSessionsTotal] = useState(1);
  const [sessionPrice, setSessionPrice] = useState(0);
  
  // Content grant fields
  const [selectedProductId, setSelectedProductId] = useState("");
  const [contentPrice, setContentPrice] = useState(0);
  
  // Subscription grant fields
  const [selectedTierId, setSelectedTierId] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  
  // Common fields
  const [notes, setNotes] = useState("הזמנה מנהלתית");

  // Fetch products
  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_products")
        .select("id, title, price")
        .eq("status", "published")
        .order("title");
      if (error) throw error;
      return data;
    },
  });

  // Fetch subscription tiers
  const { data: subscriptionTiers } = useQuery({
    queryKey: ["admin-subscription-tiers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_tiers")
        .select("id, name, price_monthly, price_quarterly, price_yearly, access_level")
        .eq("is_active", true)
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-grant-purchase", {
        body: {
          targetUserId: user.id,
          grantType,
          // Session fields
          packageType: grantType === "sessions" ? packageType : undefined,
          sessionsTotal: grantType === "sessions" ? sessionsTotal : undefined,
          price: grantType === "sessions" ? sessionPrice : grantType === "content" ? contentPrice : undefined,
          // Content fields
          productId: grantType === "content" ? selectedProductId : undefined,
          // Subscription fields
          tierId: grantType === "subscription" ? selectedTierId : undefined,
          billingCycle: grantType === "subscription" ? billingCycle : undefined,
          // Common
          notes,
        },
      });

      if (error) throw error;

      toast({
        title: "הרכישה הוענקה בהצלחה",
        description: `הזמנה מנהלתית נוצרה עבור ${user.full_name || user.email}`,
      });

      onOpenChange(false);
      onSuccess?.();
      resetForm();
    } catch (error: any) {
      console.error("Error granting purchase:", error);
      toast({
        title: "שגיאה בהענקת רכישה",
        description: error.message || "נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setGrantType("sessions");
    setPackageType("single");
    setSessionsTotal(1);
    setSessionPrice(0);
    setSelectedProductId("");
    setContentPrice(0);
    setSelectedTierId("");
    setBillingCycle("monthly");
    setNotes("הזמנה מנהלתית");
  };

  const getSelectedTierPrice = () => {
    if (!selectedTierId || !subscriptionTiers) return 0;
    const tier = subscriptionTiers.find((t) => t.id === selectedTierId);
    if (!tier) return 0;
    switch (billingCycle) {
      case "monthly":
        return tier.price_monthly;
      case "quarterly":
        return tier.price_quarterly || tier.price_monthly * 3;
      case "yearly":
        return tier.price_yearly || tier.price_monthly * 12;
      default:
        return tier.price_monthly;
    }
  };

  const isFormValid = () => {
    switch (grantType) {
      case "sessions":
        return sessionsTotal > 0;
      case "content":
        return !!selectedProductId;
      case "subscription":
        return !!selectedTierId;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            הענקת רכישה מנהלתית
          </DialogTitle>
          <DialogDescription>
            הענק רכישה עבור{" "}
            <span className="font-semibold text-foreground">
              {user?.full_name || user?.email}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Grant Type Selection */}
          <div className="space-y-2">
            <Label>סוג הענקה</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={grantType === "sessions" ? "default" : "outline"}
                className="flex flex-col h-auto py-3"
                onClick={() => setGrantType("sessions")}
              >
                <CreditCard className="h-5 w-5 mb-1" />
                <span className="text-xs">מפגשים</span>
              </Button>
              <Button
                type="button"
                variant={grantType === "content" ? "default" : "outline"}
                className="flex flex-col h-auto py-3"
                onClick={() => setGrantType("content")}
              >
                <BookOpen className="h-5 w-5 mb-1" />
                <span className="text-xs">תוכן</span>
              </Button>
              <Button
                type="button"
                variant={grantType === "subscription" ? "default" : "outline"}
                className="flex flex-col h-auto py-3"
                onClick={() => setGrantType("subscription")}
              >
                <Crown className="h-5 w-5 mb-1" />
                <span className="text-xs">מנוי</span>
              </Button>
            </div>
          </div>

          {/* Sessions Grant Form */}
          {grantType === "sessions" && (
            <>
              <div className="space-y-2">
                <Label>סוג חבילה</Label>
                <Select value={packageType} onValueChange={setPackageType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">מפגש בודד</SelectItem>
                    <SelectItem value="package_3">חבילת 3 מפגשים</SelectItem>
                    <SelectItem value="package_5">חבילת 5 מפגשים</SelectItem>
                    <SelectItem value="package_10">חבילת 10 מפגשים</SelectItem>
                    <SelectItem value="custom">מותאם אישית</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>מספר מפגשים</Label>
                  <Input
                    type="number"
                    min={1}
                    value={sessionsTotal}
                    onChange={(e) => setSessionsTotal(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>מחיר (₪)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={sessionPrice}
                    onChange={(e) => setSessionPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Content Grant Form */}
          {grantType === "content" && (
            <>
              <div className="space-y-2">
                <Label>בחר מוצר</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר מוצר..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.title} (₪{product.price})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>מחיר ששולם (₪)</Label>
                <Input
                  type="number"
                  min={0}
                  value={contentPrice}
                  onChange={(e) => setContentPrice(parseFloat(e.target.value) || 0)}
                />
              </div>
            </>
          )}

          {/* Subscription Grant Form */}
          {grantType === "subscription" && (
            <>
              <div className="space-y-2">
                <Label>רמת מנוי</Label>
                <Select value={selectedTierId} onValueChange={setSelectedTierId}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר רמת מנוי..." />
                  </SelectTrigger>
                  <SelectContent>
                    {subscriptionTiers?.map((tier) => (
                      <SelectItem key={tier.id} value={tier.id}>
                        {tier.name} ({tier.access_level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>מחזור חיוב</Label>
                <Select value={billingCycle} onValueChange={setBillingCycle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">חודשי</SelectItem>
                    <SelectItem value="quarterly">רבעוני</SelectItem>
                    <SelectItem value="yearly">שנתי</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedTierId && (
                <div className="text-sm text-muted-foreground">
                  מחיר: ₪{getSelectedTierPrice()}
                </div>
              )}
            </>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>הערות</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="הערות להזמנה..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            ביטול
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !isFormValid()}
          >
            {loading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                מעניק...
              </>
            ) : (
              <>
                <Gift className="ml-2 h-4 w-4" />
                הענק רכישה
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminGrantPurchaseDialog;
