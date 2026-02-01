import { motion } from 'framer-motion';
import { Users, ArrowRight, Star, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

export default function PractitionerShowcaseSection() {
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();

  // Fetch featured practitioners
  const { data: practitioners } = useQuery({
    queryKey: ['featured-practitioners-home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('practitioners')
        .select('id, slug, display_name, display_name_en, bio, bio_en, title, title_en, avatar_url, rating, reviews_count, is_featured, languages')
        .eq('status', 'active')
        .eq('is_featured', true)
        .limit(3);
      
      if (error) throw error;
      return data;
    },
  });

  // Don't render if no practitioners
  if (!practitioners?.length) return null;

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-muted/50 via-muted/20 to-transparent dark:from-gray-900/50 dark:via-gray-950/30 dark:to-transparent relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/20 to-violet-500/20 border border-primary/30 mb-6 shadow-lg shadow-primary/10">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              {isRTL ? 'מאמנים אנושיים' : 'Human Coaches'}
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5">
            {isRTL ? (
              <>לא רק AI — גם <span className="text-primary">מאמנים אמיתיים</span></>
            ) : (
              <>Not Just AI — <span className="text-primary">Real Human Coaches</span></>
            )}
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isRTL 
              ? 'Aurora מטפלת ביומיום. המאמנים שלנו מטפלים בעומק.'
              : 'Aurora handles the daily. Our coaches handle depth.'
            }
          </p>
        </motion.div>

        {/* Practitioners Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {practitioners.map((practitioner, index) => {
            const name = isRTL ? practitioner.display_name : (practitioner.display_name_en || practitioner.display_name);
            const title = isRTL ? practitioner.title : (practitioner.title_en || practitioner.title);

            return (
              <motion.div
                key={practitioner.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className={cn(
                  "relative p-6 rounded-2xl cursor-pointer",
                  "bg-card/60 border border-border/50 backdrop-blur-sm",
                  "hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
                )}
                onClick={() => navigate(`/practitioners/${practitioner.slug}`)}
              >
                {/* Featured Badge */}
                {practitioner.is_featured && (
                  <div className="absolute top-3 end-3 flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/30">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span className="text-xs font-medium text-amber-500">
                      {isRTL ? 'מומלץ' : 'Featured'}
                    </span>
                  </div>
                )}

                {/* Avatar */}
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-muted mb-3 ring-2 ring-primary/20">
                    {practitioner.avatar_url ? (
                      <img src={practitioner.avatar_url} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-violet-500/20">
                        <span className="text-2xl font-bold text-primary">
                          {name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-lg">{name}</h3>
                  <p className="text-sm text-muted-foreground">{title}</p>
                  
                  {/* Rating */}
                  {practitioner.rating && (
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-medium">{practitioner.rating}</span>
                      {practitioner.reviews_count && (
                        <span className="text-xs text-muted-foreground">
                          ({practitioner.reviews_count})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Languages */}
                {practitioner.languages && practitioner.languages.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    {practitioner.languages.slice(0, 3).map((lang, i) => (
                      <span 
                        key={i}
                        className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate('/practitioners')}
            className="group"
          >
            {isRTL ? 'לכל המאמנים' : 'View All Coaches'}
            <ArrowRight className={cn(
              "h-4 w-4 transition-transform group-hover:translate-x-1",
              isRTL && "rotate-180 group-hover:-translate-x-1"
            )} />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
