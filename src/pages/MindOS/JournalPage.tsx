import { BookOpen, Heart, Moon, Sun } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/hooks/useTranslation';
import { JournalTab } from '@/components/aurora/JournalTab';

export default function JournalPage() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="rounded-3xl border border-border bg-card/60 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{isHe ? 'יומן MindOS' : 'MindOS Journal'}</h2>
            <p className="text-sm text-muted-foreground">
              {isHe
                ? 'חלל אחד לחלומות, רפלקציה והכרת תודה.'
                : 'One space for dreams, reflection, and gratitude.'}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="reflection" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dream" className="gap-2">
            <Moon className="h-4 w-4" />
            <span>{isHe ? 'חלומות' : 'Dreams'}</span>
          </TabsTrigger>
          <TabsTrigger value="reflection" className="gap-2">
            <Sun className="h-4 w-4" />
            <span>{isHe ? 'רפלקציה' : 'Reflection'}</span>
          </TabsTrigger>
          <TabsTrigger value="gratitude" className="gap-2">
            <Heart className="h-4 w-4" />
            <span>{isHe ? 'הכרת תודה' : 'Gratitude'}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dream" className="min-h-[60vh] rounded-3xl border border-border bg-card/40">
          <JournalTab type="dream" />
        </TabsContent>
        <TabsContent value="reflection" className="min-h-[60vh] rounded-3xl border border-border bg-card/40">
          <JournalTab type="reflection" />
        </TabsContent>
        <TabsContent value="gratitude" className="min-h-[60vh] rounded-3xl border border-border bg-card/40">
          <JournalTab type="gratitude" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
