import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useThemeSettings, useThemePresets, updateThemeSetting, applyThemePreset, clearThemeCache, ThemePreset } from "@/hooks/useThemeSettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Type, Sparkles, Image, Globe, Check, Loader2 } from "lucide-react";

const Theme = () => {
  const { t, language } = useTranslation();
  const isRTL = language === 'he';
  const { theme, loading: themeLoading, refetch } = useThemeSettings();
  const { presets, loading: presetsLoading } = useThemePresets();
  
  const [localTheme, setLocalTheme] = useState(theme);
  const [saving, setSaving] = useState(false);
  const [applyingPreset, setApplyingPreset] = useState<string | null>(null);

  useEffect(() => {
    setLocalTheme(theme);
  }, [theme]);

  const handleChange = (key: string, value: string | boolean) => {
    setLocalTheme(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(localTheme).map(([key, value]) => 
        updateThemeSetting(key, String(value))
      );
      await Promise.all(updates);
      clearThemeCache();
      await refetch();
      toast.success(isRTL ? "הנושא נשמר בהצלחה" : "Theme saved successfully");
    } catch (error) {
      console.error("Error saving theme:", error);
      toast.error(isRTL ? "שגיאה בשמירת הנושא" : "Error saving theme");
    } finally {
      setSaving(false);
    }
  };

  const handleApplyPreset = async (preset: ThemePreset) => {
    setApplyingPreset(preset.id);
    try {
      await applyThemePreset(preset);
      clearThemeCache();
      await refetch();
      toast.success(isRTL ? `נושא "${preset.name}" הוחל בהצלחה` : `Theme "${preset.name_en || preset.name}" applied successfully`);
    } catch (error) {
      console.error("Error applying preset:", error);
      toast.error(isRTL ? "שגיאה בהחלת הנושא" : "Error applying theme");
    } finally {
      setApplyingPreset(null);
    }
  };

  const ColorInput = ({ label, hKey, sKey, lKey }: { label: string; hKey: string; sKey: string; lKey: string }) => {
    const h = (localTheme as any)[hKey] || "0";
    const s = (localTheme as any)[sKey] || "0%";
    const l = (localTheme as any)[lKey] || "0%";
    const color = `hsl(${h}, ${s}, ${l})`;
    
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-lg border-2 border-border shadow-inner"
            style={{ backgroundColor: color }}
          />
          <div className="flex-1 grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">H</Label>
              <Input
                type="number"
                min="0"
                max="360"
                value={h}
                onChange={(e) => handleChange(hKey, e.target.value)}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">S</Label>
              <Input
                value={s}
                onChange={(e) => handleChange(sKey, e.target.value)}
                className="h-8"
                placeholder="100%"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">L</Label>
              <Input
                value={l}
                onChange={(e) => handleChange(lKey, e.target.value)}
                className="h-8"
                placeholder="50%"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (themeLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isRTL ? "עיצוב ומיתוג" : "Theme & Branding"}
          </h1>
          <p className="text-muted-foreground">
            {isRTL ? "התאם את המראה והתחושה של האתר שלך" : "Customize the look and feel of your site"}
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Check className="w-4 h-4 mr-2" />
          )}
          {isRTL ? "שמור שינויים" : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="presets" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="presets" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">{isRTL ? "ערכות נושא" : "Presets"}</span>
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">{isRTL ? "צבעים" : "Colors"}</span>
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            <span className="hidden sm:inline">{isRTL ? "טיפוגרפיה" : "Typography"}</span>
          </TabsTrigger>
          <TabsTrigger value="effects" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">{isRTL ? "אפקטים" : "Effects"}</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            <span className="hidden sm:inline">{isRTL ? "מיתוג" : "Branding"}</span>
          </TabsTrigger>
        </TabsList>

        {/* Presets Tab */}
        <TabsContent value="presets">
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? "ערכות נושא מוכנות" : "Theme Presets"}</CardTitle>
              <CardDescription>
                {isRTL ? "בחר ערכת נושא מוכנה להחלה מיידית" : "Choose a ready-made theme for instant application"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {presetsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {presets.map((preset) => {
                    const colors = preset.colors as Record<string, string>;
                    const primaryColor = `hsl(${colors.primary_h}, ${colors.primary_s}, ${colors.primary_l})`;
                    const secondaryColor = `hsl(${colors.secondary_h}, ${colors.secondary_s}, ${colors.secondary_l})`;
                    const accentColor = `hsl(${colors.accent_h}, ${colors.accent_s}, ${colors.accent_l})`;
                    const bgColor = `hsl(${colors.background_h}, ${colors.background_s}, ${colors.background_l})`;
                    
                    return (
                      <Card 
                        key={preset.id} 
                        className="cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                        onClick={() => handleApplyPreset(preset)}
                      >
                        <CardContent className="p-4">
                          <div 
                            className="h-24 rounded-lg mb-3 relative overflow-hidden"
                            style={{ backgroundColor: bgColor }}
                          >
                            <div className="absolute inset-0 flex items-center justify-center gap-2">
                              <div 
                                className="w-8 h-8 rounded-full shadow-lg"
                                style={{ backgroundColor: primaryColor }}
                              />
                              <div 
                                className="w-6 h-6 rounded-full shadow-lg"
                                style={{ backgroundColor: secondaryColor }}
                              />
                              <div 
                                className="w-5 h-5 rounded-full shadow-lg"
                                style={{ backgroundColor: accentColor }}
                              />
                            </div>
                            {applyingPreset === preset.id && (
                              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                              </div>
                            )}
                          </div>
                          <h3 className="font-semibold">
                            {isRTL ? preset.name : (preset.name_en || preset.name)}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {isRTL ? preset.description : (preset.description_en || preset.description)}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors">
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? "פלטת צבעים" : "Color Palette"}</CardTitle>
              <CardDescription>
                {isRTL ? "התאם את צבעי האתר שלך (HSL)" : "Customize your site colors (HSL)"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ColorInput 
                label={isRTL ? "צבע ראשי" : "Primary Color"}
                hKey="primary_h"
                sKey="primary_s"
                lKey="primary_l"
              />
              <ColorInput 
                label={isRTL ? "צבע משני" : "Secondary Color"}
                hKey="secondary_h"
                sKey="secondary_s"
                lKey="secondary_l"
              />
              <ColorInput 
                label={isRTL ? "צבע הדגשה" : "Accent Color"}
                hKey="accent_h"
                sKey="accent_s"
                lKey="accent_l"
              />
              <ColorInput 
                label={isRTL ? "צבע רקע" : "Background Color"}
                hKey="background_h"
                sKey="background_s"
                lKey="background_l"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography">
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? "טיפוגרפיה" : "Typography"}</CardTitle>
              <CardDescription>
                {isRTL ? "בחר את הגופנים לאתר שלך" : "Choose fonts for your site"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{isRTL ? "גופן ראשי" : "Primary Font"}</Label>
                <Input
                  value={localTheme.font_family_primary}
                  onChange={(e) => handleChange('font_family_primary', e.target.value)}
                  placeholder="Heebo, sans-serif"
                />
                <p className="text-xs text-muted-foreground">
                  {isRTL ? "שם הגופן (למשל: Heebo, Assistant, Rubik)" : "Font name (e.g., Heebo, Assistant, Rubik)"}
                </p>
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? "גופן משני" : "Secondary Font"}</Label>
                <Input
                  value={localTheme.font_family_secondary}
                  onChange={(e) => handleChange('font_family_secondary', e.target.value)}
                  placeholder="inherit"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Effects Tab */}
        <TabsContent value="effects">
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? "אפקטים ויזואליים" : "Visual Effects"}</CardTitle>
              <CardDescription>
                {isRTL ? "הגדר אפקטים מיוחדים לאתר" : "Configure special effects for your site"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Background Effect Selector */}
              <div className="space-y-2">
                <Label>{isRTL ? "אפקט רקע" : "Background Effect"}</Label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleChange('background_effect', 'none')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      localTheme.background_effect === 'none' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 rounded bg-muted flex items-center justify-center">
                        <span className="text-2xl">🚫</span>
                      </div>
                      <p className="font-medium">{isRTL ? "ללא" : "None"}</p>
                      <p className="text-xs text-muted-foreground">
                        {isRTL ? "רקע נקי" : "Clean background"}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('background_effect', 'matrix_rain')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      localTheme.background_effect === 'matrix_rain' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 rounded bg-gradient-to-b from-primary/30 to-transparent flex items-center justify-center font-mono text-primary">
                        01
                      </div>
                      <p className="font-medium">{isRTL ? "גשם מטריקס" : "Matrix Rain"}</p>
                      <p className="text-xs text-muted-foreground">
                        {isRTL ? "אפקט סייבר עברי" : "Hebrew cyber effect"}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('background_effect', 'consciousness_field')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      localTheme.background_effect === 'consciousness_field' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 rounded bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] flex items-center justify-center text-[#3d7a8c]">
                        ∞ ◌
                      </div>
                      <p className="font-medium">{isRTL ? "שדה תודעתי" : "Consciousness Field"}</p>
                      <p className="text-xs text-muted-foreground">
                        {isRTL ? "שקט ומרפא" : "Calm & healing"}
                      </p>
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Matrix Rain settings - only show when selected */}
              {localTheme.background_effect === 'matrix_rain' && (
                <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border">
                  <h4 className="font-medium flex items-center gap-2">
                    <span className="text-primary font-mono">01</span>
                    {isRTL ? "הגדרות גשם מטריקס" : "Matrix Rain Settings"}
                  </h4>
                  <div className="space-y-2">
                    <Label>{isRTL ? "צבע" : "Color"}</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={localTheme.matrix_rain_color}
                        onChange={(e) => handleChange('matrix_rain_color', e.target.value)}
                        className="w-12 h-12 rounded cursor-pointer"
                      />
                      <Input
                        value={localTheme.matrix_rain_color}
                        onChange={(e) => handleChange('matrix_rain_color', e.target.value)}
                        placeholder="#00d4ff"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{isRTL ? "שקיפות" : "Opacity"}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={localTheme.matrix_rain_opacity}
                      onChange={(e) => handleChange('matrix_rain_opacity', e.target.value)}
                      placeholder="0.15"
                    />
                  </div>
                </div>
              )}

              {/* Consciousness Field settings - only show when selected */}
              {localTheme.background_effect === 'consciousness_field' && (
                <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border">
                  <h4 className="font-medium flex items-center gap-2">
                    <span className="text-[#3d7a8c]">∞</span>
                    {isRTL ? "הגדרות שדה תודעתי" : "Consciousness Field Settings"}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{isRTL ? "צבע רקע עמוק" : "Deep Background Color"}</Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={localTheme.consciousness_field_primary_color}
                          onChange={(e) => handleChange('consciousness_field_primary_color', e.target.value)}
                          className="w-12 h-12 rounded cursor-pointer"
                        />
                        <Input
                          value={localTheme.consciousness_field_primary_color}
                          onChange={(e) => handleChange('consciousness_field_primary_color', e.target.value)}
                          placeholder="#0a1628"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{isRTL ? "צבע הילה" : "Accent Glow Color"}</Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={localTheme.consciousness_field_accent_color}
                          onChange={(e) => handleChange('consciousness_field_accent_color', e.target.value)}
                          className="w-12 h-12 rounded cursor-pointer"
                        />
                        <Input
                          value={localTheme.consciousness_field_accent_color}
                          onChange={(e) => handleChange('consciousness_field_accent_color', e.target.value)}
                          placeholder="#3d7a8c"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{isRTL ? "צפיפות חלקיקים" : "Particle Density"}</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.3"
                        max="1"
                        value={localTheme.consciousness_field_particle_density}
                        onChange={(e) => handleChange('consciousness_field_particle_density', e.target.value)}
                        placeholder="0.6"
                      />
                      <p className="text-xs text-muted-foreground">
                        {isRTL ? "0.3 (מינימלי) עד 1 (צפוף)" : "0.3 (minimal) to 1 (dense)"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>{isRTL ? "מהירות נשימה (שניות)" : "Breathing Speed (seconds)"}</Label>
                      <Input
                        type="number"
                        step="1"
                        min="5"
                        max="20"
                        value={localTheme.consciousness_field_breathing_speed}
                        onChange={(e) => handleChange('consciousness_field_breathing_speed', e.target.value)}
                        placeholder="10"
                      />
                      <p className="text-xs text-muted-foreground">
                        {isRTL ? "5 (מהיר) עד 20 (איטי מאוד)" : "5 (fast) to 20 (very slow)"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                    <div>
                      <Label>{isRTL ? "אינטראקציה עם עכבר/מגע" : "Mouse/Touch Interaction"}</Label>
                      <p className="text-xs text-muted-foreground">
                        {isRTL ? "החלקיקים מגיבים לתנועת העכבר" : "Particles respond to mouse movement"}
                      </p>
                    </div>
                    <Switch
                      checked={localTheme.consciousness_field_interaction}
                      onCheckedChange={(checked) => handleChange('consciousness_field_interaction', checked)}
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-[#0a1628]/50 border border-[#3d7a8c]/20">
                    <p className="text-sm text-center text-muted-foreground italic">
                      {isRTL 
                        ? '"זה לא רקע טכנולוגי. זה שדה תודעתי עשוי קוד."'
                        : '"This isn\'t a technological background. It\'s a consciousness field made of code."'
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Hero Portrait Effect Section */}
              <div className="pt-6 border-t border-border">
                <div className="space-y-2 mb-4">
                  <Label className="text-lg font-semibold">{isRTL ? "אפקט תמונת פורטרט" : "Hero Portrait Effect"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "האפקט סביב התמונה בעמוד הראשי" : "Effect around the portrait on the homepage"}
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => handleChange('hero_portrait_effect', 'none')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      localTheme.hero_portrait_effect === 'none' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-lg">👤</span>
                      </div>
                      <p className="font-medium text-sm">{isRTL ? "ללא" : "None"}</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('hero_portrait_effect', 'cyber_glow')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      localTheme.hero_portrait_effect === 'cyber_glow' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-primary/40 to-accent/30 flex items-center justify-center shadow-lg shadow-primary/30">
                        <span className="text-lg">✨</span>
                      </div>
                      <p className="font-medium text-sm">{isRTL ? "זוהר סייבר" : "Cyber Glow"}</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('hero_portrait_effect', 'consciousness_aura')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      localTheme.hero_portrait_effect === 'consciousness_aura' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] flex items-center justify-center border border-[#3d7a8c]/50">
                        <span className="text-[#3d7a8c]">∞</span>
                      </div>
                      <p className="font-medium text-sm">{isRTL ? "הילת תודעה" : "Aura"}</p>
                    </div>
                  </button>
                </div>

                {/* Portrait effect settings */}
                {localTheme.hero_portrait_effect !== 'none' && (
                  <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{isRTL ? "צבע זוהר (אופציונלי)" : "Glow Color (optional)"}</Label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={localTheme.hero_portrait_glow_color || '#00d4ff'}
                            onChange={(e) => handleChange('hero_portrait_glow_color', e.target.value)}
                            className="w-12 h-12 rounded cursor-pointer"
                          />
                          <Input
                            value={localTheme.hero_portrait_glow_color}
                            onChange={(e) => handleChange('hero_portrait_glow_color', e.target.value)}
                            placeholder={isRTL ? "השאר ריק לצבע נושא" : "Leave empty for theme color"}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>{isRTL ? "מהירות אנימציה" : "Animation Speed"}</Label>
                        <div className="flex gap-2">
                          {(['slow', 'normal', 'fast'] as const).map((speed) => (
                            <button
                              key={speed}
                              type="button"
                              onClick={() => handleChange('hero_portrait_animation_speed', speed)}
                              className={`flex-1 py-2 px-3 rounded-lg border transition-all text-sm ${
                                localTheme.hero_portrait_animation_speed === speed
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              {isRTL 
                                ? speed === 'slow' ? 'איטי' : speed === 'normal' ? 'רגיל' : 'מהיר'
                                : speed.charAt(0).toUpperCase() + speed.slice(1)
                              }
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? "מיתוג" : "Branding"}</CardTitle>
              <CardDescription>
                {isRTL ? "הגדר את פרטי המותג שלך" : "Set up your brand details"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? "שם המותג (עברית)" : "Brand Name (Hebrew)"}</Label>
                  <Input
                    value={localTheme.brand_name}
                    onChange={(e) => handleChange('brand_name', e.target.value)}
                    placeholder="מיינד האקר"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? "שם המותג (אנגלית)" : "Brand Name (English)"}</Label>
                  <Input
                    value={localTheme.brand_name_en}
                    onChange={(e) => handleChange('brand_name_en', e.target.value)}
                    placeholder="Mind Hacker"
                    dir="ltr"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? "שם החברה המשפטי" : "Legal Company Name"}</Label>
                  <Input
                    value={localTheme.company_legal_name}
                    onChange={(e) => handleChange('company_legal_name', e.target.value)}
                    placeholder="Mind Hacker OÜ"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? "מדינת רישום" : "Registration Country"}</Label>
                  <Input
                    value={localTheme.company_country}
                    onChange={(e) => handleChange('company_country', e.target.value)}
                    placeholder="Estonia"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? "כתובת URL ללוגו" : "Logo URL"}</Label>
                <Input
                  value={localTheme.logo_url}
                  onChange={(e) => handleChange('logo_url', e.target.value)}
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground">
                  {isRTL ? "העלה לוגו לאחסון והדבק את הקישור כאן" : "Upload logo to storage and paste the URL here"}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? "תמונת פורטרט" : "Hero Portrait URL"}</Label>
                <Input
                  value={localTheme.hero_portrait_url}
                  onChange={(e) => handleChange('hero_portrait_url', e.target.value)}
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground">
                  {isRTL ? "תמונת הפורטרט שמופיעה בעמוד הראשי" : "Portrait image shown on the homepage"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? "שם מקוצר (עברית)" : "Short Name (Hebrew)"}</Label>
                  <Input
                    value={localTheme.founder_short_name}
                    onChange={(e) => handleChange('founder_short_name', e.target.value)}
                    placeholder="דין"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? "שם מקוצר (אנגלית)" : "Short Name (English)"}</Label>
                  <Input
                    value={localTheme.founder_short_name_en}
                    onChange={(e) => handleChange('founder_short_name_en', e.target.value)}
                    placeholder="Dean"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? "מזהה טופס התבוננות" : "Introspection Form ID"}</Label>
                <Input
                  value={localTheme.introspection_form_id}
                  onChange={(e) => handleChange('introspection_form_id', e.target.value)}
                  placeholder="45dfc6a5-6f98-444b-a3dd-2c0dd1ca3308"
                />
                <p className="text-xs text-muted-foreground">
                  {isRTL ? "מזהה הטופס של המתנה החינמית" : "Form ID for the free gift questionnaire"}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? "שפת ברירת מחדל" : "Default Language"}</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="default_language"
                      value="he"
                      checked={localTheme.default_language === 'he'}
                      onChange={(e) => handleChange('default_language', e.target.value)}
                      className="w-4 h-4"
                    />
                    <span>עברית</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="default_language"
                      value="en"
                      checked={localTheme.default_language === 'en'}
                      onChange={(e) => handleChange('default_language', e.target.value)}
                      className="w-4 h-4"
                    />
                    <span>English</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? "תצוגה מקדימה" : "Live Preview"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="p-6 rounded-lg"
            style={{
              backgroundColor: `hsl(${localTheme.background_h}, ${localTheme.background_s}, ${localTheme.background_l})`
            }}
          >
            <div className="space-y-4">
              <h2 
                className="text-2xl font-bold"
                style={{
                  color: `hsl(${localTheme.primary_h}, ${localTheme.primary_s}, ${localTheme.primary_l})`
                }}
              >
                {isRTL ? localTheme.brand_name : localTheme.brand_name_en}
              </h2>
              <p style={{ color: 'white' }}>
                {isRTL ? "זוהי תצוגה מקדימה של הנושא שלך" : "This is a preview of your theme"}
              </p>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{
                    backgroundColor: `hsl(${localTheme.primary_h}, ${localTheme.primary_s}, ${localTheme.primary_l})`,
                    color: 'black'
                  }}
                >
                  {isRTL ? "כפתור ראשי" : "Primary Button"}
                </button>
                <button
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{
                    backgroundColor: `hsl(${localTheme.secondary_h}, ${localTheme.secondary_s}, ${localTheme.secondary_l})`,
                    color: 'white'
                  }}
                >
                  {isRTL ? "כפתור משני" : "Secondary Button"}
                </button>
                <button
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{
                    backgroundColor: `hsl(${localTheme.accent_h}, ${localTheme.accent_s}, ${localTheme.accent_l})`,
                    color: 'black'
                  }}
                >
                  {isRTL ? "הדגשה" : "Accent"}
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Theme;
