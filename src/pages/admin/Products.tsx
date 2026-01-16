import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, ShoppingBag, Package, Edit, User, Calendar, 
  CheckCircle2, XCircle, CreditCard, Clock, Video, AlertCircle,
  Sparkles, Eye, FileText, Palette
} from "lucide-react";
import { colorOptions, getProductColors } from "@/lib/productColors";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { AssignVideoToOrderDialog } from "@/components/admin/recordings/AssignVideoToOrderDialog";

interface Product {
  id: string;
  slug: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  price: number;
  price_usd: number | null;
  status: string;
  product_type: string;
  settings: Record<string, any>;
  brand_color: string | null;
}

interface Order {
  id: string;
  user_id: string;
  product_id: string;
  amount: number;
  payment_status: string;
  order_date: string;
  payment_approved_at: string | null;
  fulfilled_at: string | null;
  notes: string | null;
  profiles: { full_name: string | null } | null;
  products: { title: string; slug: string } | null;
}

interface Application {
  id: string;
  lead_id: string;
  current_life_situation: string;
  what_feels_stuck: string;
  what_to_understand: string;
  why_now: string;
  openness_to_process: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  lead: {
    name: string;
    email: string;
    what_resonated: string | null;
    created_at: string;
  };
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  reviewed: "bg-blue-500/20 text-blue-400",
  approved: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
};

const statusLabels: Record<string, string> = {
  pending: "ממתין",
  reviewed: "נבדק",
  approved: "אושר",
  rejected: "נדחה",
};

const Products = () => {
  const { t, language, isRTL } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("products");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ order: Order; action: 'approve' | 'reject' } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");

  // Fetch products
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  // Fetch orders with pending payments
  const { data: pendingPaymentOrders, isLoading: loadingPendingPayments } = useQuery({
    queryKey: ["admin-orders-pending-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          profiles!orders_user_id_fkey (full_name),
          products!orders_product_id_fkey (title, slug)
        `)
        .eq("payment_status", "pending")
        .order("order_date", { ascending: true });
      if (error) throw error;
      return data as unknown as Order[];
    },
  });

  // Fetch orders pending fulfillment (payment approved, not fulfilled)
  const { data: pendingFulfillmentOrders, isLoading: loadingPendingFulfillment } = useQuery({
    queryKey: ["admin-orders-pending-fulfillment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          profiles!orders_user_id_fkey (full_name),
          products!orders_product_id_fkey (title, slug)
        `)
        .eq("payment_status", "completed")
        .is("fulfilled_at", null)
        .order("payment_approved_at", { ascending: true });
      if (error) throw error;
      return data as unknown as Order[];
    },
  });

  // Fetch consciousness leap applications
  const { data: applications, isLoading: loadingApplications } = useQuery({
    queryKey: ["consciousness-leap-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consciousness_leap_applications")
        .select(`
          *,
          lead:consciousness_leap_leads(name, email, what_resonated, created_at)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Application[];
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (product: Partial<Product> & { id: string }) => {
      const { error } = await supabase
        .from("products")
        .update({
          title: product.title,
          title_en: product.title_en,
          description: product.description,
          description_en: product.description_en,
          price: product.price,
          price_usd: product.price_usd,
          status: product.status,
          brand_color: product.brand_color,
        })
        .eq("id", product.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: t('common.success'), description: "המוצר עודכן בהצלחה" });
      setEditingProduct(null);
    },
    onError: (error: Error) => {
      toast({ title: t('common.error'), description: error.message, variant: "destructive" });
    },
  });

  // Approve payment mutation
  const approvePaymentMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("orders")
        .update({ 
          payment_status: "completed",
          payment_approved_at: new Date().toISOString()
        })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders-pending-payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders-pending-fulfillment"] });
      toast({ title: t('admin.paymentApproved'), description: "ההזמנה הועברה לטיפול" });
      setConfirmDialog(null);
    },
    onError: (error: Error) => {
      toast({ title: t('common.error'), description: error.message, variant: "destructive" });
    },
  });

  // Reject payment mutation
  const rejectPaymentMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("orders")
        .update({ payment_status: "cancelled" })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders-pending-payments"] });
      toast({ title: t('admin.orderCancelled'), description: "ההזמנה בוטלה" });
      setConfirmDialog(null);
    },
    onError: (error: Error) => {
      toast({ title: t('common.error'), description: error.message, variant: "destructive" });
    },
  });

  // Update application mutation
  const updateApplicationMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes: string }) => {
      const { error } = await supabase
        .from("consciousness_leap_applications")
        .update({ 
          status, 
          admin_notes: notes,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consciousness-leap-applications"] });
      toast({ title: t('common.success'), description: "הבקשה עודכנה בהצלחה" });
      setSelectedApplication(null);
    },
    onError: () => {
      toast({ title: t('common.error'), description: "שגיאה בעדכון הבקשה", variant: "destructive" });
    },
  });

  const handleOpenApplication = (app: Application) => {
    setSelectedApplication(app);
    setAdminNotes(app.admin_notes || "");
    setNewStatus(app.status);
  };

  const handleUpdateApplication = () => {
    if (!selectedApplication) return;
    updateApplicationMutation.mutate({
      id: selectedApplication.id,
      status: newStatus,
      notes: adminNotes,
    });
  };

  const getDaysSinceOrder = (orderDate: string) => {
    const diff = Date.now() - new Date(orderDate).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const isLoading = loadingProducts || loadingPendingPayments || loadingPendingFulfillment || loadingApplications;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalPendingPayments = pendingPaymentOrders?.length || 0;
  const totalPendingFulfillment = pendingFulfillmentOrders?.length || 0;
  const pendingApplicationsCount = applications?.filter(a => a.status === "pending").length || 0;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold cyber-glow">{t('admin.products')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('admin.productsDescription')}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-3xl grid-cols-4">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            {t('admin.productsTab')}
          </TabsTrigger>
          <TabsTrigger value="pending-payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            {t('admin.pendingPayments')}
            {totalPendingPayments > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">{totalPendingPayments}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending-fulfillment" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {t('admin.pendingFulfillment')}
            {totalPendingFulfillment > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{totalPendingFulfillment}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            {t('admin.applications')}
            {pendingApplicationsCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{pendingApplicationsCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="mt-6">
          <div className="grid gap-4">
            {products?.map((product) => {
              const colors = getProductColors(product.brand_color);
              return (
                <Card key={product.id} className="glass-panel">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full ${colors.bgMedium} flex items-center justify-center`}>
                          <ShoppingBag className={`h-6 w-6 ${colors.text}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{language === 'he' ? product.title : (product.title_en || product.title)}</h3>
                            <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                              {product.status === 'active' ? t('common.on') : t('common.off')}
                            </Badge>
                            {/* Color indicator */}
                            <div className={`w-4 h-4 rounded-full ${colors.bg}`} title={t('admin.brandColor')} />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            ₪{product.price} {product.price_usd && `/ $${product.price_usd}`}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setEditingProduct(product)}>
                        <Edit className="h-4 w-4 ml-1" />
                        {t('common.edit')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Pending Payments Tab */}
        <TabsContent value="pending-payments" className="mt-6">
          {!pendingPaymentOrders || pendingPaymentOrders.length === 0 ? (
            <Card className="glass-panel">
              <CardContent className="py-12 text-center">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">{t('admin.noPendingPayments')}</h3>
                <p className="text-muted-foreground">{t('admin.allPaymentsProcessed')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-amber-500" />
                <span className="font-medium">{pendingPaymentOrders.length} {t('admin.ordersPendingPayment')}</span>
              </div>
              <div className="grid gap-4">
                {pendingPaymentOrders.map((order) => (
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
                              <span className="font-medium">{order.profiles?.full_name || t('common.unknown')}</span>
                              <Badge variant="outline" className="text-amber-500 border-amber-500/50">
                                {t('admin.awaitingPayment')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">{order.products?.title}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(order.order_date), "dd/MM/yyyy HH:mm", { locale: language === 'he' ? he : undefined })}
                              </span>
                              <span className="font-bold text-primary">₪{order.amount}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setConfirmDialog({ order, action: 'reject' })}>
                            <XCircle className="h-4 w-4 ml-1" />
                            {t('common.cancel')}
                          </Button>
                          <Button size="sm" onClick={() => setConfirmDialog({ order, action: 'approve' })}>
                            <CheckCircle2 className="h-4 w-4 ml-1" />
                            {t('admin.approvePayment')}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Pending Fulfillment Tab */}
        <TabsContent value="pending-fulfillment" className="mt-6">
          {!pendingFulfillmentOrders || pendingFulfillmentOrders.length === 0 ? (
            <Card className="glass-panel">
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">{t('admin.noPendingOrders')}</h3>
                <p className="text-muted-foreground">{t('admin.allOrdersFulfilled')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-accent" />
                <span className="font-medium">{pendingFulfillmentOrders.length} {t('admin.ordersPendingFulfillment')}</span>
              </div>
              <div className="grid gap-4">
                {pendingFulfillmentOrders.map((order) => {
                  const daysSince = getDaysSinceOrder(order.payment_approved_at || order.order_date);
                  const isOverdue = daysSince > 2;
                  return (
                    <Card key={order.id} className={`glass-panel ${isOverdue ? "border-destructive/50" : ""}`}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isOverdue ? "bg-destructive/20" : "bg-accent/20"}`}>
                              <Video className={`h-6 w-6 ${isOverdue ? "text-destructive" : "text-accent"}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{order.profiles?.full_name || t('common.unknown')}</span>
                                {isOverdue && <Badge variant="destructive" className="text-xs">{t('admin.overdue')}</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">{order.products?.title}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(order.payment_approved_at || order.order_date), "dd/MM/yyyy HH:mm", { locale: language === 'he' ? he : undefined })}
                                </span>
                              <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  לפני {daysSince} {daysSince === 1 ? "יום" : "ימים"}
                                </span>
                                <span>₪{order.amount}</span>
                              </div>
                            </div>
                          </div>
                          <Button onClick={() => setSelectedOrder(order)}>
                            {t('admin.assignVideo')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="mt-6">
          {!applications || applications.length === 0 ? (
            <Card className="glass-panel">
              <CardContent className="py-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">{t('admin.noApplications')}</h3>
                <p className="text-muted-foreground">{t('admin.noApplicationsDescription')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-medium">{applications.length} {t('admin.totalApplications')}</span>
              </div>
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle>{t('admin.consciousnessLeapApplications')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div 
                        key={app.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-medium">{app.lead?.name}</span>
                            <Badge className={statusColors[app.status]}>
                              {statusLabels[app.status]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {app.lead?.email}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(app.created_at), "dd/MM/yyyy HH:mm", { locale: language === 'he' ? he : undefined })}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenApplication(app)}
                        >
                          <Eye className="h-4 w-4 ml-2" />
                          {t('common.view')}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Product Dialog */}
      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
          <DialogContent dir={isRTL ? 'rtl' : 'ltr'} className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('admin.editProduct')}</DialogTitle>
              <DialogDescription>{t('admin.editProductDescription')}</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              updateProductMutation.mutate(editingProduct);
            }} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('admin.titleHe')}</Label>
                    <Input 
                      value={editingProduct.title}
                      onChange={(e) => setEditingProduct({...editingProduct, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('admin.titleEn')}</Label>
                    <Input 
                      value={editingProduct.title_en || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, title_en: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('admin.descriptionHe')}</Label>
                    <Textarea 
                      value={editingProduct.description || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('admin.descriptionEn')}</Label>
                    <Textarea 
                      value={editingProduct.description_en || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, description_en: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('admin.priceILS')}</Label>
                    <Input 
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('admin.priceUSD')}</Label>
                    <Input 
                      type="number"
                      value={editingProduct.price_usd || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, price_usd: parseFloat(e.target.value) || null})}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={editingProduct.status === 'active'}
                    onCheckedChange={(checked) => setEditingProduct({...editingProduct, status: checked ? 'active' : 'inactive'})}
                  />
                  <Label>{t('admin.productActive')}</Label>
                </div>

                {/* Brand Color Picker */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <Label>{t('admin.brandColor')}</Label>
                  </div>
                  <Select
                    value={editingProduct.brand_color || 'primary'}
                    onValueChange={(value) => setEditingProduct({...editingProduct, brand_color: value})}
                  >
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${getProductColors(editingProduct.brand_color).bg}`} />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full ${color.preview}`} />
                            <span>{language === 'he' ? color.labelHe : color.labelEn}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{t('admin.brandColorDesc')}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={updateProductMutation.isPending}>
                  {updateProductMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
                  {t('common.save')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmDialog} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog?.action === 'approve' ? t('admin.approvePaymentTitle') : t('admin.cancelOrderTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.action === 'approve' 
                ? `האם לאשר את התשלום עבור ${confirmDialog?.order.profiles?.full_name || t('common.unknown')}? לאחר האישור ההזמנה תעבור לטיפול.`
                : `האם לבטל את ההזמנה של ${confirmDialog?.order.profiles?.full_name || t('common.unknown')}?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog?.action === 'approve') {
                  approvePaymentMutation.mutate(confirmDialog.order.id);
                } else if (confirmDialog) {
                  rejectPaymentMutation.mutate(confirmDialog.order.id);
                }
              }}
              className={confirmDialog?.action === 'reject' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {confirmDialog?.action === 'approve' ? t('admin.approvePayment') : t('admin.cancelOrder')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Video Dialog */}
      {selectedOrder && (
        <AssignVideoToOrderDialog
          open={!!selectedOrder}
          onOpenChange={(open) => !open && setSelectedOrder(null)}
          order={{
            id: selectedOrder.id,
            user_id: selectedOrder.user_id,
            product_id: selectedOrder.product_id,
            amount: selectedOrder.amount,
            order_date: selectedOrder.order_date,
            profiles: selectedOrder.profiles,
            products: selectedOrder.products,
          }}
        />
      )}

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>
              {t('admin.applicationFrom')} {selectedApplication?.lead?.name}
            </DialogTitle>
            <DialogDescription>
              {t('admin.reviewApplicationDescription')}
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* Lead Info */}
              <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                <h3 className="font-medium mb-2">{t('admin.leadDetails')}</h3>
                <p className="text-sm"><strong>{t('common.email')}:</strong> {selectedApplication.lead?.email}</p>
                <p className="text-sm"><strong>{t('admin.registeredAt')}:</strong> {format(new Date(selectedApplication.lead?.created_at), "dd/MM/yyyy HH:mm", { locale: language === 'he' ? he : undefined })}</p>
                {selectedApplication.lead?.what_resonated && (
                  <p className="text-sm mt-2">
                    <strong>{t('admin.whatResonated')}:</strong>
                    <br />
                    {selectedApplication.lead.what_resonated}
                  </p>
                )}
              </div>

              {/* Application Answers */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-primary mb-1">{t('admin.currentSituation')}</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedApplication.current_life_situation}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-primary mb-1">{t('admin.whatFeelsStuck')}</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedApplication.what_feels_stuck}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-primary mb-1">{t('admin.whatToUnderstand')}</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedApplication.what_to_understand}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-primary mb-1">{t('admin.whyNow')}</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedApplication.why_now}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-primary mb-1">{t('admin.opennessToProcess')}</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedApplication.openness_to_process}
                  </p>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-4">
                  <label className="font-medium">{t('common.status')}:</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{statusLabels.pending}</SelectItem>
                      <SelectItem value="reviewed">{statusLabels.reviewed}</SelectItem>
                      <SelectItem value="approved">{statusLabels.approved}</SelectItem>
                      <SelectItem value="rejected">{statusLabels.rejected}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="font-medium block mb-2">{t('admin.adminNotes')}:</label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder={t('admin.internalNotes')}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleUpdateApplication} disabled={updateApplicationMutation.isPending}>
                    {updateApplicationMutation.isPending ? (
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 ml-2" />
                    )}
                    {t('common.saveChanges')}
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedApplication(null)}>
                    {t('common.close')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
