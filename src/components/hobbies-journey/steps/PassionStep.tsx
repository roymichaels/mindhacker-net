import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Heart, Sparkles, Zap } from "lucide-react";

interface PassionStepProps {
  data: {
    brings_joy?: string;
    flow_state?: string;
    excited_about?: string;
  };
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const PassionStep = ({ data, onUpdate, language }: PassionStepProps) => {
  const handleChange = (field: string, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-500/20 dark:bg-teal-600/20 mb-4">
          <Heart className="w-8 h-8 text-teal-600 dark:text-teal-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'מה מביא לך שמחה?' : 'What Brings You Joy?'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'הבן מה באמת גורם לך להרגיש חי ונלהב' 
            : 'Understand what truly makes you feel alive and excited'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Heart className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {language === 'he' ? 'אילו פעילויות מביאות לך הכי הרבה שמחה?' : 'Which activities bring you the most joy?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני מרגיש הכי שמח כאשר...' 
              : 'I feel happiest when...'}
            value={data.brings_joy || ''}
            onChange={(e) => handleChange('brings_joy', e.target.value)}
            className="min-h-[100px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-teal-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Zap className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {language === 'he' ? 'מתי אתה נכנס למצב \'זרימה\' ומאבד תחושת זמן?' : "When do you enter a 'flow state' and lose track of time?"}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני מאבד תחושת זמן כשאני...' 
              : 'I lose track of time when...'}
            value={data.flow_state || ''}
            onChange={(e) => handleChange('flow_state', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-teal-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {language === 'he' ? 'מה מלהיב אותך בימים אלה?' : 'What excites you these days?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'לאחרונה אני מתרגש מ...' 
              : 'Lately I am excited about...'}
            value={data.excited_about || ''}
            onChange={(e) => handleChange('excited_about', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-teal-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default PassionStep;
