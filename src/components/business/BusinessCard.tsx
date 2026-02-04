import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/hooks/useTranslation';
import { Briefcase, Trash2, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { BusinessJourneySummary } from '@/hooks/useBusinessJourneys';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface BusinessCardProps {
  journey: BusinessJourneySummary;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function BusinessCard({ journey, onDelete, isDeleting }: BusinessCardProps) {
  const { language, isRTL } = useTranslation();
  const navigate = useNavigate();
  
  const totalSteps = 10;
  const progress = Math.round((journey.current_step - 1) / totalSteps * 100);
  
  const getStatusText = () => {
    if (journey.journey_complete) {
      return language === 'he' ? 'הושלם' : 'Completed';
    }
    return language === 'he' 
      ? `שלב ${journey.current_step} מתוך ${totalSteps}` 
      : `Step ${journey.current_step} of ${totalSteps}`;
  };

  const getBusinessName = () => {
    if (journey.business_name) return journey.business_name;
    return language === 'he' ? 'עסק בהקמה' : 'New Business';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className="backdrop-blur-xl bg-background/60 border-border/50 transition-all hover:shadow-md hover:border-amber-500/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`p-2 rounded-lg ${journey.journey_complete ? 'bg-green-500/20' : 'bg-gradient-to-r from-amber-500/20 to-yellow-400/20'}`}>
              {journey.journey_complete ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Briefcase className="h-5 w-5 text-amber-600" />
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{getBusinessName()}</h3>
              
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatDate(journey.updated_at)}</span>
              </div>
              
              {/* Progress */}
              {!journey.journey_complete && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{getStatusText()}</span>
                    <span className="font-medium text-amber-600">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>
              )}
              
              {journey.journey_complete && (
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
                    <CheckCircle className="h-3 w-3" />
                    {getStatusText()}
                  </span>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
                onClick={() => navigate(`/business/journey/${journey.id}`)}
              >
                {journey.journey_complete 
                  ? (language === 'he' ? 'צפה' : 'View')
                  : (language === 'he' ? 'המשך' : 'Continue')
                }
                <ArrowRight className="h-4 w-4 ms-1" />
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {language === 'he' ? 'מחק עסק?' : 'Delete business?'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {language === 'he' 
                        ? 'פעולה זו תמחק את כל המידע על העסק הזה לצמיתות. לא ניתן לבטל פעולה זו.'
                        : 'This will permanently delete all information about this business. This action cannot be undone.'
                      }
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className={isRTL ? 'flex-row-reverse' : ''}>
                    <AlertDialogCancel>
                      {language === 'he' ? 'ביטול' : 'Cancel'}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(journey.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isDeleting}
                    >
                      {isDeleting 
                        ? (language === 'he' ? 'מוחק...' : 'Deleting...')
                        : (language === 'he' ? 'מחק' : 'Delete')
                      }
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
