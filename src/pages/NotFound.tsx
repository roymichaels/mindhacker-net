import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowRight } from "lucide-react";
import MatrixRain from "@/components/MatrixRain";
import { useSEO } from "@/hooks/useSEO";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // SEO Configuration
  useSEO({
    title: "דף לא נמצא | מיינד-האקר",
    description: "הדף שחיפשת לא נמצא. חזור לדף הבית או לדפדף במוצרים הדיגיטליים שלנו.",
    url: `${window.location.origin}${location.pathname}`,
    type: "website",
  });

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <MatrixRain />
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,240,255,0.01)_50%)] bg-[length:100%_4px] opacity-10" style={{ zIndex: 1 }} />
      
      <div className="relative z-10 text-center px-4" dir="rtl">
        <div className="glass-panel p-8 md:p-12 max-w-2xl mx-auto">
          <h1 className="text-8xl md:text-9xl font-black cyber-glow mb-4">404</h1>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">הדף לא נמצא</h2>
          <p className="text-lg text-muted-foreground mb-8">
            הדף שחיפשת אינו קיים או הוסר. אולי תרצה לחזור לדף הבית?
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <Home className="h-5 w-5" />
              חזור לדף הבית
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/courses")}
              className="gap-2"
            >
              <ArrowRight className="h-5 w-5" />
              גלה מוצרים דיגיטליים
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
