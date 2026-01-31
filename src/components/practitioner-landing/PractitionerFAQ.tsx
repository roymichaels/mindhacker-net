import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, HelpCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  question_en: string | null;
  answer_en: string | null;
  order_index: number;
}

const PractitionerFAQ = () => {
  const { t, isRTL, language } = useTranslation();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFAQs = async () => {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (!error && data) {
        setFaqs(data);
      }
      setLoading(false);
    };

    fetchFAQs();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (faqs.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 px-4 bg-muted/30" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('faq.sectionTitle')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {language === 'en' ? 'Answers to common questions' : 'תשובות לשאלות נפוצות'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card rounded-2xl border p-6 md:p-8 shadow-sm"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={faq.id} 
                value={`item-${index}`}
                className="border border-border/50 rounded-xl px-4 md:px-6 transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 data-[state=open]:border-primary/50 data-[state=open]:bg-primary/5"
              >
                <AccordionTrigger className={`${isRTL ? 'text-right' : 'text-left'} text-base md:text-lg font-semibold hover:text-primary transition-colors py-4`}>
                  {language === 'en' ? (faq.question_en || faq.question) : faq.question}
                </AccordionTrigger>
                <AccordionContent className={`${isRTL ? 'text-right' : 'text-left'} text-muted-foreground leading-relaxed pb-4`}>
                  {language === 'en' ? (faq.answer_en || faq.answer) : faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default PractitionerFAQ;
