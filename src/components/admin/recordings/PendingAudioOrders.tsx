import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, User, Calendar, Video, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { AssignAudioToOrderDialog } from "./AssignAudioToOrderDialog";

interface PendingOrder {
  id: string;
  user_id: string;
  product_id: string;
  price_paid: number;
  purchase_date: string;
  profiles: {
    full_name: string | null;
  } | null;
  content_products: {
    title: string;
    slug: string;
  } | null;
}

export const PendingAudioOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);

  const { data: pendingOrders, isLoading } = useQuery({
    queryKey: ["pending-audio-orders"],
    queryFn: async () => {
      // Get audio products by slug pattern (personal-hypnosis and similar)
      const { data: audioProducts } = await supabase
        .from("content_products")
        .select("id")
        .like("slug", "personal-hypnosis%");

      if (!audioProducts || audioProducts.length === 0) {
        return [];
      }

      const productIds = audioProducts.map((p) => p.id);

      // Get purchases where access_granted_at is null (pending)
      const { data, error } = await supabase
        .from("content_purchases")
        .select(`
          id,
          user_id,
          product_id,
          price_paid,
          purchase_date,
          profiles!content_purchases_user_id_fkey (
            full_name
          ),
          content_products!content_purchases_product_id_fkey (
            title,
            slug
          )
        `)
        .in("product_id", productIds)
        .is("access_granted_at", null)
        .eq("payment_status", "completed")
        .order("purchase_date", { ascending: true });

      if (error) throw error;
      return data as unknown as PendingOrder[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pendingOrders || pendingOrders.length === 0) {
    return (
      <Card className="glass-panel">
        <CardContent className="py-12 text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">אין הזמנות ממתינות</h3>
          <p className="text-muted-foreground">
            כל ההזמנות טופלו בהצלחה
          </p>
        </CardContent>
      </Card>
    );
  }

  const getDaysSincePurchase = (purchaseDate: string) => {
    const diff = Date.now() - new Date(purchaseDate).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-accent" />
          <span className="font-medium">{pendingOrders.length} הזמנות ממתינות לסרטון</span>
        </div>
      </div>

      <div className="grid gap-4">
        {pendingOrders.map((order) => {
          const daysSince = getDaysSincePurchase(order.purchase_date);
          const isOverdue = daysSince > 2;

          return (
            <Card key={order.id} className={`glass-panel ${isOverdue ? "border-destructive/50" : ""}`}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center shrink-0
                      ${isOverdue ? "bg-destructive/20" : "bg-accent/20"}
                    `}>
                      <Video className={`h-6 w-6 ${isOverdue ? "text-destructive" : "text-accent"}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {order.profiles?.full_name || "משתמש ללא שם"}
                        </span>
                        {isOverdue && (
                          <Badge variant="destructive" className="text-xs">
                            באיחור!
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {order.content_products?.title}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(order.purchase_date), "dd/MM/yyyy HH:mm", { locale: he })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          לפני {daysSince} {daysSince === 1 ? "יום" : "ימים"}
                        </span>
                        <span>₪{order.price_paid}</span>
                      </div>
                    </div>
                  </div>

                  <Button onClick={() => setSelectedOrder(order)}>
                    הקצה סרטון
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedOrder && (
        <AssignAudioToOrderDialog
          open={!!selectedOrder}
          onOpenChange={(open) => !open && setSelectedOrder(null)}
          order={selectedOrder}
        />
      )}
    </div>
  );
};
