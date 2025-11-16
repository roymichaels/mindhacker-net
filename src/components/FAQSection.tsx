import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order_index: number;
}

const FAQSection = () => {
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
      <section className="relative py-32 px-4" style={{ zIndex: 2 }}>
        <div className="max-w-4xl mx-auto flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section id="faq" className="relative py-16 md:py-32 px-4" style={{ zIndex: 2 }}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-black mb-8 md:mb-16 text-center cyber-glow">
          שאלות נפוצות
        </h2>

        <div className="glass-panel p-4 md:p-8">
          <Accordion type="single" collapsible className="space-y-3 md:space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-primary/20 rounded-xl px-4 md:px-6 backdrop-blur-sm"
              >
                <AccordionTrigger className="text-right text-base md:text-xl font-bold text-foreground hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-right text-sm md:text-lg text-muted-foreground leading-relaxed pt-3 md:pt-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
