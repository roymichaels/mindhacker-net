import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Palette, Search, Heart } from "lucide-react";

interface DiscoveryStepProps {
  data: {
    current_hobbies?: string[];
    past_interests?: string;
    childhood_activities?: string;
  };
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const DiscoveryStep = ({ data, onUpdate, language }: DiscoveryStepProps) => {
  const handleChange = (field: string, value: string | string[]) => {
    onUpdate({ ...data, [field]: value });
  };

  const handleHobbiesChange = (value: string) => {
    const hobbies = value.split(',').map(h => h.trim()).filter(Boolean);
    handleChange('current_hobbies', hobbies);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-500/20 dark:bg-teal-600/20 mb-4">
          <Palette className="w-8 h-8 text-teal-600 dark:text-teal-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'גילוי התחביבים שלך' : 'Discover Your Hobbies'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'בוא נגלה מה מעסיק אותך בזמן הפנוי שלך' 
            : "Let's discover what occupies your free time"}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Search className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {language === 'he' ? 'מה התחביבים הנוכחיים שלך? (מופרדים בפסיקים)' : 'What are your current hobbies? (separated by commas)'}
          </Label>
          <Input
            placeholder={language === 'he' 
              ? 'ציור, קריאה, ספורט, בישול...' 
              : 'Painting, reading, sports, cooking...'}
            value={(data.current_hobbies || []).join(', ')}
            onChange={(e) => handleHobbiesChange(e.target.value)}
            className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-teal-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Heart className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {language === 'he' ? 'מה התעניינת בו בעבר אך הפסקת?' : 'What interested you in the past but you stopped?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'פעילויות שאהבתי ועזבתי...' 
              : 'Activities I loved and left behind...'}
            value={data.past_interests || ''}
            onChange={(e) => handleChange('past_interests', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-teal-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Palette className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {language === 'he' ? 'מה אהבת לעשות בילדות?' : 'What did you love doing as a child?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'בילדות אהבתי לעסוק ב...' 
              : 'As a child I loved...'}
            value={data.childhood_activities || ''}
            onChange={(e) => handleChange('childhood_activities', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-teal-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default DiscoveryStep;
