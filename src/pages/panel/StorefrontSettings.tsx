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
  Globe, 
  Palette, 
  Layout, 
  Settings,
  ExternalLink,
  Copy,
  CheckCircle,
  Loader2,
  Image,
  Mail,
  Phone
} from 'lucide-react';

const StorefrontSettings = () => {
  const { t, isRTL } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch practitioner
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
  
  // Fetch settings
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
  
  // Form state
  const [formData, setFormData] = useState({
    // Domain
    subdomain: '',
    custom_domain: '',
    // Branding
    logo_url: '',
    favicon_url: '',
    brand_color: '#e91e63',
    brand_color_secondary: '',
    // Landing Page
    hero_heading_he: '',
    hero_heading_en: '',
    hero_subheading_he: '',
    hero_subheading_en: '',
    hero_image_url: '',
    // Features
    enable_courses: true,
    enable_services: true,
    enable_products: true,
    enable_community: false,
    // SEO
    meta_title: '',
    meta_description: '',
    // Contact
    contact_email: '',
    contact_phone: '',
  });
  
  // Update form when settings load
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
  
  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!practitioner || !settings) throw new Error('No practitioner');
      
      const { error } = await supabase
        .from('practitioner_settings')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t('settingsSaved'));
      queryClient.invalidateQueries({ queryKey: ['practitioner-settings'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const handleSave = () => {
    saveMutation.mutate(formData);
  };
  
  const previewUrl = practitioner?.slug 
    ? `${window.location.origin}/p/${practitioner.slug}` 
    : '';
  
  const copyUrl = () => {
    navigator.clipboard.writeText(previewUrl);
    toast.success(t('copiedToClipboard'));
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4 sm:space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header - stack on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{t('storefrontSettings')}</h1>
          <p className="text-sm text-muted-foreground">{t('customizeYourStorefront')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="me-2 h-4 w-4" />
              {t('preview')}
            </a>
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending} className="flex-1 sm:flex-none">
            {saveMutation.isPending ? (
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="me-2 h-4 w-4" />
            )}
            {t('saveChanges')}
          </Button>
        </div>
      </div>
      
      {/* Preview URL Card */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">{t('yourStorefrontUrl')}</p>
              <p className="font-mono text-xs sm:text-sm truncate">{previewUrl}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={copyUrl} className="shrink-0">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="branding" className="space-y-4">
        {/* Scrollable tabs on mobile */}
        <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-4">
            <TabsTrigger value="branding" className="gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap">
              <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">{t('branding')}</span>
              <span className="xs:hidden">Brand</span>
            </TabsTrigger>
            <TabsTrigger value="landing" className="gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap">
              <Layout className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">{t('landingPage')}</span>
              <span className="xs:hidden">Landing</span>
            </TabsTrigger>
            <TabsTrigger value="domain" className="gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap">
              <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{t('domain')}</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">{t('features')}</span>
              <span className="xs:hidden">Features</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Branding Tab */}
        <TabsContent value="branding">
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">{t('brandingSettings')}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t('customizeLookAndFeel')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm">{t('logoUrl')}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.logo_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                      placeholder="https://..."
                      className="text-sm"
                    />
                    <Button variant="outline" size="icon" className="shrink-0">
                      <Image className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.logo_url && (
                    <img src={formData.logo_url} alt="Logo preview" className="h-12 mt-2" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">{t('faviconUrl')}</Label>
                  <Input
                    value={formData.favicon_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, favicon_url: e.target.value }))}
                    placeholder="https://..."
                    className="text-sm"
                  />
                </div>
              </div>
              
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('primaryColor')}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.brand_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand_color: e.target.value }))}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={formData.brand_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand_color: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>{t('secondaryColor')}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.brand_color_secondary || '#000000'}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand_color_secondary: e.target.value }))}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={formData.brand_color_secondary}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand_color_secondary: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('contactEmail')}</Label>
                  <div className="flex gap-2">
                    <Mail className="h-4 w-4 mt-3 text-muted-foreground" />
                    <Input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                      placeholder="contact@example.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>{t('contactPhone')}</Label>
                  <div className="flex gap-2">
                    <Phone className="h-4 w-4 mt-3 text-muted-foreground" />
                    <Input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                      placeholder="+972..."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Landing Page Tab */}
        <TabsContent value="landing">
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">{t('landingPageSettings')}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t('customizeYourHomepage')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label className="text-sm">{t('heroImageUrl')}</Label>
                <Input
                  value={formData.hero_image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, hero_image_url: e.target.value }))}
                  placeholder="https://..."
                  className="text-sm"
                />
                {formData.hero_image_url && (
                  <img src={formData.hero_image_url} alt="Hero preview" className="h-24 sm:h-32 rounded-lg mt-2 object-cover" />
                )}
              </div>
              
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('heroHeadingHebrew')}</Label>
                  <Input
                    value={formData.hero_heading_he}
                    onChange={(e) => setFormData(prev => ({ ...prev, hero_heading_he: e.target.value }))}
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('heroHeadingEnglish')}</Label>
                  <Input
                    value={formData.hero_heading_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, hero_heading_en: e.target.value }))}
                    dir="ltr"
                  />
                </div>
              </div>
              
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('heroSubheadingHebrew')}</Label>
                  <Textarea
                    value={formData.hero_subheading_he}
                    onChange={(e) => setFormData(prev => ({ ...prev, hero_subheading_he: e.target.value }))}
                    dir="rtl"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('heroSubheadingEnglish')}</Label>
                  <Textarea
                    value={formData.hero_subheading_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, hero_subheading_en: e.target.value }))}
                    dir="ltr"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('seoTitle')}</Label>
                  <Input
                    value={formData.meta_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground">{formData.meta_title.length}/60</p>
                </div>
                <div className="space-y-2">
                  <Label>{t('seoDescription')}</Label>
                  <Textarea
                    value={formData.meta_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                    maxLength={160}
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">{formData.meta_description.length}/160</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Domain Tab */}
        <TabsContent value="domain">
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">{t('domainSettings')}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t('configureYourDomain')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label className="text-sm">{t('subdomain')}</Label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <Input
                    value={formData.subdomain}
                    onChange={(e) => setFormData(prev => ({ ...prev, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                    className="flex-1 sm:max-w-xs text-sm"
                  />
                  <span className="text-sm text-muted-foreground">.mindhacker.net</span>
                </div>
                <p className="text-xs text-muted-foreground">{t('subdomainDescription')}</p>
              </div>
              
              <div className="space-y-2">
                <Label>{t('customDomain')}</Label>
                <Input
                  value={formData.custom_domain}
                  onChange={(e) => setFormData(prev => ({ ...prev, custom_domain: e.target.value }))}
                  placeholder="yourdomain.com"
                />
                <p className="text-sm text-muted-foreground">{t('customDomainDescription')}</p>
              </div>
              
              {formData.custom_domain && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-2">{t('dnsSetup')}</h4>
                    <p className="text-sm text-muted-foreground mb-4">{t('addDnsRecord')}</p>
                    <div className="bg-background p-4 rounded-lg font-mono text-sm">
                      <p>Type: CNAME</p>
                      <p>Name: @</p>
                      <p>Value: mindhacker.net</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Features Tab */}
        <TabsContent value="features">
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">{t('featureToggles')}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t('enableDisableFeatures')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Label className="text-sm">{t('enableCourses')}</Label>
                  <p className="text-xs text-muted-foreground">{t('showCoursesSection')}</p>
                </div>
                <Switch
                  checked={formData.enable_courses}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enable_courses: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Label className="text-sm">{t('enableServices')}</Label>
                  <p className="text-xs text-muted-foreground">{t('showServicesSection')}</p>
                </div>
                <Switch
                  checked={formData.enable_services}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enable_services: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Label className="text-sm">{t('enableProducts')}</Label>
                  <p className="text-xs text-muted-foreground">{t('showProductsSection')}</p>
                </div>
                <Switch
                  checked={formData.enable_products}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enable_products: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Label className="text-sm">{t('enableCommunity')}</Label>
                  <p className="text-xs text-muted-foreground">{t('showCommunitySection')}</p>
                </div>
                <Switch
                  checked={formData.enable_community}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enable_community: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StorefrontSettings;
