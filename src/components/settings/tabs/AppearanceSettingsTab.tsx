import { Moon, Sun, Globe } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';

const AppearanceSettingsTab = () => {
  const { t, isRTL } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const isDarkMode = theme === 'dark';

  return (
    <div className="space-y-6">
      {/* Theme Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50">
        <div className="flex items-center gap-3">
          {isDarkMode ? (
            <Moon className="h-5 w-5 text-primary" />
          ) : (
            <Sun className="h-5 w-5 text-amber-500" />
          )}
          <div>
            <Label className="text-sm font-medium">{t('settings.appearance.theme')}</Label>
            <p className="text-xs text-muted-foreground">
              {isDarkMode ? t('settings.appearance.darkMode') : t('settings.appearance.lightMode')}
            </p>
          </div>
        </div>
        <Switch
          checked={isDarkMode}
          onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        />
      </div>

      {/* Language Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50">
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5 text-primary" />
          <div>
            <Label className="text-sm font-medium">{t('settings.appearance.language')}</Label>
            <p className="text-xs text-muted-foreground">
              {language === 'he' ? 'עברית' : 'English'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              language === 'en'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('he')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              language === 'he'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent'
            }`}
          >
            עב
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettingsTab;
