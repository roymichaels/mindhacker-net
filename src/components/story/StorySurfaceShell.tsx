import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Brain, ClipboardList, ScrollText } from 'lucide-react';
import { AIONDialogShell } from '@/components/orb/AIONSignature';

interface StorySurfaceShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  subtitle?: ReactNode;
  description?: string;
  icon?: ReactNode;
  className?: string;
  contentClassName?: string;
  preventClose?: boolean;
  children: ReactNode;
}

interface StoryTypedSurfaceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  subtitle?: ReactNode;
  description?: string;
  className?: string;
  contentClassName?: string;
  preventClose?: boolean;
  children: ReactNode;
}

function buildIcon(Icon: LucideIcon) {
  return <Icon className="w-4 h-4" />;
}

export function StorySurfaceShell(props: StorySurfaceShellProps) {
  return <AIONDialogShell {...props} />;
}

export function StoryConversationSurface(props: StoryTypedSurfaceProps) {
  return <StorySurfaceShell {...props} icon={buildIcon(Brain)} />;
}

export function StoryAssessmentSurface(props: StoryTypedSurfaceProps) {
  return <StorySurfaceShell {...props} icon={buildIcon(ClipboardList)} />;
}

export function StoryPlanSurface(props: StoryTypedSurfaceProps) {
  return <StorySurfaceShell {...props} icon={buildIcon(ScrollText)} />;
}
