import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, Mail, CheckCircle2, ArrowRight, Home } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { useTranslation } from "@/hooks/useTranslation";

const PersonalHypnosisPending = () => {
  const { t, isRTL } = useTranslation();
  
  useSEO({
    title: t('personalHypnosisPending.seoTitle'),
    description: t('personalHypnosisPending.seoDescription'),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-lg">
        <div className="glass-panel p-8 space-y-6 text-center">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-black cyber-glow">
              {t('personalHypnosisPending.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('personalHypnosisPending.subtitle')}
            </p>
          </div>

          {/* Next Steps */}
          <div className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h2 className="font-bold text-lg">{t('personalHypnosisPending.whatsNext')}</h2>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-accent/10 border border-accent/30 rounded-xl">
                <Mail className={`h-5 w-5 text-accent mt-0.5 shrink-0`} />
                <div>
                  <h3 className="font-medium text-accent">{t('personalHypnosisPending.step1Title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('personalHypnosisPending.step1Description')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-muted/30 border border-border rounded-xl">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-medium">{t('personalHypnosisPending.step2Title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('personalHypnosisPending.step2Description')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-muted/30 border border-border rounded-xl">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-medium">{t('personalHypnosisPending.step3Title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('personalHypnosisPending.step3Description')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4">
            <Link to="/dashboard">
              <Button className="w-full" size="lg">
                <ArrowRight className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('personalHypnosisPending.toDashboard')}
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full" size="lg">
                <Home className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('personalHypnosisPending.toHome')}
              </Button>
            </Link>
          </div>

          {/* Contact Note */}
          <p className="text-xs text-muted-foreground pt-4">
            {t('personalHypnosisPending.contactNote')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PersonalHypnosisPending;