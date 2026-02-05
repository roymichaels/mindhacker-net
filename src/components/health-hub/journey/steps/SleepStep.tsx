import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Moon, Clock, AlertTriangle } from "lucide-react";

interface SleepStepProps {
  data: {
    sleep_hours?: string;
    sleep_quality?: string;
    sleep_issues?: string[];
    bedtime_routine?: string;
  };
  onUpdate: (data: any) => void;
  language: string;
}

const sleepHoursOptions = {
  he: [
    { value: 'less-5', label: 'פחות מ-5 שעות' },
    { value: '5-6', label: '5-6 שעות' },
    { value: '6-7', label: '6-7 שעות' },
    { value: '7-8', label: '7-8 שעות' },
    { value: 'more-8', label: 'יותר מ-8 שעות' }
  ],
  en: [
    { value: 'less-5', label: 'Less than 5 hours' },
    { value: '5-6', label: '5-6 hours' },
    { value: '6-7', label: '6-7 hours' },
    { value: '7-8', label: '7-8 hours' },
    { value: 'more-8', label: 'More than 8 hours' }
  ]
};

const sleepQualityOptions = {
  he: [
    { value: 'poor', label: 'גרועה - מתעורר עייף' },
    { value: 'fair', label: 'סבירה - לא מספיק מנוחה' },
    { value: 'good', label: 'טובה - רוב הלילות בסדר' },
    { value: 'excellent', label: 'מצוינת - מתעורר רענן' }
  ],
  en: [
    { value: 'poor', label: 'Poor - wake up tired' },
    { value: 'fair', label: 'Fair - not enough rest' },
    { value: 'good', label: 'Good - most nights are fine' },
    { value: 'excellent', label: 'Excellent - wake up refreshed' }
  ]
};

const sleepIssuesOptions = {
  he: [
    { value: 'falling_asleep', label: 'קושי להירדם' },
    { value: 'staying_asleep', label: 'התעוררויות באמצע הלילה' },
    { value: 'early_waking', label: 'התעוררות מוקדמת מדי' },
    { value: 'restless', label: 'שינה לא שקטה' },
    { value: 'snoring', label: 'נחירות' },
    { value: 'nightmares', label: 'סיוטים' },
    { value: 'screens', label: 'מסכים לפני השינה' },
    { value: 'irregular', label: 'שעות שינה לא קבועות' }
  ],
  en: [
    { value: 'falling_asleep', label: 'Difficulty falling asleep' },
    { value: 'staying_asleep', label: 'Waking up during the night' },
    { value: 'early_waking', label: 'Waking up too early' },
    { value: 'restless', label: 'Restless sleep' },
    { value: 'snoring', label: 'Snoring' },
    { value: 'nightmares', label: 'Nightmares' },
    { value: 'screens', label: 'Screens before bed' },
    { value: 'irregular', label: 'Irregular sleep schedule' }
  ]
};

const SleepStep = ({ data, onUpdate, language }: SleepStepProps) => {
  const handleChange = (field: string, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  const toggleIssue = (issue: string) => {
    const current = data.sleep_issues || [];
    const updated = current.includes(issue)
      ? current.filter(i => i !== issue)
      : [...current, issue];
    handleChange('sleep_issues', updated);
  };

  const hours = language === 'he' ? sleepHoursOptions.he : sleepHoursOptions.en;
  const quality = language === 'he' ? sleepQualityOptions.he : sleepQualityOptions.en;
  const issues = language === 'he' ? sleepIssuesOptions.he : sleepIssuesOptions.en;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 dark:bg-red-600/20 mb-4">
          <Moon className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'שינה ומנוחה' : 'Sleep & Rest'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'שינה איכותית היא הבסיס לבריאות טובה' 
            : 'Quality sleep is the foundation of good health'}
        </p>
      </div>

      {/* Sleep Hours */}
      <div className="space-y-3 p-4 bg-gray-100 dark:bg-gray-800/30 rounded-lg">
        <Label className="flex items-center gap-2 text-foreground">
          <Clock className="w-4 h-4 text-red-600 dark:text-red-400" />
          {language === 'he' ? 'כמה שעות אני ישן בלילה?' : 'How many hours do I sleep at night?'}
        </Label>
        <RadioGroup
          value={data.sleep_hours || ''}
          onValueChange={(value) => handleChange('sleep_hours', value)}
          className="grid grid-cols-2 gap-2"
        >
          {hours.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem 
                value={option.value} 
                id={`hours-${option.value}`}
                className="border-red-600 text-red-600"
              />
              <label htmlFor={`hours-${option.value}`} className="text-sm cursor-pointer">
                {option.label}
              </label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Sleep Quality */}
      <div className="space-y-3 p-4 bg-gray-100 dark:bg-gray-800/30 rounded-lg">
        <Label className="flex items-center gap-2 text-foreground">
          <Moon className="w-4 h-4 text-red-600 dark:text-red-400" />
          {language === 'he' ? 'איכות השינה שלי' : 'My sleep quality'}
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {quality.map((option) => (
            <button
              key={option.value}
              onClick={() => handleChange('sleep_quality', option.value)}
              className={`p-3 rounded-lg text-sm text-center transition-all ${
                data.sleep_quality === option.value
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sleep Issues */}
      <div className="space-y-3 p-4 bg-gray-100 dark:bg-gray-800/30 rounded-lg">
        <Label className="flex items-center gap-2 text-foreground">
          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
          {language === 'he' ? 'בעיות שינה (סמן הכל שרלוונטי)' : 'Sleep issues (select all that apply)'}
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {issues.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id={`issue-${option.value}`}
                checked={(data.sleep_issues || []).includes(option.value)}
                onCheckedChange={() => toggleIssue(option.value)}
                className="border-red-600 data-[state=checked]:bg-red-600"
              />
              <label
                htmlFor={`issue-${option.value}`}
                className="text-sm cursor-pointer"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Bedtime Routine */}
      <div className="space-y-2">
        <Label className="text-foreground">
          {language === 'he' ? 'תאר את הרוטינה שלך לפני השינה' : 'Describe your bedtime routine'}
        </Label>
        <Textarea
          placeholder={language === 'he' 
            ? 'מה אתה עושה בשעה לפני השינה?' 
            : 'What do you do in the hour before bed?'}
          value={data.bedtime_routine || ''}
          onChange={(e) => handleChange('bedtime_routine', e.target.value)}
          className="min-h-[60px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-red-500 text-foreground placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
};

export default SleepStep;
