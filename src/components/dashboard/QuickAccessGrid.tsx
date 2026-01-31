import { 
  Sparkles, 
  Calendar, 
  ListTodo, 
  Brain, 
  Activity, 
  UserCircle, 
  Heart, 
  Target, 
  Anchor,
  FileDown,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useProfilePDF } from '@/hooks/useProfilePDF';
import { ProfilePDFRenderer } from '@/components/pdf/ProfilePDFRenderer';

interface QuickAccessItem {
  id: string;
  icon: React.ElementType;
  label: string;
  labelHe: string;
  gradient: string;
  onClick: () => void;
  isLoading?: boolean;
}

interface QuickAccessGridProps {
  language: string;
  onOpenAI: () => void;
  onOpenPlan: () => void;
  onOpenTasks: () => void;
  onOpenConsciousness: () => void;
  onOpenBehavioral: () => void;
  onOpenIdentity: () => void;
  onOpenTraits: () => void;
  onOpenCommitments: () => void;
  onOpenAnchors: () => void;
  onOpenFocus: () => void;
  hasFocusPlan: boolean;
}

export function QuickAccessGrid({
  language,
  onOpenAI,
  onOpenPlan,
  onOpenTasks,
  onOpenConsciousness,
  onOpenBehavioral,
  onOpenIdentity,
  onOpenTraits,
  onOpenCommitments,
  onOpenAnchors,
  onOpenFocus,
  hasFocusPlan,
}: QuickAccessGridProps) {
  const { downloadPDF, generating, containerRef, pdfData, showRenderer } = useProfilePDF();

  const items: QuickAccessItem[] = [
    {
      id: 'ai',
      icon: Sparkles,
      label: 'AI Analysis',
      labelHe: 'ניתוח AI',
      gradient: 'from-purple-500/20 to-pink-500/20',
      onClick: onOpenAI,
    },
    {
      id: 'plan',
      icon: Calendar,
      label: '90-Day Plan',
      labelHe: 'תוכנית 90 יום',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      onClick: onOpenPlan,
    },
    {
      id: 'tasks',
      icon: ListTodo,
      label: 'My Tasks',
      labelHe: 'המשימות שלי',
      gradient: 'from-green-500/20 to-emerald-500/20',
      onClick: onOpenTasks,
    },
    {
      id: 'consciousness',
      icon: Brain,
      label: 'Consciousness',
      labelHe: 'מפת תודעה',
      gradient: 'from-indigo-500/20 to-violet-500/20',
      onClick: onOpenConsciousness,
    },
    {
      id: 'behavioral',
      icon: Activity,
      label: 'Insights',
      labelHe: 'תובנות',
      gradient: 'from-orange-500/20 to-amber-500/20',
      onClick: onOpenBehavioral,
    },
    {
      id: 'identity',
      icon: UserCircle,
      label: 'Identity',
      labelHe: 'זהות',
      gradient: 'from-rose-500/20 to-red-500/20',
      onClick: onOpenIdentity,
    },
    {
      id: 'traits',
      icon: Heart,
      label: 'Traits',
      labelHe: 'תכונות',
      gradient: 'from-pink-500/20 to-fuchsia-500/20',
      onClick: onOpenTraits,
    },
    {
      id: 'commitments',
      icon: Target,
      label: 'Commitments',
      labelHe: 'התחייבויות',
      gradient: 'from-teal-500/20 to-cyan-500/20',
      onClick: onOpenCommitments,
    },
    {
      id: 'anchors',
      icon: Anchor,
      label: 'Anchors',
      labelHe: 'עוגנים',
      gradient: 'from-sky-500/20 to-blue-500/20',
      onClick: onOpenAnchors,
    },
    {
      id: 'pdf',
      icon: generating ? Loader2 : FileDown,
      label: 'Download PDF',
      labelHe: 'הורד PDF',
      gradient: 'from-indigo-500/20 to-blue-500/20',
      onClick: downloadPDF,
      isLoading: generating,
    },
  ];

  // Add focus if exists
  if (hasFocusPlan) {
    items.push({
      id: 'focus',
      icon: Target,
      label: 'Focus',
      labelHe: 'פוקוס',
      gradient: 'from-yellow-500/20 to-orange-500/20',
      onClick: onOpenFocus,
    });
  }

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {items.map((item) => (
          <Card
            key={item.id}
            onClick={item.isLoading ? undefined : item.onClick}
            className={cn(
              "p-4 cursor-pointer transition-all duration-200",
              "hover:scale-105 hover:shadow-lg active:scale-95",
              "flex flex-col items-center justify-center gap-2 text-center",
              `bg-gradient-to-br ${item.gradient}`,
              item.isLoading && "opacity-70 cursor-wait"
            )}
          >
            <item.icon className={cn("h-6 w-6 text-primary", item.isLoading && "animate-spin")} />
            <span className="text-xs font-medium">
              {language === 'he' ? item.labelHe : item.label}
            </span>
          </Card>
        ))}
      </div>
      
      {/* Hidden PDF Renderer */}
      {showRenderer && pdfData && (
        <ProfilePDFRenderer ref={containerRef} data={pdfData} />
      )}
    </>
  );
}
