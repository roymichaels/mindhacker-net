import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Home, Heart, Users } from "lucide-react";

interface FamilyStepProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const FamilyStep = ({ data, onUpdate, language }: FamilyStepProps) => {
  const handleChange = (field: string, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-600/20 mb-4">
          <Home className="w-8 h-8 text-pink-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'דינמיקה משפחתית' : 'Family Dynamics'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'בוא נבין את הקשרים המשפחתיים שלך' 
            : 'Let\'s understand your family relationships'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="w-4 h-4 text-pink-400" />
            {language === 'he' ? 'תאר את הדינמיקה המשפחתית שלך' : 'Describe your family dynamics'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'המשפחה שלי היא...' 
              : 'My family is...'}
            value={(data.family_dynamics as string) || ''}
            onChange={(e) => handleChange('family_dynamics', e.target.value)}
            className="min-h-[100px] bg-gray-800/50 border-gray-700 focus:border-pink-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-400" />
            {language === 'he' ? 'החוזקות של המשפחה שלך' : 'Your family\'s strengths'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'החוזקות של המשפחה שלי כוללות...' 
              : 'My family\'s strengths include...'}
            value={(data.family_strengths as string) || ''}
            onChange={(e) => handleChange('family_strengths', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-pink-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Home className="w-4 h-4 text-pink-400" />
            {language === 'he' ? 'מטרות לשיפור הקשרים המשפחתיים' : 'Goals for improving family relationships'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני רוצה לשפר את הקשרים המשפחתיים על ידי...' 
              : 'I want to improve family relationships by...'}
            value={(data.family_goals as string) || ''}
            onChange={(e) => handleChange('family_goals', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-pink-500"
          />
        </div>
      </div>
    </div>
  );
};

export default FamilyStep;
