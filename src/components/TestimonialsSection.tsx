import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, Loader2, Star, Users, ChevronRight, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  avatar_url: string | null;
  initials: string | null;
}

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    direction: "rtl",
    align: "start"
  });

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

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

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
    <section className="relative py-16 md:py-32 px-4" style={{ zIndex: 2 }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 cyber-glow">
            קולות מתוך המטריקס
          </h2>
          <p className="text-base md:text-xl text-muted-foreground mb-4">
            אנשים שבחרו לשכתב את הקוד שלהם
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

        {/* Mobile Carousel */}
        <div className="md:hidden relative">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex gap-4">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="flex-[0_0_85%] min-w-0">
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>
          
          {/* Carousel Controls */}
          <div className="flex justify-center gap-4 mt-6">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              className="rounded-full border-primary/50 hover:bg-primary/20"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              className="rounded-full border-primary/50 hover:bg-primary/20"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>

        {/* Bottom decoration */}
        <div className="mt-8 md:mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground text-xs md:text-sm">
            <div className="w-6 md:w-8 h-px bg-primary/30" />
            <span>תוצאות אמיתיות · שינוי מודע</span>
            <div className="w-6 md:w-8 h-px bg-primary/30" />
          </div>
        </div>
      </div>
    </section>
  );
};

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
  <Card className="glass-panel border-primary/30 hover:border-primary/60 transition-all duration-500 cyber-border h-full">
    <CardContent className="p-6 md:p-8">
      <div className="flex flex-col items-center text-center space-y-4 md:space-y-6">
        {/* Rating Stars */}
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-4 h-4 text-accent fill-accent" />
          ))}
        </div>
        
        {/* Quote Icon */}
        <Quote className="w-8 h-8 md:w-10 md:h-10 text-primary opacity-50" />
        
        {/* Avatar */}
        <Avatar className="w-16 h-16 md:w-20 md:h-20 border-2 border-primary/50">
          <AvatarImage src={testimonial.avatar_url || undefined} alt={testimonial.name} />
          <AvatarFallback className="bg-primary/20 text-primary text-lg md:text-xl font-bold">
            {testimonial.initials || testimonial.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        {/* Quote */}
        <p className="text-base md:text-lg leading-relaxed text-foreground/90 italic">
          "{testimonial.quote}"
        </p>

        {/* Divider */}
        <div className="w-12 md:w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

        {/* Name & Role */}
        <div>
          <p className="font-bold text-lg md:text-xl text-foreground">
            {testimonial.name}
          </p>
          <p className="text-sm text-secondary">
            {testimonial.role}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default TestimonialsSection;
