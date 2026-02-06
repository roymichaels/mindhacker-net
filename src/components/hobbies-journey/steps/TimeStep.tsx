import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Clock, Target, AlertCircle } from "lucide-react";

interface TimeStepProps {
  data: {
    weekly_hours?: string;
    ideal_hours?: string;
    time_blockers?: string;
  };
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const TimeStep = ({ data, onUpdate, language }: TimeStepProps) => {
  const handleChange = (field: string, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-500/20 dark:bg-teal-600/20 mb-4">
          <Clock className="w-8 h-8 text-teal-600 dark:text-teal-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'ניהול זמן הפנאי' : 'Leisure Time Management'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'הבן כמה זמן אתה מקדיש לתחביבים שלך' 
            : 'Understand how much time you dedicate to your hobbies'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {language === 'he' ? 'כמה שעות בשבוע אתה מקדיש לתחביבים?' : 'How many hours per week do you dedicate to hobbies?'}
          </Label>
          <Input
            type="text"
            placeholder={language === 'he' ? 'לדוגמה: 5 שעות' : 'e.g., 5 hours'}
            value={data.weekly_hours || ''}
            onChange={(e) => handleChange('weekly_hours', e.target.value)}
            className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-teal-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Target className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {language === 'he' ? 'כמה שעות היית רוצה להקדיש באופן אידיאלי?' : 'How many hours would you ideally like to dedicate?'}
          </Label>
          <Input
            type="text"
            placeholder={language === 'he' ? 'לדוגמה: 10 שעות' : 'e.g., 10 hours'}
            value={data.ideal_hours || ''}
            onChange={(e) => handleChange('ideal_hours', e.target.value)}
            className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-teal-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <AlertCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {language === 'he' ? 'מה מונע ממך להקדיש יותר זמן לתחביבים?' : 'What prevents you from dedicating more time to hobbies?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'המכשולים העיקריים שלי הם...' 
              : 'My main obstacles are...'}
            value={data.time_blockers || ''}
            onChange={(e) => handleChange('time_blockers', e.target.value)}
            className="min-h-[100px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-teal-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default TimeStep;
