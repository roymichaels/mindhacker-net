import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface ProcessStep {
  title_he?: string;
  title_en?: string;
  description_he?: string;
  description_en?: string;
  icon?: string;
}

interface DynamicProcessProps {
  items: ProcessStep[];
  brand_color?: string;
  section_title_he?: string;
  section_title_en?: string;
}

export const DynamicProcess = ({
  items,
  brand_color = '#8B5CF6',
  section_title_he = 'איך זה עובד?',
  section_title_en = 'How does it work?',
}: DynamicProcessProps) => {
  const { language, isRTL } = useLanguage();
  
  const sectionTitle = language === 'he' ? section_title_he : section_title_en;

  if (!items || items.length === 0) return null;

  return (
    <section className="py-20" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{sectionTitle}</h2>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {items.map((item, index) => {
            const title = language === 'he' ? item.title_he : item.title_en;
            const description = language === 'he' ? item.description_he : item.description_en;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative flex gap-6 mb-8 last:mb-0"
              >
                {/* Step number */}
                <div 
                  className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: brand_color }}
                >
                  {index + 1}
                </div>

                {/* Connecting line */}
                {index < items.length - 1 && (
                  <div 
                    className="absolute top-12 w-0.5 h-full -z-10"
                    style={{ 
                      backgroundColor: `${brand_color}30`,
                      [isRTL ? 'right' : 'left']: '23px'
                    }}
                  />
                )}

                {/* Content */}
                <Card className="flex-1">
                  <CardContent className="p-6">
                    {title && (
                      <h3 className="text-xl font-semibold mb-2">{title}</h3>
                    )}
                    {description && (
                      <p className="text-muted-foreground">{description}</p>
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
