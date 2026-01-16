import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gift, Sparkles, ArrowLeft, ArrowRight, FileText, Clock, Download, Lock, Eye, Repeat, Target, Heart, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const IntrospectionPromo = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const { settings } = useSiteSettings();

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  const introspectionFormUrl = settings.introspection_form_url || "/form/866eb5a92355da936aea2b7bcb50726cc3f01badf5ebbeaecfff9b2c4aa7539e";

  const features = [
    { icon: FileText, text: t('introspectionPromo.feature1') },
    { icon: Clock, text: t('introspectionPromo.feature2') },
    { icon: Download, text: t('introspectionPromo.feature3') },
    { icon: Brain, text: isRTL ? "ניתוח תודעה אישי מבוסס AI" : "AI-powered consciousness analysis" },
  ];

  const discoveries = [
    { icon: Eye, text: t('introspectionPromo.discover1') },
    { icon: Repeat, text: t('introspectionPromo.discover2') },
    { icon: Target, text: t('introspectionPromo.discover3') },
    { icon: Heart, text: t('introspectionPromo.discover4') },
  ];

  return (
    <section id="introspection" className="relative py-20 md:py-32 overflow-hidden bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Warm gradient background - dark mode only */}
      <div className="absolute inset-0 dark:bg-gradient-to-b dark:from-accent/5 dark:via-background dark:to-background" />
      
      {/* Decorative elements - reduced in light mode */}
      <div className="absolute top-20 left-1/4 w-64 h-64 bg-accent/10 dark:bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-48 h-48 bg-accent/10 dark:bg-accent/10 rounded-full blur-3xl" />
      
      {/* Sacred geometry - dark mode only */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-accent/10 dark:border-accent/10 rounded-full pointer-events-none hidden dark:block" />
      
      <div className="container relative mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/40 shadow-lg shadow-accent/10">
              <Gift className="h-5 w-5 text-accent animate-pulse" />
              <span className="text-sm font-bold text-accent">{t('introspectionPromo.badge')}</span>
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4">
            <span className="text-accent">{t('introspectionPromo.title')}</span>
          </h2>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground text-center max-w-2xl mx-auto mb-4">
            {t('introspectionPromo.subtitle')}
          </p>
          
          <p className="text-base text-muted-foreground/80 text-center max-w-xl mx-auto mb-12">
            {t('introspectionPromo.description')}
          </p>
          
          {/* Content Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Left side - What You'll Discover */}
            <Card className="bg-card dark:bg-card/50 dark:backdrop-blur border-accent/20 shadow-md p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6 text-center text-accent">{t('introspectionPromo.whatDiscover')}</h3>
              
              <ul className="space-y-4">
                {discoveries.map((item, index) => (
                  <li key={index} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/30 transition-colors">
                      <item.icon className="w-5 h-5 text-accent" />
                    </div>
                    <span className="text-foreground">{item.text}</span>
                  </li>
                ))}
              </ul>
            </Card>
            
            {/* Right side - Features & CTA */}
            <Card className="bg-card dark:bg-gradient-to-br dark:from-accent/10 dark:to-accent/5 dark:backdrop-blur border-accent/30 shadow-md p-6 md:p-8 relative overflow-hidden">
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent -skew-x-12 animate-shimmer" />
              
              <h3 className="text-xl font-bold mb-6 text-center relative">{t('introspectionPromo.journeyDetails')}</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-8 relative">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 bg-background/50 rounded-lg p-3">
                    <feature.icon className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
              
              <Button
                size="lg"
                className="w-full gap-3 text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-lg shadow-accent/30 relative overflow-hidden group"
                onClick={() => navigate(introspectionFormUrl)}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {t('introspectionPromo.cta')}
                  <ArrowIcon className="h-5 w-5" />
                </span>
              </Button>
              
              <p className="text-center text-sm text-muted-foreground mt-4 relative">
                {t('introspectionPromo.noSignup')}
              </p>
            </Card>
          </div>
          
          {/* Quote */}
          <div className="text-center">
            <p className="text-lg md:text-xl italic text-accent/80 font-medium">
              "{t('introspectionPromo.quote')}"
            </p>
            <p className="text-muted-foreground mt-2">— {t('about.name')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntrospectionPromo;
