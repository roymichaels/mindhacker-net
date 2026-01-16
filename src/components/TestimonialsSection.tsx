import { useState, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, Loader2, Star, ChevronRight, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useTranslation } from "@/hooks/useTranslation";

interface Testimonial {
  id: string;
  name: string;
  name_en: string | null;
  role: string | null;
  role_en: string | null;
  quote: string;
  quote_en: string | null;
  avatar_url: string | null;
  initials: string | null;
}

const TestimonialsSection = () => {
  const { t, isRTL, language } = useTranslation();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      direction: isRTL ? "rtl" : "ltr",
      align: "center"
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true })
        .limit(6);

      if (!error && data) {
        setTestimonials(data);
      }
      setLoading(false);
    };

    fetchTestimonials();
  }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  // Helper function to get localized content
  const getLocalizedContent = (testimonial: Testimonial) => {
    const isEnglish = language === 'en';
    return {
      name: (isEnglish && testimonial.name_en) ? testimonial.name_en : testimonial.name,
      role: (isEnglish && testimonial.role_en) ? testimonial.role_en : testimonial.role,
      quote: (isEnglish && testimonial.quote_en) ? testimonial.quote_en : testimonial.quote,
    };
  };

  if (loading) {
    return (
      <section className="relative py-32 px-4" style={{ zIndex: 2 }}>
        <div className="max-w-7xl mx-auto flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="relative py-16 md:py-32 px-4" style={{ zIndex: 2 }} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 cyber-glow">
            {t('testimonials.sectionTitle')}
          </h2>
          <p className="text-base md:text-xl text-muted-foreground mb-4">
            {t('testimonials.sectionSubtitle')}
          </p>
          
          {/* Rating Summary */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5 text-accent fill-accent" />
              ))}
            </div>
            <span className="text-lg font-bold text-foreground">4.9/5</span>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            className={`absolute ${isRTL ? 'right-0 md:-right-16' : 'left-0 md:-left-16'} top-1/2 -translate-y-1/2 z-10 rounded-full border-border hover:bg-muted bg-card shadow-sm`}
          >
            {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            className={`absolute ${isRTL ? 'left-0 md:-left-16' : 'right-0 md:-right-16'} top-1/2 -translate-y-1/2 z-10 rounded-full border-border hover:bg-muted bg-card shadow-sm`}
          >
            {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </Button>

          {/* Carousel Container */}
          <div ref={emblaRef} className="overflow-hidden px-8 md:px-0">
            <div className="flex">
              {testimonials.map((testimonial, index) => {
                const localized = getLocalizedContent(testimonial);
                return (
                  <div 
                    key={testimonial.id} 
                    className={`flex-[0_0_100%] min-w-0 px-2 md:px-4 transition-all duration-700 ease-out ${
                      selectedIndex === index 
                        ? "opacity-100 scale-100" 
                        : "opacity-0 scale-95"
                    }`}
                  >
                    <TestimonialCard 
                      testimonial={testimonial} 
                      name={localized.name}
                      role={localized.role}
                      quote={localized.quote}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dot Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  selectedIndex === index 
                    ? "bg-primary w-8" 
                    : "bg-primary/30 hover:bg-primary/50"
                }`}
                aria-label={`${t('testimonials.goToTestimonial')} ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="mt-8 md:mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground text-xs md:text-sm">
            <div className="w-6 md:w-8 h-px bg-primary/30" />
            <span>{t('testimonials.bottomNote')}</span>
            <div className="w-6 md:w-8 h-px bg-primary/30" />
          </div>
        </div>
      </div>
    </section>
  );
};

interface TestimonialCardProps {
  testimonial: {
    avatar_url: string | null;
    initials: string | null;
  };
  name: string;
  role: string | null;
  quote: string;
}

const TestimonialCard = ({ testimonial, name, role, quote }: TestimonialCardProps) => (
  <Card className="glass-panel border-primary/30 hover:border-primary/60 transition-all duration-500 cyber-border max-w-2xl mx-auto">
    <CardContent className="p-8 md:p-12">
      <div className="flex flex-col items-center text-center space-y-6">
        {/* Rating Stars */}
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-5 h-5 text-accent fill-accent" />
          ))}
        </div>
        
        {/* Quote Icon */}
        <Quote className="w-10 h-10 md:w-12 md:h-12 text-primary opacity-50" />
        
        {/* Avatar */}
        <Avatar className="w-20 h-20 md:w-24 md:h-24 border-2 border-primary/50">
          <AvatarImage 
            src={testimonial.avatar_url || undefined} 
            alt={name}
            loading="lazy"
            decoding="async"
          />
          <AvatarFallback className="bg-primary/20 text-primary text-xl md:text-2xl font-bold">
            {testimonial.initials || name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        {/* Quote */}
        <p className="text-lg md:text-xl leading-relaxed text-foreground/90 italic max-w-xl">
          "{quote}"
        </p>

        {/* Divider */}
        <div className="w-16 md:w-20 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

        {/* Name & Role */}
        <div>
          <p className="font-bold text-xl md:text-2xl text-foreground">
            {name}
          </p>
          <p className="text-sm md:text-base text-secondary">
            {role}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default TestimonialsSection;