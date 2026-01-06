import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import MatrixRain from "@/components/MatrixRain";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Zap, Lock } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { getBreadcrumbSchema } from "@/lib/seo";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { formatPrice } from "@/lib/currency";

const Subscriptions = () => {
  const { language } = useTranslation();
  // SEO Configuration
  useSEO({
    title: "מנויים | מיינד-האקר",
    description: "בחר את תוכנית המנוי המתאימה לך. גישה בלתי מוגבלת למוצרים דיגיטליים, קורסים, וסדנאות בתחום אימון התודעה והפיתוח האישי.",
    keywords: "מנוי חודשי, תוכנית מנוי, גישה בלתי מוגבלת, קורסים אונליין, מנוי דיגיטלי",
    url: `${window.location.origin}/subscriptions`,
    type: "website",
    structuredData: [
      getBreadcrumbSchema([
        { name: "דף הבית", url: window.location.origin },
        { name: "מנויים", url: `${window.location.origin}/subscriptions` },
      ]),
    ],
  });

  const { user } = useAuth();

  const handleSubscribe = () => {
    if (!user) {
      toast({
        title: "נדרשת התחברות",
        description: "אנא התחבר כדי להירשם למנוי",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "בקרוב!",
      description: "מערכת המנויים תושק בקרוב. נעדכן אותך!",
    });
  };

  const mainFeatures = [
    "גישה בלתי מוגבלת לכל הקורסים והתכנים",
    "חומרים להורדה ומשאבים בלעדיים",
    "סדנאות חיות חודשיות",
    "קהילה פרטית של מתרגלים",
    "תמיכה ישירה בווטסאפ",
    "עדכונים שוטפים של תכנים חדשים",
  ];

  const comingSoonFeatures = [
    "מפגשי מנטורינג קבוצתיים",
    "תעודות דיגיטליות מוכרות",
    "גישה לארכיון מלא של הקלטות",
    "מפגשי שאלות ותשובות חיים",
  ];

  return (
    <div className="relative min-h-screen">
      <MatrixRain />
      
      <Header />
      
      <main className="relative container mx-auto px-4 py-8 mt-20" style={{ zIndex: 2 }}>
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-6xl font-black cyber-glow mb-4">
            מנוי חודשי Premium
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            גישה מלאה לכל התכנים, הקורסים והסדנאות במחיר אחד פשוט
          </p>
        </div>

        {/* Main Subscription Card */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="glass-panel border-primary cyber-border relative" dir="rtl">
            <div className="absolute -top-4 right-1/2 translate-x-1/2">
              <Badge className="cyber-glow px-6 py-2 text-base">
                <Zap className="w-4 h-4 ml-2" />
                הצעת השקה מיוחדת!
              </Badge>
            </div>

            <CardHeader className="text-center pt-8">
              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-primary/20 p-6">
                  <Zap className="h-12 w-12 text-primary" />
                </div>
              </div>
              
              <CardTitle className="text-3xl md:text-4xl mb-2">מנוי Premium</CardTitle>
              <CardDescription className="text-base">
                גישה מלאה וללא הגבלה לכל התכנים
              </CardDescription>

              <div className="mt-6">
                <div className="text-6xl md:text-7xl font-black cyber-glow mb-2">
                  {formatPrice(97, language)}
                </div>
                <div className="text-lg text-muted-foreground">{language === 'en' ? 'per month' : 'לחודש'}</div>
                <div className="text-sm text-primary mt-2">
                  מחיר מיוחד למצטרפים הראשונים!
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-6 md:px-12 py-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-xl mb-4 text-center">מה כלול במנוי?</h3>
                  <ul className="space-y-3">
                    {mainFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-border/50 pt-6">
                  <div className="bg-primary/5 rounded-lg p-4 space-y-2">
                    <p className="font-semibold text-center">💰 מדיניות ביטול גמישה</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• ביטול בכל עת ללא עלויות נוספות</li>
                      <li>• אין התחייבות לתקופה מינימלית</li>
                      <li>• החזר מלא תוך 14 יום</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 px-6 md:px-12 pb-8">
              <Button 
                onClick={handleSubscribe}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xl py-6 cyber-glow"
              >
                {language === 'en' ? `Join now for ${formatPrice(97, language)}/month` : `הצטרף עכשיו ב-${formatPrice(97, language)} לחודש`}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                בלחיצה על הכפתור אתה מסכים לתנאי השימוש ומדיניות הפרטיות
              </p>
            </CardFooter>
          </Card>
        </div>

        {/* Coming Soon Features */}
        <div className="max-w-4xl mx-auto">
          <Card className="glass-panel border-muted" dir="rtl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-muted/20 p-4">
                  <Lock className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl">בקרוב - יתרונות נוספים!</CardTitle>
              <CardDescription>
                אנחנו עובדים על תכונות נוספות שיהיו זמינות בקרוב למנויים
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-6 md:px-12">
              <ul className="space-y-3">
                {comingSoonFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 opacity-60">
                    <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span className="text-base">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-16 text-center" dir="rtl">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 cyber-glow">שאלות נפוצות</h2>
          
          <div className="space-y-4 text-right">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-lg">מתי אני משלם?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  התשלום הוא חודשי וחוזר אוטומטית. תחויב ב-97 ש"ח כל חודש עד לביטול המנוי.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-lg">איך מבטלים?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  אפשר לבטל בכל רגע מהדאשבורד האישי. אין עמלות ביטול ואין התחייבות לתקופה מינימלית.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-lg">מה קורה אחרי הביטול?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  תמשיך ליהנות מהגישה עד סוף התקופה ששילמת עליה. לאחר מכן הגישה תחסם אוטומטית.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 mb-12">
          <Card className="glass-panel max-w-2xl mx-auto border-primary/30" dir="rtl">
            <CardContent className="pt-8 pb-8 px-6">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 cyber-glow">
                מוכן להתחיל את המסע?
              </h3>
              <p className="text-muted-foreground mb-6 text-lg">
                הצטרף למיינד האקר והתחל לשנות את המציאות שלך כבר היום
              </p>
              <Button 
                onClick={handleSubscribe}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xl py-6 px-12"
              >
                התחל עכשיו
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Subscriptions;
