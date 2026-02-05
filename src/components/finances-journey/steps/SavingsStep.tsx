import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PiggyBank, Shield, Target } from "lucide-react";

interface SavingsStepProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const SavingsStep = ({ data, onUpdate, language }: SavingsStepProps) => {
  const handleChange = (field: string, value: unknown) => {
    onUpdate({ ...data, [field]: value });
  };

  const savingsRates = [
    { value: 'none', he: 'לא חוסך', en: 'Not saving' },
    { value: 'low', he: 'עד 10%', en: 'Up to 10%' },
    { value: 'medium', he: '10-20%', en: '10-20%' },
    { value: 'high', he: '20-30%', en: '20-30%' },
    { value: 'very_high', he: 'מעל 30%', en: 'Above 30%' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 dark:bg-emerald-600/20 mb-4">
          <PiggyBank className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'חסכונות' : 'Savings'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'בוא נבין את הרגלי החיסכון שלך' 
            : 'Let\'s understand your saving habits'}
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <PiggyBank className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {language === 'he' ? 'שיעור חיסכון' : 'Savings Rate'}
          </Label>
          <Select
            value={(data.savings_rate as string) || ''}
            onValueChange={(value) => handleChange('savings_rate', value)}
          >
            <SelectTrigger className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-foreground">
              <SelectValue placeholder={language === 'he' ? 'בחר שיעור' : 'Select rate'} />
            </SelectTrigger>
            <SelectContent>
              {savingsRates.map((rate) => (
                <SelectItem key={rate.value} value={rate.value}>
                  {language === 'he' ? rate.he : rate.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {language === 'he' ? 'קרן חירום' : 'Emergency Fund'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'קרן החירום שלי יכולה לכסות...' 
              : 'My emergency fund can cover...'}
            value={(data.emergency_fund as string) || ''}
            onChange={(e) => handleChange('emergency_fund', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-emerald-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {language === 'he' ? 'יעדי חיסכון' : 'Savings Goals'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני חוסך עבור...' 
              : 'I\'m saving for...'}
            value={(data.savings_goals as string) || ''}
            onChange={(e) => handleChange('savings_goals', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-emerald-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default SavingsStep;
