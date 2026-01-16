import { useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useThemeSettings } from "@/hooks/useThemeSettings";

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Inner component that applies dynamic theme settings from database
 */
const ThemeSettingsApplier = ({ children }: { children: React.ReactNode }) => {
  const { theme, loading } = useThemeSettings();

  useEffect(() => {
    // Apply font family to body when theme loads
    if (!loading && theme.font_family_primary) {
      document.body.style.fontFamily = `'${theme.font_family_primary}', sans-serif`;
    }
  }, [loading, theme.font_family_primary]);

  // Handle favicon updates
  useEffect(() => {
    if (!loading && theme.favicon_url) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = theme.favicon_url;
      }
      
      // Also update apple touch icon if present
      const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
      if (appleTouchIcon && theme.favicon_url) {
        appleTouchIcon.href = theme.favicon_url;
      }
    }
  }, [loading, theme.favicon_url]);

  return <>{children}</>;
};

/**
 * ThemeProvider component that wraps next-themes for light/dark mode
 * and applies dynamic theme settings from database.
 * 
 * Uses next-themes with class attribute for Tailwind CSS dark mode.
 * Default theme is "dark" to match the cyber aesthetic.
 */
const ThemeProvider = ({ children }: ThemeProviderProps) => {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="theme-preference"
      themes={["light", "dark"]}
      value={{
        light: "light",
        dark: "dark"
      }}
    >
      <ThemeSettingsApplier>
        {children}
      </ThemeSettingsApplier>
    </NextThemesProvider>
  );
};

export default ThemeProvider;
