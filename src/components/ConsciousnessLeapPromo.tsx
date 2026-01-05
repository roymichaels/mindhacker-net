import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Compass, ArrowLeft, ArrowRight, Zap, CheckCircle, Brain, Heart, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

const ConsciousnessLeapPromo = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();

  const benefits = [
    t('consciousnessLeapPromo.benefit1'),
    t('consciousnessLeapPromo.benefit2'),
    t('consciousnessLeapPromo.benefit3'),
    t('consciousnessLeapPromo.benefit4'),
    t('consciousnessLeapPromo.benefit5'),
  ];

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section id="consciousness-leap" className="relative py-20 md:py-32 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-20 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-36 h-36 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="container relative mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">{t('consciousnessLeapPromo.badge')}</span>
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-6 cyber-glow">
            {t('consciousnessLeapPromo.title')}
          </h2>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground text-center max-w-2xl mx-auto mb-4">
            {t('consciousnessLeapPromo.subtitle')}
          </p>
          <p className="text-base text-muted-foreground/80 text-center max-w-xl mx-auto mb-12">
            {t('consciousnessLeapPromo.subtitleSmall')}
          </p>
          
          {/* Content Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Left side - Features */}
            <div className="grid grid-cols-1 gap-4">
              <Card className="bg-card/50 backdrop-blur border-primary/20 p-5 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{t('consciousnessLeapPromo.deepMapping')}</h3>
                  <p className="text-muted-foreground text-sm">{t('consciousnessLeapPromo.deepMappingDesc')}</p>
                </div>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur border-primary/20 p-5 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{t('consciousnessLeapPromo.consciousnessWork')}</h3>
                  <p className="text-muted-foreground text-sm">{t('consciousnessLeapPromo.consciousnessWorkDesc')}</p>
                </div>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur border-primary/20 p-5 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{t('consciousnessLeapPromo.personalGuidance')}</h3>
                  <p className="text-muted-foreground text-sm">{t('consciousnessLeapPromo.personalGuidanceDesc')}</p>
                </div>
              </Card>
            </div>
            
            {/* Right side - Benefits & CTA */}
            <Card className="bg-card/50 backdrop-blur border-primary/30 p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6 text-center">{t('consciousnessLeapPromo.whatIncludes')}</h3>
              
              <ul className="space-y-3 mb-8">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              
              <div className="text-center mb-6">
                <div className="text-sm text-muted-foreground mb-1">{t('consciousnessLeapPromo.investInYourself')}</div>
                <div className="text-4xl font-bold text-primary cyber-glow">{t('consciousnessLeapPromo.price')}</div>
                <div className="text-sm text-muted-foreground mt-1">{t('consciousnessLeapPromo.installments')}</div>
              </div>
              
              <Button
                size="lg"
                className="w-full gap-3 text-lg py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
                onClick={() => navigate("/consciousness-leap")}
              >
                {t('consciousnessLeapPromo.cta')}
                <ArrowIcon className="h-5 w-5" />
              </Button>
              
              <p className="text-center text-sm text-muted-foreground mt-4">
                {t('consciousnessLeapPromo.notForEveryone')}
              </p>
            </Card>
          </div>
          
          {/* Who is it for */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50">
              <Compass className="h-4 w-4 text-accent" />
              <span className="text-sm">{t('consciousnessLeapPromo.atCrossroads')}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm">{t('consciousnessLeapPromo.readyForChange')}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50">
              <Heart className="h-4 w-4 text-accent" />
              <span className="text-sm">{t('consciousnessLeapPromo.seekingClarity')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsciousnessLeapPromo;