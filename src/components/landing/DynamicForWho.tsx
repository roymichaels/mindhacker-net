import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface ForWhoItem {
  text_he?: string;
  text_en?: string;
}

interface DynamicForWhoProps {
  for_who: ForWhoItem[];
  not_for_who?: ForWhoItem[];
  brand_color?: string;
  section_title_he?: string;
  section_title_en?: string;
}

export const DynamicForWho = ({
  for_who,
  not_for_who = [],
  brand_color = '#8B5CF6',
  section_title_he = 'בשבילך אם...',
  section_title_en = 'This is for you if...',
}: DynamicForWhoProps) => {
  const { language, isRTL } = useLanguage();
  
  const sectionTitle = language === 'he' ? section_title_he : section_title_en;
  const notForTitle = language === 'he' ? 'לא בשבילך אם...' : 'Not for you if...';

  if ((!for_who || for_who.length === 0) && (!not_for_who || not_for_who.length === 0)) {
    return null;
  }

  return (
    <section className="py-20" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* For Who */}
          {for_who && for_who.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-green-500/30 bg-green-500/5">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-6 text-green-600 dark:text-green-400">
                    {sectionTitle}
                  </h3>
                  <ul className="space-y-4">
                    {for_who.map((item, index) => {
                      const text = language === 'he' ? item.text_he : item.text_en;
                      return (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <div 
                            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                            style={{ backgroundColor: `${brand_color}20`, color: brand_color }}
                          >
                            <Check className="w-4 h-4" />
                          </div>
                          <span>{text}</span>
                        </motion.li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Not For Who */}
          {not_for_who && not_for_who.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-red-500/30 bg-red-500/5">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-6 text-red-600 dark:text-red-400">
                    {notForTitle}
                  </h3>
                  <ul className="space-y-4">
                    {not_for_who.map((item, index) => {
                      const text = language === 'he' ? item.text_he : item.text_en;
                      return (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: isRTL ? -10 : 10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 bg-red-500/20 text-red-500">
                            <X className="w-4 h-4" />
                          </div>
                          <span className="text-muted-foreground">{text}</span>
                        </motion.li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
