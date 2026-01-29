import { Compass, Heart, Target, Zap, Activity, Calendar, Star, Eye, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifeModel, useDashboard, useOnboardingProgress } from '@/hooks/aurora';
import { cn } from '@/lib/utils';

const AuroraDashboardView = () => {
  const { t } = useTranslation();
  const { lifeDirection, activeFocusPlan, dailyMinimums, energyPatterns, behavioralPatterns } = useLifeModel();
  const { values, principles, selfConcepts, visionStatements, fiveYearVision, tenYearVision, activeCommitments } = useDashboard();
  const { progressPercentage, hasDirection, hasIdentity, hasEnergy } = useOnboardingProgress();

  const isEmpty = !hasDirection && !hasIdentity && !hasEnergy;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{t('aurora.dashboard.emptyTitle')}</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            {t('aurora.dashboard.emptySubtitle')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('aurora.dashboard.progress')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={progressPercentage} className="flex-1" />
            <span className="text-sm font-medium">{progressPercentage}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Life Direction */}
      {lifeDirection && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Compass className="h-5 w-5 text-primary" />
              {t('aurora.dashboard.lifeDirection')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{lifeDirection.content}</p>
            {lifeDirection.clarity_score > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{t('aurora.dashboard.clarity')}</span>
                <Progress value={lifeDirection.clarity_score} className="w-24 h-1.5" />
                <span className="text-xs">{lifeDirection.clarity_score}%</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Current Focus */}
      {activeFocusPlan && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-amber-500" />
              {t('aurora.dashboard.currentFocus')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{activeFocusPlan.title}</p>
            {activeFocusPlan.description && (
              <p className="text-sm text-muted-foreground mt-1">{activeFocusPlan.description}</p>
            )}
            <Badge variant="outline" className="mt-2">
              {activeFocusPlan.duration_days} {t('aurora.dashboard.days')}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Daily Anchors */}
      {dailyMinimums.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5 text-green-500" />
              {t('aurora.dashboard.dailyAnchors')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {dailyMinimums.map((min) => (
                <Badge key={min.id} variant="secondary">
                  {min.title}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Identity Profile */}
      {(values.length > 0 || principles.length > 0 || selfConcepts.length > 0) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-5 w-5 text-rose-500" />
              {t('aurora.dashboard.identity')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {values.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  {t('aurora.dashboard.values')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {values.map((v) => (
                    <Badge key={v.id} className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                      {v.content}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {principles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  {t('aurora.dashboard.principles')}
                </h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {principles.map((p) => (
                    <li key={p.id}>{p.content}</li>
                  ))}
                </ul>
              </div>
            )}
            {selfConcepts.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  {t('aurora.dashboard.selfConcepts')}
                </h4>
                <ul className="text-sm space-y-1">
                  {selfConcepts.map((s) => (
                    <li key={s.id} className="italic">"{s.content}"</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Vision Statements */}
      {visionStatements.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="h-5 w-5 text-yellow-500" />
              {t('aurora.dashboard.visionStatement')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {visionStatements.map((v) => (
              <p key={v.id} className="text-sm">{v.content}</p>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Life Visions (5/10 year) */}
      {(fiveYearVision || tenYearVision) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fiveYearVision && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Eye className="h-5 w-5 text-blue-500" />
                  {t('aurora.dashboard.fiveYear')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{fiveYearVision.title}</p>
                {fiveYearVision.description && (
                  <p className="text-sm text-muted-foreground mt-1">{fiveYearVision.description}</p>
                )}
              </CardContent>
            </Card>
          )}
          {tenYearVision && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Eye className="h-5 w-5 text-purple-500" />
                  {t('aurora.dashboard.tenYear')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{tenYearVision.title}</p>
                {tenYearVision.description && (
                  <p className="text-sm text-muted-foreground mt-1">{tenYearVision.description}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Active Commitments */}
      {activeCommitments.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-indigo-500" />
              {t('aurora.dashboard.activeCommitments')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {activeCommitments.map((c) => (
                <li key={c.id} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{c.title}</p>
                    {c.description && (
                      <p className="text-xs text-muted-foreground">{c.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Energy Patterns */}
      {energyPatterns.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-5 w-5 text-orange-500" />
              {t('aurora.dashboard.energyPatterns')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {energyPatterns.map((e) => (
                <li key={e.id}>
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    {t(`aurora.dashboard.energy.${e.pattern_type}`)}
                  </span>
                  <p className="text-sm">{e.description}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Behavioral Patterns */}
      {behavioralPatterns.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-teal-500" />
              {t('aurora.dashboard.behavioralPatterns')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {behavioralPatterns.map((b) => (
                <li key={b.id}>
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    {t(`aurora.dashboard.behavior.${b.pattern_type}`)}
                  </span>
                  <p className="text-sm">{b.description}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuroraDashboardView;
