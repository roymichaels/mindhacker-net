import type { BrainNode } from "./types";

export interface NodeStyle {
  color: string; // hsl string
  shape: "circle" | "diamond" | "ring" | "square";
  label: string;
}

const TYPE_MAP: Record<string, { color: string; shape: NodeStyle["shape"]; label: string }> = {
  identity:      { color: "hsl(var(--primary))",     shape: "ring",    label: "Identity" },
  belief:        { color: "hsl(220 80% 65%)",        shape: "circle",  label: "Belief" },
  value:         { color: "hsl(160 70% 60%)",        shape: "diamond", label: "Value" },
  goal:          { color: "hsl(45 95% 60%)",         shape: "diamond", label: "Goal" },
  habit:         { color: "hsl(280 70% 65%)",        shape: "square",  label: "Habit" },
  pattern:       { color: "hsl(190 90% 60%)",        shape: "circle",  label: "Pattern" },
  contradiction: { color: "hsl(0 80% 65%)",          shape: "diamond", label: "Contradiction" },
  memory:        { color: "hsl(30 70% 60%)",         shape: "circle",  label: "Memory" },
  emotion:       { color: "hsl(330 75% 65%)",        shape: "circle",  label: "Emotion" },
  mission:       { color: "hsl(142 70% 55%)",        shape: "square",  label: "Mission" },
};

const FALLBACK: NodeStyle = { color: "hsl(var(--muted-foreground))", shape: "circle", label: "Signal" };

export function styleForNode(n: BrainNode): NodeStyle {
  return TYPE_MAP[n.type?.toLowerCase()] ?? FALLBACK;
}

export function styleForType(t: string): NodeStyle {
  return TYPE_MAP[t.toLowerCase()] ?? FALLBACK;
}

export const ALL_TYPES = Object.keys(TYPE_MAP);

export function edgeStyle(relation: string, inferred: boolean) {
  if (inferred) return { stroke: "hsl(var(--foreground))", opacity: 0.08, dash: "3 4" };
  switch (relation) {
    case "contradicts": return { stroke: "hsl(0 80% 60%)",   opacity: 0.55, dash: undefined };
    case "reinforces":  return { stroke: "hsl(140 70% 55%)", opacity: 0.5,  dash: undefined };
    case "triggers":    return { stroke: "hsl(45 95% 60%)",  opacity: 0.45, dash: undefined };
    case "blocks":      return { stroke: "hsl(0 80% 60%)",   opacity: 0.5,  dash: "4 4" };
    case "evolved_from":return { stroke: "hsl(var(--primary))", opacity: 0.4, dash: "1 3" };
    default:            return { stroke: "hsl(var(--foreground))", opacity: 0.18, dash: undefined };
  }
}
