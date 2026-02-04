import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CreditCard, ShoppingCart, TrendingDown } from "lucide-react";

interface ExpensesStepProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const ExpensesStep = ({ data, onUpdate, language }: ExpensesStepProps) => {
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
          {language === 'he' ? 'הוצאות' : 'Expenses'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'בוא נבין לאן הכסף שלך הולך' 
            : 'Let\'s understand where your money goes'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            {language === 'he' ? 'הוצאות חודשיות' : 'Monthly Expenses'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'ההוצאות החודשיות העיקריות שלי הן...' 
              : 'My main monthly expenses are...'}
            value={(data.monthly_expenses as string) || ''}
            onChange={(e) => handleChange('monthly_expenses', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-emerald-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
            {language === 'he' ? 'דפוסי הוצאה' : 'Spending Patterns'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'הדפוסים של ההוצאות שלי כוללים...' 
              : 'My spending patterns include...'}
            value={(data.spending_patterns as string) || ''}
            onChange={(e) => handleChange('spending_patterns', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-emerald-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            {language === 'he' ? 'ההוצאות הגדולות ביותר' : 'Biggest Expenses'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'ההוצאות הגדולות ביותר שלי הן...' 
              : 'My biggest expenses are...'}
            value={(data.biggest_expenses as string) || ''}
            onChange={(e) => handleChange('biggest_expenses', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};

export default ExpensesStep;
