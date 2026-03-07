import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GalleryCanvas } from "@/components/orb/GalleryMorphOrb";
import { useSEO } from "@/hooks/useSEO";
import { getOrganizationSchema, getWebsiteSchema, BrandSettings } from "@/lib/seo";
import { useTranslation } from "@/hooks/useTranslation";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import { useAuth } from "@/contexts/AuthContext";
import { flowAudit } from "@/lib/flowAudit";
import {
  GameHeroSection,
  OrbCollectionSection,
  OrbEvolutionSection,
  CityShowcaseSection,
  TraitShowcaseSection,
  PlanCinematicSection,
  AuroraCoachSection,
  HypnosisSection,
  Play2EarnSection,
  GamificationSection,
  FreeMarketSection,
  GuildSection,
  CoachOSSection,
  PricingPreviewSection,
  RoadmapSection,
  FinalCTASection,
  InlineCTA,
} from "@/components/home";
import { WelcomeGateProvider } from "@/contexts/WelcomeGateContext";

const Index = () => {
  const { t, isRTL } = useTranslation();
  const { theme } = useThemeSettings();
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      flowAudit.redirect('/', '/now', 'Authenticated user on Index — redirecting to now');
      navigate('/now', { replace: true });
    }
  }, [user, loading, navigate]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      <GalleryCanvas containerRef={containerRef}>
        <Header />
        <WelcomeGateProvider>
          <main className="relative">
            <GameHeroSection />
            <OrbCollectionSection />
            <InlineCTA variant="default" />
            <AuroraCoachSection />
            <InlineCTA variant="subtle" />
            <HypnosisSection />
            <InlineCTA variant="bold" />
            <CityShowcaseSection />
            <InlineCTA variant="subtle" />
            <TraitShowcaseSection />
            <InlineCTA variant="default" />
            <PlanCinematicSection />
            <InlineCTA variant="subtle" />
            <GamificationSection />
            <InlineCTA variant="bold" />
            <Play2EarnSection />
            <InlineCTA variant="default" />
            <FreeMarketSection />
            <InlineCTA variant="subtle" />
            <GuildSection />
            <InlineCTA variant="default" />
            <CoachOSSection />
            <InlineCTA variant="bold" />
            <RoadmapSection />
            <FinalCTASection />
          </main>
        </WelcomeGateProvider>
        <Footer />
      </GalleryCanvas>
    </div>
  );
};

export default Index;
