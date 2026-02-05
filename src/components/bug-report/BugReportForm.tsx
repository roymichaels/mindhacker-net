import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useTranslation } from '@/hooks/useTranslation';
import { CategorySelect } from './CategorySelect';
import { PrioritySelect } from './PrioritySelect';
import { ScreenshotCapture } from './ScreenshotCapture';
import { cn } from '@/lib/utils';
import { useBugReport, BugReportData } from '@/hooks/useBugReport';
import { Loader2, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

const bugReportSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  category: z.enum(['ui', 'performance', 'feature', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  contactEmail: z.string().email().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof bugReportSchema>;

interface BugReportFormProps {
  onSuccess: () => void;
  contextInfo: { pagePath: string; deviceInfo: string };
}

export const BugReportForm = ({ onSuccess, contextInfo }: BugReportFormProps) => {
  const { t, isRTL } = useTranslation();
  const { 
    submitReport, 
    isSubmitting, 
    captureScreenshot, 
    clearScreenshot, 
    screenshotPreview 
  } = useBugReport();

  const form = useForm<FormValues>({
    resolver: zodResolver(bugReportSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'other',
      priority: 'medium',
      contactEmail: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    const data: BugReportData = {
      title: values.title,
      description: values.description,
      category: values.category,
      priority: values.priority,
      contactEmail: values.contactEmail || undefined,
    };
    
    const success = await submitReport(data);
    
    if (success) {
      // Celebrate!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#d946ef', '#06b6d4'],
      });
      onSuccess();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Context Info */}
        <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/30 border border-border/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-medium">{t('bugReport.pageInfo')}:</span>
            <span className="truncate">{contextInfo.pagePath}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{t('bugReport.deviceInfo')}:</span>
            <span>{contextInfo.deviceInfo}</span>
          </div>
        </div>

        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <CategorySelect value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Priority */}
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PrioritySelect value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('bugReport.titleLabel')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('bugReport.titlePlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('bugReport.descriptionLabel')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('bugReport.descriptionPlaceholder')}
                  className="min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Screenshot */}
        <ScreenshotCapture
          onCapture={captureScreenshot}
          onClear={clearScreenshot}
          previewUrl={screenshotPreview}
        />

        {/* Email (optional) */}
        <FormField
          control={form.control}
          name="contactEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('bugReport.emailLabel')}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t('bugReport.emailPlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('bugReport.submitting')}
            </>
          ) : (
            <>
              <Send className={cn("h-4 w-4", isRTL && 'rotate-180')} />
              {t('bugReport.submit')}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};
