import { LucideIcon } from "lucide-react";

export interface PillarColorScheme {
  headerGradient: string;
  headerBorder: string;
  iconBg: string;
  iconColor: string;
  iconFill?: string;
  titleColor: string;
  descColor: string;
  circle1: string;
  circle2: string;
  primaryBtn: string;
  outlineBtn: string;
  toolCardBorder: string;
  toolIconBg: string;
  toolIconColor: string;
  statusGradient: string;
  statusBorder: string;
  statusTitleColor: string;
  statusBtnOutline: string;
}

/** Helper to generate a full color scheme from a single tailwind color name */
function scheme(c: string, c2?: string): PillarColorScheme {
  const s = c2 || c;
  return {
    headerGradient: `from-${c}-100 to-${s}-50 dark:from-${c}-950 dark:to-gray-900`,
    headerBorder: `border-${c}-200 dark:border-${c}-800/50`,
    iconBg: `bg-${c}-500/20 dark:bg-${c}-800/30`,
    iconColor: `text-${c}-600 dark:text-${c}-400`,
    titleColor: `text-${c}-700 dark:text-${c}-400`,
    descColor: `text-${c}-600/80 dark:text-${c}-200`,
    circle1: `bg-${c}-500/10 dark:bg-${c}-700/10`,
    circle2: `bg-${s}-500/10 dark:bg-${s}-700/10`,
    primaryBtn: `bg-gradient-to-r from-${c}-600 to-${s}-500 text-white hover:from-${c}-500 hover:to-${s}-400 shadow-lg font-bold border border-${c}-400/30`,
    outlineBtn: `border-${c}-400 dark:border-${c}-600/50 text-${c}-600 dark:text-${c}-400 hover:bg-${c}-100 dark:hover:bg-${c}-900/30`,
    toolCardBorder: `border-${c}-200/50 dark:border-${c}-800/30 hover:border-${c}-400 dark:hover:border-${c}-600`,
    toolIconBg: `bg-gradient-to-br from-${c}-500/20 to-${s}-500/20 dark:from-${c}-800/30 dark:to-${s}-800/30`,
    toolIconColor: `text-${c}-600 dark:text-${c}-400`,
    statusGradient: `from-${c}-100/50 to-${s}-100/50 dark:from-${c}-950/30 dark:to-${s}-950/30`,
    statusBorder: `border-${c}-200 dark:border-${c}-800/30`,
    statusTitleColor: `text-${c}-700 dark:text-${c}-400`,
    statusBtnOutline: `border-${c}-400 dark:border-${c}-600/50 text-${c}-600 dark:text-${c}-400 hover:bg-${c}-100 dark:hover:bg-${c}-900/30`,
  };
}

/**
 * All 15 pillars keyed by domain ID with thematic color schemes.
 * Also includes legacy keys (health, finances, etc.) for backwards compat.
 */
export const pillarColors: Record<string, PillarColorScheme> = {
  // ── Core 7 ──
  consciousness: scheme('violet', 'purple'),
  presence:      scheme('fuchsia', 'pink'),
  power:         scheme('red', 'rose'),
  vitality:      scheme('amber', 'yellow'),
  focus:         scheme('cyan', 'sky'),
  combat:        scheme('slate', 'gray'),
  expansion:     scheme('indigo', 'violet'),

  // ── Arena 8 ──
  wealth:        scheme('emerald', 'green'),
  influence:     scheme('purple', 'fuchsia'),
  relationships: scheme('sky', 'blue'),
  business:      scheme('orange', 'amber'),
  projects:      scheme('blue', 'indigo'),
  play:          scheme('lime', 'green'),
  order:         scheme('teal', 'cyan'),
  romantics:     scheme('rose', 'pink'),

  // ── Legacy keys (backwards compat) ──
  health:    scheme('red', 'rose'),
  finances:  scheme('emerald', 'green'),
  hobbies:   scheme('teal', 'cyan'),
  purpose:   scheme('purple', 'fuchsia'),
  learning:  scheme('indigo', 'violet'),
};
