/**
 * JobPanel — Displays the user's current job assignment.
 * SSOT: Reads from user_jobs via useUserJob hook.
 */
import { useState } from 'react';
import { useUserJob, type Job } from '@/hooks/useUserJob';
import { useTranslation } from '@/hooks/useTranslation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronRight, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface JobPanelProps {
  compact?: boolean;
}

export function JobPanel({ compact = false }: JobPanelProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { currentJob, allJobs, isLoading, assignJob, jobName, jobNameHe, jobIcon, jobDescription, jobDescriptionHe } = useUserJob();
  const [showChangeModal, setShowChangeModal] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!currentJob) return null;

  const displayName = isHe ? (jobNameHe || jobName) : jobName;
  const displayDesc = isHe ? (jobDescriptionHe || jobDescription) : jobDescription;
  const assignedLabel = isHe
    ? currentJob.assigned_by === 'ai' ? 'הוקצה ע"י AI' : currentJob.assigned_by === 'coach' ? 'המלצת מאמן' : 'בחירה אישית'
    : currentJob.assigned_by === 'ai' ? 'AI assigned' : currentJob.assigned_by === 'coach' ? 'Coach recommended' : 'Self-selected';

  return (
    <>
      <button
        onClick={() => setShowChangeModal(true)}
        className={cn(
          "w-full rounded-2xl bg-card border border-border overflow-hidden text-start transition-colors hover:border-primary/30",
          compact && "rounded-xl"
        )}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="text-2xl">{jobIcon}</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{assignedLabel}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </div>
        {!compact && displayDesc && (
          <div className="px-4 pb-3">
            <p className="text-xs text-muted-foreground line-clamp-2">{displayDesc}</p>
          </div>
        )}
      </button>

      <ChangeJobModal
        open={showChangeModal}
        onOpenChange={setShowChangeModal}
        allJobs={allJobs}
        currentJobId={currentJob.job_id}
        isHe={isHe}
        onSelect={async (job: Job) => {
          try {
            await assignJob.mutateAsync({ jobName: job.name, assignedBy: 'user' });
            toast.success(isHe ? 'התפקיד עודכן!' : 'Job updated!');
            setShowChangeModal(false);
          } catch {
            toast.error(isHe ? 'שגיאה בעדכון' : 'Error updating job');
          }
        }}
        isSubmitting={assignJob.isPending}
      />
    </>
  );
}

function ChangeJobModal({ open, onOpenChange, allJobs, currentJobId, isHe, onSelect, isSubmitting }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  allJobs: Job[];
  currentJobId: string;
  isHe: boolean;
  onSelect: (job: Job) => void;
  isSubmitting: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isHe ? 'בחר תפקיד' : 'Choose Your Job'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 mt-2">
          <AnimatePresence>
            {allJobs.map((job) => (
              <motion.button
                key={job.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onClick={() => onSelect(job)}
                disabled={isSubmitting}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all text-start w-full",
                  job.id === currentJobId
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                )}
              >
                <span className="text-2xl">{job.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{isHe ? (job.name_he || job.name) : job.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {isHe ? (job.description_he || job.description) : job.description}
                  </p>
                </div>
                {job.id === currentJobId && <Check className="w-4 h-4 text-primary shrink-0" />}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default JobPanel;
