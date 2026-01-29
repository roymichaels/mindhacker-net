import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

interface Testimonial {
  name?: string;
  role_he?: string;
  role_en?: string;
  content_he?: string;
  content_en?: string;
  avatar_url?: string;
  rating?: number;
}

interface DynamicTestimonialsProps {
  items: Testimonial[];
  brand_color?: string;
  section_title_he?: string;
  section_title_en?: string;
}

export const DynamicTestimonials = ({
  items,
  brand_color = '#8B5CF6',
  section_title_he = 'מה אומרים עלינו',
  section_title_en = 'What people say',
}: DynamicTestimonialsProps) => {
  const { language, isRTL } = useLanguage();
  
  const sectionTitle = language === 'he' ? section_title_he : section_title_en;

  if (!items || items.length === 0) return null;

  return (
    <section className="py-20 bg-muted/30" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{sectionTitle}</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {items.map((item, index) => {
            const content = language === 'he' ? item.content_he : item.content_en;
            const role = language === 'he' ? item.role_he : item.role_en;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <Quote 
                      className="w-8 h-8 mb-4 opacity-30" 
                      style={{ color: brand_color }}
                    />
                    
                    {content && (
                      <p className="text-muted-foreground mb-6 italic">
                        "{content}"
                      </p>
                    )}

                    {item.rating && (
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4"
                            fill={i < item.rating! ? brand_color : 'transparent'}
                            color={brand_color}
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={item.avatar_url} />
                        <AvatarFallback style={{ backgroundColor: `${brand_color}30` }}>
                          {item.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        {item.name && (
                          <p className="font-semibold">{item.name}</p>
                        )}
                        {role && (
                          <p className="text-sm text-muted-foreground">{role}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
