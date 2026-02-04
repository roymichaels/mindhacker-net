import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Ear, Heart } from "lucide-react";

interface CommunicationStepProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const CommunicationStep = ({ data, onUpdate, language }: CommunicationStepProps) => {
  const handleChange = (field: string, value: unknown) => {
    onUpdate({ ...data, [field]: value });
  };

  const communicationStyles = [
    { value: 'assertive', he: 'אסרטיבי', en: 'Assertive' },
    { value: 'passive', he: 'פסיבי', en: 'Passive' },
    { value: 'aggressive', he: 'אגרסיבי', en: 'Aggressive' },
    { value: 'passive_aggressive', he: 'פסיבי-אגרסיבי', en: 'Passive-aggressive' },
  ];

  const conflictApproaches = [
    { value: 'avoidant', he: 'נמנע', en: 'Avoidant' },
    { value: 'confrontational', he: 'עימותי', en: 'Confrontational' },
    { value: 'collaborative', he: 'שיתופי', en: 'Collaborative' },
    { value: 'compromising', he: 'פשרני', en: 'Compromising' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-600/20 mb-4">
          <MessageCircle className="w-8 h-8 text-pink-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'סגנון תקשורת' : 'Communication Style'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'בוא נבין איך אתה מתקשר עם אחרים' 
            : 'Let\'s understand how you communicate with others'}
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-pink-400" />
            {language === 'he' ? 'סגנון התקשורת שלך' : 'Your Communication Style'}
          </Label>
          <Select
            value={(data.communication_style as string) || ''}
            onValueChange={(value) => handleChange('communication_style', value)}
          >
            <SelectTrigger className="bg-gray-800/50 border-gray-700">
              <SelectValue placeholder={language === 'he' ? 'בחר סגנון' : 'Select style'} />
            </SelectTrigger>
            <SelectContent>
              {communicationStyles.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {language === 'he' ? style.he : style.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-400" />
            {language === 'he' ? 'גישה לקונפליקטים' : 'Conflict Approach'}
          </Label>
          <Select
            value={(data.conflict_approach as string) || ''}
            onValueChange={(value) => handleChange('conflict_approach', value)}
          >
            <SelectTrigger className="bg-gray-800/50 border-gray-700">
              <SelectValue placeholder={language === 'he' ? 'בחר גישה' : 'Select approach'} />
            </SelectTrigger>
            <SelectContent>
              {conflictApproaches.map((approach) => (
                <SelectItem key={approach.value} value={approach.value}>
                  {language === 'he' ? approach.he : approach.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Ear className="w-4 h-4 text-pink-400" />
            {language === 'he' ? 'כישורי הקשבה' : 'Listening Skills'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'כשמישהו מדבר אליי, אני...' 
              : 'When someone talks to me, I...'}
            value={(data.listening_skills as string) || ''}
            onChange={(e) => handleChange('listening_skills', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-pink-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-pink-400" />
            {language === 'he' ? 'אתגרי ביטוי' : 'Expression Challenges'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'קשה לי לבטא את עצמי כאשר...' 
              : 'I find it hard to express myself when...'}
            value={(data.expression_challenges as string) || ''}
            onChange={(e) => handleChange('expression_challenges', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-pink-500"
          />
        </div>
      </div>
    </div>
  );
};

export default CommunicationStep;
