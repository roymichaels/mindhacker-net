import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

const THEME_STORAGE_KEY = "theme-preference";

// Event for other components to listen to theme mode changes
export const THEME_MODE_CHANGED_EVENT = "theme-mode-changed";

export const useThemeMode = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored ? stored === "dark" : true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("light", !isDark);
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const newValue = !prev;
      localStorage.setItem(THEME_STORAGE_KEY, newValue ? "dark" : "light");
      document.documentElement.classList.toggle("light", !newValue);
      window.dispatchEvent(new CustomEvent(THEME_MODE_CHANGED_EVENT, { detail: { isDark: newValue } }));
      return newValue;
    });
  }, []);

  return { isDark, toggleTheme };
};

export const ThemeToggle = () => {
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useThemeMode();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative w-9 h-9 rounded-full hover:bg-primary/10 transition-colors"
      aria-label={isDark ? t('theme.switchToLight') : t('theme.switchToDark')}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? "dark" : "light"}
          initial={{ y: -20, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 20, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {isDark ? (
            <Moon className="h-5 w-5 text-primary" />
          ) : (
            <Sun className="h-5 w-5 text-amber-500" />
          )}
        </motion.div>
      </AnimatePresence>
    </Button>
  );
};

export default ThemeToggle;
