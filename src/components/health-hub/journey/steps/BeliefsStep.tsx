import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Lock, Lightbulb } from "lucide-react";

interface BeliefsStepProps {
  data: {
    health_beliefs?: string[];
    limiting_patterns?: string;
    past_obstacles?: string;
    subconscious_blocks?: string[];
  };
  onUpdate: (data: any) => void;
  language: string;
}

const beliefOptions = {
  he: [
    { value: 'genetics', label: 'הגנטיקה שלי מגבילה אותי' },
    { value: 'age', label: 'אני כבר מבוגר מדי לשינוי' },
    { value: 'time', label: 'אין לי זמן לדאוג לעצמי' },
    { value: 'willpower', label: 'אני חלש/ה ולא מסוגל/ת להתמיד' },
    { value: 'deserve', label: 'אני לא מגיע לי להיות בריא' },
    { value: 'hard', label: 'בריאות זה קשה מדי בשבילי' },
    { value: 'expensive', label: 'בריאות זה יקר מדי' },
    { value: 'failed', label: 'כבר נכשלתי בעבר - זה לא יעבוד' }
  ],
  en: [
    { value: 'genetics', label: 'My genetics limit me' },
    { value: 'age', label: 'I\'m too old to change' },
    { value: 'time', label: 'I don\'t have time for self-care' },
    { value: 'willpower', label: 'I\'m weak and can\'t stick to things' },
    { value: 'deserve', label: 'I don\'t deserve to be healthy' },
    { value: 'hard', label: 'Health is too hard for me' },
    { value: 'expensive', label: 'Being healthy is too expensive' },
    { value: 'failed', label: 'I\'ve failed before - it won\'t work' }
  ]
};

const blockOptions = {
  he: [
    { value: 'self_sabotage', label: 'חבלה עצמית' },
    { value: 'fear_success', label: 'פחד מהצלחה' },
    { value: 'comfort_zone', label: 'התמכרות לאזור הנוחות' },
    { value: 'perfectionism', label: 'פרפקציוניזם משתק' },
    { value: 'procrastination', label: 'דחיינות' },
    { value: 'low_priority', label: 'עצמי תמיד באחרונה' }
  ],
  en: [
    { value: 'self_sabotage', label: 'Self-sabotage' },
    { value: 'fear_success', label: 'Fear of success' },
    { value: 'comfort_zone', label: 'Addiction to comfort zone' },
    { value: 'perfectionism', label: 'Paralyzing perfectionism' },
    { value: 'procrastination', label: 'Procrastination' },
    { value: 'low_priority', label: 'Always putting myself last' }
  ]
};

const BeliefsStep = ({ data, onUpdate, language }: BeliefsStepProps) => {
  const handleChange = (field: string, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  const toggleBelief = (belief: string) => {
    const current = data.health_beliefs || [];
    const updated = current.includes(belief)
      ? current.filter(b => b !== belief)
      : [...current, belief];
    handleChange('health_beliefs', updated);
  };

  const toggleBlock = (block: string) => {
    const current = data.subconscious_blocks || [];
    const updated = current.includes(block)
      ? current.filter(b => b !== block)
      : [...current, block];
    handleChange('subconscious_blocks', updated);
  };

  const beliefs = language === 'he' ? beliefOptions.he : beliefOptions.en;
  const blocks = language === 'he' ? blockOptions.he : blockOptions.en;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 dark:bg-red-600/20 mb-4">
          <Sparkles className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'אמונות מגבילות' : 'Limiting Beliefs'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'זיהוי החסמים הפנימיים הוא הצעד הראשון לשחרורם' 
            : 'Identifying inner blocks is the first step to releasing them'}
        </p>
      </div>

      {/* Limiting Beliefs */}
      <div className="space-y-3 p-4 bg-gray-100 dark:bg-gray-800/30 rounded-lg">
        <Label className="flex items-center gap-2 text-foreground">
          <Lock className="w-4 h-4 text-red-600 dark:text-red-400" />
          {language === 'he' ? 'אמונות שמגבילות אותי' : 'Beliefs that limit me'}
        </Label>
        <p className="text-xs text-muted-foreground mb-2">
          {language === 'he' 
            ? 'סמן את המחשבות שעולות לך לפעמים' 
            : 'Select thoughts that sometimes come up for you'}
        </p>
        <div className="space-y-3">
          {beliefs.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id={`belief-${option.value}`}
                checked={(data.health_beliefs || []).includes(option.value)}
                onCheckedChange={() => toggleBelief(option.value)}
                className="border-red-600 data-[state=checked]:bg-red-600"
              />
              <label
                htmlFor={`belief-${option.value}`}
                className="text-sm cursor-pointer"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Subconscious Blocks */}
      <div className="space-y-3 p-4 bg-gray-100 dark:bg-gray-800/30 rounded-lg">
        <Label className="flex items-center gap-2 text-foreground">
          <Lightbulb className="w-4 h-4 text-red-600 dark:text-red-400" />
          {language === 'he' ? 'דפוסים תת-מודעים' : 'Subconscious patterns'}
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {blocks.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id={`block-${option.value}`}
                checked={(data.subconscious_blocks || []).includes(option.value)}
                onCheckedChange={() => toggleBlock(option.value)}
                className="border-red-600 data-[state=checked]:bg-red-600"
              />
              <label
                htmlFor={`block-${option.value}`}
                className="text-sm cursor-pointer"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Past Obstacles */}
      <div className="space-y-2">
        <Label className="text-foreground">
          {language === 'he' ? 'מה עצר אותי בניסיונות קודמים?' : 'What stopped me in past attempts?'}
        </Label>
        <Textarea
          placeholder={language === 'he' 
            ? 'בפעמים קודמות שניסיתי לשפר את הבריאות שלי...' 
            : 'In previous attempts to improve my health...'}
          value={data.past_obstacles || ''}
          onChange={(e) => handleChange('past_obstacles', e.target.value)}
          className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-red-500 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Limiting Patterns Description */}
      <div className="space-y-2">
        <Label className="text-foreground">
          {language === 'he' ? 'דפוס מחשבתי שחוזר על עצמו' : 'A recurring thought pattern'}
        </Label>
        <Textarea
          placeholder={language === 'he' 
            ? 'כשאני חושב על בריאות, המחשבה שעולה היא...' 
            : 'When I think about health, the thought that comes up is...'}
          value={data.limiting_patterns || ''}
          onChange={(e) => handleChange('limiting_patterns', e.target.value)}
          className="min-h-[60px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-red-500 text-foreground placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
};

export default BeliefsStep;
