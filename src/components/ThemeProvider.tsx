import { useEffect } from "react";
import { useThemeSettings } from "@/hooks/useThemeSettings";

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * ThemeProvider component that fetches theme settings from database
 * and applies them as CSS custom properties to the document root.
 * 
 * This ensures all components use the dynamically configured theme
 * without needing to pass props or use context for individual values.
 */
const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { theme, loading } = useThemeSettings();

  useEffect(() => {
    // Apply font family to body when theme loads
    if (!loading && theme.font_family_primary) {
      document.body.style.fontFamily = `'${theme.font_family_primary}', sans-serif`;
    }
  }, [loading, theme.font_family_primary]);

  // Theme is applied via CSS custom properties in useThemeSettings hook
  // No need to block rendering while loading - defaults are already applied
  return <>{children}</>;
};

export default ThemeProvider;
