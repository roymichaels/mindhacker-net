import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { PenSquare, Calendar, Users, BookOpen } from 'lucide-react';

interface QuickActionsProps {
  onNewPost?: () => void;
}

const QuickActions = ({ onNewPost }: QuickActionsProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const actions = [
    { 
      icon: PenSquare, 
      label: t('community.newPost'), 
      onClick: onNewPost,
      primary: true 
    },
    { 
      icon: Calendar, 
      label: t('community.events'), 
      onClick: () => navigate('/community/events') 
    },
    { 
      icon: Users, 
      label: t('community.members'), 
      onClick: () => navigate('/community/members') 
    },
    { 
      icon: BookOpen, 
      label: t('common.courses'), 
      onClick: () => navigate('/courses') 
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {actions.map((action, idx) => (
        <Button
          key={idx}
          variant={action.primary ? "default" : "outline"}
          size="sm"
          onClick={action.onClick}
          className="gap-2"
        >
          <action.icon className="h-4 w-4" />
          {action.label}
        </Button>
      ))}
    </div>
  );
};

export default QuickActions;
