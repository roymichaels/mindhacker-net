import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CreditCard, AlertCircle, Target } from "lucide-react";

interface DebtStepProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const DebtStep = ({ data, onUpdate, language }: DebtStepProps) => {
  const handleChange = (field: string, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-600/20 mb-4">
          <CreditCard className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'חובות' : 'Debt'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'בוא נבין את מצב החובות שלך' 
            : 'Let\'s understand your debt situation'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            {language === 'he' ? 'סך החובות' : 'Total Debt'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'סך החובות שלי הוא בערך...' 
              : 'My total debt is approximately...'}
            value={(data.total_debt as string) || ''}
            onChange={(e) => handleChange('total_debt', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-emerald-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-emerald-400" />
            {language === 'he' ? 'ניהול חובות' : 'Debt Management'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'איך אני מנהל את החובות שלי...' 
              : 'How I manage my debt...'}
            value={(data.debt_management as string) || ''}
            onChange={(e) => handleChange('debt_management', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-emerald-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            {language === 'he' ? 'יעד להפחתת חובות' : 'Debt Reduction Goal'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'המטרה שלי לגבי החובות היא...' 
              : 'My goal regarding debt is...'}
            value={(data.debt_reduction_goal as string) || ''}
            onChange={(e) => handleChange('debt_reduction_goal', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};

export default DebtStep;
