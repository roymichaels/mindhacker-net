import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Briefcase, Target } from "lucide-react";

interface IncomeStepProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const IncomeStep = ({ data, onUpdate, language }: IncomeStepProps) => {
  const handleChange = (field: string, value: unknown) => {
    onUpdate({ ...data, [field]: value });
  };

  const incomeStabilities = [
    { value: 'stable', he: 'יציב', en: 'Stable' },
    { value: 'somewhat_stable', he: 'יציב במידה מסוימת', en: 'Somewhat stable' },
    { value: 'variable', he: 'משתנה', en: 'Variable' },
    { value: 'unstable', he: 'לא יציב', en: 'Unstable' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 dark:bg-emerald-600/20 mb-4">
          <TrendingUp className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'הכנסות' : 'Income'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'בוא נבין את מקורות ההכנסה שלך' 
            : 'Let\'s understand your income sources'}
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {language === 'he' ? 'הכנסה עיקרית' : 'Primary Income'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'מקור ההכנסה העיקרי שלי הוא...' 
              : 'My primary income source is...'}
            value={(data.primary_income as string) || ''}
            onChange={(e) => handleChange('primary_income', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-emerald-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {language === 'he' ? 'יציבות הכנסה' : 'Income Stability'}
          </Label>
          <Select
            value={(data.income_stability as string) || ''}
            onValueChange={(value) => handleChange('income_stability', value)}
          >
            <SelectTrigger className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-foreground">
              <SelectValue placeholder={language === 'he' ? 'בחר רמת יציבות' : 'Select stability level'} />
            </SelectTrigger>
            <SelectContent>
              {incomeStabilities.map((stability) => (
                <SelectItem key={stability.value} value={stability.value}>
                  {language === 'he' ? stability.he : stability.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {language === 'he' ? 'פוטנציאל צמיחה בהכנסה' : 'Income Growth Potential'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני רואה פוטנציאל להגדיל את ההכנסה שלי על ידי...' 
              : 'I see potential to increase my income by...'}
            value={(data.income_growth_potential as string) || ''}
            onChange={(e) => handleChange('income_growth_potential', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-emerald-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default IncomeStep;
