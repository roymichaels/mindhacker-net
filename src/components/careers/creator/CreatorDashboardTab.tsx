import { useTranslation } from '@/hooks/useTranslation';
import { Sparkles, BookOpen, Package } from 'lucide-react';

export default function CreatorDashboardTab() {
  const { language } = useTranslation();
  const isHe = language === 'he';

  const quickActions = [
    {
      icon: BookOpen,
      label: isHe ? 'צור קורס חדש' : 'Create New Course',
      desc: isHe ? 'בנה קורס ומכור אותו ללומדים' : 'Build a course and sell it to learners',
      color: 'from-sky-500/20 to-blue-500/20 border-sky-500/30',
      iconColor: 'text-sky-400',
    },
    {
      icon: Package,
      label: isHe ? 'מוצרים דיגיטליים' : 'Digital Products',
      desc: isHe ? '0 מוצרים' : '0 products',
      color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30',
      iconColor: 'text-purple-400',
    },
    {
      icon: Sparkles,
      label: isHe ? 'צור תוכן עם AI' : 'Create Content with AI',
      desc: isHe ? 'השתמש ב-AI ליצירת תוכן מקצועי' : 'Use AI to create professional content',
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
      iconColor: 'text-amber-400',
    },
  ];

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {isHe ? 'פעולות מהירות' : 'Quick Actions'}
        </h3>
        <div className="grid gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className={`w-full text-start rounded-xl bg-gradient-to-r ${action.color} border p-4 flex items-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99]`}
            >
              <div className="w-10 h-10 rounded-lg bg-card/50 flex items-center justify-center flex-shrink-0">
                <action.icon className={`w-5 h-5 ${action.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
