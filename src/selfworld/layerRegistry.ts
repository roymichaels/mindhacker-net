/**
 * SelfWorld layer registry — declarative list of inner-system layers that
 * appear in the InnerSystemsBand. Most are placeholders for now; future
 * phases just flip `status: 'live'` and point `route`/`open` to the real
 * surface. Owner indicates which identity entity this layer belongs to:
 *   - 'dna'       → Consciousness layer (the user's evolving inner self)
 *   - 'aion'      → Intelligence layer (the persistent guide)
 *   - 'character' → Embodiment layer (avatar, access, world)
 */
import {
  Brain,
  Heart,
  Sparkles,
  Zap,
  Compass,
  Flame,
  Users,
  Crown,
  Eye,
  Layers,
  Palette,
  Anchor,
  Footprints,
  type LucideIcon,
} from 'lucide-react';

export type LayerOwner = 'dna' | 'aion' | 'character';
export type LayerStatus = 'live' | 'coming';

export interface SelfWorldLayer {
  id: string;
  labelHe: string;
  labelEn: string;
  hintHe: string;
  hintEn: string;
  icon: LucideIcon;
  owner: LayerOwner;
  status: LayerStatus;
}

export const SELFWORLD_LAYERS: SelfWorldLayer[] = [
  {
    id: 'memories',
    labelHe: 'זיכרונות',
    labelEn: 'Memories',
    hintHe: 'שכבת הזיכרון של התודעה שלך',
    hintEn: 'The memory layer of your consciousness',
    icon: Layers,
    owner: 'dna',
    status: 'coming',
  },
  {
    id: 'beliefs',
    labelHe: 'אמונות',
    labelEn: 'Beliefs',
    hintHe: 'מבנים שמעצבים איך אתה רואה את העולם',
    hintEn: 'Structures that shape how you see reality',
    icon: Anchor,
    owner: 'dna',
    status: 'coming',
  },
  {
    id: 'emotional-patterns',
    labelHe: 'דפוסים רגשיים',
    labelEn: 'Emotional Patterns',
    hintHe: 'התנועות הרגשיות החוזרות שלך',
    hintEn: 'Your recurring emotional currents',
    icon: Heart,
    owner: 'dna',
    status: 'coming',
  },
  {
    id: 'habits',
    labelHe: 'הרגלים',
    labelEn: 'Habits',
    hintHe: 'התנהגויות שהפכו לאוטומטיות',
    hintEn: 'Behaviors that became automatic',
    icon: Footprints,
    owner: 'dna',
    status: 'coming',
  },
  {
    id: 'archetypes',
    labelHe: 'ארכיטיפים',
    labelEn: 'Archetypes',
    hintHe: 'הצורות הסמליות שמופיעות דרכך',
    hintEn: 'The symbolic forms moving through you',
    icon: Crown,
    owner: 'dna',
    status: 'coming',
  },
  {
    id: 'roles',
    labelHe: 'תפקידים',
    labelEn: 'Roles',
    hintHe: 'מי אתה במצבים שונים בחיים',
    hintEn: 'Who you become in different life contexts',
    icon: Users,
    owner: 'character',
    status: 'coming',
  },
  {
    id: 'values',
    labelHe: 'ערכים',
    labelEn: 'Values',
    hintHe: 'מה שחשוב לך באמת',
    hintEn: 'What actually matters to you',
    icon: Sparkles,
    owner: 'dna',
    status: 'coming',
  },
  {
    id: 'relationships',
    labelHe: 'מערכות יחסים',
    labelEn: 'Relationships',
    hintHe: 'הדפוסים בקשרים שלך',
    hintEn: 'The patterns inside your connections',
    icon: Users,
    owner: 'dna',
    status: 'coming',
  },
  {
    id: 'trajectory',
    labelHe: 'מסלול חיים',
    labelEn: 'Trajectory',
    hintHe: 'לאן החיים שלך נעים',
    hintEn: 'Where your life is moving',
    icon: Compass,
    owner: 'dna',
    status: 'coming',
  },
  {
    id: 'shadow',
    labelHe: 'צל',
    labelEn: 'Shadow',
    hintHe: 'מה שאתה לא רואה בעצמך עדיין',
    hintEn: 'What you do not yet see in yourself',
    icon: Eye,
    owner: 'dna',
    status: 'coming',
  },
  {
    id: 'creative',
    labelHe: 'עולם יצירתי',
    labelEn: 'Creative World',
    hintHe: 'מרחב היצירה הפנימי שלך',
    hintEn: 'Your inner creative field',
    icon: Palette,
    owner: 'dna',
    status: 'coming',
  },
  {
    id: 'higher-self',
    labelHe: 'אני עליון',
    labelEn: 'Higher Self',
    hintHe: 'השכבה הסמלית מעבר לאישיות',
    hintEn: 'The symbolic layer beyond personality',
    icon: Flame,
    owner: 'dna',
    status: 'coming',
  },
  {
    id: 'energy',
    labelHe: 'דפוסי אנרגיה',
    labelEn: 'Energy Patterns',
    hintHe: 'איך האנרגיה שלך נעה ביום',
    hintEn: 'How your energy moves through the day',
    icon: Zap,
    owner: 'dna',
    status: 'coming',
  },
  {
    id: 'cognition',
    labelHe: 'מבנים קוגניטיביים',
    labelEn: 'Cognitive Structures',
    hintHe: 'איך אתה חושב ומקבל החלטות',
    hintEn: 'How you think and decide',
    icon: Brain,
    owner: 'aion',
    status: 'coming',
  },
];
