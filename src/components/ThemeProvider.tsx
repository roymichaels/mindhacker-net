import { useEffect } from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import {
  clearThemeSurfaceOverrides,
  clearThemeBrandOverrides,
  applyThemeSurfaceToDOM,
  applyThemeBrandToDOM,
} from "@/hooks/useThemeSettings";
import { useThemeSettings } from "@/hooks/useThemeSettings";

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Inner component that applies dynamic theme settings from database
 */
const ThemeSettingsApplier = ({ children }: { children: React.ReactNode }) => {
  const { theme, loading } = useThemeSettings();
  const { resolvedTheme } = useTheme();

  // Apply font family to body when theme loads
  useEffect(() => {
    if (!loading && theme.font_family_primary) {
      document.body.style.fontFamily = `'${theme.font_family_primary}', sans-serif`;
    }
  }, [loading, theme.font_family_primary]);

  // Set data-bg-effect attribute on html for CSS conditional styling
  useEffect(() => {
    if (loading) return;
    
    const effect = theme.background_effect || 'none';
    document.documentElement.dataset.bgEffect = effect;
    document.documentElement.dataset.bgEffectEnabled = effect !== 'none' ? 'true' : 'false';
  }, [loading, theme.background_effect]);

  // Ensure the html class ALWAYS matches the resolved theme.
  // (We enforce this because other runtime effects and the SSR-less Vite entry can
  // occasionally leave both classes or none, which breaks CSS.)
  useEffect(() => {
    if (loading) return;

    const next = resolvedTheme === "light" ? "light" : "dark";
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(next);
  }, [loading, resolvedTheme]);

  // Handle favicon updates
  useEffect(() => {
    if (!loading && theme.favicon_url) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) favicon.href = theme.favicon_url;

      const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
      if (appleTouchIcon) appleTouchIcon.href = theme.favicon_url;
    }
  }, [loading, theme.favicon_url]);

  // CRITICAL: Light/dark mode must control the surface palette.
  // Our DB theme injects variables onto :root (inline), which would otherwise
  // override the light mode CSS.
  useEffect(() => {
    if (loading) return;

    // Brand colors (primary/secondary/accent) should come from Admin theme
    // in BOTH light and dark modes.
    applyThemeBrandToDOM(theme);

    if (resolvedTheme === "light") {
      // Light mode: keep the clean surface palette from CSS, clear any DB surface overrides
      clearThemeSurfaceOverrides();
      return;
    }

    // Dark mode: apply DB surface palette overrides (cyber aesthetic)
    applyThemeSurfaceToDOM(theme);
  }, [loading, resolvedTheme, theme]);

  return <>{children}</>;
};

/**
 * ThemeProvider component that wraps next-themes for light/dark mode
 * and applies dynamic theme settings from database.
 */
/**
 * Inner wrapper that sets default theme from database
 */
const ThemeProviderInner = ({ children }: { children: React.ReactNode }) => {
  const { theme: themeSettings, loading } = useThemeSettings();
  const { setTheme, theme } = useTheme();

  // Apply default theme from database on first load (only if user hasn't set preference)
  useEffect(() => {
    if (loading) return;
    
    // Check if user already has a preference stored
    const storedTheme = localStorage.getItem("theme-preference");
    if (!storedTheme && themeSettings.default_theme_mode) {
      setTheme(themeSettings.default_theme_mode);
    }
  }, [loading, themeSettings.default_theme_mode, setTheme]);

  return <ThemeSettingsApplier>{children}</ThemeSettingsApplier>;
};

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="theme-preference"
      themes={["light", "dark"]}
      value={{ light: "light", dark: "dark" }}
    >
      <ThemeProviderInner>{children}</ThemeProviderInner>
    </NextThemesProvider>
  );
};

export default ThemeProvider;

