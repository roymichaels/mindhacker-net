/**
 * Ego States Theme System
 * Defines colors and visual properties for each archetype
 */

export interface EgoStateColors {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  highlight: string;
  shadow: string;
  gradient: string;
}

export interface EgoState {
  id: string;
  name: string;
  nameHe: string;
  description: string;
  descriptionHe: string;
  icon: string;
  colors: EgoStateColors;
}

// Color definitions using HSL for consistency with design system
export const EGO_STATES: Record<string, EgoState> = {
  guardian: {
    id: 'guardian',
    name: 'Guardian',
    nameHe: 'שומר',
    description: 'Protection and safety',
    descriptionHe: 'הגנה וביטחון',
    icon: '🛡️',
    colors: {
      primary: 'hsl(210, 100%, 50%)',
      secondary: 'hsl(220, 90%, 40%)',
      accent: 'hsl(200, 100%, 60%)',
      glow: 'hsl(210, 100%, 70%)',
      highlight: 'hsl(200, 100%, 80%)',
      shadow: 'hsl(220, 80%, 25%)',
      gradient: 'from-blue-500 to-blue-700',
    },
  },
  rebel: {
    id: 'rebel',
    name: 'Rebel',
    nameHe: 'מורד',
    description: 'Breaking patterns and liberation',
    descriptionHe: 'שבירת תבניות ושחרור',
    icon: '⚡',
    colors: {
      primary: 'hsl(0, 85%, 55%)',
      secondary: 'hsl(350, 80%, 45%)',
      accent: 'hsl(15, 90%, 60%)',
      glow: 'hsl(0, 100%, 70%)',
      highlight: 'hsl(10, 100%, 75%)',
      shadow: 'hsl(350, 70%, 30%)',
      gradient: 'from-red-500 to-red-700',
    },
  },
  healer: {
    id: 'healer',
    name: 'Healer',
    nameHe: 'מרפא',
    description: 'Restoration and wholeness',
    descriptionHe: 'שיקום ושלמות',
    icon: '💚',
    colors: {
      primary: 'hsl(150, 70%, 45%)',
      secondary: 'hsl(160, 65%, 35%)',
      accent: 'hsl(140, 80%, 55%)',
      glow: 'hsl(150, 100%, 65%)',
      highlight: 'hsl(140, 90%, 75%)',
      shadow: 'hsl(160, 60%, 25%)',
      gradient: 'from-green-500 to-green-700',
    },
  },
  explorer: {
    id: 'explorer',
    name: 'Explorer',
    nameHe: 'חוקר',
    description: 'Discovery and curiosity',
    descriptionHe: 'גילוי וסקרנות',
    icon: '🔍',
    colors: {
      primary: 'hsl(45, 95%, 55%)',
      secondary: 'hsl(35, 90%, 45%)',
      accent: 'hsl(50, 100%, 60%)',
      glow: 'hsl(45, 100%, 70%)',
      highlight: 'hsl(50, 100%, 80%)',
      shadow: 'hsl(35, 80%, 30%)',
      gradient: 'from-yellow-500 to-yellow-700',
    },
  },
  mystic: {
    id: 'mystic',
    name: 'Mystic',
    nameHe: 'מיסטיקן',
    description: 'Intuition and transcendence',
    descriptionHe: 'אינטואיציה והתעלות',
    icon: '🔮',
    colors: {
      primary: 'hsl(270, 70%, 55%)',
      secondary: 'hsl(280, 65%, 45%)',
      accent: 'hsl(260, 80%, 65%)',
      glow: 'hsl(270, 100%, 75%)',
      highlight: 'hsl(260, 90%, 80%)',
      shadow: 'hsl(280, 60%, 30%)',
      gradient: 'from-purple-500 to-purple-700',
    },
  },
  warrior: {
    id: 'warrior',
    name: 'Warrior',
    nameHe: 'לוחם',
    description: 'Strength and courage',
    descriptionHe: 'כוח ואומץ',
    icon: '⚔️',
    colors: {
      primary: 'hsl(25, 90%, 50%)',
      secondary: 'hsl(15, 85%, 40%)',
      accent: 'hsl(30, 100%, 55%)',
      glow: 'hsl(25, 100%, 65%)',
      highlight: 'hsl(30, 100%, 75%)',
      shadow: 'hsl(15, 75%, 28%)',
      gradient: 'from-orange-500 to-orange-700',
    },
  },
  sage: {
    id: 'sage',
    name: 'Sage',
    nameHe: 'חכם',
    description: 'Wisdom and understanding',
    descriptionHe: 'חוכמה והבנה',
    icon: '📚',
    colors: {
      primary: 'hsl(195, 75%, 45%)',
      secondary: 'hsl(200, 70%, 35%)',
      accent: 'hsl(190, 85%, 55%)',
      glow: 'hsl(195, 100%, 65%)',
      highlight: 'hsl(190, 95%, 75%)',
      shadow: 'hsl(200, 65%, 25%)',
      gradient: 'from-cyan-500 to-cyan-700',
    },
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    nameHe: 'יוצר',
    description: 'Imagination and innovation',
    descriptionHe: 'דמיון וחדשנות',
    icon: '🎨',
    colors: {
      primary: 'hsl(320, 75%, 55%)',
      secondary: 'hsl(330, 70%, 45%)',
      accent: 'hsl(310, 85%, 65%)',
      glow: 'hsl(320, 100%, 75%)',
      highlight: 'hsl(310, 95%, 80%)',
      shadow: 'hsl(330, 60%, 30%)',
      gradient: 'from-pink-500 to-pink-700',
    },
  },
  lover: {
    id: 'lover',
    name: 'Lover',
    nameHe: 'אוהב',
    description: 'Connection and passion',
    descriptionHe: 'חיבור ותשוקה',
    icon: '❤️',
    colors: {
      primary: 'hsl(340, 85%, 55%)',
      secondary: 'hsl(350, 80%, 45%)',
      accent: 'hsl(330, 90%, 65%)',
      glow: 'hsl(340, 100%, 70%)',
      highlight: 'hsl(330, 95%, 80%)',
      shadow: 'hsl(350, 70%, 30%)',
      gradient: 'from-rose-500 to-rose-700',
    },
  },
  child: {
    id: 'child',
    name: 'Inner Child',
    nameHe: 'ילד פנימי',
    description: 'Wonder and playfulness',
    descriptionHe: 'פליאה ושובבות',
    icon: '🌟',
    colors: {
      primary: 'hsl(55, 95%, 55%)',
      secondary: 'hsl(45, 90%, 50%)',
      accent: 'hsl(60, 100%, 60%)',
      glow: 'hsl(55, 100%, 70%)',
      highlight: 'hsl(60, 100%, 80%)',
      shadow: 'hsl(45, 80%, 35%)',
      gradient: 'from-amber-400 to-amber-600',
    },
  },
  shadow: {
    id: 'shadow',
    name: 'Shadow',
    nameHe: 'צל',
    description: 'Integration and acceptance',
    descriptionHe: 'אינטגרציה וקבלה',
    icon: '🌑',
    colors: {
      primary: 'hsl(240, 30%, 35%)',
      secondary: 'hsl(250, 25%, 25%)',
      accent: 'hsl(230, 40%, 50%)',
      glow: 'hsl(240, 50%, 55%)',
      highlight: 'hsl(230, 45%, 65%)',
      shadow: 'hsl(250, 20%, 15%)',
      gradient: 'from-slate-600 to-slate-800',
    },
  },
  transformer: {
    id: 'transformer',
    name: 'Transformer',
    nameHe: 'משנה',
    description: 'Change and evolution',
    descriptionHe: 'שינוי ואבולוציה',
    icon: '🦋',
    colors: {
      primary: 'hsl(180, 70%, 45%)',
      secondary: 'hsl(170, 65%, 35%)',
      accent: 'hsl(185, 80%, 55%)',
      glow: 'hsl(180, 100%, 65%)',
      highlight: 'hsl(185, 95%, 75%)',
      shadow: 'hsl(170, 55%, 25%)',
      gradient: 'from-teal-500 to-teal-700',
    },
  },
};

export function getEgoState(id: string): EgoState {
  return EGO_STATES[id] || EGO_STATES.guardian;
}

export function getEgoStateColors(id: string): EgoStateColors {
  return getEgoState(id).colors;
}

export function getAllEgoStates(): EgoState[] {
  return Object.values(EGO_STATES);
}

export function getEgoStateGradient(id: string): string {
  return getEgoState(id).colors.gradient;
}
