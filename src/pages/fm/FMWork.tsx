import { useNavigate } from 'react-router-dom';
import { GraduationCap, Briefcase, Palette, Code, Sparkles, Crown, Shield, Scroll } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { motion } from 'framer-motion';

const RARITY_BORDER: Record<string, string> = {
  legendary: 'border-amber-500/50 shadow-amber-500/10',
  epic: 'border-purple-500/50 shadow-purple-500/10',
  rare: 'border-sky-500/50 shadow-sky-500/10',
  uncommon: 'border-emerald-500/50 shadow-emerald-500/10',
};

const RARITY_GLOW: Record<string, string> = {
  legendary: 'from-amber-500/15 to-orange-500/5',
  epic: 'from-purple-500/15 to-fuchsia-500/5',
  rare: 'from-sky-500/15 to-blue-500/5',
  uncommon: 'from-emerald-500/15 to-teal-500/5',
};

const RARITY_ICON_BG: Record<string, string> = {
  legendary: 'from-amber-500 to-orange-600',
  epic: 'from-purple-500 to-fuchsia-600',
  rare: 'from-sky-500 to-blue-600',
  uncommon: 'from-emerald-500 to-teal-600',
};

const RARITY_LABEL: Record<string, { en: string; he: string; color: string }> = {
  legendary: { en: 'LEGENDARY', he: 'אגדי', color: 'text-amber-400' },
  epic: { en: 'EPIC', he: 'אפי', color: 'text-purple-400' },
  rare: { en: 'RARE', he: 'נדיר', color: 'text-sky-400' },
  uncommon: { en: 'UNCOMMON', he: 'לא שכיח', color: 'text-emerald-400' },
};

const PROFESSIONAL_PATHS = [
  {
    id: 'business',
    icon: Briefcase,
    titleEn: 'Business Owner',
    titleHe: 'בעל עסק',
    descEn: 'Plan, launch and grow your business with AI-guided strategy',
    descHe: 'תכנן, השק וצמח את העסק שלך עם אסטרטגיה מונחית AI',
    path: '/business',
    rarity: 'legendary',
  },
  {
    id: 'coach',
    icon: GraduationCap,
    titleEn: 'Coach / Practitioner',
    titleHe: 'מאמן / מטפל',
    descEn: 'Build your coaching practice — clients, sessions, landing pages & content',
    descHe: 'בנה את הפרקטיקה שלך — לקוחות, פגישות, דפי נחיתה ותוכן',
    path: '/coaches',
    rarity: 'epic',
  },
  {
    id: 'creator',
    icon: Palette,
    titleEn: 'Content Creator',
    titleHe: 'יוצר תוכן',
    descEn: 'Create courses, content & digital products to monetize your expertise',
    descHe: 'צור קורסים, תוכן ומוצרים דיגיטליים כדי למנף את המומחיות שלך',
    path: '/coaches',
    rarity: 'rare',
  },
  {
    id: 'freelancer',
    icon: Code,
    titleEn: 'Freelancer',
    titleHe: 'פרילנסר',
    descEn: 'Find gigs, manage projects & earn MOS tokens for your skills',
    descHe: 'מצא עבודות, נהל פרויקטים והרוויח טוקנים עבור הכישורים שלך',
    path: '/projects',
    rarity: 'uncommon',
  },
] as const;

export default function FMWork() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full py-4">

      {/* Header — Guild Hall vibe */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h1 className="text-xl font-black text-foreground tracking-tight">
            {isHe ? 'הזהות המקצועית שלך' : 'Your Professional Identity'}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {isHe
            ? 'בחר את המסלול שלך ובנה את הקריירה הדיגיטלית שלך'
            : 'Choose your path and build your digital career'}
        </p>
      </div>

      {/* Professional Path Cards — Item rarity style */}
      <div className="grid grid-cols-2 gap-3">
        {PROFESSIONAL_PATHS.map((path, i) => {
          const Icon = path.icon;
          const rarity = RARITY_LABEL[path.rarity];
          return (
            <motion.button
              key={path.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
              onClick={() => navigate(path.path)}
              className={`relative w-full text-start rounded-xl p-4 flex flex-col items-center gap-3 border-2 bg-gradient-to-br transition-all hover:scale-[1.03] active:scale-[0.97] hover:shadow-xl ${RARITY_BORDER[path.rarity]} ${RARITY_GLOW[path.rarity]}`}
            >
              {/* Rarity tag */}
              <span className={`absolute top-2 end-2 text-[8px] font-black uppercase tracking-[0.15em] ${rarity.color}`}>
                {isHe ? rarity.he : rarity.en}
              </span>

              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${RARITY_ICON_BG[path.rarity]} flex items-center justify-center shadow-lg`}>
                <Icon className="w-6 h-6 text-white/90" />
              </div>
              <div className="text-center min-w-0">
                <h3 className="font-bold text-sm text-foreground">
                  {isHe ? path.titleHe : path.titleEn}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {isHe ? path.descHe : path.descEn}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
