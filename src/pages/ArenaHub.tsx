/**
 * ArenaHub — Body content for the Arena/זירה tab.
 * Displays the user's personalized execution grid for Arena domains.
 */
import { useState, useEffect } from 'react';
import { AnalysisProgressBar } from '@/components/hubs/AnalysisProgressBar';
import { TodayExecutionSection } from '@/components/execution/TodayExecutionSection';
import { UserPlateGrid } from '@/components/plate/UserPlateGrid';
import { AddProjectWizard } from '@/components/projects/AddProjectWizard';

interface ArenaHubProps {
  openWizardTrigger?: number;
}

export default function ArenaHub({ openWizardTrigger = 0 }: ArenaHubProps) {
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    if (openWizardTrigger > 0) setWizardOpen(true);
  }, [openWizardTrigger]);

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-4 flex-1 px-1">
        <div className="pt-1" />
        <AnalysisProgressBar />
        <TodayExecutionSection hub="arena" />
        <UserPlateGrid hub="arena" />
      </div>
      <AddProjectWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  );
}
