import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/hooks/use-toast";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, ExternalLink, Copy, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { colorOptions, getOfferColors } from "@/lib/productColors";

interface Offer {
  id: string;
  slug: string;
  title: string;
  title_en: string | null;
  subtitle: string | null;
  subtitle_en: string | null;
  price: number;
  price_usd: number | null;
  original_price: number | null;
  brand_color: string | null;
  is_free: boolean;
  cta_type: string;
  cta_text: string | null;
  cta_text_en: string | null;
  cta_link: string | null;
  landing_page_route: string | null;
  landing_page_enabled: boolean;
  show_on_homepage: boolean;
  homepage_order: number;
  status: string;
  badge_text: string | null;
  badge_text_en: string | null;
  seo_title: string | null;
  seo_title_en: string | null;
  seo_description: string | null;
  seo_description_en: string | null;
  practitioner_id: string | null;
  [key: string]: any;
}

interface Practitioner {
  id: string;
  display_name: string;
  display_name_en: string | null;
  slug: string;
}

const Offers = () => {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // Form state
  const [formData, setFormData] = useState<Partial<Offer>>({
    slug: "",
    title: "",
    title_en: "",
    subtitle: "",
    subtitle_en: "",
    description: "",
    description_en: "",
    badge_text: "",
    badge_text_en: "",
    price: 0,
    price_usd: 0,
    original_price: null,
    brand_color: null,
    is_free: false,
    cta_type: "checkout",
    cta_text: "",
    cta_text_en: "",
    landing_page_route: "",
    landing_page_enabled: true,
    show_on_homepage: true,
    homepage_order: 0,
    status: "draft",
    practitioner_id: null,
  });

  // Fetch all practitioners
  const { data: practitioners } = useQuery({
    queryKey: ["admin-practitioners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("practitioners")
        .select("id, display_name, display_name_en, slug")
        .eq("status", "active")
        .order("display_name", { ascending: true });
      if (error) throw error;
      return data as Practitioner[];
    },
  });

  // Fetch all offers
  const { data: offers, isLoading } = useQuery({
    queryKey: ["admin-offers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offers")
        .select("*, practitioners(display_name, display_name_en)")
        .order("homepage_order", { ascending: true });
      if (error) throw error;
      return data as (Offer & { practitioners?: { display_name: string; display_name_en: string | null } })[];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: Partial<Offer>) => {
      const insertData = {
        slug: data.slug!,
        title: data.title!,
        title_en: data.title_en,
        subtitle: data.subtitle,
        subtitle_en: data.subtitle_en,
        price: data.price ?? 0,
        price_usd: data.price_usd,
        original_price: data.original_price,
        brand_color: data.brand_color,
        is_free: data.is_free ?? false,
        cta_type: data.cta_type ?? 'checkout',
        cta_text: data.cta_text,
        cta_text_en: data.cta_text_en,
        cta_link: data.cta_link,
        landing_page_route: data.landing_page_route,
        landing_page_enabled: data.landing_page_enabled ?? true,
        show_on_homepage: data.show_on_homepage ?? true,
        homepage_order: data.homepage_order ?? 0,
        status: data.status ?? 'draft',
        badge_text: data.badge_text,
        badge_text_en: data.badge_text_en,
        seo_title: data.seo_title,
        seo_title_en: data.seo_title_en,
        seo_description: data.seo_description,
        seo_description_en: data.seo_description_en,
        practitioner_id: data.practitioner_id,
      };
      const { error } = await supabase.from("offers").insert([insertData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      queryClient.invalidateQueries({ queryKey: ["homepage-offers"] });
      toast({ title: t("admin.created") });
      handleCloseDialog();
    },
    onError: (error) => {
      toast({ title: t("admin.updateError"), description: error.message, variant: "destructive" });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Offer> }) => {
      const { error } = await supabase.from("offers").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      queryClient.invalidateQueries({ queryKey: ["homepage-offers"] });
      queryClient.invalidateQueries({ queryKey: ["offer-branding"] });
      toast({ title: t("admin.updated") });
      handleCloseDialog();
    },
    onError: (error) => {
      toast({ title: t("admin.updateError"), description: error.message, variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("offers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      queryClient.invalidateQueries({ queryKey: ["homepage-offers"] });
      toast({ title: t("admin.deleted") });
    },
    onError: (error) => {
      toast({ title: t("admin.deleteError"), description: error.message, variant: "destructive" });
    },
  });

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: async (offer: Offer) => {
      const { id, created_at, updated_at, ...rest } = offer;
      const newSlug = `${offer.slug}-copy-${Date.now().toString(36)}`;
      const { error } = await supabase.from("offers").insert([{
        ...rest,
        slug: newSlug,
        title: `${offer.title} (עותק)`,
        title_en: offer.title_en ? `${offer.title_en} (Copy)` : null,
        status: "draft",
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      toast({ title: t("admin.created") });
    },
    onError: (error) => {
      toast({ title: t("admin.updateError"), description: error.message, variant: "destructive" });
    },
  });

  const handleOpenDialog = (offer?: Offer) => {
    if (offer) {
      setEditingOffer(offer);
      setFormData(offer);
    } else {
      setEditingOffer(null);
      setFormData({
        slug: "",
        title: "",
        title_en: "",
        subtitle: "",
        subtitle_en: "",
        description: "",
        description_en: "",
        badge_text: "",
        badge_text_en: "",
        price: 0,
        price_usd: 0,
        original_price: null,
        brand_color: null,
        is_free: false,
        cta_type: "checkout",
        cta_text: "",
        cta_text_en: "",
        landing_page_route: "",
        landing_page_enabled: true,
        show_on_homepage: true,
        homepage_order: (offers?.length || 0) + 1,
        status: "draft",
        practitioner_id: null,
      });
    }
    setActiveTab("basic");
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingOffer(null);
    setActiveTab("basic");
  };

  const handleSave = () => {
    if (!formData.slug || !formData.title) {
      toast({ title: t("admin.testimonialsPage.fillRequired"), variant: "destructive" });
      return;
    }

    if (editingOffer) {
      updateMutation.mutate({ id: editingOffer.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "draft": return "secondary";
      case "archived": return "outline";
      default: return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { he: string; en: string }> = {
      active: { he: "פעיל", en: "Active" },
      draft: { he: "טיוטה", en: "Draft" },
      archived: { he: "בארכיון", en: "Archived" },
    };
    return labels[status]?.[language] || status;
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        titleKey="admin.offers.title"
        subtitleKey="admin.offers.subtitle"
        icon={Sparkles}
        action={{
          labelKey: "admin.offers.create",
          onClick: () => handleOpenDialog(),
          icon: Plus
        }}
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {offers?.map((offer) => {
            const colors = getOfferColors(offer.brand_color);
            return (
              <Card 
                key={offer.id} 
                className={cn(
                  "relative overflow-hidden transition-all hover:shadow-lg",
                  `border-2 ${colors.border}/30 hover:${colors.border}`
                )}
              >
                {/* Color indicator strip */}
                <div className={cn("absolute top-0 left-0 right-0 h-1", colors.bg)} />
                
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {language === "he" ? offer.title : (offer.title_en || offer.title)}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {language === "he" ? offer.subtitle : (offer.subtitle_en || offer.subtitle)}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusBadgeVariant(offer.status)}>
                      {getStatusLabel(offer.status)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Price display */}
                  <div className="flex items-center gap-2">
                    {offer.is_free ? (
                      <span className={cn("text-lg font-bold", colors.text)}>
                        {language === "he" ? "חינם" : "Free"}
                      </span>
                    ) : (
                      <>
                        {offer.original_price && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₪{offer.original_price}
                          </span>
                        )}
                        <span className={cn("text-lg font-bold", colors.text)}>
                          ₪{offer.price}
                        </span>
                        {offer.price_usd && (
                          <span className="text-sm text-muted-foreground">
                            (${offer.price_usd})
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Settings indicators */}
                  <div className="flex flex-wrap gap-1">
                    {offer.practitioners && (
                      <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30">
                        <User className="w-3 h-3 me-1" />
                        {language === "he" 
                          ? offer.practitioners.display_name 
                          : (offer.practitioners.display_name_en || offer.practitioners.display_name)
                        }
                      </Badge>
                    )}
                    {offer.show_on_homepage && (
                      <Badge variant="outline" className="text-xs">
                        {language === "he" ? "בעמוד הבית" : "Homepage"}
                      </Badge>
                    )}
                    {offer.landing_page_enabled && offer.landing_page_route && (
                      <Badge variant="outline" className="text-xs">
                        {language === "he" ? "דף נחיתה" : "Landing Page"}
                      </Badge>
                    )}
                    {offer.is_free && (
                      <Badge variant="outline" className="text-xs bg-amber-500/10 border-amber-500/30">
                        🎁 {language === "he" ? "חינם" : "Free"}
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleOpenDialog(offer)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {offer.landing_page_route && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        asChild
                      >
                        <a href={offer.landing_page_route} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => duplicateMutation.mutate(offer)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("admin.deleteConfirm")}</AlertDialogTitle>
                          <AlertDialogDescription>{t("admin.deleteDescription")}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(offer.id)}>
                            {t("common.delete")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Add new offer card */}
          <Card 
            className="border-dashed border-2 hover:border-primary/50 cursor-pointer transition-all flex items-center justify-center min-h-48"
            onClick={() => handleOpenDialog()}
          >
            <div className="text-center text-muted-foreground">
              <Plus className="w-8 h-8 mx-auto mb-2" />
              <p>{t("admin.offers.create")}</p>
            </div>
          </Card>
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {editingOffer ? t("admin.offers.edit") : t("admin.offers.create")}
            </DialogTitle>
            <DialogDescription>
              {t("admin.offers.editDescription")}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">{t("admin.offers.tabs.basic")}</TabsTrigger>
              <TabsTrigger value="branding">{t("admin.offers.tabs.branding")}</TabsTrigger>
              <TabsTrigger value="landing">{t("admin.offers.tabs.landing")}</TabsTrigger>
              <TabsTrigger value="settings">{t("admin.offers.tabs.settings")}</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("admin.offers.slug")}</Label>
                  <Input
                    value={formData.slug || ""}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                    placeholder="my-offer"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("admin.offers.status")}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">{language === "he" ? "טיוטה" : "Draft"}</SelectItem>
                      <SelectItem value="active">{language === "he" ? "פעיל" : "Active"}</SelectItem>
                      <SelectItem value="archived">{language === "he" ? "בארכיון" : "Archived"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Practitioner Selection */}
              <div className="space-y-2">
                <Label>{language === "he" ? "מאמן" : "Practitioner"}</Label>
                <Select
                  value={formData.practitioner_id || "none"}
                  onValueChange={(value) => setFormData({ ...formData, practitioner_id: value === "none" ? null : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={language === "he" ? "בחר מאמן" : "Select practitioner"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{language === "he" ? "ללא מאמן" : "No practitioner"}</SelectItem>
                    {practitioners?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {language === "he" ? p.display_name : (p.display_name_en || p.display_name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("admin.titleHe")}</Label>
                  <Input
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("admin.titleEn")}</Label>
                  <Input
                    value={formData.title_en || ""}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("admin.offers.subtitleHe")}</Label>
                  <Textarea
                    value={formData.subtitle || ""}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    dir="rtl"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("admin.offers.subtitleEn")}</Label>
                  <Textarea
                    value={formData.subtitle_en || ""}
                    onChange={(e) => setFormData({ ...formData, subtitle_en: e.target.value })}
                    dir="ltr"
                    rows={2}
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">{t("admin.offers.pricing")}</h4>
                <div className="flex items-center gap-4 mb-4">
                  <Switch
                    checked={formData.is_free || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked, price: checked ? 0 : formData.price })}
                  />
                  <Label>{t("admin.offers.isFree")}</Label>
                </div>
                {!formData.is_free && (
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>{t("admin.priceILS")}</Label>
                      <Input
                        type="number"
                        value={formData.price || 0}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("admin.priceUSD")}</Label>
                      <Input
                        type="number"
                        value={formData.price_usd || ""}
                        onChange={(e) => setFormData({ ...formData, price_usd: parseFloat(e.target.value) || null })}
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("admin.offers.originalPrice")}</Label>
                      <Input
                        type="number"
                        value={formData.original_price || ""}
                        onChange={(e) => setFormData({ ...formData, original_price: parseFloat(e.target.value) || null })}
                        dir="ltr"
                        placeholder={language === "he" ? "למחיר מקורי (אופציונלי)" : "Original price (optional)"}
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Branding Tab */}
            <TabsContent value="branding" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>{t("admin.brandColor")}</Label>
                <p className="text-sm text-muted-foreground">{t("admin.offers.brandColorDesc")}</p>
                <Select
                  value={formData.brand_color || "null"}
                  onValueChange={(value) => setFormData({ ...formData, brand_color: value === "null" ? null : value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((option) => (
                      <SelectItem key={option.value ?? "null"} value={option.value ?? "null"}>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-4 h-4 rounded-full", option.preview)} />
                          {language === "he" ? option.labelHe : option.labelEn}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("admin.offers.badgeHe")}</Label>
                  <Input
                    value={formData.badge_text || ""}
                    onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                    placeholder="🎁 מתנה חינמית"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("admin.offers.badgeEn")}</Label>
                  <Input
                    value={formData.badge_text_en || ""}
                    onChange={(e) => setFormData({ ...formData, badge_text_en: e.target.value })}
                    placeholder="🎁 Free Gift"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="border rounded-lg p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">{t("admin.offers.preview")}</p>
                <div className={cn(
                  "p-4 rounded-lg border-2 transition-all",
                  getOfferColors(formData.brand_color).border,
                  getOfferColors(formData.brand_color).bgLight
                )}>
                  {formData.badge_text && (
                    <Badge className={cn("mb-2", getOfferColors(formData.brand_color).bg, getOfferColors(formData.brand_color).buttonText)}>
                      {language === "he" ? formData.badge_text : (formData.badge_text_en || formData.badge_text)}
                    </Badge>
                  )}
                  <h3 className="text-lg font-bold">
                    {language === "he" ? (formData.title || "כותרת ההצעה") : (formData.title_en || formData.title || "Offer Title")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === "he" ? (formData.subtitle || "תיאור קצר") : (formData.subtitle_en || formData.subtitle || "Short description")}
                  </p>
                  <div className="mt-2">
                    <span className={cn("text-xl font-bold", getOfferColors(formData.brand_color).text)}>
                      {formData.is_free ? (language === "he" ? "חינם" : "Free") : `₪${formData.price || 0}`}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Landing Page Tab */}
            <TabsContent value="landing" className="space-y-4 mt-4">
              <div className="flex items-center gap-4">
                <Switch
                  checked={formData.landing_page_enabled ?? true}
                  onCheckedChange={(checked) => setFormData({ ...formData, landing_page_enabled: checked })}
                />
                <Label>{t("admin.offers.landingEnabled")}</Label>
              </div>

              <div className="space-y-2">
                <Label>{t("admin.offers.landingRoute")}</Label>
                <Input
                  value={formData.landing_page_route || ""}
                  onChange={(e) => setFormData({ ...formData, landing_page_route: e.target.value })}
                  placeholder="/my-offer"
                  dir="ltr"
                />
                <p className="text-xs text-muted-foreground">
                  {t("admin.offers.landingRouteDesc")}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{t("admin.offers.ctaType")}</Label>
                <Select
                  value={formData.cta_type || "checkout"}
                  onValueChange={(value) => setFormData({ ...formData, cta_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checkout">{language === "he" ? "תשלום / רכישה" : "Checkout / Purchase"}</SelectItem>
                    <SelectItem value="lead_form">{language === "he" ? "טופס לידים" : "Lead Form"}</SelectItem>
                    <SelectItem value="form">{language === "he" ? "טופס מותאם" : "Custom Form"}</SelectItem>
                    <SelectItem value="external_link">{language === "he" ? "קישור חיצוני" : "External Link"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("admin.offers.ctaTextHe")}</Label>
                  <Input
                    value={formData.cta_text || ""}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    placeholder="הזמן עכשיו"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("admin.offers.ctaTextEn")}</Label>
                  <Input
                    value={formData.cta_text_en || ""}
                    onChange={(e) => setFormData({ ...formData, cta_text_en: e.target.value })}
                    placeholder="Order Now"
                    dir="ltr"
                  />
                </div>
              </div>

              {formData.cta_type === "external_link" && (
                <div className="space-y-2">
                  <Label>{t("admin.offers.ctaLink")}</Label>
                  <Input
                    value={formData.cta_link || ""}
                    onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                    placeholder="https://..."
                    dir="ltr"
                  />
                </div>
              )}
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4 mt-4">
              <div className="flex items-center gap-4">
                <Switch
                  checked={formData.show_on_homepage ?? true}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_on_homepage: checked })}
                />
                <div>
                  <Label>{t("admin.offers.showOnHomepage")}</Label>
                  <p className="text-xs text-muted-foreground">{t("admin.offers.showOnHomepageDesc")}</p>
                </div>
              </div>

              {formData.show_on_homepage && (
                <div className="space-y-2">
                  <Label>{t("admin.offers.homepageOrder")}</Label>
                  <Input
                    type="number"
                    value={formData.homepage_order || 0}
                    onChange={(e) => setFormData({ ...formData, homepage_order: parseInt(e.target.value) || 0 })}
                    min={0}
                    dir="ltr"
                  />
                  <p className="text-xs text-muted-foreground">{t("admin.offers.homepageOrderDesc")}</p>
                </div>
              )}

              {/* SEO fields placeholder */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">{t("admin.offers.seo")}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("admin.offers.seoTitleHe")}</Label>
                    <Input
                      value={formData.seo_title || ""}
                      onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.offers.seoTitleEn")}</Label>
                    <Input
                      value={formData.seo_title_en || ""}
                      onChange={(e) => setFormData({ ...formData, seo_title_en: e.target.value })}
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>{t("admin.offers.seoDescHe")}</Label>
                    <Textarea
                      value={formData.seo_description || ""}
                      onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                      dir="rtl"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.offers.seoDescEn")}</Label>
                    <Textarea
                      value={formData.seo_description_en || ""}
                      onChange={(e) => setFormData({ ...formData, seo_description_en: e.target.value })}
                      dir="ltr"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={handleCloseDialog}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Offers;
