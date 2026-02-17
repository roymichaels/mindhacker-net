import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Compass } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();

  useSEO({
    title: t('seo.notFoundTitle'),
    description: t('seo.notFoundDescription'),
    url: `${window.location.origin}${location.pathname}`,
    type: "website",
  });

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Subtle animated background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 text-center px-4 max-w-lg mx-auto"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8 md:p-12 space-y-6">
          {/* Glitch-style 404 */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <p className="text-sm font-medium text-primary tracking-widest uppercase mb-2">
              {isRTL ? 'שגיאת מערכת' : 'System Error'}
            </p>
            <h1 className="text-8xl md:text-9xl font-black text-primary/20 leading-none select-none">
              404
            </h1>
          </motion.div>

          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              {isRTL ? 'הנתיב לא נמצא' : 'Path Not Found'}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isRTL
                ? 'נראה שהגעת למקום שלא קיים במערכת. בוא נחזיר אותך למסלול.'
                : "Looks like this route doesn't exist in Mind OS. Let's get you back on track."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              size="lg"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              {isRTL ? 'דף הבית' : 'Home'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="gap-2"
            >
              <Compass className="h-4 w-4" />
              {isRTL ? 'לדשבורד' : 'Dashboard'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
