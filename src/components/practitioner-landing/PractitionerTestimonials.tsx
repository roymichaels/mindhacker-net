import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/hooks/useTranslation";
import { PractitionerWithDetails } from "@/hooks/usePractitioners";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PractitionerTestimonialsProps {
  practitioner: PractitionerWithDetails;
}

interface Testimonial {
  id: string;
  name: string;
  name_en: string | null;
  initials: string | null;
  role: string | null;
  role_en: string | null;
  quote: string;
  quote_en: string | null;
  avatar_url: string | null;
  order_index: number;
}

const PractitionerTestimonials = ({ practitioner }: PractitionerTestimonialsProps) => {
  const { t, isRTL, language } = useTranslation();

  // Fetch testimonials from the testimonials table
  const { data: testimonials = [] } = useQuery({
    queryKey: ['practitioner-testimonials', practitioner.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true })
        .limit(6);
      
      if (error) {
        console.error('Error fetching testimonials:', error);
        return [];
      }
      return data as Testimonial[];
    },
  });

  if (testimonials.length === 0) return null;

  return (
    <section 
      className="py-16 px-4 bg-background"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            {t('practitionerLanding.testimonialsTitle')}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => {
            const name = language === 'en' && testimonial.name_en ? testimonial.name_en : testimonial.name;
            const role = language === 'en' && testimonial.role_en ? testimonial.role_en : testimonial.role;
            const quote = language === 'en' && testimonial.quote_en ? testimonial.quote_en : testimonial.quote;

            return (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 relative"
              >
                {/* Quote icon */}
                <Quote className="absolute top-4 end-4 w-8 h-8 text-primary/20" />

                {/* Stars - 5 star rating */}
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* Review text */}
                <p className="text-muted-foreground mb-6 leading-relaxed line-clamp-6">
                  "{quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={testimonial.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {testimonial.initials || name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{name}</p>
                    {role && (
                      <p className="text-sm text-muted-foreground">{role}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PractitionerTestimonials;