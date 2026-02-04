import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Activity, TrendingUp, AlertCircle } from "lucide-react";

interface CurrentStateStepProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const CurrentStateStep = ({ data, onUpdate, language }: CurrentStateStepProps) => {
  const handleChange = (field: string, value: unknown) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-600/20 mb-4">
          <Activity className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'המצב הכלכלי הנוכחי' : 'Current Financial State'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'בוא נבין את המצב הכלכלי הנוכחי שלך' 
            : 'Let\'s understand your current financial situation'}
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-emerald-400" />
            {language === 'he' ? 'רמת לחץ כלכלי' : 'Financial Stress Level'}
          </Label>
          <Slider
            value={[(data.stress_level as number) || 50]}
            onValueChange={(value) => handleChange('stress_level', value[0])}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{language === 'he' ? 'רגוע' : 'Relaxed'}</span>
            <span className="font-medium text-emerald-400">{(data.stress_level as number) || 50}%</span>
            <span>{language === 'he' ? 'לחוץ מאוד' : 'Very stressed'}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            {language === 'he' ? 'תיאור המצב הכלכלי' : 'Financial Situation Description'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'המצב הכלכלי הנוכחי שלי הוא...' 
              : 'My current financial situation is...'}
            value={(data.financial_situation as string) || ''}
            onChange={(e) => handleChange('financial_situation', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-emerald-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            {language === 'he' ? 'מודעות כלכלית' : 'Financial Awareness'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'רמת המודעות שלי לכסף ולהוצאות היא...' 
              : 'My awareness of money and expenses is...'}
            value={(data.financial_awareness as string) || ''}
            onChange={(e) => handleChange('financial_awareness', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};

export default CurrentStateStep;
