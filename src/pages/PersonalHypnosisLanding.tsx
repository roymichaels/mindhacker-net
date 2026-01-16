import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PersonalHypnosisCheckoutDialog } from "@/components/checkout/PersonalHypnosisCheckoutDialog";
import { useSEO } from "@/hooks/useSEO";
import { useTranslation } from "@/hooks/useTranslation";
import { useProductBranding } from "@/hooks/useProductBranding";
import { formatPrice } from "@/lib/currency";
import { 
  Brain, 
  Sparkles, 
  Clock, 
  Video, 
  CheckCircle2, 
  MessageCircle, 
  Clapperboard, 
  Send,
  Star,
  Play
} from "lucide-react";

const PersonalHypnosisLanding = () => {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, language, isRTL } = useTranslation();
  const { colors } = useProductBranding('personal-hypnosis-video');

  useSEO({
    title: t('personalHypnosisLanding.seoTitle'),
    description: t('personalHypnosisLanding.seoDescription'),
    keywords: t('personalHypnosisLanding.seoKeywords'),
    url: `${window.location.origin}/personal-hypnosis`,
  });

  // Track if we've processed the checkout action to prevent re-triggers
  const hasProcessedAction = useRef(false);

  // Auto-open checkout if returning from login with action=checkout
  useEffect(() => {
    if (hasProcessedAction.current) return;
    
    const action = searchParams.get('action');
    if (action === 'checkout' && user) {
      hasProcessedAction.current = true;
      setCheckoutOpen(true);
      // Clear the action parameter from URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('action');
      setSearchParams(newParams, { replace: true });
    }
  }, [user, searchParams, setSearchParams]);

  const handlePurchase = () => {
    if (!user) {
      navigate("/login?redirect=/personal-hypnosis?action=checkout");
      return;
    }
    setCheckoutOpen(true);
  };

  const painPoints = [
    { icon: Brain, text: t('personalHypnosisLanding.painPoint1') },
    { icon: Sparkles, text: t('personalHypnosisLanding.painPoint2') },
    { icon: Clock, text: t('personalHypnosisLanding.painPoint3') },
  ];

  const processSteps = [
    { icon: MessageCircle, title: t('personalHypnosisLanding.step1Title'), desc: t('personalHypnosisLanding.step1Desc') },
    { icon: Clapperboard, title: t('personalHypnosisLanding.step2Title'), desc: t('personalHypnosisLanding.step2Desc') },
    { icon: Send, title: t('personalHypnosisLanding.step3Title'), desc: t('personalHypnosisLanding.step3Desc') },
    { icon: Play, title: t('personalHypnosisLanding.step4Title'), desc: t('personalHypnosisLanding.step4Desc') },
  ];

  const benefits = [
    t('personalHypnosisLanding.benefit1'),
    t('personalHypnosisLanding.benefit2'),
    t('personalHypnosisLanding.benefit3'),
    t('personalHypnosisLanding.benefit4'),
    t('personalHypnosisLanding.benefit5'),
  ];

  return (
    <div className="relative min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header brandColors={colors} />
      
      <main className="relative pt-20">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container max-w-4xl mx-auto text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${colors.bgLight} border ${colors.border}/30 ${colors.text} mb-6 animate-fade-in-up`}>
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">{t('personalHypnosisLanding.badge')}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 cyber-glow animate-fade-in-up-delay-1">
              {t('personalHypnosisLanding.heroTitle')}
              <br />
              <span className={colors.text}>{t('personalHypnosisLanding.heroTitleHighlight')}</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up-delay-2">
              {t('personalHypnosisLanding.heroDescription')}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up-delay-3">
              <Button size="lg" onClick={handlePurchase} className={`text-lg px-8 py-6 pulse-glow ${colors.button} ${colors.buttonText}`}>
                {t('personalHypnosisLanding.buyNow')}{formatPrice(297, language)}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t('personalHypnosisLanding.securePayment')}
              </span>
            </div>
          </div>
        </section>

        {/* Pain Points */}
        <section className="py-16 px-4 bg-card/30">
          <div className="container max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              {t('personalHypnosisLanding.painPointsTitle')}
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {painPoints.map((point, i) => (
                <Card key={i} className="glass-panel hover-lift">
                  <CardContent className="p-6 text-center">
                    <point.icon className={`h-10 w-10 mx-auto mb-4 ${colors.text}`} />
                    <p className="text-lg">{point.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-16 px-4">
          <div className="container max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              {t('personalHypnosisLanding.processTitle')}
            </h2>
            <p className="text-center text-muted-foreground mb-10">
              {t('personalHypnosisLanding.processSubtitle')}
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {processSteps.map((step, i) => (
                <Card key={i} className="glass-panel relative overflow-hidden">
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 rounded-full ${colors.bgMedium} flex items-center justify-center mx-auto mb-4`}>
                      <step.icon className={`h-7 w-7 ${colors.text}`} />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className={`mt-8 p-4 ${colors.bgLight} border ${colors.border}/30 rounded-xl text-center`}>
              <Clock className={`h-6 w-6 mx-auto mb-2 ${colors.text}`} />
              <p className={`${colors.text} font-medium`}>
                {t('personalHypnosisLanding.readyIn')}
              </p>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 px-4 bg-card/30">
          <div className="container max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              {t('personalHypnosisLanding.benefitsTitle')}
            </h2>
            
            <div className="glass-panel p-8 max-w-xl mx-auto">
              <ul className="space-y-4">
              {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className={`h-6 w-6 ${colors.text} shrink-0`} />
                    <span className="text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-16 px-4">
          <div className="container max-w-3xl mx-auto text-center">
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-6 w-6 fill-current ${colors.text}`} />
              ))}
            </div>
            <blockquote className="text-xl md:text-2xl italic text-muted-foreground mb-6">
              "{t('personalHypnosisLanding.testimonialQuote')}"
            </blockquote>
            <p className="font-medium">{t('personalHypnosisLanding.testimonialAuthor')}</p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container max-w-2xl mx-auto text-center">
            <div className={`glass-panel p-8 md:p-12 border ${colors.border}/30`}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 cyber-glow">
                {t('personalHypnosisLanding.ctaTitle')}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {t('personalHypnosisLanding.ctaDescription')}
              </p>
              
              <div className="mb-6">
                <span className={`text-4xl font-bold ${colors.text}`}>{formatPrice(297, language)}</span>
                <span className={`text-muted-foreground ${isRTL ? 'mr-2' : 'ml-2'}`}>{t('personalHypnosisLanding.oneTimePayment')}</span>
              </div>
              
              <Button size="lg" onClick={handlePurchase} className={`text-lg px-10 py-6 w-full sm:w-auto pulse-glow ${colors.button} ${colors.buttonText}`}>
                <Video className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('personalHypnosisLanding.purchaseButton')}
              </Button>
              
              <p className="text-sm text-muted-foreground mt-4">
                {t('personalHypnosisLanding.readyNote')}
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      
      <PersonalHypnosisCheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
      />
    </div>
  );
};

export default PersonalHypnosisLanding;