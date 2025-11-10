import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  const faqs = [
    {
      question: "מה ההבדל בין אימון תודעתי לטיפול?",
      answer: "טיפול מתמקד בעבר ובריפוי פצעים. אימון תודעתי מתמקד בהווה ובעתיד — שכתוב תבניות, תכנות מחדש של התת-מודע, ושחרור מהגבלות. זה לא ניתוח, זה עדכון מערכת הפעלה.",
    },
    {
      question: "האם אני בשליטה בזמן ההיפנוזה?",
      answer: "לחלוטין. היפנוזה מודעת היא מצב של מיקוד עמוק ורצוני. אתה מודע לכל רגע, יכול לעצור בכל שלב, ורק מקבל הצעות שמתאימות לך. זה לא שליטה חיצונית — זה שליטה פנימית משוחררת.",
    },
    {
      question: "כמה מפגשים נדרשים?",
      answer: "שינוי משמעותי מורגש כבר מהמפגש הראשון. תהליך מלא נע בין 3-6 מפגשים, תלוי במטרה ובעומק השינוי הרצוי. כל מפגש בונה על הקודם ומעמיק את התכנות.",
    },
  ];

  return (
    <section className="relative py-32 px-4" style={{ zIndex: 2 }}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-5xl font-black mb-16 text-center cyber-glow">
          שאלות נפוצות
        </h2>

        <div className="glass-panel p-8">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-primary/20 rounded-xl px-6 backdrop-blur-sm"
              >
                <AccordionTrigger className="text-right text-xl font-bold text-foreground hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-right text-lg text-muted-foreground leading-relaxed pt-4">
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
