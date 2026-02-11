export interface Mood {
  id: string;
  label: string;
  emoji: string;
  color: string;
  glowClass: string;
  pulseType: "slow" | "medium" | "fast" | "gentle" | "steady";
}

export const moods: Mood[] = [
  {
    id: "cozy",
    label: "Cozy",
    emoji: "🕯️",
    color: "#f59e0b",
    glowClass: "glow-cozy",
    pulseType: "slow",
  },
  {
    id: "anxious",
    label: "Anxious",
    emoji: "🌊",
    color: "#3b82f6",
    glowClass: "glow-anxious",
    pulseType: "fast",
  },
  {
    id: "focused",
    label: "Focused",
    emoji: "🔮",
    color: "#8b5cf6",
    glowClass: "glow-focused",
    pulseType: "steady",
  },
  {
    id: "low-energy",
    label: "Low Energy",
    emoji: "🌫️",
    color: "#6b7280",
    glowClass: "glow-low-energy",
    pulseType: "gentle",
  },
  {
    id: "social",
    label: "Social",
    emoji: "🌿",
    color: "#10b981",
    glowClass: "glow-social",
    pulseType: "medium",
  },
];

export function getMoodById(id: string): Mood | undefined {
  return moods.find((m) => m.id === id);
}
