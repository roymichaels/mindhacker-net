import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Check, Star, Sparkles, Heart, Zap, Shield } from "lucide-react";

interface Benefit {
  title_he?: string;
  title_en?: string;
  description_he?: string;
  description_en?: string;
  icon?: string;
}

interface DynamicBenefitsProps {
  items: Benefit[];
  brand_color?: string;
  section_title_he?: string;
  section_title_en?: string;
}

const getIcon = (iconName?: string, index: number = 0) => {
  const icons = [Star, Sparkles, Heart, Zap, Shield, Check];
  const IconComponent = icons[index % icons.length];
  return <IconComponent className="w-6 h-6" />;
};

export const DynamicBenefits = ({
  items,
  brand_color = '#8B5CF6',
  section_title_he = 'מה תקבל?',
  section_title_en = 'What will you get?',
}: DynamicBenefitsProps) => {
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {items.map((item, index) => {
            const title = language === 'he' ? item.title_he : item.title_en;
            const description = language === 'he' ? item.description_he : item.description_en;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-primary/20">
                  <CardContent className="p-6">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${brand_color}20`, color: brand_color }}
                    >
                      {getIcon(item.icon, index)}
                    </div>
                    {title && (
                      <h3 className="text-lg font-semibold mb-2">{title}</h3>
                    )}
                    {description && (
                      <p className="text-muted-foreground text-sm">{description}</p>
                    )}
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
