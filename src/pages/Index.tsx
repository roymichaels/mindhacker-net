import { useEffect, useRef, lazy, Suspense } from "react";
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
import { WelcomeGateProvider } from "@/contexts/WelcomeGateContext";

// Above-fold (eager)
import { GameHeroSection, ProblemSection } from "@/components/home";

// Below-fold (lazy)
const CityShowcaseSection = lazy(() => import("@/components/home/CityShowcaseSection"));
const OrbCollectionSection = lazy(() => import("@/components/home/OrbCollectionSection"));
const AuroraCoachSection = lazy(() => import("@/components/home/AuroraCoachSection"));
const HypnosisSection = lazy(() => import("@/components/home/HypnosisSection"));
const PlanCinematicSection = lazy(() => import("@/components/home/PlanCinematicSection"));
const TraitShowcaseSection = lazy(() => import("@/components/home/TraitShowcaseSection"));
const GamificationSection = lazy(() => import("@/components/home/GamificationSection"));
const Play2EarnSection = lazy(() => import("@/components/home/Play2EarnSection"));
const FreeMarketSection = lazy(() => import("@/components/home/FreeMarketSection"));
const GuildSection = lazy(() => import("@/components/home/GuildSection"));
const CoachOSSection = lazy(() => import("@/components/home/CoachOSSection"));
const PricingPreviewSection = lazy(() => import("@/components/home/PricingPreviewSection"));
const RoadmapSection = lazy(() => import("@/components/home/RoadmapSection"));
const FinalCTASection = lazy(() => import("@/components/home/FinalCTASection"));
const InlineCTA = lazy(() => import("@/components/home/InlineCTA"));

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
      flowAudit.redirect('/', '/play', 'Authenticated user on Index — redirecting to play');
      navigate('/play', { replace: true });
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
            {/* 1. Hero — Introduction */}
            <GameHeroSection />
            {/* 2. The Problem — Why this exists */}
            <ProblemSection />
            {/* 3. The System Overview — 15 pillars, AI, economy */}
            <CityShowcaseSection />
            <InlineCTA variant="default" />
            {/* 4. AION — Evolving digital identity */}
            <OrbCollectionSection />
            {/* 5. Aurora — Consciousness AI */}
            <AuroraCoachSection />
            <InlineCTA variant="subtle" />
            {/* 6. Hypnosis & Meditation */}
            <HypnosisSection />
            {/* 7. Why-How-Now — 100-Day Plan */}
            <PlanCinematicSection />
            <InlineCTA variant="bold" />
            {/* 8. Identity — Traits & DNA */}
            <TraitShowcaseSection />
            {/* 9. Gamification — XP, Streaks, Skills */}
            <GamificationSection />
            <InlineCTA variant="subtle" />
            {/* 10. Economy — Proof of Growth */}
            <Play2EarnSection />
            {/* 11. Marketplace — FreeMarket */}
            <FreeMarketSection />
            {/* 12. Community + Learning */}
            <GuildSection />
            <InlineCTA variant="default" />
            {/* 13. Career Platform — 5 paths */}
            <CoachOSSection />
            {/* 14. Pricing */}
            <PricingPreviewSection />
            {/* 15. Roadmap */}
            <RoadmapSection />
            {/* 16. Final CTA */}
            <FinalCTASection />
          </main>
        </WelcomeGateProvider>
        <Footer />
      </GalleryCanvas>
    </div>
  );
};

export default Index;
