import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useSEO } from "@/hooks/useSEO";
import { getOrganizationSchema, getWebsiteSchema, BrandSettings } from "@/lib/seo";
import { useTranslation } from "@/hooks/useTranslation";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import { useAuth } from "@/contexts/AuthContext";
import { 
  GameHeroSection,
  TransformationProofSection,
  JobShowcaseSection,
  WhyChooseUsSection,
  WhatIsThisSection,
  AuroraCoachSection,
  PractitionerShowcaseSection,
  GamificationFeaturesSection,
  FearOfMissingOutSection,
  FinalCTASection,
  FreeJourneyBannerSection,
} from "@/components/home";

const Index = () => {
  const { t, isRTL } = useTranslation();
  const { theme } = useThemeSettings();
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect logged-in users to their dashboard (like major apps)
  useEffect(() => {
    if (!loading && user) {
      navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);
  
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

  // Don't render landing page content while checking auth - show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // If user is logged in, they will be redirected by the useEffect above
  if (user) {
    return null;
  }

  return (
    <div className="relative min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* HUD-style gradient background - Theme-aware using new gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10 -z-10" />
      <div className="fixed inset-0 bg-background/80 -z-10" />
      
      {/* Header */}
      <Header />
      
      <main className="relative z-10">
        {/* Hero with urgency, social proof, typing effect */}
        <GameHeroSection />
        
        {/* Before/After transformation with loss aversion */}
        <TransformationProofSection />
        
        {/* RPG Job System showcase - character selection feel */}
        <JobShowcaseSection />
        
        {/* Why Choose Us - Value Props with dopamine elements */}
        <WhyChooseUsSection />
        
        {/* What is this platform - the 3 pillars */}
        <WhatIsThisSection />
        
        {/* Free Transformation Journey Banner */}
        <FreeJourneyBannerSection />
        
        {/* Aurora AI Coach section */}
        <AuroraCoachSection />
        
        {/* Practitioner Marketplace - Human coaches */}
        <PractitionerShowcaseSection />
        
        {/* Gamification features with XP, levels, streaks */}
        <GamificationFeaturesSection />
        
        {/* FOMO section with countdown */}
        <FearOfMissingOutSection />
        
        {/* Final CTA with all psychological triggers */}
        <FinalCTASection />
      </main>
    </div>
  );
};

export default Index;
