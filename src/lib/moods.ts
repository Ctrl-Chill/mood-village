export interface Mood {
  id: string;
  label: string;
  emoji: string;
  color: string;
  glowClass: string;
  pulseType: 'soft' | 'flicker' | 'steady' | 'slow' | 'bouncy';
}

export const moods: Mood[] = [
  {
    id: 'cozy',
    label: 'Cozy',
    emoji: '\u{1F56F}\u{FE0F}',
    color: '#f59e0b',
    glowClass: 'glow-cozy',
    pulseType: 'soft',
  },
  {
    id: 'anxious',
    label: 'Anxious',
    emoji: '\u{1F30A}',
    color: '#3b82f6',
    glowClass: 'glow-anxious',
    pulseType: 'flicker',
  },
  {
    id: 'focused',
    label: 'Focused',
    emoji: '\u{1F52E}',
    color: '#8b5cf6',
    glowClass: 'glow-focused',
    pulseType: 'steady',
  },
  {
    id: 'low-energy',
    label: 'Low Energy',
    emoji: '\u{1F32B}\u{FE0F}',
    color: '#6b7280',
    glowClass: 'glow-low-energy',
    pulseType: 'slow',
  },
  {
    id: 'social',
    label: 'Social',
    emoji: '\u{1F33F}',
    color: '#10b981',
    glowClass: 'glow-social',
    pulseType: 'bouncy',
  },
];

export function getMoodById(id: string): Mood | undefined {
  return moods.find((m) => m.id === id);
}
