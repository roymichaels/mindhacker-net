import { useNavigate } from 'react-router-dom';
import { GraduationCap, Briefcase, Palette, Code, ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { motion } from 'framer-motion';
import { FMAuroraCard } from '@/components/fm/FMAuroraCard';
import { useAuroraOpportunities } from '@/hooks/fm/useAuroraOpportunities';

const PROFESSIONAL_PATHS = [
  {
    id: 'coach',
    icon: GraduationCap,
    titleEn: 'Coach / Practitioner',
    titleHe: 'מאמן / מטפל',
    descEn: 'Build your coaching practice — clients, sessions, landing pages & content',
    descHe: 'בנה את הפרקטיקה שלך — לקוחות, פגישות, דפי נחיתה ותוכן',
    path: '/coaches',
    journeyPath: '/coaching/journey',
    color: 'from-amber-500/20 to-orange-500/10',
    iconColor: 'text-amber-500',
    borderColor: 'border-amber-500/20',
  },
  {
    id: 'business',
    icon: Briefcase,
    titleEn: 'Business Owner',
    titleHe: 'בעל עסק',
    descEn: 'Plan, launch and grow your business with AI-guided strategy',
    descHe: 'תכנן, השק וצמח את העסק שלך עם אסטרטגיה מונחית AI',
    path: '/business',
    journeyPath: '/business/journey',
    color: 'from-blue-500/20 to-indigo-500/10',
    iconColor: 'text-blue-500',
    borderColor: 'border-blue-500/20',
  },
  {
    id: 'freelancer',
    icon: Code,
    titleEn: 'Freelancer',
    titleHe: 'פרילנסר',
    descEn: 'Find gigs, manage projects & earn MOS tokens for your skills',
    descHe: 'מצא עבודות, נהל פרויקטים והרוויח טוקנים עבור הכישורים שלך',
    path: '/projects',
    journeyPath: '/projects/journey',
    color: 'from-emerald-500/20 to-teal-500/10',
    iconColor: 'text-emerald-500',
    borderColor: 'border-emerald-500/20',
  },
  {
    id: 'creator',
    icon: Palette,
    titleEn: 'Creator',
    titleHe: 'יוצר תוכן',
    descEn: 'Create courses, content & digital products to monetize your expertise',
    descHe: 'צור קורסים, תוכן ומוצרים דיגיטליים כדי למנף את המומחיות שלך',
    path: '/coaches',
    journeyPath: '/coaching/journey',
    color: 'from-purple-500/20 to-pink-500/10',
    iconColor: 'text-purple-500',
    borderColor: 'border-purple-500/20',
  },
] as const;

export default function FMWork() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full py-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          {isHe ? 'הזהות המקצועית שלך' : 'Your Professional Identity'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isHe
            ? 'בחר את המסלול שלך ובנה את הקריירה הדיגיטלית שלך'
            : 'Choose your path and build your digital career'}
        </p>
      </div>

      {/* Professional Path Cards */}
      <div className="grid gap-3">
        {PROFESSIONAL_PATHS.map((path, i) => {
          const Icon = path.icon;
          return (
            <motion.button
              key={path.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => navigate(path.path)}
              className={`w-full text-left bg-gradient-to-r ${path.color} border ${path.borderColor} rounded-xl p-4 flex items-center gap-4 hover:scale-[1.01] active:scale-[0.99] transition-transform`}
            >
              <div className={`w-12 h-12 rounded-xl bg-background/80 flex items-center justify-center shrink-0`}>
                <Icon className={`w-6 h-6 ${path.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-foreground">
                  {isHe ? path.titleHe : path.titleEn}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {isHe ? path.descHe : path.descEn}
                </p>
              </div>
              <ArrowRight className={`w-4 h-4 text-muted-foreground shrink-0 ${isHe ? 'rotate-180' : ''}`} />
            </motion.button>
          );
        })}
      </div>

    </div>
  );
}
