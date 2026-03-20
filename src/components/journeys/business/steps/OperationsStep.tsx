import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Settings, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OperationsStepProps {
  onComplete: (data: Record<string, unknown>) => void;
  isCompleting: boolean;
  savedData?: Record<string, unknown>;
  onAutoSave?: (data: Record<string, unknown>) => void;
}

const STRUCTURE_OPTIONS = {
  he: [
    { id: 'sole_proprietor', label: 'עוסק פטור/מורשה' },
    { id: 'llc', label: 'חברה בע"מ' },
    { id: 'partnership', label: 'שותפות' },
    { id: 'undecided', label: 'עדיין לא החלטתי' },
  ],
  en: [
    { id: 'sole_proprietor', label: 'Sole Proprietor' },
    { id: 'llc', label: 'LLC / Corporation' },
    { id: 'partnership', label: 'Partnership' },
    { id: 'undecided', label: 'Not decided yet' },
  ],
};

const TEAM_OPTIONS = {
  he: [
    { id: 'solo', label: 'לבד - בלי צוות' },
    { id: 'partner', label: 'עם שותף אחד' },
    { id: 'small_team', label: 'צוות קטן (2-5)' },
    { id: 'medium_team', label: 'צוות בינוני (6-20)' },
    { id: 'freelancers', label: 'עם פרילנסרים' },
  ],
  en: [
    { id: 'solo', label: 'Solo - no team' },
    { id: 'partner', label: 'With one partner' },
    { id: 'small_team', label: 'Small team (2-5)' },
    { id: 'medium_team', label: 'Medium team (6-20)' },
    { id: 'freelancers', label: 'With freelancers' },
  ],
};

const LOCATION_OPTIONS = {
  he: [
    { id: 'home', label: 'מהבית' },
    { id: 'coworking', label: 'חלל עבודה משותף' },
    { id: 'office', label: 'משרד' },
    { id: 'online_only', label: 'אונליין בלבד' },
    { id: 'mobile', label: 'ניידת / שטח' },
  ],
  en: [
    { id: 'home', label: 'From home' },
    { id: 'coworking', label: 'Coworking space' },
    { id: 'office', label: 'Office' },
    { id: 'online_only', label: 'Online only' },
    { id: 'mobile', label: 'Mobile / Field' },
  ],
};

const HOURS_OPTIONS = {
  he: [
    { id: 'flexible', label: 'שעות גמישות' },
    { id: 'part_time', label: 'חלקי משרה קבוע' },
    { id: 'full_time', label: 'משרה מלאה' },
    { id: 'evenings_weekends', label: 'ערבים וסופ"ש' },
    { id: '24_7', label: 'זמינות מלאה 24/7' },
  ],
  en: [
    { id: 'flexible', label: 'Flexible hours' },
    { id: 'part_time', label: 'Fixed part-time' },
    { id: 'full_time', label: 'Full-time' },
    { id: 'evenings_weekends', label: 'Evenings & weekends' },
    { id: '24_7', label: 'Full 24/7 availability' },
  ],
};

export function OperationsStep({ onComplete, isCompleting, savedData, onAutoSave }: OperationsStepProps) {
  const { language, isRTL } = useTranslation();
  const [structure, setStructure] = useState<string>((savedData?.structure as string) || '');
  const [team, setTeam] = useState<string>((savedData?.team as string) || '');
  const [tools, setTools] = useState<string>((savedData?.tools as string) || '');
  const [location, setLocation] = useState<string>((savedData?.location as string) || '');
  const [workHours, setWorkHours] = useState<string>((savedData?.workHours as string) || '');
  const [processes, setProcesses] = useState<string>((savedData?.processes as string) || '');

  const structureOptions = language === 'he' ? STRUCTURE_OPTIONS.he : STRUCTURE_OPTIONS.en;
  const teamOptions = language === 'he' ? TEAM_OPTIONS.he : TEAM_OPTIONS.en;
  const locationOptions = language === 'he' ? LOCATION_OPTIONS.he : LOCATION_OPTIONS.en;
  const hoursOptions = language === 'he' ? HOURS_OPTIONS.he : HOURS_OPTIONS.en;

  const isValid = structure && team && location && workHours;

  useEffect(() => {
    if (onAutoSave) {
      const timer = setTimeout(() => {
        onAutoSave({ structure, team, tools, location, workHours, processes });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [structure, team, tools, location, workHours, processes, onAutoSave]);

  const handleComplete = () => {
    if (!isValid) return;
    onComplete({ structure, team, tools, location, workHours, processes });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 mb-4">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">
          {language === 'he' ? 'תפעול ומבנה' : 'Operations & Structure'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'he' ? 'איך העסק שלך יעבוד?' : 'How will your business operate?'}
        </p>
      </motion.div>

      {/* Structure */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'מבנה העסק' : 'Business structure'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {structureOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setStructure(option.id)}
                className={cn(
                  "p-3 rounded-lg border text-sm font-medium transition-all text-start",
                  structure === option.id
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                    : "border-border hover:border-emerald-500/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {structure === option.id && <Check className="w-4 h-4 text-emerald-500" />}
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'צוות נדרש' : 'Required team'}
          </h3>
          <div className="space-y-2">
            {teamOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setTeam(option.id)}
                className={cn(
                  "w-full p-3 rounded-lg border text-sm font-medium transition-all text-start",
                  team === option.id
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                    : "border-border hover:border-emerald-500/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {team === option.id && <Check className="w-4 h-4 text-emerald-500" />}
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tools */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'כלים וטכנולוגיה' : 'Tools & Technology'}
          </h3>
          <Textarea
            value={tools}
            onChange={(e) => setTools(e.target.value)}
            placeholder={language === 'he' ? 'איזה כלים ותוכנות תצטרך...' : 'What tools and software will you need...'}
            className="min-h-[80px]"
          />
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'מיקום העסק' : 'Business location'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {locationOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setLocation(option.id)}
                className={cn(
                  "p-3 rounded-lg border text-sm font-medium transition-all text-start",
                  location === option.id
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                    : "border-border hover:border-emerald-500/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {location === option.id && <Check className="w-4 h-4 text-emerald-500" />}
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Work Hours */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'שעות פעילות' : 'Working hours'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {hoursOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setWorkHours(option.id)}
                className={cn(
                  "p-3 rounded-lg border text-sm font-medium transition-all text-start",
                  workHours === option.id
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                    : "border-border hover:border-emerald-500/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {workHours === option.id && <Check className="w-4 h-4 text-emerald-500" />}
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Processes */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'תהליכי עבודה' : 'Work processes'}
          </h3>
          <Textarea
            value={processes}
            onChange={(e) => setProcesses(e.target.value)}
            placeholder={language === 'he' ? 'תאר את תהליכי העבודה המתוכננים...' : 'Describe your planned work processes...'}
            className="min-h-[80px]"
          />
        </CardContent>
      </Card>

      <Button
        onClick={handleComplete}
        disabled={!isValid || isCompleting}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
        size="lg"
      >
        {isCompleting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin me-2" />
            {language === 'he' ? 'שומר...' : 'Saving...'}
          </>
        ) : (
          language === 'he' ? 'המשך' : 'Continue'
        )}
      </Button>
    </div>
  );
}

export default OperationsStep;
