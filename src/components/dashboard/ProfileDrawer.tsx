import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLaunchpadData } from '@/hooks/useLaunchpadData';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Save, RefreshCw, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { translateProfileValue, translateFieldLabel } from '@/utils/profileTranslations';
import { AIAnalysisDisplay } from '@/components/launchpad/AIAnalysisDisplay';

interface ProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TABS = [
  { id: 'profile', label: 'פרופיל', labelEn: 'Profile', icon: '👤' },
  { id: 'focus', label: 'פוקוס', labelEn: 'Focus', icon: '🎯' },
  { id: 'analysis', label: 'AI', labelEn: 'AI', icon: '🧠' },
];

export function ProfileDrawer({ open, onOpenChange }: ProfileDrawerProps) {
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: launchpadData, isLoading, updateData, isUpdating } = useLaunchpadData();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [hasChanges, setHasChanges] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [analysisRefreshKey, setAnalysisRefreshKey] = useState(0);

  const [localData, setLocalData] = useState<{
    welcomeQuiz?: Record<string, string | string[]>;
    personalProfile?: Record<string, unknown>;
    focusAreas?: string[];
    firstWeek?: Record<string, unknown>;
  }>({});

  useEffect(() => {
    if (launchpadData) {
      setLocalData({
        welcomeQuiz: launchpadData.welcomeQuiz,
        personalProfile: launchpadData.personalProfile,
        focusAreas: launchpadData.focusAreas,
        firstWeek: launchpadData.firstWeek,
      });
    }
  }, [launchpadData]);

  const handleSave = async () => {
    updateData(localData);
    setHasChanges(false);
    toast.success(language === 'he' ? 'נשמר!' : 'Saved!');
  };

  const handleRegenerate = async () => {
    if (!user?.id) return;
    
    setIsRegenerating(true);
    try {
      const { error } = await supabase.functions.invoke('generate-launchpad-summary', {
        body: { userId: user.id, regenerate: true },
      });

      if (error) throw error;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['launchpad-data', user.id], refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: ['launchpad-summary', user.id], refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: ['life-plan', user.id], refetchType: 'active' }),
      ]);

      setAnalysisRefreshKey((k) => k + 1);
      toast.success(language === 'he' ? 'חושב מחדש!' : 'Regenerated!');
    } catch (error) {
      console.error('Error regenerating summary:', error);
      toast.error(language === 'he' ? 'שגיאה' : 'Error');
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isRTL ? "right" : "left"} 
        className="w-full sm:max-w-lg p-0"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle>
              {language === 'he' ? 'הפרופיל שלי' : 'My Profile'}
            </SheetTitle>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Button size="sm" onClick={handleSave} disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                </Button>
              )}
              <Button 
                size="sm"
                variant="outline" 
                onClick={handleRegenerate}
                disabled={isRegenerating}
              >
                {isRegenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-[calc(100vh-80px)]">
            <TabsList className="grid grid-cols-3 mx-4 mt-4">
              {TABS.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="text-xs gap-1">
                  <span>{tab.icon}</span>
                  <span>{language === 'he' ? tab.label : tab.labelEn}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <ScrollArea className="flex-1 px-4 py-4">
              <TabsContent value="profile" className="mt-0">
                <ProfileDisplay 
                  data={{ ...localData.welcomeQuiz, ...localData.personalProfile }}
                  language={language}
                />
              </TabsContent>

              <TabsContent value="focus" className="mt-0">
                <FocusDisplay 
                  areas={localData.focusAreas || []}
                  firstWeek={localData.firstWeek || {}}
                  language={language}
                />
              </TabsContent>

              <TabsContent value="analysis" className="mt-0">
                <AIAnalysisDisplay language={language} refreshKey={analysisRefreshKey} />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ProfileDisplay({ data, language }: { data: Record<string, unknown>; language: string }) {
  const entries = Object.entries(data || {}).filter(([_, v]) => v !== null && v !== undefined && v !== '');
  
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {language === 'he' ? 'אין נתונים עדיין' : 'No data yet'}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map(([key, value]) => (
        <div key={key} className="p-3 rounded-lg bg-muted/50 border">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {translateFieldLabel(key, language)}
          </p>
          {Array.isArray(value) ? (
            <div className="flex flex-wrap gap-1">
              {value.map((v, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                  {translateProfileValue(String(v), language)}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-foreground">
              {translateProfileValue(String(value), language)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function FocusDisplay({ areas, firstWeek, language }: { areas: string[]; firstWeek: Record<string, unknown>; language: string }) {
  const areaLabels: Record<string, { he: string; en: string }> = {
    career: { he: 'קריירה', en: 'Career' },
    business: { he: 'עסקים', en: 'Business' },
    relationships: { he: 'זוגיות', en: 'Relationships' },
    family: { he: 'משפחה', en: 'Family' },
    health: { he: 'בריאות', en: 'Health' },
    energy: { he: 'אנרגיה', en: 'Energy' },
    finance: { he: 'כספים', en: 'Finance' },
    purpose: { he: 'ייעוד', en: 'Purpose' },
    emotions: { he: 'רגשות', en: 'Emotions' },
    social: { he: 'חברתי', en: 'Social' },
    learning: { he: 'למידה', en: 'Learning' },
    spirituality: { he: 'רוחניות', en: 'Spirituality' },
  };

  return (
    <div className="space-y-4">
      {/* Focus Areas */}
      {areas.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">
            {language === 'he' ? 'תחומי פוקוס' : 'Focus Areas'}
          </p>
          <div className="flex flex-wrap gap-2">
            {areas.map((area) => (
              <span 
                key={area}
                className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                {areaLabels[area]?.[language === 'he' ? 'he' : 'en'] || area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* First Week Plan */}
      {Object.keys(firstWeek).length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">
            {language === 'he' ? 'תוכנית שבוע ראשון' : 'First Week Plan'}
          </p>
          
          {/* Habits to quit */}
          {Array.isArray(firstWeek.habits_to_quit) && firstWeek.habits_to_quit.length > 0 && (
            <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <p className="text-xs font-medium text-destructive mb-2">
                {language === 'he' ? 'הרגלים לעזוב' : 'Habits to Quit'}
              </p>
              <div className="flex flex-wrap gap-1">
                {(firstWeek.habits_to_quit as string[]).map((h, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* New habits */}
          {Array.isArray(firstWeek.new_habits) && firstWeek.new_habits.length > 0 && (
            <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
              <p className="text-xs font-medium text-green-600 mb-2">
                {language === 'he' ? 'הרגלים חדשים' : 'New Habits'}
              </p>
              <div className="flex flex-wrap gap-1">
                {(firstWeek.new_habits as string[]).map((h, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProfileDrawer;
