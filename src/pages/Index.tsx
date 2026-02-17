import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { getOrganizationSchema, getWebsiteSchema, BrandSettings } from "@/lib/seo";
import { useTranslation } from "@/hooks/useTranslation";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import { useAuth } from "@/contexts/AuthContext";
import { 
  GameHeroSection,
  AuroraCoachSection,
  TransformationJourneySection,
  WhyChooseUsSection,
  TransformationProofSection,
  FinalCTASection,
} from "@/components/home";

const Index = () => {
  const { t, isRTL } = useTranslation();
  const { theme } = useThemeSettings();
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect logged-in users to their dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/today', { replace: true });
    }
  }, [user, loading, navigate]);
  
  // Build brand settings from theme for SEO
  const brandSettings: BrandSettings = {
    brandName: theme.brand_name,
    brandNameEn: theme.brand_name_en,
    founderName: theme.founder_name,
    founderNameEn: theme.founder_name_en,
    founderTitle: theme.founder_title,
    founderTitleEn: theme.founder_title_en,
    siteUrl: theme.site_url || window.location.origin,
    ogImageUrl: theme.og_image_url,
  };

  useSEO({
    title: t('seo.indexTitle'),
    description: t('seo.indexDescription'),
    keywords: t('seo.indexKeywords'),
    url: window.location.origin,
    type: "website",
    siteName: isRTL ? theme.brand_name : theme.brand_name_en,
    structuredData: [
      getOrganizationSchema(brandSettings), 
      getWebsiteSchema(brandSettings)
    ],
  });

  // Don't render landing page content while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // If user is logged in, they will be redirected
  if (user) {
    return null;
  }

  return (
    <div className="relative min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <Header />
      
      <main className="relative z-10">
        {/* Hero - 90-Day Transformation pitch */}
        <GameHeroSection />
        
        {/* The 3-phase transformation timeline */}
        <TransformationJourneySection />
        
        {/* Aurora Coach - AI as your daily guide */}
        <AuroraCoachSection />
        
        {/* Why Choose Us - value props reframed around outcomes */}
        <WhyChooseUsSection />
        
        {/* Social proof */}
        <TransformationProofSection />
        
        {/* Final CTA */}
        <FinalCTASection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
