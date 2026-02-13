import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useProjects, ProjectInsert } from '@/hooks/useProjects';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Sparkles, Target, Lightbulb, Clock, Flag, Mountain, Shield, ArrowRight, ArrowLeft, Check,
} from 'lucide-react';

interface AddProjectWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LIFE_AREAS = [
  { id: 'business', labelEn: 'Business', labelHe: 'עסקים' },
  { id: 'health', labelEn: 'Health', labelHe: 'בריאות' },
  { id: 'relationships', labelEn: 'Relationships', labelHe: 'קשרים' },
  { id: 'finances', labelEn: 'Finances', labelHe: 'פיננסים' },
  { id: 'learning', labelEn: 'Learning', labelHe: 'למידה' },
  { id: 'purpose', labelEn: 'Purpose', labelHe: 'ייעוד' },
  { id: 'hobbies', labelEn: 'Hobbies', labelHe: 'תחביבים' },
  { id: 'consciousness', labelEn: 'Consciousness', labelHe: 'תודעה' },
];

const PRIORITIES = [
  { id: 'low', labelEn: 'Low', labelHe: 'נמוכה', color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' },
  { id: 'medium', labelEn: 'Medium', labelHe: 'בינונית', color: 'bg-amber-500/20 text-amber-600 dark:text-amber-400' },
  { id: 'high', labelEn: 'High', labelHe: 'גבוהה', color: 'bg-orange-500/20 text-orange-600 dark:text-orange-400' },
  { id: 'critical', labelEn: 'Critical', labelHe: 'קריטית', color: 'bg-red-500/20 text-red-600 dark:text-red-400' },
];

const COLORS = [
  '#d4a574', '#c9a04f', '#b8860b', '#daa520', '#cd853f',
  '#8b7355', '#a0522d', '#6b4423', '#c19a6b', '#e6be8a',
];

const TOTAL_STEPS = 6;

export function AddProjectWizard({ open, onOpenChange }: AddProjectWizardProps) {
  const { language, isRTL } = useTranslation();
  const { createProject } = useProjects();
  const [step, setStep] = useState(1);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('personal');
  const [priority, setPriority] = useState('medium');
  const [vision, setVision] = useState('');
  const [whyItMatters, setWhyItMatters] = useState('');
  const [desiredOutcome, setDesiredOutcome] = useState('');
  const [timeline, setTimeline] = useState('');
  const [resourcesNeeded, setResourcesNeeded] = useState('');
  const [potentialBlockers, setPotentialBlockers] = useState('');
  const [linkedLifeAreas, setLinkedLifeAreas] = useState<string[]>([]);
  const [coverColor, setCoverColor] = useState('#d4a574');
  const [targetDate, setTargetDate] = useState('');

  const resetForm = () => {
    setStep(1);
    setTitle(''); setDescription(''); setCategory('personal'); setPriority('medium');
    setVision(''); setWhyItMatters(''); setDesiredOutcome(''); setTimeline('');
    setResourcesNeeded(''); setPotentialBlockers(''); setLinkedLifeAreas([]);
    setCoverColor('#d4a574'); setTargetDate('');
  };

  const toggleLifeArea = (id: string) => {
    setLinkedLifeAreas(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    await createProject.mutateAsync({
      title, description: description || null, category, priority, vision: vision || null,
      why_it_matters: whyItMatters || null, desired_outcome: desiredOutcome || null,
      timeline: timeline || null, resources_needed: resourcesNeeded || null,
      potential_blockers: potentialBlockers || null, linked_life_areas: linkedLifeAreas,
      cover_color: coverColor, target_date: targetDate || null,
      progress_percentage: 0, status: 'active', tags: [], key_milestones: [],
      linked_goal_ids: [], linked_checklist_ids: [], started_at: new Date().toISOString(),
      completed_at: null,
    } as any);
    resetForm();
    onOpenChange(false);
  };

  const canProceed = () => {
    if (step === 1) return title.trim().length > 0;
    return true;
  };

  const NextIcon = isRTL ? ArrowLeft : ArrowRight;
  const PrevIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-yellow-600 dark:from-amber-400 dark:to-yellow-500 font-bold">
              {language === 'he' ? 'הוסף פרויקט חדש' : 'Add New Project'}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{language === 'he' ? `שלב ${step} מתוך ${TOTAL_STEPS}` : `Step ${step} of ${TOTAL_STEPS}`}</span>
            <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
          </div>
          <Progress value={(step / TOTAL_STEPS) * 100} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-amber-400 [&>div]:to-yellow-500" />
        </div>

        {/* Step 1: Name & Description */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Lightbulb className="h-5 w-5" />
              <h3 className="font-semibold">{language === 'he' ? 'מה הפרויקט שלך?' : "What's your project?"}</h3>
            </div>
            <div className="space-y-3">
              <div>
                <Label>{language === 'he' ? 'שם הפרויקט' : 'Project Name'} *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={language === 'he' ? 'למשל: השקת אתר חדש' : 'e.g. Launch new website'} className="mt-1" />
              </div>
              <div>
                <Label>{language === 'he' ? 'תיאור קצר' : 'Short Description'}</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder={language === 'he' ? 'ספר בקצרה על הפרויקט...' : 'Briefly describe your project...'} className="mt-1" rows={3} />
              </div>
              <div>
                <Label>{language === 'he' ? 'צבע כיסוי' : 'Cover Color'}</Label>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setCoverColor(c)} className={cn("h-8 w-8 rounded-full border-2 transition-all", coverColor === c ? 'border-foreground scale-110' : 'border-transparent')} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Vision & Why */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Target className="h-5 w-5" />
              <h3 className="font-semibold">{language === 'he' ? 'חזון ומטרה' : 'Vision & Purpose'}</h3>
            </div>
            <div className="space-y-3">
              <div>
                <Label>{language === 'he' ? 'מה החזון שלך לפרויקט?' : 'What is your vision for this project?'}</Label>
                <Textarea value={vision} onChange={e => setVision(e.target.value)} placeholder={language === 'he' ? 'תאר את המצב האידיאלי...' : 'Describe the ideal outcome...'} className="mt-1" rows={3} />
              </div>
              <div>
                <Label>{language === 'he' ? 'למה זה חשוב לך?' : 'Why does this matter to you?'}</Label>
                <Textarea value={whyItMatters} onChange={e => setWhyItMatters(e.target.value)} placeholder={language === 'he' ? 'מה המוטיבציה העמוקה...' : 'What is the deeper motivation...'} className="mt-1" rows={3} />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Desired Outcome & Timeline */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
              <h3 className="font-semibold">{language === 'he' ? 'תוצאה רצויה ולוח זמנים' : 'Outcome & Timeline'}</h3>
            </div>
            <div className="space-y-3">
              <div>
                <Label>{language === 'he' ? 'מה התוצאה הרצויה?' : 'What is the desired outcome?'}</Label>
                <Textarea value={desiredOutcome} onChange={e => setDesiredOutcome(e.target.value)} placeholder={language === 'he' ? 'כיצד תדע שהפרויקט הושלם בהצלחה...' : 'How will you know the project succeeded...'} className="mt-1" rows={3} />
              </div>
              <div>
                <Label>{language === 'he' ? 'לוח זמנים' : 'Timeline'}</Label>
                <Input value={timeline} onChange={e => setTimeline(e.target.value)} placeholder={language === 'he' ? 'למשל: 3 חודשים' : 'e.g. 3 months'} className="mt-1" />
              </div>
              <div>
                <Label>{language === 'he' ? 'תאריך יעד' : 'Target Date'}</Label>
                <Input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="mt-1" />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Priority & Resources */}
        {step === 4 && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Flag className="h-5 w-5" />
              <h3 className="font-semibold">{language === 'he' ? 'עדיפות ומשאבים' : 'Priority & Resources'}</h3>
            </div>
            <div className="space-y-3">
              <div>
                <Label>{language === 'he' ? 'עדיפות' : 'Priority'}</Label>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {PRIORITIES.map(p => (
                    <button key={p.id} onClick={() => setPriority(p.id)} className={cn("px-3 py-1.5 rounded-full text-sm font-medium border transition-all", p.color, priority === p.id ? 'ring-2 ring-amber-400 scale-105' : 'opacity-70 hover:opacity-100')}>
                      {language === 'he' ? p.labelHe : p.labelEn}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>{language === 'he' ? 'משאבים נדרשים' : 'Resources Needed'}</Label>
                <Textarea value={resourcesNeeded} onChange={e => setResourcesNeeded(e.target.value)} placeholder={language === 'he' ? 'כסף, זמן, כלים, אנשים...' : 'Money, time, tools, people...'} className="mt-1" rows={2} />
              </div>
              <div>
                <Label>{language === 'he' ? 'חסמים פוטנציאליים' : 'Potential Blockers'}</Label>
                <Textarea value={potentialBlockers} onChange={e => setPotentialBlockers(e.target.value)} placeholder={language === 'he' ? 'מה עלול לעצור אותך...' : 'What might stop you...'} className="mt-1" rows={2} />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Life Areas */}
        {step === 5 && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Mountain className="h-5 w-5" />
              <h3 className="font-semibold">{language === 'he' ? 'תחומי חיים מקושרים' : 'Linked Life Areas'}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {language === 'he' ? 'בחר את תחומי החיים שהפרויקט משפיע עליהם. זה יעזור לאורורה לשלב את הפרויקט במטרות ובתוכניות שלך.' : 'Select the life areas this project impacts. This helps Aurora integrate it into your goals and plans.'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {LIFE_AREAS.map(area => (
                <button
                  key={area.id}
                  onClick={() => toggleLifeArea(area.id)}
                  className={cn(
                    "px-3 py-3 rounded-xl border text-sm font-medium transition-all text-start",
                    linkedLifeAreas.includes(area.id)
                      ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300'
                      : 'border-border hover:border-amber-500/30 text-muted-foreground hover:text-foreground'
                  )}
                >
                  {language === 'he' ? area.labelHe : area.labelEn}
                  {linkedLifeAreas.includes(area.id) && <Check className="inline ms-2 h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Review */}
        {step === 6 && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Shield className="h-5 w-5" />
              <h3 className="font-semibold">{language === 'he' ? 'סיכום ואישור' : 'Review & Confirm'}</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-yellow-500/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg" style={{ backgroundColor: coverColor }} />
                  <div>
                    <p className="font-bold text-foreground">{title}</p>
                    {description && <p className="text-muted-foreground text-xs line-clamp-1">{description}</p>}
                  </div>
                </div>
                {vision && <p className="text-muted-foreground mt-2"><strong>{language === 'he' ? 'חזון: ' : 'Vision: '}</strong>{vision}</p>}
                {desiredOutcome && <p className="text-muted-foreground"><strong>{language === 'he' ? 'תוצאה: ' : 'Outcome: '}</strong>{desiredOutcome}</p>}
                {timeline && <p className="text-muted-foreground"><strong>{language === 'he' ? 'לוח זמנים: ' : 'Timeline: '}</strong>{timeline}</p>}
                {linkedLifeAreas.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-2">
                    {linkedLifeAreas.map(a => (
                      <Badge key={a} variant="outline" className="text-xs border-amber-500/30 text-amber-600 dark:text-amber-400">{a}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-2">
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="gap-1">
              <PrevIcon className="h-4 w-4" />
              {language === 'he' ? 'הקודם' : 'Back'}
            </Button>
          ) : <div />}
          {step < TOTAL_STEPS ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()} className="gap-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white">
              {language === 'he' ? 'הבא' : 'Next'}
              <NextIcon className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={createProject.isPending} className="gap-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white">
              <Check className="h-4 w-4" />
              {language === 'he' ? 'צור פרויקט' : 'Create Project'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
