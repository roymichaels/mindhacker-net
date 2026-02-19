import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Globe, Palette, Layout, Settings,
  ExternalLink, Copy, CheckCircle, Loader2,
  Image, Mail, Phone
} from 'lucide-react';

const CoachSettingsTab = () => {
  const { t, isRTL, language } = useTranslation();
  const isHebrew = language === 'he';
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: practitioner } = useQuery({
    queryKey: ['my-practitioner', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('practitioners')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['practitioner-settings', practitioner?.id],
    queryFn: async () => {
      if (!practitioner) return null;
      const { data } = await supabase
        .from('practitioner_settings')
        .select('*')
        .eq('practitioner_id', practitioner.id)
        .maybeSingle();
      return data;
    },
    enabled: !!practitioner,
  });

  const [formData, setFormData] = useState({
    subdomain: '', custom_domain: '',
    logo_url: '', favicon_url: '',
    brand_color: '#e91e63', brand_color_secondary: '',
    hero_heading_he: '', hero_heading_en: '',
    hero_subheading_he: '', hero_subheading_en: '',
    hero_image_url: '',
    enable_courses: true, enable_services: true,
    enable_products: true, enable_community: false,
    meta_title: '', meta_description: '',
    contact_email: '', contact_phone: '',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        subdomain: settings.subdomain || '',
        custom_domain: settings.custom_domain || '',
        logo_url: settings.logo_url || '',
        favicon_url: settings.favicon_url || '',
        brand_color: settings.brand_color || '#e91e63',
        brand_color_secondary: settings.brand_color_secondary || '',
        hero_heading_he: settings.hero_heading_he || '',
        hero_heading_en: settings.hero_heading_en || '',
        hero_subheading_he: settings.hero_subheading_he || '',
        hero_subheading_en: settings.hero_subheading_en || '',
        hero_image_url: settings.hero_image_url || '',
        enable_courses: settings.enable_courses ?? true,
        enable_services: settings.enable_services ?? true,
        enable_products: settings.enable_products ?? true,
        enable_community: settings.enable_community ?? false,
        meta_title: settings.meta_title || '',
        meta_description: settings.meta_description || '',
        contact_email: settings.contact_email || '',
        contact_phone: settings.contact_phone || '',
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!practitioner || !settings) throw new Error('No practitioner');
      const { error } = await supabase
        .from('practitioner_settings')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', settings.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t('settingsSaved'));
      queryClient.invalidateQueries({ queryKey: ['practitioner-settings'] });
    },
    onError: (error) => toast.error(error.message),
  });

  const previewUrl = practitioner?.slug ? `${window.location.origin}/p/${practitioner.slug}` : '';
  const copyUrl = () => {
    navigator.clipboard.writeText(previewUrl);
    toast.success(isHebrew ? 'הקישור הועתק' : 'URL copied');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{isHebrew ? 'הגדרות חנות' : 'Storefront Settings'}</h2>
          <p className="text-sm text-muted-foreground">{isHebrew ? 'התאימו את החנות שלכם' : 'Customize your storefront'}</p>
        </div>
        <div className="flex gap-2">
          {previewUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="me-2 h-4 w-4" />
                {isHebrew ? 'תצוגה מקדימה' : 'Preview'}
              </a>
            </Button>
          )}
          <Button size="sm" onClick={() => saveMutation.mutate(formData)} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <CheckCircle className="me-2 h-4 w-4" />}
            {isHebrew ? 'שמור' : 'Save'}
          </Button>
        </div>
      </div>

      {/* URL Card */}
      {previewUrl && (
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-4 hover:shadow-md transition-shadow">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Globe className="h-6 w-6 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{isHebrew ? 'כתובת החנות' : 'Storefront URL'}</p>
                <p className="font-mono text-xs truncate">{previewUrl}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={copyUrl} className="shrink-0">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </div>
      )}

      <Tabs defaultValue="branding" className="space-y-4">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-4">
            <TabsTrigger value="branding" className="gap-1 text-xs sm:text-sm whitespace-nowrap">
              <Palette className="h-3.5 w-3.5" />
              {isHebrew ? 'מיתוג' : 'Branding'}
            </TabsTrigger>
            <TabsTrigger value="landing" className="gap-1 text-xs sm:text-sm whitespace-nowrap">
              <Layout className="h-3.5 w-3.5" />
              {isHebrew ? 'דף נחיתה' : 'Landing'}
            </TabsTrigger>
            <TabsTrigger value="domain" className="gap-1 text-xs sm:text-sm whitespace-nowrap">
              <Globe className="h-3.5 w-3.5" />
              {isHebrew ? 'דומיין' : 'Domain'}
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-1 text-xs sm:text-sm whitespace-nowrap">
              <Settings className="h-3.5 w-3.5" />
              {isHebrew ? 'תכונות' : 'Features'}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{isHebrew ? 'הגדרות מיתוג' : 'Branding'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isHebrew ? 'לוגו' : 'Logo URL'}</Label>
                  <Input value={formData.logo_url} onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label>{isHebrew ? 'צבע ראשי' : 'Primary Color'}</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={formData.brand_color} onChange={(e) => setFormData(prev => ({ ...prev, brand_color: e.target.value }))} className="w-14 h-10 p-1" />
                    <Input value={formData.brand_color} onChange={(e) => setFormData(prev => ({ ...prev, brand_color: e.target.value }))} className="flex-1" />
                  </div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isHebrew ? 'אימייל' : 'Contact Email'}</Label>
                  <Input type="email" value={formData.contact_email} onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>{isHebrew ? 'טלפון' : 'Phone'}</Label>
                  <Input type="tel" value={formData.contact_phone} onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="landing">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{isHebrew ? 'דף נחיתה' : 'Landing Page'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{isHebrew ? 'תמונת גיבור' : 'Hero Image'}</Label>
                <Input value={formData.hero_image_url} onChange={(e) => setFormData(prev => ({ ...prev, hero_image_url: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isHebrew ? 'כותרת (עברית)' : 'Heading (Hebrew)'}</Label>
                  <Input value={formData.hero_heading_he} onChange={(e) => setFormData(prev => ({ ...prev, hero_heading_he: e.target.value }))} dir="rtl" />
                </div>
                <div className="space-y-2">
                  <Label>{isHebrew ? 'כותרת (English)' : 'Heading (English)'}</Label>
                  <Input value={formData.hero_heading_en} onChange={(e) => setFormData(prev => ({ ...prev, hero_heading_en: e.target.value }))} dir="ltr" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domain">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{isHebrew ? 'הגדרות דומיין' : 'Domain Settings'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{isHebrew ? 'תת-דומיין' : 'Subdomain'}</Label>
                <div className="flex items-center gap-2">
                  <Input value={formData.subdomain} onChange={(e) => setFormData(prev => ({ ...prev, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))} className="max-w-xs" />
                  <span className="text-sm text-muted-foreground">.mindos.app</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{isHebrew ? 'דומיין מותאם' : 'Custom Domain'}</Label>
                <Input value={formData.custom_domain} onChange={(e) => setFormData(prev => ({ ...prev, custom_domain: e.target.value }))} placeholder="coaching.example.com" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{isHebrew ? 'תכונות' : 'Features'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'enable_courses', label: isHebrew ? 'קורסים' : 'Courses' },
                { key: 'enable_services', label: isHebrew ? 'שירותים' : 'Services' },
                { key: 'enable_products', label: isHebrew ? 'מוצרים' : 'Products' },
                { key: 'enable_community', label: isHebrew ? 'קהילה' : 'Community' },
              ].map((feature) => (
                <div key={feature.key} className="flex items-center justify-between">
                  <Label>{feature.label}</Label>
                  <Switch
                    checked={formData[feature.key as keyof typeof formData] as boolean}
                    onCheckedChange={(v) => setFormData(prev => ({ ...prev, [feature.key]: v }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoachSettingsTab;
