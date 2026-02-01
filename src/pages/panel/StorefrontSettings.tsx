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
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('storefrontSettings')}</h1>
          <p className="text-muted-foreground">{t('customizeYourStorefront')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              {t('preview')}
            </a>
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            {t('saveChanges')}
          </Button>
        </div>
      </div>
      
      {/* Preview URL Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Globe className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{t('yourStorefrontUrl')}</p>
              <p className="font-mono text-sm">{previewUrl}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={copyUrl}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="branding" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="branding">
            <Palette className="mr-2 h-4 w-4" />
            {t('branding')}
          </TabsTrigger>
          <TabsTrigger value="landing">
            <Layout className="mr-2 h-4 w-4" />
            {t('landingPage')}
          </TabsTrigger>
          <TabsTrigger value="domain">
            <Globe className="mr-2 h-4 w-4" />
            {t('domain')}
          </TabsTrigger>
          <TabsTrigger value="features">
            <Settings className="mr-2 h-4 w-4" />
            {t('features')}
          </TabsTrigger>
        </TabsList>
        
        {/* Branding Tab */}
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>{t('brandingSettings')}</CardTitle>
              <CardDescription>{t('customizeLookAndFeel')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{t('logoUrl')}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.logo_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                      placeholder="https://..."
                    />
                    <Button variant="outline" size="icon">
                      <Image className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.logo_url && (
                    <img src={formData.logo_url} alt="Logo preview" className="h-12 mt-2" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>{t('faviconUrl')}</Label>
                  <Input
                    value={formData.favicon_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, favicon_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
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
              
              <div className="grid md:grid-cols-2 gap-6">
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
            <CardHeader>
              <CardTitle>{t('landingPageSettings')}</CardTitle>
              <CardDescription>{t('customizeYourHomepage')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>{t('heroImageUrl')}</Label>
                <Input
                  value={formData.hero_image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, hero_image_url: e.target.value }))}
                  placeholder="https://..."
                />
                {formData.hero_image_url && (
                  <img src={formData.hero_image_url} alt="Hero preview" className="h-32 rounded-lg mt-2" />
                )}
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
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
              
              <div className="grid md:grid-cols-2 gap-6">
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
              
              <div className="grid md:grid-cols-2 gap-6">
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
            <CardHeader>
              <CardTitle>{t('domainSettings')}</CardTitle>
              <CardDescription>{t('configureYourDomain')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>{t('subdomain')}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={formData.subdomain}
                    onChange={(e) => setFormData(prev => ({ ...prev, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                    className="max-w-xs"
                  />
                  <span className="text-muted-foreground">.mindhacker.net</span>
                </div>
                <p className="text-sm text-muted-foreground">{t('subdomainDescription')}</p>
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
            <CardHeader>
              <CardTitle>{t('featureToggles')}</CardTitle>
              <CardDescription>{t('enableDisableFeatures')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('enableCourses')}</Label>
                  <p className="text-sm text-muted-foreground">{t('showCoursesSection')}</p>
                </div>
                <Switch
                  checked={formData.enable_courses}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enable_courses: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('enableServices')}</Label>
                  <p className="text-sm text-muted-foreground">{t('showServicesSection')}</p>
                </div>
                <Switch
                  checked={formData.enable_services}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enable_services: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('enableProducts')}</Label>
                  <p className="text-sm text-muted-foreground">{t('showProductsSection')}</p>
                </div>
                <Switch
                  checked={formData.enable_products}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enable_products: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('enableCommunity')}</Label>
                  <p className="text-sm text-muted-foreground">{t('showCommunitySection')}</p>
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
