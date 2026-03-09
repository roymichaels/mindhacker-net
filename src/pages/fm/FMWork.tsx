/**
 * FMWork (Career) — Professional identity hub with drill-down views.
 * Route: /fm/work
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Briefcase, Palette, Code, Sparkles, ArrowRight, Heart } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { motion } from 'framer-motion';

type CareerView = 'overview' | 'business' | 'coach' | 'therapist' | 'creator' | 'freelancer';

const RARITY_STYLES: Record<string, { border: string; bg: string; iconBg: string; glow: string; label: { en: string; he: string; color: string } }> = {
  legendary: { border: 'border-amber-500/50', bg: 'from-amber-500/12 to-orange-500/5', iconBg: 'from-amber-500 to-orange-600', glow: 'hover:shadow-amber-500/15', label: { en: 'LEGENDARY', he: 'אגדי', color: 'text-amber-400' } },
  epic: { border: 'border-purple-500/50', bg: 'from-purple-500/12 to-fuchsia-500/5', iconBg: 'from-purple-500 to-fuchsia-600', glow: 'hover:shadow-purple-500/15', label: { en: 'EPIC', he: 'אפי', color: 'text-purple-400' } },
  rare: { border: 'border-sky-500/50', bg: 'from-sky-500/12 to-blue-500/5', iconBg: 'from-sky-500 to-blue-600', glow: 'hover:shadow-sky-500/15', label: { en: 'RARE', he: 'נדיר', color: 'text-sky-400' } },
  uncommon: { border: 'border-emerald-500/50', bg: 'from-emerald-500/12 to-teal-500/5', iconBg: 'from-emerald-500 to-teal-600', glow: 'hover:shadow-emerald-500/15', label: { en: 'UNCOMMON', he: 'לא שכיח', color: 'text-emerald-400' } },
  heroic: { border: 'border-rose-500/50', bg: 'from-rose-500/12 to-pink-500/5', iconBg: 'from-rose-500 to-pink-600', glow: 'hover:shadow-rose-500/15', label: { en: 'HEROIC', he: 'הרואי', color: 'text-rose-400' } },
};

const PROFESSIONAL_PATHS = [
  {
    id: 'business' as const,
    icon: Briefcase,
    titleEn: 'Business Owner',
    titleHe: 'בעל עסק',
    descEn: 'Plan, launch and grow your business with AI-guided strategy',
    descHe: 'תכנן, השק וצמח את העסק שלך עם אסטרטגיה מונחית AI',
    path: '/business',
    rarity: 'legendary',
  },
  {
    id: 'coach' as const,
    icon: GraduationCap,
    titleEn: 'Coach',
    titleHe: 'מאמן',
    descEn: 'Build your coaching practice — clients, sessions & content',
    descHe: 'בנה את הפרקטיקה שלך — לקוחות, פגישות ותוכן',
    path: '/coaches',
    rarity: 'epic',
  },
  {
    id: 'therapist' as const,
    icon: Heart,
    titleEn: 'Therapist',
    titleHe: 'מטפל',
    descEn: 'Manage your therapy practice — clients, scheduling & growth',
    descHe: 'נהל את הפרקטיקה הטיפולית שלך — לקוחות, תורים וצמיחה',
    path: '/coaches',
    rarity: 'heroic',
  },
  {
    id: 'creator' as const,
    icon: Palette,
    titleEn: 'Content Creator',
    titleHe: 'יוצר תוכן',
    descEn: 'Create courses, content & digital products to monetize your expertise',
    descHe: 'צור קורסים, תוכן ומוצרים דיגיטליים כדי למנף את המומחיות שלך',
    path: '/creator',
    rarity: 'rare',
  },
  {
    id: 'freelancer' as const,
    icon: Code,
    titleEn: 'Freelancer',
    titleHe: 'פרילנסר',
    descEn: 'Find gigs, manage projects & earn MOS tokens for your skills',
    descHe: 'מצא עבודות, נהל פרויקטים והרוויח טוקנים עבור הכישורים שלך',
    path: '/freelancer',
    rarity: 'uncommon',
  },
] as const;

export default function FMWork() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();
  const [view, setView] = useState<CareerView>('overview');

  const selectedPath = PROFESSIONAL_PATHS.find(p => p.id === view);

  return (
    <div className="space-y-4 max-w-2xl mx-auto w-full py-4">

      {/* ═══ OVERVIEW ═══ */}
      {view === 'overview' && (
        <div className="space-y-5">
          <div className="text-center">
            <h1 className="text-xl font-black text-foreground flex items-center justify-center gap-2 tracking-tight">
              <Sparkles className="w-5 h-5 text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
              {isHe ? 'קריירה' : 'Career'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isHe ? 'בחר את המסלול שלך ובנה את הקריירה הדיגיטלית שלך' : 'Choose your path and build your digital career'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {PROFESSIONAL_PATHS.map((path, i) => {
              const Icon = path.icon;
              const style = RARITY_STYLES[path.rarity];
              return (
                <motion.button
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
                  onClick={() => navigate(path.path)}
                  className={`relative flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 bg-gradient-to-br transition-all hover:scale-[1.03] active:scale-[0.97] hover:shadow-xl ${style.border} ${style.bg} ${style.glow}`}
                >
                  <span className={`absolute top-1.5 end-2 text-[7px] font-black uppercase tracking-[0.15em] ${style.label.color}`}>
                    {isHe ? style.label.he : style.label.en}
                  </span>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${style.iconBg} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white/90" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">{isHe ? path.titleHe : path.titleEn}</h3>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed text-center">
                    {isHe ? path.descHe : path.descEn}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
