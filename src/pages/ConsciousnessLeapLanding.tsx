import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getStoredAffiliateCode } from "@/components/AffiliateTracker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSEO } from "@/hooks/useSEO";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { useProductBranding } from "@/hooks/useProductBranding";
import { formatPrice } from "@/lib/currency";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Brain, 
  Target, 
  Heart, 
  Sparkles, 
  CheckCircle, 
  XCircle,
  MessageCircle,
  Clock,
  Shield,
  Star,
  ArrowRight,
  ArrowLeft,
  Phone,
  ChevronDown,
  Users,
  Lightbulb,
  Compass,
  RefreshCw,
  Loader2
} from "lucide-react";

const ConsciousnessLeapLanding = () => {
  const { t, language, isRTL } = useTranslation();
  const { colors } = useProductBranding('consciousness-leap');
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatResonated, setWhatResonated] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useSEO({
    title: t('consciousnessLeapLanding.seoTitle'),
    description: t('consciousnessLeapLanding.seoDescription'),
    keywords: t('consciousnessLeapLanding.seoKeywords'),
    url: `${window.location.origin}/consciousness-leap`,
  });

  // Track if we've processed the action to prevent re-triggers
  const hasProcessedAction = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    if (hasProcessedAction.current) return;
    
    // Auto-scroll to form if returning from login with action=apply
    const action = searchParams.get('action');
    if (action === 'apply') {
      hasProcessedAction.current = true;
      setTimeout(() => {
        document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
      // Clear the action parameter from URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('action');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast.error(t('consciousnessLeapLanding.errorFillNameEmail'));
      return;
    }

    setIsSubmitting(true);

    try {
      const affiliateCode = getStoredAffiliateCode();
      const { error } = await supabase.functions.invoke('submit-consciousness-leap-lead', {
        body: { name, email, whatResonated, affiliateCode }
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success(t('consciousnessLeapLanding.successSubmit'));
    } catch (error) {
      console.error("Error submitting lead:", error);
      toast.error(t('consciousnessLeapLanding.errorSubmit'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const painPoints = [
    {
      icon: RefreshCw,
      title: t('consciousnessLeapLanding.painPoint1Title'),
      description: t('consciousnessLeapLanding.painPoint1Desc')
    },
    {
      icon: Compass,
      title: t('consciousnessLeapLanding.painPoint2Title'),
      description: t('consciousnessLeapLanding.painPoint2Desc')
    },
    {
      icon: Lightbulb,
      title: t('consciousnessLeapLanding.painPoint3Title'),
      description: t('consciousnessLeapLanding.painPoint3Desc')
    }
  ];

  const processSteps = [
    { number: t('consciousnessLeapLanding.processStep1Number'), title: t('consciousnessLeapLanding.processStep1Title'), description: t('consciousnessLeapLanding.processStep1Desc') },
    { number: t('consciousnessLeapLanding.processStep2Number'), title: t('consciousnessLeapLanding.processStep2Title'), description: t('consciousnessLeapLanding.processStep2Desc') },
    { number: t('consciousnessLeapLanding.processStep3Number'), title: t('consciousnessLeapLanding.processStep3Title'), description: t('consciousnessLeapLanding.processStep3Desc') },
    { number: t('consciousnessLeapLanding.processStep4Number'), title: t('consciousnessLeapLanding.processStep4Title'), description: t('consciousnessLeapLanding.processStep4Desc') }
  ];

  const benefits = [
    t('consciousnessLeapLanding.benefit1'),
    t('consciousnessLeapLanding.benefit2'),
    t('consciousnessLeapLanding.benefit3'),
    t('consciousnessLeapLanding.benefit4'),
    t('consciousnessLeapLanding.benefit5'),
    t('consciousnessLeapLanding.benefit6')
  ];

  const forWho = [
    t('consciousnessLeapLanding.forWho1'),
    t('consciousnessLeapLanding.forWho2'),
    t('consciousnessLeapLanding.forWho3'),
    t('consciousnessLeapLanding.forWho4')
  ];

  const notForWho = [
    t('consciousnessLeapLanding.notForWho1'),
    t('consciousnessLeapLanding.notForWho2'),
    t('consciousnessLeapLanding.notForWho3'),
    t('consciousnessLeapLanding.notForWho4')
  ];

  const testimonials = [
    { name: t('consciousnessLeapLanding.testimonial1Name'), role: t('consciousnessLeapLanding.testimonial1Role'), quote: t('consciousnessLeapLanding.testimonial1Quote'), rating: 5 },
    { name: t('consciousnessLeapLanding.testimonial2Name'), role: t('consciousnessLeapLanding.testimonial2Role'), quote: t('consciousnessLeapLanding.testimonial2Quote'), rating: 5 },
    { name: t('consciousnessLeapLanding.testimonial3Name'), role: t('consciousnessLeapLanding.testimonial3Role'), quote: t('consciousnessLeapLanding.testimonial3Quote'), rating: 5 }
  ];

  const faqs = [
    { question: t('consciousnessLeapLanding.faq1Question'), answer: t('consciousnessLeapLanding.faq1Answer') },
    { question: t('consciousnessLeapLanding.faq2Question'), answer: t('consciousnessLeapLanding.faq2Answer') },
    { question: t('consciousnessLeapLanding.faq3Question'), answer: t('consciousnessLeapLanding.faq3Answer') },
    { question: t('consciousnessLeapLanding.faq4Question'), answer: t('consciousnessLeapLanding.faq4Answer') },
    { question: t('consciousnessLeapLanding.faq5Question'), answer: t('consciousnessLeapLanding.faq5Answer') }
  ];

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  if (isSubmitted) {
    return (
      <div className="min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
        <main className="relative z-20 pt-24 pb-20 px-4">
          <div className="container max-w-2xl mx-auto text-center">
            <Card className={`bg-card/80 backdrop-blur ${colors.border}/30 p-8 md:p-12`}>
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full ${colors.bgMedium} flex items-center justify-center`}>
                <CheckCircle className={`h-10 w-10 ${colors.text}`} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-6">{t('consciousnessLeapLanding.successTitle')}</h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {t('consciousnessLeapLanding.successText')}
              </p>
              <Button variant="outline" onClick={() => navigate("/")} className="border-primary/50">
                {isRTL ? <ArrowLeft className="h-4 w-4 ml-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                {t('consciousnessLeapLanding.successBackHome')}
              </Button>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="/icons/icon-96x96.png" alt={t('consciousnessLeapLanding.brandName')} className="h-8 w-8" width={32} height={32} loading="eager" decoding="async" />
              <span className="font-black text-lg cyber-glow">{t('consciousnessLeapLanding.brandName')}</span>
            </Link>
            <Button onClick={scrollToForm} className={`${colors.button} ${colors.buttonText}`}>
              {t('consciousnessLeapLanding.navCta')}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-20 min-h-screen flex items-center justify-center pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className={`inline-flex items-center gap-2 ${colors.bgLight} border ${colors.border}/30 rounded-full px-4 py-2 mb-8 animate-fade-in`}>
              <Sparkles className={`w-4 h-4 ${colors.text}`} />
              <span className={`text-sm ${colors.text}`}>{t('consciousnessLeapLanding.limitedSpots')}</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
              <span className={`${colors.text} cyber-glow`}>{t('consciousnessLeapLanding.heroTitle')}</span>
              <br />
              <span className="text-foreground">{t('consciousnessLeapLanding.heroTitleHighlight')}</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
              {t('consciousnessLeapLanding.heroSubtitle')}
              <span className={colors.text}> {t('consciousnessLeapLanding.heroSubtitleHighlight')}</span>
              {t('consciousnessLeapLanding.heroSubtitleEnd')}
            </p>

            <div className={`inline-block bg-card/50 backdrop-blur border ${colors.border}/30 rounded-2xl p-6 mb-8 animate-fade-in`}>
              <div className="text-sm text-muted-foreground mb-1">{t('consciousnessLeapLanding.investInYourself')}</div>
              <div className={`text-4xl md:text-5xl font-bold ${colors.text} cyber-glow`}>{t('consciousnessLeapLanding.price')}</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button size="lg" onClick={scrollToForm} className={`${colors.button} ${colors.buttonText} text-lg px-8 py-6 rounded-xl shadow-lg ${colors.shadow}`}>
                {t('consciousnessLeapLanding.iWantToStart')}
                <ArrowIcon className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
              </Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className={`${colors.border}/50 ${colors.text} hover:${colors.bgLight} text-lg px-8 py-6 rounded-xl`}>
                {t('consciousnessLeapLanding.howDoesItWork')}
                <ChevronDown className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-primary/50" />
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="relative z-20 py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('consciousnessLeapLanding.painPointsSectionTitle')}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t('consciousnessLeapLanding.painPointsSectionSubtitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {painPoints.map((point, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur border-primary/20 p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <point.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-primary">{point.title}</h3>
                <p className="text-muted-foreground">{point.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-20 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('consciousnessLeapLanding.processSectionTitle')} <span className="text-primary">{t('consciousnessLeapLanding.processSectionTitleHighlight')}</span></h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t('consciousnessLeapLanding.processSectionSubtitle')}</p>
          </div>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="relative flex gap-4 p-6 bg-card/30 backdrop-blur rounded-xl border border-primary/20 hover:border-primary/50 transition-all duration-300">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">{step.number}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="relative z-20 py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('consciousnessLeapLanding.includesSectionTitle')} <span className="text-primary">{t('consciousnessLeapLanding.includesSectionTitleHighlight')}</span></h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <Card className="bg-card/50 backdrop-blur border-primary/30 p-8">
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-primary/20 text-center">
                <div className="text-sm text-muted-foreground mb-2">{t('consciousnessLeapLanding.allIncludedPrice')}</div>
                <div className="text-4xl font-bold text-primary cyber-glow">{t('consciousnessLeapLanding.price')}</div>
                <Button onClick={scrollToForm} className="mt-4 bg-primary hover:bg-primary/90">{t('consciousnessLeapLanding.iWantToStart')}</Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* For Who Section */}
      <section className="relative z-20 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('consciousnessLeapLanding.forWhoSectionTitle')} <span className="text-primary">{t('consciousnessLeapLanding.forWhoSectionTitleHighlight')}</span></h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-card/50 backdrop-blur border-primary/30 p-6">
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold">{t('consciousnessLeapLanding.forWhoTitle')}</h3>
              </div>
              <ul className="space-y-4">
                {forWho.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="bg-card/50 backdrop-blur border-destructive/30 p-6">
              <div className="flex items-center gap-2 mb-6">
                <XCircle className="w-6 h-6 text-destructive" />
                <h3 className="text-xl font-bold">{t('consciousnessLeapLanding.notForWhoTitle')}</h3>
              </div>
              <ul className="space-y-4">
                {notForWho.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-20 py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('consciousnessLeapLanding.testimonialsSectionTitle')} <span className="text-primary">{t('consciousnessLeapLanding.testimonialsSectionTitleHighlight')}</span> {t('consciousnessLeapLanding.testimonialsSectionTitleEnd')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur border-primary/20 p-6 hover:border-primary/40 transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative z-20 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-card/50 backdrop-blur border-primary/30 p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center">
                    <Brain className="w-16 h-16 text-primary" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('consciousnessLeapLanding.aboutSectionTitle')} <span className="text-primary">{t('consciousnessLeapLanding.aboutSectionTitleHighlight')}</span></h2>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {t('consciousnessLeapLanding.aboutText1')}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('consciousnessLeapLanding.aboutText2')}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-20 py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('consciousnessLeapLanding.faqSectionTitle')} <span className="text-primary">{t('consciousnessLeapLanding.faqSectionTitleHighlight')}</span></h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-card/50 backdrop-blur border border-primary/20 rounded-xl px-6 data-[state=open]:border-primary/50">
                  <AccordionTrigger className={`${isRTL ? 'text-right' : 'text-left'} hover:no-underline py-4`}>
                    <span className="text-lg font-medium">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Lead Form Section */}
      <section id="lead-form" className="relative z-20 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-card/80 backdrop-blur-lg border-primary/30 p-8 md:p-12 shadow-2xl shadow-primary/10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary">{t('consciousnessLeapLanding.formSectionBadge')}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('consciousnessLeapLanding.formSectionTitle')} <span className="text-primary">{t('consciousnessLeapLanding.formSectionTitleHighlight')}</span></h2>
                <p className="text-muted-foreground">{t('consciousnessLeapLanding.formSectionSubtitle')}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('consciousnessLeapLanding.formNameLabel')}</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="bg-background/50 border-primary/30 focus:border-primary" placeholder={t('consciousnessLeapLanding.formNamePlaceholder')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('consciousnessLeapLanding.formEmailLabel')}</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-background/50 border-primary/30 focus:border-primary" placeholder="your@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatResonated">{t('consciousnessLeapLanding.formWhatResonatedLabel')}</Label>
                  <Textarea id="whatResonated" value={whatResonated} onChange={(e) => setWhatResonated(e.target.value)} className="bg-background/50 border-primary/30 focus:border-primary min-h-[100px]" placeholder={t('consciousnessLeapLanding.formWhatResonatedPlaceholder')} />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg rounded-xl">
                  {isSubmitting ? t('consciousnessLeapLanding.formSubmitting') : (<>{t('consciousnessLeapLanding.formSubmitButton')}<Phone className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} /></>)}
                </Button>
                <p className="text-center text-sm text-muted-foreground">{t('consciousnessLeapLanding.formFreeNote')}</p>
              </form>
            </Card>

            <div className="flex flex-wrap justify-center gap-6 mt-8 text-muted-foreground">
              <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /><span className="text-sm">{t('consciousnessLeapLanding.formBadgeDiscrete')}</span></div>
              <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-primary" /><span className="text-sm">{t('consciousnessLeapLanding.formBadgeResponse')}</span></div>
              <div className="flex items-center gap-2"><MessageCircle className="w-5 h-5 text-primary" /><span className="text-sm">{t('consciousnessLeapLanding.formBadgeNoObligation')}</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-20 py-20 bg-primary/5 border-t border-primary/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('consciousnessLeapLanding.finalCtaTitle')} <span className="text-primary">{t('consciousnessLeapLanding.finalCtaTitleHighlight')}</span></h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">{t('consciousnessLeapLanding.finalCtaSubtitle')}</p>
          <div className="inline-block bg-card/50 backdrop-blur border border-primary/30 rounded-2xl p-8 mb-8">
            <div className="text-sm text-muted-foreground mb-2">{t('consciousnessLeapLanding.finalCtaProcessName')}</div>
            <div className="text-5xl font-bold text-primary cyber-glow mb-2">{t('consciousnessLeapLanding.price')}</div>
            <div className="text-sm text-muted-foreground">{t('consciousnessLeapLanding.finalCtaPriceNote')}</div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={scrollToForm} className="bg-primary hover:bg-primary/90 text-lg px-10 py-6 rounded-xl shadow-lg shadow-primary/25">
              {t('consciousnessLeapLanding.finalCtaButton')}<ArrowIcon className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">{t('consciousnessLeapLanding.finalCtaFooter')}</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 py-8 border-t border-primary/20 bg-background/80">
        <div className="container mx-auto px-4 text-center">
          <Link to="/" className="text-primary hover:underline">{t('consciousnessLeapLanding.footerName')}</Link>
          <p className="text-sm text-muted-foreground mt-2">© {new Date().getFullYear()} {t('consciousnessLeapLanding.footerRights')}</p>
        </div>
      </footer>
    </div>
  );
};

export default ConsciousnessLeapLanding;