import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

const THEME_STORAGE_KEY = "theme-preference";

export const ThemeToggle = () => {
  const { t } = useTranslation();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check stored preference or default to dark
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark = stored ? stored === "dark" : true;
    setIsDark(prefersDark);
    document.documentElement.classList.toggle("light", !prefersDark);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem(THEME_STORAGE_KEY, newIsDark ? "dark" : "light");
    document.documentElement.classList.toggle("light", !newIsDark);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative w-9 h-9 rounded-full"
      aria-label={isDark ? t('theme.switchToLight') : t('theme.switchToDark')}
    >
      <motion.div
        initial={false}
        animate={{ 
          rotate: isDark ? 0 : 180,
          scale: 1
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {isDark ? (
          <Moon className="h-5 w-5 text-primary" />
        ) : (
          <Sun className="h-5 w-5 text-accent" />
        )}
      </motion.div>
    </Button>
  );
};

export default ThemeToggle;
