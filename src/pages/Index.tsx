import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { useNavigate, Navigate } from "react-router-dom";
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

// Above-fold (eager) — Phase 5K.2 ontology realignment.
import { GameHeroSection } from "@/components/home";

// Below-fold (lazy) — only canonical sections that match the living-universe ontology.
const PresenceSection = lazy(() => import("@/components/home/PresenceSection"));
const WorldsSection = lazy(() => import("@/components/home/WorldsSection"));
const CityShowcaseSection = lazy(() => import("@/components/home/CityShowcaseSection"));
const AuroraCoachSection = lazy(() => import("@/components/home/AuroraCoachSection"));
const OrbCollectionSection = lazy(() => import("@/components/home/OrbCollectionSection"));
const PlanCinematicSection = lazy(() => import("@/components/home/PlanCinematicSection"));
const FutureEmergenceSection = lazy(() => import("@/components/home/FutureEmergenceSection"));
const FinalCTASection = lazy(() => import("@/components/home/FinalCTASection"));

const Index = () => {
  const { t, isRTL } = useTranslation();
  const { theme } = useThemeSettings();
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null!);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Authenticated users: home IS the dashboard. The chat lives at /aurora as
  // its own dedicated surface, separate from the dashboard.
  // Phase 5E — `/` is the authed home (SmartRoot). Skip the dashboard hop.
  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

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

  // Show spinner while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // (auth-gated redirect handled above)

  return (
    <div ref={containerRef} className="relative min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      <GalleryCanvas containerRef={containerRef}>
        <Header />
        <WelcomeGateProvider>
          <main className="relative">
            {/* 1. Hero — Presence (single living orb, atmospheric) */}
            <GameHeroSection />
            {/* Below-fold: lazy-loaded for faster initial paint */}
            <Suspense fallback={<div className="min-h-[200px]" />}>
              {/* 2. Presence — what AION feels like */}
              <PresenceSection />
              {/* 3. Worlds — realms you enter */}
              <WorldsSection />
              {/* 4. The way AION knows you (atmospheric proof, demoted from identity-stack diagram) */}
              <CityShowcaseSection />
              {/* 5. Living intelligence — meet AION */}
              <AuroraCoachSection />
              {/* 6. Atmospheric proof — orb evolution */}
              <OrbCollectionSection />
              {/* 7. Trajectory — how identity evolves */}
              <PlanCinematicSection />
              {/* 8. Future emergence — what is forming (replaces Play2Earn / FreeMarket / Guild / Roadmap) */}
              <FutureEmergenceSection />
              {/* 9. Quiet invitation */}
              <FinalCTASection />
            </Suspense>
          </main>
        </WelcomeGateProvider>
        <Footer />
      </GalleryCanvas>
    </div>
  );
};

export default Index;
