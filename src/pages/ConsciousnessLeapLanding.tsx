import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSEO } from "@/hooks/useSEO";
import { toast } from "sonner";
import MatrixRain from "@/components/MatrixRain";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Brain, 
  Target, 
  Heart, 
  Sparkles, 
  CheckCircle, 
  XCircle,
  MessageCircle,
  Clock,
  Shield,
  Star,
  ArrowRight,
  Phone,
  ChevronDown,
  Users,
  Lightbulb,
  Compass,
  RefreshCw,
  Loader2,
  ArrowLeft
} from "lucide-react";

const ConsciousnessLeapLanding = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatResonated, setWhatResonated] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  useSEO({
    title: "קפיצה לתודעה חדשה | תהליך טרנספורמציה אישית עם דין אושר אזולאי",
    description: "תהליך מקיף וממוקד לשינוי עמוק ובר-קיימא. 3-5 מפגשים שיביאו אותך לבהירות, כיוון ושחרור דפוסים ישנים.",
    keywords: "תודעה, בהירות, חיבור עצמי, תהליך אישי, דין אושר אזולאי, טרנספורמציה",
    url: `${window.location.origin}/consciousness-leap`,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast.error("נא למלא שם ואימייל");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('submit-consciousness-leap-lead', {
        body: { name, email, whatResonated }
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("הפרטים נשלחו בהצלחה! נחזור אליך בהקדם");
    } catch (error) {
      console.error("Error submitting lead:", error);
      toast.error("שגיאה בשליחת הפרטים, נסו שוב");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const painPoints = [
    {
      icon: RefreshCw,
      title: "מרגיש שאתה מסתובב במעגלים?",
      description: "אותן מחשבות, אותם דפוסים, אותן תוצאות. משהו עמוק יודע שהגיע הזמן לשינוי אמיתי."
    },
    {
      icon: Compass,
      title: "עומד בצומת ולא יודע לאן?",
      description: "החלטות גדולות מרגישות מכריעות. הייתי רוצה בהירות אמיתית לגבי הכיוון הנכון עבורי."
    },
    {
      icon: Lightbulb,
      title: "יודע שמשהו צריך להשתנות?",
      description: "תחושה עמוקה שיש עוד משהו, שאתה מסוגל ליותר - אבל לא יודע מה בדיוק חוסם."
    }
  ];

  const processSteps = [
    { number: "01", title: "שיחת היכרות", description: "שיחה טלפונית קצרה כדי להבין את הצרכים שלך ולוודא התאמה הדדית" },
    { number: "02", title: "מיפוי עומק", description: "מפגש ראשון לזיהוי הדפוסים, האמונות והחסמים שמונעים ממך להתקדם" },
    { number: "03", title: "עבודה תודעתית", description: "3-5 מפגשים של טרנספורמציה עמוקה עם שילוב היפנוזה וטכניקות מתקדמות" },
    { number: "04", title: "עתיד חדש", description: "סיום עם בהירות, כיוון ותוכנית פעולה להמשך הדרך" }
  ];

  const benefits = [
    "שיחת אבחון והיכרות (30 דק')",
    "3-5 מפגשי עומק (כל מפגש 90 דק')",
    "הקלטות היפנוזה מותאמות אישית",
    "תמיכה בווטסאפ לאורך כל התהליך",
    "חומרים נלווים ותרגילים להמשך",
    "מפגש סיכום ותוכנית להמשך"
  ];

  const forWho = [
    "אנשים בצומת משמעותית בחיים",
    "מי שמוכן להשקיע בעצמו",
    "מחפשי בהירות וכיוון",
    "מוכנים לשינוי אמיתי ועמוק"
  ];

  const notForWho = [
    "מחפשי פתרון קסם מיידי",
    "לא מוכנים לעבודה פנימית",
    "מצפים שמישהו אחר יעשה את העבודה",
    "לא פנויים להתחייב לתהליך"
  ];

  const testimonials = [
    { name: "מ.ל", role: "יזם", quote: "הגעתי לדין בתקופה שלא ידעתי לאן אני הולך. התהליך הזה נתן לי בהירות שלא חוויתי מעולם.", rating: 5 },
    { name: "ש.כ", role: "מנהלת", quote: "אחרי שנים של להסתובב במעגלים, סוף סוף הבנתי מה באמת חוסם אותי. התהליך היה עמוק אבל עדין.", rating: 5 },
    { name: "א.ר", role: "מטפל", quote: "חשבתי שאני מכיר את עצמי היטב, אבל התהליך הזה חשף שכבות שלא ידעתי שקיימות.", rating: 5 }
  ];

  const faqs = [
    { question: "כמה זמן לוקח התהליך?", answer: "התהליך נמשך בדרך כלל בין 4-8 שבועות, תלוי בצרכים האישיים שלך. זה כולל 3-5 מפגשים עמוקים בנוסף לשיחות ליווי ותמיכה." },
    { question: "האם זה מתאים לי אם כבר עברתי טיפולים אחרים?", answer: "בהחלט! הרבה אנשים מגיעים אלי אחרי שניסו גישות אחרות. התהליך הזה שונה כי הוא משלב עבודה תודעתית עמוקה עם כלים פרקטיים." },
    { question: "מה קורה אחרי התהליך?", answer: "בסוף התהליך תקבל תוכנית ברורה להמשך, הקלטות היפנוזה שתוכל להמשיך להשתמש בהן, וכלים שישארו איתך לכל החיים." },
    { question: "האם יש אחריות?", answer: "אני מאמין בעבודה משותפת. אם תגיע עם נכונות אמיתית ותעשה את העבודה, אני מתחייב ללוות אותך עד שתגיע לתוצאות." },
    { question: "כמה עולה התהליך?", answer: "התהליך המלא עולה ₪1,997. זו השקעה בעצמך שתשתלם לאורך שנים. ניתן לפרוס לתשלומים." }
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <div className="fixed inset-0 z-0">
          <MatrixRain />
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background" />
        </div>
        <main className="relative z-20 pt-24 pb-20 px-4">
          <div className="container max-w-2xl mx-auto text-center">
            <Card className="bg-card/80 backdrop-blur border-primary/30 p-8 md:p-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-6">תודה ששיתפת</h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                קיבלתי את הפרטים שלך ואחזור אליך בהקדם האפשרי לשיחת היכרות קצרה.
              </p>
              <Button variant="outline" onClick={() => navigate("/")} className="border-primary/50">
                <ArrowLeft className="h-4 w-4 ml-2" />
                חזרה לדף הבית
              </Button>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden" dir="rtl">
      {/* Matrix Rain Background */}
      <div className="fixed inset-0 z-0">
        <MatrixRain />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background" />
      </div>

      {/* Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-10 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.03) 2px, rgba(0,255,0,0.03) 4px)'
        }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="/icons/icon-96x96.png" alt="מיינד האקר" className="h-8 w-8" width={32} height={32} loading="eager" decoding="async" />
              <span className="font-black text-lg cyber-glow">מיינד האקר</span>
            </Link>
            <Button onClick={scrollToForm} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              בוא נדבר
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-20 min-h-screen flex items-center justify-center pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary">מקומות מוגבלים</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
              <span className="text-primary cyber-glow">קפיצה</span>
              <br />
              <span className="text-foreground">לתודעה חדשה</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
              תהליך טרנספורמציה אישית מעמיק שיביא אותך 
              <span className="text-primary"> מבלבול לבהירות</span>, 
              מדפוסים ישנים לחיים חדשים
            </p>

            <div className="flex items-center justify-center gap-4 mb-8 animate-fade-in">
              <div className="flex -space-x-2 rtl:space-x-reverse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                ))}
              </div>
              <span className="text-muted-foreground">
                <span className="text-primary font-bold">+50</span> אנשים כבר עברו את התהליך
              </span>
            </div>

            <div className="inline-block bg-card/50 backdrop-blur border border-primary/30 rounded-2xl p-6 mb-8 animate-fade-in">
              <div className="text-sm text-muted-foreground mb-1">השקעה בעצמך</div>
              <div className="text-4xl md:text-5xl font-bold text-primary cyber-glow">₪1,997</div>
              <div className="text-sm text-muted-foreground mt-1">ניתן לפריסה לתשלומים</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button size="lg" onClick={scrollToForm} className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-xl shadow-lg shadow-primary/25">
                אני רוצה להתחיל
                <ArrowRight className="mr-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="border-primary/50 text-primary hover:bg-primary/10 text-lg px-8 py-6 rounded-xl">
                איך זה עובד?
                <ChevronDown className="mr-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-primary/50" />
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="relative z-20 py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">האם אתה מכיר את זה?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">אם אחד מהמשפטים האלה מהדהד בך - אתה במקום הנכון</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {painPoints.map((point, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur border-primary/20 p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <point.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-primary">{point.title}</h3>
                <p className="text-muted-foreground">{point.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-20 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">איך התהליך <span className="text-primary">עובד?</span></h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">4 שלבים פשוטים לשינוי אמיתי</p>
          </div>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="relative flex gap-4 p-6 bg-card/30 backdrop-blur rounded-xl border border-primary/20 hover:border-primary/50 transition-all duration-300">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">{step.number}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="relative z-20 py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">מה כולל <span className="text-primary">התהליך?</span></h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <Card className="bg-card/50 backdrop-blur border-primary/30 p-8">
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-primary/20 text-center">
                <div className="text-sm text-muted-foreground mb-2">הכל במחיר אחד</div>
                <div className="text-4xl font-bold text-primary cyber-glow">₪1,997</div>
                <Button onClick={scrollToForm} className="mt-4 bg-primary hover:bg-primary/90">אני רוצה להתחיל</Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* For Who Section */}
      <section className="relative z-20 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">למי זה <span className="text-primary">מתאים?</span></h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-card/50 backdrop-blur border-primary/30 p-6">
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold">מתאים לך אם:</h3>
              </div>
              <ul className="space-y-4">
                {forWho.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="bg-card/50 backdrop-blur border-destructive/30 p-6">
              <div className="flex items-center gap-2 mb-6">
                <XCircle className="w-6 h-6 text-destructive" />
                <h3 className="text-xl font-bold">לא מתאים לך אם:</h3>
              </div>
              <ul className="space-y-4">
                {notForWho.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-20 py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">מה אומרים <span className="text-primary">מי שעברו</span> את התהליך</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur border-primary/20 p-6 hover:border-primary/40 transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative z-20 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-card/50 backdrop-blur border-primary/30 p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center">
                    <Brain className="w-16 h-16 text-primary" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">היי, אני <span className="text-primary">דין</span></h2>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    בעשור האחרון ליוויתי מאות אנשים בתהליכי שינוי עמוקים. התמחיתי בהיפנוזה קלינית, NLP וטכניקות תודעה מתקדמות.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    ה"קפיצה לתודעה חדשה" היא המסגרת שפיתחתי אחרי שנים של עבודה עם אנשים שהרגישו תקועים. זה תהליך שמביא תוצאות אמיתיות.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-20 py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">שאלות <span className="text-primary">נפוצות</span></h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-card/50 backdrop-blur border border-primary/20 rounded-xl px-6 data-[state=open]:border-primary/50">
                  <AccordionTrigger className="text-right hover:no-underline py-4">
                    <span className="text-lg font-medium">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Lead Form Section */}
      <section id="lead-form" className="relative z-20 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-card/80 backdrop-blur-lg border-primary/30 p-8 md:p-12 shadow-2xl shadow-primary/10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary">ללא התחייבות</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">בוא נבדוק אם זה <span className="text-primary">מתאים לך</span></h2>
                <p className="text-muted-foreground">השאר פרטים ואחזור אליך לשיחת היכרות קצרה</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">שם מלא</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="bg-background/50 border-primary/30 focus:border-primary" placeholder="איך קוראים לך?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">אימייל</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-background/50 border-primary/30 focus:border-primary" placeholder="your@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatResonated">מה הדהד לך בדף הזה? (אופציונלי)</Label>
                  <Textarea id="whatResonated" value={whatResonated} onChange={(e) => setWhatResonated(e.target.value)} className="bg-background/50 border-primary/30 focus:border-primary min-h-[100px]" placeholder="ספר לי קצת על מה שהביא אותך לכאן..." />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg rounded-xl">
                  {isSubmitting ? "שולח..." : (<>אני רוצה שיחת היכרות<Phone className="mr-2 w-5 h-5" /></>)}
                </Button>
                <p className="text-center text-sm text-muted-foreground">השיחה ללא התחייבות ובחינם</p>
              </form>
            </Card>

            <div className="flex flex-wrap justify-center gap-6 mt-8 text-muted-foreground">
              <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /><span className="text-sm">100% דיסקרטי</span></div>
              <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-primary" /><span className="text-sm">מענה תוך 24 שעות</span></div>
              <div className="flex items-center gap-2"><MessageCircle className="w-5 h-5 text-primary" /><span className="text-sm">ללא התחייבות</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-20 py-20 bg-primary/5 border-t border-primary/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">מוכן <span className="text-primary">לקפוץ?</span></h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">הצעד הראשון הוא תמיד הכי קשה. אבל אני כאן ללוות אותך.</p>
          <div className="inline-block bg-card/50 backdrop-blur border border-primary/30 rounded-2xl p-8 mb-8">
            <div className="text-sm text-muted-foreground mb-2">תהליך קפיצה לתודעה חדשה</div>
            <div className="text-5xl font-bold text-primary cyber-glow mb-2">₪1,997</div>
            <div className="text-sm text-muted-foreground">כולל הכל | ניתן לפריסה</div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={scrollToForm} className="bg-primary hover:bg-primary/90 text-lg px-10 py-6 rounded-xl shadow-lg shadow-primary/25">
              בוא נדבר<ArrowRight className="mr-2 w-5 h-5" />
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">מקומות מוגבלים | שיחת ההיכרות בחינם וללא התחייבות</p>
        </div>
      </section>

      {/* WhatsApp Button */}
      <a href="https://wa.me/972547390907?text=היי דין, אני מתעניין בתהליך קפיצה לתודעה חדשה" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 left-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110">
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* Footer */}
      <footer className="relative z-20 py-8 border-t border-primary/20 bg-background/80">
        <div className="container mx-auto px-4 text-center">
          <Link to="/" className="text-primary hover:underline">דין אושר אזולאי - היפנותרפיה ושינוי תודעתי</Link>
          <p className="text-sm text-muted-foreground mt-2">© {new Date().getFullYear()} כל הזכויות שמורות</p>
        </div>
      </footer>
    </div>
  );
};

export default ConsciousnessLeapLanding;
