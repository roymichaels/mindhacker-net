import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DecryptText from "./DecryptText";
import TrustBadges from "./TrustBadges";
import HeroVideo from "./HeroVideo";
import HeroPortraitEffect from "./HeroPortraitEffect";
import { ArrowLeft, ArrowRight, Zap, Video, Sparkles, Brain, Gift } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import { useProductsColors } from "@/hooks/useProductBranding";
import { getProductColors } from "@/lib/productColors";
import heroPortrait from "@/assets/hero-portrait.png";

const HeroSection = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const { settings } = useSiteSettings();
  const { theme } = useThemeSettings();
  const { data: products } = useProductsColors();
  
  // Get product colors from database
  const personalHypnosisProduct = products?.find(p => p.slug === 'personal-hypnosis-video');
  const consciousnessLeapProduct = products?.find(p => p.slug === 'consciousness-leap');
  const personalHypnosisColors = getProductColors(personalHypnosisProduct?.brand_color);
  const consciousnessLeapColors = getProductColors(consciousnessLeapProduct?.brand_color);
  
  // Get brand name for alt text from theme settings
  const brandNameAlt = isRTL ? theme.brand_name : theme.brand_name_en;
  
  // Use theme portrait or fallback to asset
  const portraitUrl = theme.hero_portrait_url || heroPortrait;
  
  // Get introspection form URL from settings or use access token
  const formAccessToken = theme.introspection_form_id || "866eb5a92355da936aea2b7bcb50726cc3f01badf5ebbeaecfff9b2c4aa7539e";
  const introspectionFormUrl = settings.introspection_form_url || `/form/${formAccessToken}`;
  
  const wordsHe = ["מוח", "תודעה", "חופש", "מציאות", "זהות", "תת־מודע"];
  const wordsEn = ["Mind", "Consciousness", "Freedom", "Reality", "Identity", "Subconscious"];
  const words = isRTL ? wordsHe : wordsEn;
  
  const [currentWord, setCurrentWord] = useState(0);
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <section className="relative min-h-screen flex items-start justify-center px-3 sm:px-4 md:vignette pt-8 sm:pt-12 md:pt-16 pb-16 sm:pb-20 md:pb-24 bg-background" style={{ zIndex: 2 }} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Radial glow overlay - dark mode only */}
      <div 
        className="absolute inset-0 pointer-events-none hidden dark:block"
        style={{
          background: "radial-gradient(circle at center, hsl(var(--primary) / 0.03) 0%, transparent 70%)"
        }}
      />

      {/* Consciousness pulse behind headline - dark mode only */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] md:w-[900px] h-[400px] sm:h-[600px] md:h-[900px] border border-primary/30 rounded-full consciousness-pulse pointer-events-none hidden dark:block" />

      {/* Sacred geometry background - dark mode only */}
      <div className="absolute inset-0 opacity-5 hidden dark:block">
        <div className="absolute top-1/4 left-1/4 w-24 sm:w-32 md:w-64 h-24 sm:h-32 md:h-64 border border-primary rounded-full animate-breathe" />
      </div>

      <div className="relative text-center max-w-5xl mx-auto">
        {/* Hero Portrait with data-driven effects */}
        <HeroPortraitEffect portraitUrl={portraitUrl} alt={brandNameAlt} />

        {/* Main Headline - proper vertical stacking on mobile */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-4 sm:mb-6 md:mb-8 leading-tight flex flex-col md:flex-row items-center justify-center gap-0 md:gap-4 pb-1 sm:pb-2 animate-fade-in-up" style={{ animationFillMode: 'forwards' }}>
          {isRTL ? (
            <>
              <span className="text-foreground font-black">{t('hero.hackerWord')}</span>
              <DecryptText 
                text={words[currentWord]} 
                className="text-primary"
              />
            </>
          ) : (
            <>
              <DecryptText 
                text={words[currentWord]} 
                className="text-primary"
              />
              <span className="text-foreground font-black">{t('hero.hackerWord')}</span>
            </>
          )}
        </h1>

        <p className="text-base sm:text-xl md:text-3xl text-muted-foreground mb-2 sm:mb-4 font-medium animate-fade-in-up px-2" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          {t('hero.mainSubtitle')}
        </p>

        <p className="text-sm sm:text-base md:text-xl text-secondary mb-4 sm:mb-6 font-light animate-fade-in-up px-2" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
          {t('hero.pathsSubtitle')}
        </p>

        {/* Personal Video Button - smaller margin on mobile */}
        <div className="animate-fade-in-up mb-6 sm:mb-10" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
          <HeroVideo />
        </div>

        {/* Mobile-First: Show Free Gift card prominently first on mobile */}
        <div className="md:hidden mb-5 animate-fade-in-up px-1" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
          <Card className="group relative bg-gradient-to-br from-accent/20 to-accent/10 backdrop-blur-sm border-2 border-accent/70 rounded-2xl p-4 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/40 cursor-pointer overflow-hidden"
            onClick={() => navigate(introspectionFormUrl)}>
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/15 to-transparent -skew-x-12 animate-shimmer" />
            
            <div className="relative flex items-center gap-4">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-accent/40 to-accent/25 border-2 border-accent flex items-center justify-center shadow-lg shadow-accent/30 group-hover:scale-105 transition-transform">
                <Gift className="w-8 h-8 text-accent" />
              </div>
              
              <div className="flex-1 min-w-0 text-start">
                <div className="inline-flex items-center gap-1 bg-accent text-accent-foreground text-[11px] font-bold px-2.5 py-1 rounded-full mb-1.5 shadow-md">
                  {t('hero.freeGift')}
                </div>
                <h3 className="text-lg font-bold text-accent">{t('hero.introspectionForm')}</h3>
                <p className="text-xs text-muted-foreground">{t('hero.introspectionFormTag')}</p>
              </div>
              
              <ArrowIcon className="w-6 h-6 text-accent flex-shrink-0 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </div>
          </Card>
        </div>

        {/* Three Options Cards - Desktop layout */}
        <div className="hidden md:grid md:grid-cols-3 gap-4 lg:gap-6 max-w-6xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
          
          {/* Option 1: Free Introspection Form (FIRST - Entry Point) */}
          <Card className="group relative bg-gradient-to-br from-accent/10 to-accent/5 backdrop-blur border-accent/40 hover:border-accent/70 p-5 md:p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/30 cursor-pointer overflow-hidden"
            onClick={() => navigate(introspectionFormUrl)}>
            {/* Animated glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent -skew-x-12 group-hover:animate-shimmer" />
            
            <div className="relative">
              <div className="flex justify-center mb-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/30 to-accent/20 border-2 border-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-accent/20">
                  <Gift className="w-8 h-8 text-accent" />
                </div>
              </div>
              
              <div className="inline-flex items-center gap-2 bg-accent/15 rounded-full px-3 py-1 mb-3">
                <Sparkles className="w-3 h-3 text-accent" />
                <span className="text-xs text-accent font-medium">{t('hero.introspectionFormTag')}</span>
              </div>
              
              <h3 className="text-xl md:text-2xl font-bold mb-2 text-accent">{t('hero.introspectionForm')}</h3>
              
              <p className="text-muted-foreground mb-4 text-sm">
                {t('hero.introspectionFormDesc')}
              </p>
              
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold group-hover:shadow-lg group-hover:shadow-accent/40 transition-all">
                <Sparkles className="w-4 h-4 mr-2" />
                {t('hero.startFree')}
                <ArrowIcon className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
              </Button>
              
              {/* Free badge - below CTA */}
              <div className="flex justify-center mt-3">
                <div className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-accent/40 animate-pulse">
                  <Gift className="w-3 h-3 inline-block mr-1" />
                  {t('hero.freeGift')}
                </div>
              </div>
            </div>
          </Card>

          {/* Option 2: Personal Hypnosis Video (SECOND - Low barrier) - Data-driven color */}
          <Card className={`group relative bg-card border border-border shadow-md ${personalHypnosisColors.borderHover} p-5 md:p-6 transition-all duration-500 hover:shadow-xl cursor-pointer overflow-hidden`}
            onClick={() => navigate("/personal-hypnosis")}>
            {/* Glow effect on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${personalHypnosisColors.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <div className="relative">
              <div className="flex justify-center mb-3">
                <div className={`w-14 h-14 rounded-full ${personalHypnosisColors.bgMedium} border-2 ${personalHypnosisColors.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Video className={`w-7 h-7 ${personalHypnosisColors.text}`} />
                </div>
              </div>
              
              <div className={`inline-flex items-center gap-2 ${personalHypnosisColors.bgLight} rounded-full px-3 py-1 mb-3`}>
                <Brain className={`w-3 h-3 ${personalHypnosisColors.text}`} />
                <span className={`text-xs ${personalHypnosisColors.text} font-medium`}>{t('hero.personalHypnosisTag')}</span>
              </div>
              
              <h3 className="text-xl md:text-2xl font-bold mb-2">{t('hero.personalHypnosis')}</h3>
              
              <p className="text-muted-foreground mb-4 text-sm">
                {t('hero.personalHypnosisDesc')}
              </p>
              
              <Button className={`w-full ${personalHypnosisColors.button} ${personalHypnosisColors.buttonText} group-hover:shadow-lg group-hover:${personalHypnosisColors.shadow} transition-all`}>
                {t('hero.discoverMore')}
                <ArrowIcon className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
              </Button>
            </div>
          </Card>

          {/* Option 3: Consciousness Leap (THIRD - Full commitment) - Data-driven color */}
          <Card className={`group relative bg-card border border-border shadow-md ${consciousnessLeapColors.borderHover} p-5 md:p-6 transition-all duration-500 hover:shadow-xl cursor-pointer overflow-hidden`}
            onClick={() => navigate("/consciousness-leap")}>
            {/* Glow effect on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${consciousnessLeapColors.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <div className="relative">
              <div className="flex justify-center mb-3">
                <div className={`w-14 h-14 rounded-full ${consciousnessLeapColors.bgMedium} border-2 ${consciousnessLeapColors.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Zap className={`w-7 h-7 ${consciousnessLeapColors.text}`} />
                </div>
              </div>
              
              <div className={`inline-flex items-center gap-2 ${consciousnessLeapColors.bgLight} rounded-full px-3 py-1 mb-3`}>
                <Sparkles className={`w-3 h-3 ${consciousnessLeapColors.text}`} />
                <span className={`text-xs ${consciousnessLeapColors.text} font-medium`}>{t('hero.consciousnessLeapTag')}</span>
              </div>
              
              <h3 className="text-xl md:text-2xl font-bold mb-2">{t('hero.consciousnessLeap')}</h3>
              
              <p className="text-muted-foreground mb-4 text-sm">
                {t('hero.consciousnessLeapDesc')}
              </p>
              
              <Button className={`w-full ${consciousnessLeapColors.button} ${consciousnessLeapColors.buttonText} group-hover:shadow-lg group-hover:${consciousnessLeapColors.shadow} transition-all`}>
                {t('hero.discoverIfRight')}
                <ArrowIcon className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
              </Button>
            </div>
          </Card>
        </div>

        {/* Mobile: Compact cards for other options */}
        <div className="md:hidden grid grid-cols-2 gap-3 mb-6 px-1 animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
          {/* Personal Hypnosis - Mobile - Data-driven color */}
          <Card className={`group relative bg-card border border-border shadow-sm rounded-xl p-3.5 transition-all cursor-pointer ${personalHypnosisColors.borderHover}`}
            onClick={() => navigate("/personal-hypnosis")}>
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full ${personalHypnosisColors.bgMedium} border-2 ${personalHypnosisColors.border} mx-auto mb-2.5 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                <Video className={`w-6 h-6 ${personalHypnosisColors.text}`} />
              </div>
              <h3 className="text-sm font-bold mb-1">{t('hero.personalHypnosis')}</h3>
              <p className="text-[11px] text-muted-foreground line-clamp-2">{t('hero.personalHypnosisTag')}</p>
            </div>
          </Card>
          
          {/* Consciousness Leap - Mobile - Data-driven color */}
          <Card className={`group relative bg-card border border-border shadow-sm rounded-xl p-3.5 transition-all cursor-pointer ${consciousnessLeapColors.borderHover}`}
            onClick={() => navigate("/consciousness-leap")}>
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full ${consciousnessLeapColors.bgMedium} border-2 ${consciousnessLeapColors.border} mx-auto mb-2.5 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                <Zap className={`w-6 h-6 ${consciousnessLeapColors.text}`} />
              </div>
              <h3 className="text-sm font-bold mb-1">{t('hero.consciousnessLeap')}</h3>
              <p className="text-[11px] text-muted-foreground line-clamp-2">{t('hero.consciousnessLeapTag')}</p>
            </div>
          </Card>
        </div>

        {/* Trust Badges */}
        <TrustBadges />

        {/* Bottom note - hide on mobile for cleaner look */}
        <p className="hidden sm:block text-muted-foreground text-sm max-w-lg mx-auto mt-6">
          {t('hero.notSure')}
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
