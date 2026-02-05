import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Target, DollarSign } from "lucide-react";

interface VisionStepProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const VisionStep = ({ data, onUpdate, language }: VisionStepProps) => {
  const handleChange = (field: string, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 dark:bg-emerald-600/20 mb-4">
          <Sparkles className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'החזון הפיננסי שלך' : 'Your Financial Vision'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'תאר את המצב הכלכלי שאתה שואף אליו' 
            : 'Describe the financial situation you aspire to'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {language === 'he' ? 'החזון הפיננסי שלי' : 'My financial vision'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'בעוד 5 שנים אני רואה את המצב הכלכלי שלי...' 
              : 'In 5 years I see my financial situation...'}
            value={(data.financial_vision as string) || ''}
            onChange={(e) => handleChange('financial_vision', e.target.value)}
            className="min-h-[100px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-emerald-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {language === 'he' ? 'יעדי הכסף שלי' : 'My money goals'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'היעדים הכלכליים העיקריים שלי הם...' 
              : 'My main financial goals are...'}
            value={(data.money_goals as string) || ''}
            onChange={(e) => handleChange('money_goals', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-emerald-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {language === 'he' ? 'למה יציבות כלכלית חשובה לי?' : 'Why is financial stability important to me?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'יציבות כלכלית חשובה לי כי...' 
              : 'Financial stability is important to me because...'}
            value={(data.motivation as string) || ''}
            onChange={(e) => handleChange('motivation', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-emerald-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default VisionStep;
