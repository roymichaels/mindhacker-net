import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionEditor } from "./SectionEditor";
import { Save, Eye, Settings, FileText, Palette, Search, MousePointer } from "lucide-react";

interface LandingPageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageId: string | null;
  isCreating: boolean;
}

interface FormData {
  slug: string;
  template_type: string;
  title_he: string;
  title_en: string;
  seo_title_he: string;
  seo_title_en: string;
  seo_description_he: string;
  seo_description_en: string;
  hero_heading_he: string;
  hero_heading_en: string;
  hero_subheading_he: string;
  hero_subheading_en: string;
  hero_image_url: string;
  hero_video_url: string;
  hero_badge_text_he: string;
  hero_badge_text_en: string;
  sections_order: string[];
  sections_config: Record<string, unknown>;
  pain_points: unknown[];
  process_steps: unknown[];
  benefits: unknown[];
  for_who: unknown[];
  not_for_who: unknown[];
  testimonials: unknown[];
  faqs: unknown[];
  includes: unknown[];
  brand_color: string;
  custom_css: string;
  primary_cta_type: string;
  primary_cta_text_he: string;
  primary_cta_text_en: string;
  primary_cta_link: string;
  is_published: boolean;
  is_homepage: boolean;
}

const defaultFormData: FormData = {
  slug: '',
  template_type: 'product',
  title_he: '',
  title_en: '',
  seo_title_he: '',
  seo_title_en: '',
  seo_description_he: '',
  seo_description_en: '',
  hero_heading_he: '',
  hero_heading_en: '',
  hero_subheading_he: '',
  hero_subheading_en: '',
  hero_image_url: '',
  hero_video_url: '',
  hero_badge_text_he: '',
  hero_badge_text_en: '',
  sections_order: ["hero", "pain_points", "process", "benefits", "testimonials", "faq", "cta"],
  sections_config: {},
  pain_points: [],
  process_steps: [],
  benefits: [],
  for_who: [],
  not_for_who: [],
  testimonials: [],
  faqs: [],
  includes: [],
  brand_color: '#8B5CF6',
  custom_css: '',
  primary_cta_type: 'link',
  primary_cta_text_he: '',
  primary_cta_text_en: '',
  primary_cta_link: '',
  is_published: false,
  is_homepage: false,
};

export const LandingPageDialog = ({
  open,
  onOpenChange,
  pageId,
  isCreating,
}: LandingPageDialogProps) => {
  const { isRTL } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [activeTab, setActiveTab] = useState("general");

  // Fetch page data when editing
  const { data: page, isLoading: isLoadingPage } = useQuery({
    queryKey: ['landing-page', pageId],
    queryFn: async () => {
      if (!pageId) return null;
      const { data, error } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('id', pageId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!pageId && open,
  });

  useEffect(() => {
    if (page) {
      setFormData({
        slug: page.slug || '',
        template_type: page.template_type || 'product',
        title_he: page.title_he || '',
        title_en: page.title_en || '',
        seo_title_he: page.seo_title_he || '',
        seo_title_en: page.seo_title_en || '',
        seo_description_he: page.seo_description_he || '',
        seo_description_en: page.seo_description_en || '',
        hero_heading_he: page.hero_heading_he || '',
        hero_heading_en: page.hero_heading_en || '',
        hero_subheading_he: page.hero_subheading_he || '',
        hero_subheading_en: page.hero_subheading_en || '',
        hero_image_url: page.hero_image_url || '',
        hero_video_url: page.hero_video_url || '',
        hero_badge_text_he: page.hero_badge_text_he || '',
        hero_badge_text_en: page.hero_badge_text_en || '',
        sections_order: Array.isArray(page.sections_order) ? page.sections_order as string[] : [],
        sections_config: (page.sections_config as Record<string, unknown>) || {},
        pain_points: Array.isArray(page.pain_points) ? page.pain_points : [],
        process_steps: Array.isArray(page.process_steps) ? page.process_steps : [],
        benefits: Array.isArray(page.benefits) ? page.benefits : [],
        for_who: Array.isArray(page.for_who) ? page.for_who : [],
        not_for_who: Array.isArray(page.not_for_who) ? page.not_for_who : [],
        testimonials: Array.isArray(page.testimonials) ? page.testimonials : [],
        faqs: Array.isArray(page.faqs) ? page.faqs : [],
        includes: Array.isArray(page.includes) ? page.includes : [],
        brand_color: page.brand_color || '#8B5CF6',
        custom_css: page.custom_css || '',
        primary_cta_type: page.primary_cta_type || 'link',
        primary_cta_text_he: page.primary_cta_text_he || '',
        primary_cta_text_en: page.primary_cta_text_en || '',
        primary_cta_link: page.primary_cta_link || '',
        is_published: page.is_published || false,
        is_homepage: page.is_homepage || false,
      });
    } else if (isCreating) {
      setFormData(defaultFormData);
    }
    setActiveTab("general");
  }, [page, isCreating, open]);

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isCreating) {
        const { error } = await supabase
          .from('landing_pages')
          .insert(data as any);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('landing_pages')
          .update(data as any)
          .eq('id', pageId!);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-pages'] });
      queryClient.invalidateQueries({ queryKey: ['landing-page', pageId] });
      toast({ title: isRTL ? 'נשמר בהצלחה' : 'Saved successfully' });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast({ 
        title: isRTL ? 'שגיאה בשמירה' : 'Error saving',
        variant: 'destructive'
      });
    },
  });

  const handleSave = (publish = false) => {
    const dataToSave = {
      ...formData,
      is_published: publish ? true : formData.is_published,
    };
    saveMutation.mutate(dataToSave);
  };

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isCreating && isLoadingPage) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{isRTL ? 'טוען...' : 'Loading...'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isCreating 
              ? (isRTL ? 'יצירת דף נחיתה חדש' : 'Create New Landing Page')
              : (isRTL ? `עריכת: ${formData.title_he || formData.slug}` : `Edit: ${formData.title_en || formData.slug}`)
            }
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="general" className="gap-1 text-xs">
              <Settings className="w-3 h-3" />
              {isRTL ? 'כללי' : 'General'}
            </TabsTrigger>
            <TabsTrigger value="hero" className="gap-1 text-xs">
              <Eye className="w-3 h-3" />
              Hero
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-1 text-xs">
              <FileText className="w-3 h-3" />
              {isRTL ? 'תוכן' : 'Content'}
            </TabsTrigger>
            <TabsTrigger value="style" className="gap-1 text-xs">
              <Palette className="w-3 h-3" />
              {isRTL ? 'עיצוב' : 'Style'}
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-1 text-xs">
              <Search className="w-3 h-3" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="cta" className="gap-1 text-xs">
              <MousePointer className="w-3 h-3" />
              CTA
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-1">
            <TabsContent value="general" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'כותרת (עברית)' : 'Title (Hebrew)'}</Label>
                  <Input
                    value={formData.title_he || ''}
                    onChange={(e) => updateField('title_he', e.target.value)}
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'כותרת (אנגלית)' : 'Title (English)'}</Label>
                  <Input
                    value={formData.title_en || ''}
                    onChange={(e) => updateField('title_en', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Slug (URL)</Label>
                  <Input
                    value={formData.slug || ''}
                    onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="my-landing-page"
                    disabled={!isCreating && formData.is_homepage}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'סוג תבנית' : 'Template Type'}</Label>
                  <Select
                    value={formData.template_type}
                    onValueChange={(v) => updateField('template_type', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homepage">{isRTL ? 'דף בית' : 'Homepage'}</SelectItem>
                      <SelectItem value="product">{isRTL ? 'מוצר' : 'Product'}</SelectItem>
                      <SelectItem value="lead_capture">{isRTL ? 'לכידת לידים' : 'Lead Capture'}</SelectItem>
                      <SelectItem value="custom">{isRTL ? 'מותאם אישית' : 'Custom'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(v) => updateField('is_published', v)}
                  />
                  <Label>{isRTL ? 'פורסם' : 'Published'}</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hero" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'כותרת Hero (עברית)' : 'Hero Heading (Hebrew)'}</Label>
                  <Textarea
                    value={formData.hero_heading_he || ''}
                    onChange={(e) => updateField('hero_heading_he', e.target.value)}
                    dir="rtl"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'כותרת Hero (אנגלית)' : 'Hero Heading (English)'}</Label>
                  <Textarea
                    value={formData.hero_heading_en || ''}
                    onChange={(e) => updateField('hero_heading_en', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'תת-כותרת (עברית)' : 'Subheading (Hebrew)'}</Label>
                  <Textarea
                    value={formData.hero_subheading_he || ''}
                    onChange={(e) => updateField('hero_subheading_he', e.target.value)}
                    dir="rtl"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'תת-כותרת (אנגלית)' : 'Subheading (English)'}</Label>
                  <Textarea
                    value={formData.hero_subheading_en || ''}
                    onChange={(e) => updateField('hero_subheading_en', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'תגית (עברית)' : 'Badge (Hebrew)'}</Label>
                  <Input
                    value={formData.hero_badge_text_he || ''}
                    onChange={(e) => updateField('hero_badge_text_he', e.target.value)}
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'תגית (אנגלית)' : 'Badge (English)'}</Label>
                  <Input
                    value={formData.hero_badge_text_en || ''}
                    onChange={(e) => updateField('hero_badge_text_en', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'תמונת Hero' : 'Hero Image URL'}</Label>
                  <Input
                    value={formData.hero_image_url || ''}
                    onChange={(e) => updateField('hero_image_url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'וידאו Hero' : 'Hero Video URL'}</Label>
                  <Input
                    value={formData.hero_video_url || ''}
                    onChange={(e) => updateField('hero_video_url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="mt-4 space-y-6">
              <SectionEditor
                title={isRTL ? 'נקודות כאב' : 'Pain Points'}
                items={formData.pain_points as any[] || []}
                onChange={(items) => updateField('pain_points', items as any)}
                fields={[
                  { key: 'title_he', label: isRTL ? 'כותרת (עברית)' : 'Title (Hebrew)', type: 'text' },
                  { key: 'title_en', label: isRTL ? 'כותרת (אנגלית)' : 'Title (English)', type: 'text' },
                  { key: 'description_he', label: isRTL ? 'תיאור (עברית)' : 'Description (Hebrew)', type: 'textarea' },
                  { key: 'description_en', label: isRTL ? 'תיאור (אנגלית)' : 'Description (English)', type: 'textarea' },
                ]}
              />

              <SectionEditor
                title={isRTL ? 'שלבי התהליך' : 'Process Steps'}
                items={formData.process_steps as any[] || []}
                onChange={(items) => updateField('process_steps', items as any)}
                fields={[
                  { key: 'title_he', label: isRTL ? 'כותרת (עברית)' : 'Title (Hebrew)', type: 'text' },
                  { key: 'title_en', label: isRTL ? 'כותרת (אנגלית)' : 'Title (English)', type: 'text' },
                  { key: 'description_he', label: isRTL ? 'תיאור (עברית)' : 'Description (Hebrew)', type: 'textarea' },
                  { key: 'description_en', label: isRTL ? 'תיאור (אנגלית)' : 'Description (English)', type: 'textarea' },
                  { key: 'icon', label: isRTL ? 'אייקון' : 'Icon', type: 'text' },
                ]}
              />

              <SectionEditor
                title={isRTL ? 'יתרונות' : 'Benefits'}
                items={formData.benefits as any[] || []}
                onChange={(items) => updateField('benefits', items as any)}
                fields={[
                  { key: 'title_he', label: isRTL ? 'כותרת (עברית)' : 'Title (Hebrew)', type: 'text' },
                  { key: 'title_en', label: isRTL ? 'כותרת (אנגלית)' : 'Title (English)', type: 'text' },
                  { key: 'description_he', label: isRTL ? 'תיאור (עברית)' : 'Description (Hebrew)', type: 'textarea' },
                  { key: 'description_en', label: isRTL ? 'תיאור (אנגלית)' : 'Description (English)', type: 'textarea' },
                ]}
              />

              <SectionEditor
                title={isRTL ? 'למי זה מתאים' : 'For Who'}
                items={formData.for_who as any[] || []}
                onChange={(items) => updateField('for_who', items as any)}
                fields={[
                  { key: 'text_he', label: isRTL ? 'טקסט (עברית)' : 'Text (Hebrew)', type: 'text' },
                  { key: 'text_en', label: isRTL ? 'טקסט (אנגלית)' : 'Text (English)', type: 'text' },
                ]}
              />

              <SectionEditor
                title={isRTL ? 'שאלות נפוצות' : 'FAQs'}
                items={formData.faqs as any[] || []}
                onChange={(items) => updateField('faqs', items as any)}
                fields={[
                  { key: 'question_he', label: isRTL ? 'שאלה (עברית)' : 'Question (Hebrew)', type: 'text' },
                  { key: 'question_en', label: isRTL ? 'שאלה (אנגלית)' : 'Question (English)', type: 'text' },
                  { key: 'answer_he', label: isRTL ? 'תשובה (עברית)' : 'Answer (Hebrew)', type: 'textarea' },
                  { key: 'answer_en', label: isRTL ? 'תשובה (אנגלית)' : 'Answer (English)', type: 'textarea' },
                ]}
              />
            </TabsContent>

            <TabsContent value="style" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'צבע מותג' : 'Brand Color'}</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.brand_color || '#8B5CF6'}
                    onChange={(e) => updateField('brand_color', e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.brand_color || '#8B5CF6'}
                    onChange={(e) => updateField('brand_color', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? 'CSS מותאם אישית' : 'Custom CSS'}</Label>
                <Textarea
                  value={formData.custom_css || ''}
                  onChange={(e) => updateField('custom_css', e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                  placeholder=".landing-page { }"
                />
              </div>
            </TabsContent>

            <TabsContent value="seo" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'כותרת SEO (עברית)' : 'SEO Title (Hebrew)'}</Label>
                  <Input
                    value={formData.seo_title_he || ''}
                    onChange={(e) => updateField('seo_title_he', e.target.value)}
                    dir="rtl"
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground">
                    {(formData.seo_title_he || '').length}/60
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'כותרת SEO (אנגלית)' : 'SEO Title (English)'}</Label>
                  <Input
                    value={formData.seo_title_en || ''}
                    onChange={(e) => updateField('seo_title_en', e.target.value)}
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground">
                    {(formData.seo_title_en || '').length}/60
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'תיאור SEO (עברית)' : 'SEO Description (Hebrew)'}</Label>
                  <Textarea
                    value={formData.seo_description_he || ''}
                    onChange={(e) => updateField('seo_description_he', e.target.value)}
                    dir="rtl"
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground">
                    {(formData.seo_description_he || '').length}/160
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'תיאור SEO (אנגלית)' : 'SEO Description (English)'}</Label>
                  <Textarea
                    value={formData.seo_description_en || ''}
                    onChange={(e) => updateField('seo_description_en', e.target.value)}
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground">
                    {(formData.seo_description_en || '').length}/160
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cta" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'סוג CTA' : 'CTA Type'}</Label>
                <Select
                  value={formData.primary_cta_type || 'link'}
                  onValueChange={(v) => updateField('primary_cta_type', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="link">{isRTL ? 'קישור' : 'Link'}</SelectItem>
                    <SelectItem value="checkout">{isRTL ? 'צ\'קאאוט' : 'Checkout'}</SelectItem>
                    <SelectItem value="form">{isRTL ? 'טופס' : 'Form'}</SelectItem>
                    <SelectItem value="contact">{isRTL ? 'יצירת קשר' : 'Contact'}</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'טקסט כפתור (עברית)' : 'Button Text (Hebrew)'}</Label>
                  <Input
                    value={formData.primary_cta_text_he || ''}
                    onChange={(e) => updateField('primary_cta_text_he', e.target.value)}
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'טקסט כפתור (אנגלית)' : 'Button Text (English)'}</Label>
                  <Input
                    value={formData.primary_cta_text_en || ''}
                    onChange={(e) => updateField('primary_cta_text_en', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? 'קישור CTA' : 'CTA Link'}</Label>
                <Input
                  value={formData.primary_cta_link || ''}
                  onChange={(e) => updateField('primary_cta_link', e.target.value)}
                  placeholder="/checkout/product-id"
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isRTL ? 'ביטול' : 'Cancel'}
          </Button>
          <Button 
            variant="secondary"
            onClick={() => handleSave(false)}
            disabled={saveMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            {isRTL ? 'שמור' : 'Save'}
          </Button>
          <Button 
            onClick={() => handleSave(true)}
            disabled={saveMutation.isPending}
          >
            <Eye className="w-4 h-4 mr-2" />
            {isRTL ? 'שמור ופרסם' : 'Save & Publish'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
