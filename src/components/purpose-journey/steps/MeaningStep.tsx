import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Sun, Zap } from "lucide-react";

interface MeaningStepProps {
  data: {
    meaning_sources?: string;
    peak_moments?: string;
    flow_activities?: string;
  };
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const MeaningStep = ({ data, onUpdate, language }: MeaningStepProps) => {
  const handleChange = (field: string, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 dark:bg-purple-600/20 mb-4">
          <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'משמעות' : 'Meaning'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'מה נותן לך תחושת משמעות עמוקה בחיים?' 
            : 'What gives you a deep sense of meaning in life?'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {language === 'he' ? 'מה נותן לך את תחושת המשמעות הגדולה ביותר?' : 'What gives you the greatest sense of meaning?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני מרגיש את המשמעות הגדולה ביותר כאשר...' 
              : 'I feel the greatest meaning when...'}
            value={data.meaning_sources || ''}
            onChange={(e) => handleChange('meaning_sources', e.target.value)}
            className="min-h-[100px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-purple-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Sun className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {language === 'he' ? 'תאר רגע בחיים שבו הרגשת "זה בשביל זה אני כאן"' : 'Describe a moment when you felt "this is why I\'m here"'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'רגע שבו הרגשתי תחושת ייעוד עמוקה היה כאשר...' 
              : 'A moment when I felt a deep sense of purpose was when...'}
            value={data.peak_moments || ''}
            onChange={(e) => handleChange('peak_moments', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-purple-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {language === 'he' ? 'באילו פעילויות אתה נכנס למצב של "זרימה" (flow)?' : 'In which activities do you enter a "flow" state?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני נכנס לזרימה כאשר אני...' 
              : 'I enter flow state when I...'}
            value={data.flow_activities || ''}
            onChange={(e) => handleChange('flow_activities', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-purple-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default MeaningStep;
