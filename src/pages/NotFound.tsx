import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowRight, ArrowLeft } from "lucide-react";
import MatrixRain from "@/components/MatrixRain";
import { useSEO } from "@/hooks/useSEO";
import { useTranslation } from "@/hooks/useTranslation";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();

  // SEO Configuration
  useSEO({
    title: t('seo.notFoundTitle'),
    description: t('seo.notFoundDescription'),
    url: `${window.location.origin}${location.pathname}`,
    type: "website",
  });

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <MatrixRain />
      
      <div className="relative z-10 text-center px-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="glass-panel p-8 md:p-12 max-w-2xl mx-auto">
          <h1 className="text-8xl md:text-9xl font-black cyber-glow mb-4">{t('notFound.title')}</h1>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('notFound.subtitle')}</h2>
          <p className="text-lg text-muted-foreground mb-8">
            {t('notFound.description')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <Home className="h-5 w-5" />
              {t('notFound.goHome')}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/courses")}
              className="gap-2"
            >
              <ArrowIcon className="h-5 w-5" />
              {t('notFound.discoverProducts')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
