import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, User, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PendingPayment {
  id: string;
  user_id: string;
  product_id: string;
  price_paid: number;
  purchase_date: string;
  payment_status: string;
  profiles: {
    full_name: string | null;
  } | null;
  content_products: {
    title: string;
    slug: string;
  } | null;
}

export const PendingPayments = () => {
  const queryClient = useQueryClient();
  const [confirmDialog, setConfirmDialog] = useState<{ order: PendingPayment; action: 'approve' | 'reject' } | null>(null);

  const { data: pendingPayments, isLoading } = useQuery({
    queryKey: ["pending-payments"],
    queryFn: async () => {
      // Get all purchases with pending payment status
      const { data, error } = await supabase
        .from("content_purchases")
        .select(`
          id,
          user_id,
          product_id,
          price_paid,
          purchase_date,
          payment_status,
          profiles!content_purchases_user_id_fkey (
            full_name
          ),
          content_products!content_purchases_product_id_fkey (
            title,
            slug
          )
        `)
        .eq("payment_status", "pending")
        .order("purchase_date", { ascending: true });

      if (error) throw error;
      return data as unknown as PendingPayment[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("content_purchases")
        .update({ 
          payment_status: "completed",
          access_granted_at: null // Still null - will be set when admin assigns video
        })
        .eq("id", orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-payments"] });
      queryClient.invalidateQueries({ queryKey: ["pending-audio-orders"] });
      toast({
        title: "התשלום אושר",
        description: "ההזמנה הועברה לטיפול - יש להקצות סרטון",
      });
      setConfirmDialog(null);
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("content_purchases")
        .update({ payment_status: "cancelled" })
        .eq("id", orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-payments"] });
      toast({
        title: "ההזמנה בוטלה",
        description: "ההזמנה סומנה כמבוטלת",
      });
      setConfirmDialog(null);
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pendingPayments || pendingPayments.length === 0) {
    return (
      <Card className="glass-panel">
        <CardContent className="py-12 text-center">
          <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">אין תשלומים ממתינים</h3>
          <p className="text-muted-foreground">
            כל התשלומים טופלו
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-amber-500" />
        <span className="font-medium">{pendingPayments.length} הזמנות ממתינות לאישור תשלום</span>
      </div>

      <div className="grid gap-4">
        {pendingPayments.map((order) => (
          <Card key={order.id} className="glass-panel border-amber-500/30">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                    <CreditCard className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {order.profiles?.full_name || "משתמש ללא שם"}
                      </span>
                      <Badge variant="outline" className="text-amber-500 border-amber-500/50">
                        ממתין לתשלום
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {order.content_products?.title}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(order.purchase_date), "dd/MM/yyyy HH:mm", { locale: he })}
                      </span>
                      <span className="font-bold text-primary">₪{order.price_paid}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setConfirmDialog({ order, action: 'reject' })}
                  >
                    <XCircle className="h-4 w-4 ml-1" />
                    בטל
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setConfirmDialog({ order, action: 'approve' })}
                  >
                    <CheckCircle2 className="h-4 w-4 ml-1" />
                    אשר תשלום
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmDialog} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog?.action === 'approve' ? 'אישור תשלום' : 'ביטול הזמנה'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.action === 'approve' 
                ? `האם לאשר את התשלום עבור ${confirmDialog?.order.profiles?.full_name || 'המשתמש'}? לאחר האישור ההזמנה תעבור לטיפול.`
                : `האם לבטל את ההזמנה של ${confirmDialog?.order.profiles?.full_name || 'המשתמש'}?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog?.action === 'approve') {
                  approveMutation.mutate(confirmDialog.order.id);
                } else if (confirmDialog) {
                  rejectMutation.mutate(confirmDialog.order.id);
                }
              }}
              className={confirmDialog?.action === 'reject' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {confirmDialog?.action === 'approve' ? 'אשר תשלום' : 'בטל הזמנה'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
