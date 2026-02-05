import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Hammer, Repeat, Target } from "lucide-react";

interface PracticeStepProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const PracticeStep = ({ data, onUpdate, language }: PracticeStepProps) => {
  const handleChange = (field: string, value: unknown) => {
    onUpdate({ ...data, [field]: value });
  };

  const practiceFrequencies = [
    { value: 'never', he: 'אף פעם', en: 'Never' },
    { value: 'rarely', he: 'לעיתים רחוקות', en: 'Rarely' },
    { value: 'weekly', he: 'פעם בשבוע', en: 'Weekly' },
    { value: 'several_weekly', he: 'כמה פעמים בשבוע', en: 'Several times a week' },
    { value: 'daily', he: 'כל יום', en: 'Daily' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/20 dark:bg-indigo-600/20 mb-4">
          <Hammer className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'תרגול ויישום' : 'Practice & Application'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'בוא נבין איך אתה מתרגל את מה שלמדת' 
            : 'Let\'s understand how you practice what you learn'}
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Repeat className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {language === 'he' ? 'תדירות תרגול' : 'Practice Frequency'}
          </Label>
          <Select
            value={(data.practice_frequency as string) || ''}
            onValueChange={(value) => handleChange('practice_frequency', value)}
          >
            <SelectTrigger className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-foreground">
              <SelectValue placeholder={language === 'he' ? 'בחר תדירות' : 'Select frequency'} />
            </SelectTrigger>
            <SelectContent>
              {practiceFrequencies.map((freq) => (
                <SelectItem key={freq.value} value={freq.value}>
                  {language === 'he' ? freq.he : freq.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Hammer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {language === 'he' ? 'שיטות תרגול' : 'Practice Methods'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני מתרגל על ידי...' 
              : 'I practice by...'}
            value={(data.practice_methods as string) || ''}
            onChange={(e) => handleChange('practice_methods', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-indigo-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {language === 'he' ? 'אזורי יישום' : 'Application Areas'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני מיישם את מה שלמדתי ב...' 
              : 'I apply what I\'ve learned in...'}
            value={(data.application_areas as string) || ''}
            onChange={(e) => handleChange('application_areas', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-indigo-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default PracticeStep;
