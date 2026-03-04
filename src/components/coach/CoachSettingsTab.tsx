import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useCoachSettings, useSaveCoachSettings } from '@/domain/coaches';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Globe, Palette, Layout, Settings,
  ExternalLink, Copy, CheckCircle, Loader2,
} from 'lucide-react';

const CoachSettingsTab = () => {
  const { t, isRTL } = useTranslation();
  const { user } = useAuth();

  const { practitioner, settings, isLoading } = useCoachSettings(user?.id);
  const saveMutation = useSaveCoachSettings();

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

  const handleSave = () => {
    if (!settings) return;
    saveMutation.mutate(
      { settingsId: settings.id, data: formData },
      { onSuccess: () => toast.success(t('settingsSaved')), onError: (e) => toast.error(e.message) }
    );
  };

  const previewUrl = practitioner?.slug ? `${window.location.origin}/p/${practitioner.slug}` : '';
  const copyUrl = () => {
    navigator.clipboard.writeText(previewUrl);
    toast.success(t('coachSettings.urlCopied'));
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
          <h2 className="text-xl font-bold">{t('coachSettings.storefrontSettings')}</h2>
          <p className="text-sm text-muted-foreground">{t('coachSettings.customizeStorefront')}</p>
        </div>
        <div className="flex gap-2">
          {previewUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="me-2 h-4 w-4" />
                {t('coachSettings.preview')}
              </a>
            </Button>
          )}
          <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <CheckCircle className="me-2 h-4 w-4" />}
            {t('common.save')}
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
                <p className="text-xs text-muted-foreground">{t('coachSettings.storefrontUrl')}</p>
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
              {t('coachSettings.branding')}
            </TabsTrigger>
            <TabsTrigger value="landing" className="gap-1 text-xs sm:text-sm whitespace-nowrap">
              <Layout className="h-3.5 w-3.5" />
              {t('coachSettings.landing')}
            </TabsTrigger>
            <TabsTrigger value="domain" className="gap-1 text-xs sm:text-sm whitespace-nowrap">
              <Globe className="h-3.5 w-3.5" />
              {t('coachSettings.domain')}
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-1 text-xs sm:text-sm whitespace-nowrap">
              <Settings className="h-3.5 w-3.5" />
              {t('coachSettings.features')}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('coachSettings.brandingSettings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('coachSettings.logo')}</Label>
                  <Input value={formData.logo_url} onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label>{t('coachSettings.primaryColor')}</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={formData.brand_color} onChange={(e) => setFormData(prev => ({ ...prev, brand_color: e.target.value }))} className="w-14 h-10 p-1" />
                    <Input value={formData.brand_color} onChange={(e) => setFormData(prev => ({ ...prev, brand_color: e.target.value }))} className="flex-1" />
                  </div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('coachSettings.contactEmail')}</Label>
                  <Input type="email" value={formData.contact_email} onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>{t('coachSettings.phone')}</Label>
                  <Input type="tel" value={formData.contact_phone} onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="landing">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('coachSettings.landingPage')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('coachSettings.heroImage')}</Label>
                <Input value={formData.hero_image_url} onChange={(e) => setFormData(prev => ({ ...prev, hero_image_url: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('coachSettings.headingHe')}</Label>
                  <Input value={formData.hero_heading_he} onChange={(e) => setFormData(prev => ({ ...prev, hero_heading_he: e.target.value }))} dir="rtl" />
                </div>
                <div className="space-y-2">
                  <Label>{t('coachSettings.headingEn')}</Label>
                  <Input value={formData.hero_heading_en} onChange={(e) => setFormData(prev => ({ ...prev, hero_heading_en: e.target.value }))} dir="ltr" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domain">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('coachSettings.domainSettings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('coachSettings.subdomain')}</Label>
                <div className="flex items-center gap-2">
                  <Input value={formData.subdomain} onChange={(e) => setFormData(prev => ({ ...prev, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))} className="max-w-xs" />
                  <span className="text-sm text-muted-foreground">.mindos.app</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('coachSettings.customDomain')}</Label>
                <Input value={formData.custom_domain} onChange={(e) => setFormData(prev => ({ ...prev, custom_domain: e.target.value }))} placeholder="coaching.example.com" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('coachSettings.features')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'enable_courses', label: t('coachSettings.courses') },
                { key: 'enable_services', label: t('coachSettings.services') },
                { key: 'enable_products', label: t('coachSettings.products') },
                { key: 'enable_community', label: t('coachSettings.community') },
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
