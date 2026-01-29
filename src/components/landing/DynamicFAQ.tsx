import { useLanguage } from "@/contexts/LanguageContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

interface FAQ {
  question_he?: string;
  question_en?: string;
  answer_he?: string;
  answer_en?: string;
}

interface DynamicFAQProps {
  items: FAQ[];
  brand_color?: string;
  section_title_he?: string;
  section_title_en?: string;
}

export const DynamicFAQ = ({
  items,
  brand_color = '#8B5CF6',
  section_title_he = 'שאלות נפוצות',
  section_title_en = 'Frequently Asked Questions',
}: DynamicFAQProps) => {
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

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {items.map((item, index) => {
              const question = language === 'he' ? item.question_he : item.question_en;
              const answer = language === 'he' ? item.answer_he : item.answer_en;

              if (!question) return null;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AccordionItem 
                    value={`faq-${index}`}
                    className="border rounded-lg px-4 bg-card"
                  >
                    <AccordionTrigger className="text-start hover:no-underline">
                      <span className="font-semibold">{question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              );
            })}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
