export function getAvailableThemes(user) {
  const userTier = user?.plan === 'premium' ? 'premium' : user ? 'logged_in' : 'free'
  const tierOrder = { free: 0, logged_in: 1, premium: 2 }

  return THEMES.filter(t => tierOrder[t.tier] <= tierOrder[userTier])
}

export { THEMES as themes }
export const THEMES = [
  {
    id: 'light',
    name: 'Light',
    description: 'Clean & bright',
    tier: 'free',
    preview: ['#ffffff', '#10b981', '#f0fdf4'],
    icon: '☀️',
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Easy on the eyes',
    tier: 'free',
    preview: ['#0f1a14', '#34d399', '#064e3b'],
    icon: '🌙',
  },
  {
    id: 'ocean',
    name: 'Ocean Night',
    description: 'Deep sea calm',
    tier: 'logged_in',
    preview: ['#0c1929', '#38bdf8', '#0369a1'],
    icon: '🌊',
  },
  {
    id: 'royal',
    name: 'Royal Gold',
    description: 'Majestic & warm',
    tier: 'premium',
    preview: ['#1a1207', '#f59e0b', '#78350f'],
    icon: '👑',
  },
  {
    id: 'rose',
    name: 'Rose Garden',
    description: 'Elegant & soft',
    tier: 'premium',
    preview: ['#1a0a10', '#f472b6', '#831843'],
    icon: '🌹',
  },
];