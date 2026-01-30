import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/hooks/useTranslation";
import { PractitionerWithDetails } from "@/hooks/usePractitioners";
import { motion } from "framer-motion";

interface PractitionerTestimonialsProps {
  practitioner: PractitionerWithDetails;
}

const PractitionerTestimonials = ({ practitioner }: PractitionerTestimonialsProps) => {
  const { t, isRTL } = useTranslation();

  if (!practitioner.reviews || practitioner.reviews.length === 0) return null;

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
          {practitioner.reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 relative"
            >
              {/* Quote icon */}
              <Quote className="absolute top-4 end-4 w-8 h-8 text-primary/20" />

              {/* Stars */}
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>

              {/* Review text */}
              {review.review_text && (
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{review.review_text}"
                </p>
              )}

              {/* Author */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.profiles?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {review.profiles?.full_name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <p className="font-medium">
                  {review.profiles?.full_name || t('practitioners.anonymous')}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PractitionerTestimonials;
