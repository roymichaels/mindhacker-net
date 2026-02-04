import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Library, Target } from "lucide-react";

interface ReadingStepProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const ReadingStep = ({ data, onUpdate, language }: ReadingStepProps) => {
  const handleChange = (field: string, value: unknown) => {
    onUpdate({ ...data, [field]: value });
  };

  const readingHabits = [
    { value: 'none', he: 'לא קורא', en: 'Don\'t read' },
    { value: 'rarely', he: 'לעיתים רחוקות', en: 'Rarely' },
    { value: 'monthly', he: 'ספר בחודש', en: 'One book a month' },
    { value: 'weekly', he: 'כמה פעמים בשבוע', en: 'Several times a week' },
    { value: 'daily', he: 'כל יום', en: 'Daily' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600/20 mb-4">
          <BookOpen className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'קריאה ולמידה' : 'Reading & Learning'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'בוא נבין את הרגלי הקריאה שלך' 
            : 'Let\'s understand your reading habits'}
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            {language === 'he' ? 'הרגלי קריאה' : 'Reading Habits'}
          </Label>
          <Select
            value={(data.reading_habit as string) || ''}
            onValueChange={(value) => handleChange('reading_habit', value)}
          >
            <SelectTrigger className="bg-gray-800/50 border-gray-700">
              <SelectValue placeholder={language === 'he' ? 'בחר הרגל' : 'Select habit'} />
            </SelectTrigger>
            <SelectContent>
              {readingHabits.map((habit) => (
                <SelectItem key={habit.value} value={habit.value}>
                  {language === 'he' ? habit.he : habit.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Library className="w-4 h-4 text-indigo-400" />
            {language === 'he' ? 'נושאים מועדפים' : 'Favorite Topics'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני נהנה לקרוא על...' 
              : 'I enjoy reading about...'}
            value={(data.favorite_topics as string) || ''}
            onChange={(e) => handleChange('favorite_topics', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-400" />
            {language === 'he' ? 'מטרות קריאה' : 'Reading Goals'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'השנה אני רוצה לקרוא...' 
              : 'This year I want to read...'}
            value={(data.reading_goals as string) || ''}
            onChange={(e) => handleChange('reading_goals', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};

export default ReadingStep;
