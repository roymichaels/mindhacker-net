/**
 * Capability registry — the canonical map of intents AION can summon.
 *
 * Used by:
 *  - Composer "+" actions (prefilled prompts)
 *  - In-chat capability cards (rendered by ArtifactLayer)
 *
 * Each capability is a thin pointer to an existing route or an in-app
 * action. We do NOT rebuild the underlying tools — we re-expose them as
 * conversational capabilities AION can invoke.
 */
import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  Layout,
  PenSquare,
  GraduationCap,
  Target,
  Network,
  Dumbbell,
  Sparkles,
  Mic,
  Upload,
  Search,
  Workflow,
} from 'lucide-react';

export type CapabilityId =
  | 'business'
  | 'landing_page'
  | 'blog'
  | 'course'
  | 'strategy'
  | 'mind_map'
  | 'fitness_plan'
  | 'content_plan'
  | 'voice'
  | 'upload'
  | 'deep_dive'
  | 'workflow';

export interface Capability {
  id: CapabilityId;
  icon: LucideIcon;
  labelEn: string;
  labelHe: string;
  /** Short helper text shown in cards / sheets. */
  descEn: string;
  descHe: string;
  /** Pre-filled chat prompt sent to AION when the capability is invoked. */
  promptEn: string;
  promptHe: string;
  /** Existing destination if the user wants to open the dedicated surface. */
  route?: string;
}

export const CAPABILITIES: Record<CapabilityId, Capability> = {
  business: {
    id: 'business',
    icon: Briefcase,
    labelEn: 'Build a business',
    labelHe: 'בניית עסק',
    descEn: 'AION drafts a business strategy with you.',
    descHe: 'AION בונה איתך אסטרטגיה עסקית.',
    promptEn: 'Help me create a business. Ask me what you need to know and start drafting.',
    promptHe: 'עזור לי לבנות עסק. שאל אותי מה שצריך והתחל לטייט.',
    route: '/business',
  },
  landing_page: {
    id: 'landing_page',
    icon: Layout,
    labelEn: 'Landing page',
    labelHe: 'דף נחיתה',
    descEn: 'Generate a landing page for an offer.',
    descHe: 'צור דף נחיתה להצעה שלך.',
    promptEn: 'Help me build a landing page. Ask for the offer, audience, and tone, then propose a draft.',
    promptHe: 'עזור לי לבנות דף נחיתה. שאל על ההצעה, הקהל והטון, ואז הצע טיוטה.',
    route: '/coach-landing-builder',
  },
  blog: {
    id: 'blog',
    icon: PenSquare,
    labelEn: 'Blog post',
    labelHe: 'פוסט בלוג',
    descEn: 'Plan and draft a blog post.',
    descHe: 'תכנן וכתוב פוסט בלוג.',
    promptEn: 'Help me write a blog post. Ask me the topic and angle, then outline and draft it.',
    promptHe: 'עזור לי לכתוב פוסט בלוג. שאל על הנושא והזווית, ואז הכן מתווה וטיוטה.',
    route: '/blog',
  },
  course: {
    id: 'course',
    icon: GraduationCap,
    labelEn: 'Create a course',
    labelHe: 'בניית קורס',
    descEn: 'Design a course curriculum.',
    descHe: 'עצב מערך לימוד לקורס.',
    promptEn: 'Help me design a course. Ask the subject and learner profile, then outline the modules.',
    promptHe: 'עזור לי לעצב קורס. שאל על הנושא ועל פרופיל הלומד, ואז הצע מודולים.',
    route: '/courses',
  },
  strategy: {
    id: 'strategy',
    icon: Target,
    labelEn: 'Design a strategy',
    labelHe: 'בניית אסטרטגיה',
    descEn: 'Build a 100-day execution plan.',
    descHe: 'בנה תוכנית פעולה ל-100 ימים.',
    promptEn: 'Help me design a strategy for the next 100 days. Start by asking about my current focus.',
    promptHe: 'עזור לי לבנות אסטרטגיה ל-100 הימים הקרובים. התחל בשאלה על המוקד הנוכחי שלי.',
    route: '/strategy',
  },
  mind_map: {
    id: 'mind_map',
    icon: Network,
    labelEn: 'Map my mind',
    labelHe: 'מפת תודעה',
    descEn: 'Open the live brain graph.',
    descHe: 'פתח את גרף המוח החי.',
    promptEn: 'Show me my mind right now — patterns, beliefs, and what needs attention.',
    promptHe: 'הראה לי את המוח שלי עכשיו — דפוסים, אמונות, ומה דורש תשומת לב.',
  },
  fitness_plan: {
    id: 'fitness_plan',
    icon: Dumbbell,
    labelEn: 'Fitness transformation',
    labelHe: 'שינוי גופני',
    descEn: 'Design a personalised fitness plan.',
    descHe: 'עצב תוכנית כושר אישית.',
    promptEn: 'Help me plan a fitness transformation. Ask about my body, time, and goal first.',
    promptHe: 'עזור לי לתכנן שינוי גופני. שאל קודם על הגוף, הזמן והמטרה שלי.',
    route: '/strategy?domain=health',
  },
  content_plan: {
    id: 'content_plan',
    icon: Sparkles,
    labelEn: 'Content strategy',
    labelHe: 'אסטרטגיית תוכן',
    descEn: 'Plan a content strategy and calendar.',
    descHe: 'תכנן אסטרטגיית תוכן ולוח פרסום.',
    promptEn: 'Help me design a content strategy. Ask about my niche, channels, and audience.',
    promptHe: 'עזור לי לתכנן אסטרטגיית תוכן. שאל על הנישה, הערוצים והקהל שלי.',
  },
  voice: {
    id: 'voice',
    icon: Mic,
    labelEn: 'Voice mode',
    labelHe: 'מצב קולי',
    descEn: 'Talk to AION out loud.',
    descHe: 'שוחח עם AION בקול.',
    promptEn: '',
    promptHe: '',
  },
  upload: {
    id: 'upload',
    icon: Upload,
    labelEn: 'Attach context',
    labelHe: 'צרף הקשר',
    descEn: 'Upload a file or note as context.',
    descHe: 'העלה קובץ או הערה כהקשר.',
    promptEn: '',
    promptHe: '',
  },
  deep_dive: {
    id: 'deep_dive',
    icon: Search,
    labelEn: 'Deep dive',
    labelHe: 'צלילה לעומק',
    descEn: 'Ask AION to investigate something thoroughly.',
    descHe: 'בקש מ-AION לחקור נושא לעומק.',
    promptEn: 'Take a deep dive on this with me. Ask whatever you need to understand the full picture.',
    promptHe: 'בוא נצלול לעומק יחד. שאל כל מה שצריך כדי להבין את התמונה המלאה.',
  },
  workflow: {
    id: 'workflow',
    icon: Workflow,
    labelEn: 'Launch workflow',
    labelHe: 'הפעל תהליך',
    descEn: 'Run a multi-step orchestrated flow.',
    descHe: 'הפעל תהליך מתואם רב-שלבי.',
    promptEn: 'Launch a workflow with me. Ask me what outcome I want and orchestrate the steps.',
    promptHe: 'הפעל איתי תהליך עבודה. שאל איזה תוצר אני רוצה ותאם את השלבים.',
  },
};

export function getCapability(id: CapabilityId): Capability | undefined {
  return CAPABILITIES[id];
}

export function listCapabilities(ids: CapabilityId[]): Capability[] {
  return ids.map((id) => CAPABILITIES[id]).filter(Boolean);
}