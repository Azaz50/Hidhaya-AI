import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'

const ThemeContext = createContext(null)

// ─── 5 Stunning Themes ───────────────────────────────────────────
export const THEMES = {
  // ── Theme 1: Dark Emerald (Default Dark) ──
  dark_emerald: {
    id: 'dark_emerald',
    name: 'Dark Emerald',
    description: 'Deep dark with emerald accents',
    tier: 'free', // free = guest + all
    preview: { bg: '#0a0f0d', accent: '#10b981', card: '#111916' },
    vars: {
      '--bg-primary': '#0a0f0d',
      '--bg-secondary': '#111916',
      '--bg-tertiary': '#19241f',
      '--bg-card': '#141e19',
      '--bg-card-hover': '#1a2b24',
      '--bg-input': '#19241f',
      '--bg-sidebar': '#0d1410',
      '--bg-navbar': '#0a0f0d',
      '--bg-modal': '#141e19',
      '--bg-message-user': '#10b981',
      '--bg-message-ai': '#19241f',
      '--bg-suggestion': 'transparent',
      '--bg-suggestion-hover': '#1a2b24',
      '--bg-scrollbar-track': '#111916',
      '--bg-scrollbar-thumb': '#2d4a3e',
      '--bg-overlay': 'rgba(0, 0, 0, 0.7)',
      '--bg-badge': 'rgba(16, 185, 129, 0.15)',
      '--border-primary': '#1e3a2f',
      '--border-secondary': '#2d4a3e',
      '--border-input': '#2d4a3e',
      '--border-suggestion': '#1e3a2f',
      '--border-active': '#10b981',
      '--text-primary': '#e8f5f0',
      '--text-secondary': '#94b8a8',
      '--text-tertiary': '#5e8574',
      '--text-inverse': '#0a0f0d',
      '--text-accent': '#10b981',
      '--text-muted': '#4a7363',
      '--text-on-accent': '#ffffff',
      '--accent-primary': '#10b981',
      '--accent-secondary': '#059669',
      '--accent-hover': '#0d9668',
      '--accent-glow': 'rgba(16, 185, 129, 0.2)',
      '--accent-gradient': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      '--danger': '#ef4444',
      '--warning': '#f59e0b',
      '--premium-gradient': 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
      '--shadow-sm': '0 2px 8px rgba(0, 0, 0, 0.3)',
      '--shadow-md': '0 4px 16px rgba(0, 0, 0, 0.4)',
      '--shadow-lg': '0 8px 32px rgba(0, 0, 0, 0.5)',
      '--shadow-glow': '0 0 20px rgba(16, 185, 129, 0.15)',
      '--radius-sm': '8px',
      '--radius-md': '12px',
      '--radius-lg': '16px',
      '--radius-xl': '20px',
      '--radius-full': '9999px',
    }
  },

  // ── Theme 2: Light Ivory (Default Light) ──
  light_ivory: {
    id: 'light_ivory',
    name: 'Light Ivory',
    description: 'Clean, warm and elegant',
    tier: 'free',
    preview: { bg: '#faf8f5', accent: '#059669', card: '#ffffff' },
    vars: {
      '--bg-primary': '#faf8f5',
      '--bg-secondary': '#ffffff',
      '--bg-tertiary': '#f3efe9',
      '--bg-card': '#ffffff',
      '--bg-card-hover': '#f9f6f2',
      '--bg-input': '#ffffff',
      '--bg-sidebar': '#ffffff',
      '--bg-navbar': '#ffffff',
      '--bg-modal': '#ffffff',
      '--bg-message-user': '#059669',
      '--bg-message-ai': '#f3efe9',
      '--bg-suggestion': 'transparent',
      '--bg-suggestion-hover': '#f3efe9',
      '--bg-scrollbar-track': '#f3efe9',
      '--bg-scrollbar-thumb': '#d4cfc7',
      '--bg-overlay': 'rgba(0, 0, 0, 0.4)',
      '--bg-badge': 'rgba(5, 150, 105, 0.1)',
      '--border-primary': '#e8e2da',
      '--border-secondary': '#d4cfc7',
      '--border-input': '#d4cfc7',
      '--border-suggestion': '#e8e2da',
      '--border-active': '#059669',
      '--text-primary': '#2d2a26',
      '--text-secondary': '#6b6560',
      '--text-tertiary': '#9a948d',
      '--text-inverse': '#ffffff',
      '--text-accent': '#059669',
      '--text-muted': '#b0a99f',
      '--text-on-accent': '#ffffff',
      '--accent-primary': '#059669',
      '--accent-secondary': '#047857',
      '--accent-hover': '#047857',
      '--accent-glow': 'rgba(5, 150, 105, 0.15)',
      '--accent-gradient': 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      '--danger': '#dc2626',
      '--warning': '#d97706',
      '--premium-gradient': 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
      '--shadow-sm': '0 2px 8px rgba(0, 0, 0, 0.06)',
      '--shadow-md': '0 4px 16px rgba(0, 0, 0, 0.08)',
      '--shadow-lg': '0 8px 32px rgba(0, 0, 0, 0.12)',
      '--shadow-glow': '0 0 20px rgba(5, 150, 105, 0.1)',
      '--radius-sm': '8px',
      '--radius-md': '12px',
      '--radius-lg': '16px',
      '--radius-xl': '20px',
      '--radius-full': '9999px',
    }
  },

  // ── Theme 3: Midnight Sapphire (Logged-in) ──
  midnight_sapphire: {
    id: 'midnight_sapphire',
    name: 'Midnight Sapphire',
    description: 'Deep blue luxury feel',
    tier: 'loggedin',
    preview: { bg: '#0a0e1a', accent: '#3b82f6', card: '#111827' },
    vars: {
      '--bg-primary': '#0a0e1a',
      '--bg-secondary': '#111827',
      '--bg-tertiary': '#1e293b',
      '--bg-card': '#151d2e',
      '--bg-card-hover': '#1e293b',
      '--bg-input': '#1e293b',
      '--bg-sidebar': '#0d1117',
      '--bg-navbar': '#0a0e1a',
      '--bg-modal': '#151d2e',
      '--bg-message-user': '#3b82f6',
      '--bg-message-ai': '#1e293b',
      '--bg-suggestion': 'transparent',
      '--bg-suggestion-hover': '#1e293b',
      '--bg-scrollbar-track': '#111827',
      '--bg-scrollbar-thumb': '#334155',
      '--bg-overlay': 'rgba(0, 0, 0, 0.7)',
      '--bg-badge': 'rgba(59, 130, 246, 0.15)',
      '--border-primary': '#1e293b',
      '--border-secondary': '#334155',
      '--border-input': '#334155',
      '--border-suggestion': '#1e293b',
      '--border-active': '#3b82f6',
      '--text-primary': '#e2e8f0',
      '--text-secondary': '#94a3b8',
      '--text-tertiary': '#64748b',
      '--text-inverse': '#0a0e1a',
      '--text-accent': '#60a5fa',
      '--text-muted': '#475569',
      '--text-on-accent': '#ffffff',
      '--accent-primary': '#3b82f6',
      '--accent-secondary': '#2563eb',
      '--accent-hover': '#2563eb',
      '--accent-glow': 'rgba(59, 130, 246, 0.2)',
      '--accent-gradient': 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
      '--danger': '#ef4444',
      '--warning': '#f59e0b',
      '--premium-gradient': 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
      '--shadow-sm': '0 2px 8px rgba(0, 0, 0, 0.4)',
      '--shadow-md': '0 4px 16px rgba(0, 0, 0, 0.5)',
      '--shadow-lg': '0 8px 32px rgba(0, 0, 0, 0.6)',
      '--shadow-glow': '0 0 20px rgba(59, 130, 246, 0.15)',
      '--radius-sm': '8px',
      '--radius-md': '12px',
      '--radius-lg': '16px',
      '--radius-xl': '20px',
      '--radius-full': '9999px',
    }
  },

  // ── Theme 4: Royal Gold (Premium) ──
  royal_gold: {
    id: 'royal_gold',
    name: 'Royal Gold',
    description: 'Luxurious dark with gold',
    tier: 'premium',
    preview: { bg: '#110f0a', accent: '#d4a017', card: '#1a1610' },
    vars: {
      '--bg-primary': '#110f0a',
      '--bg-secondary': '#1a1610',
      '--bg-tertiary': '#252015',
      '--bg-card': '#1e1a12',
      '--bg-card-hover': '#2a2418',
      '--bg-input': '#252015',
      '--bg-sidebar': '#13100b',
      '--bg-navbar': '#110f0a',
      '--bg-modal': '#1e1a12',
      '--bg-message-user': '#b8860b',
      '--bg-message-ai': '#252015',
      '--bg-suggestion': 'transparent',
      '--bg-suggestion-hover': '#2a2418',
      '--bg-scrollbar-track': '#1a1610',
      '--bg-scrollbar-thumb': '#4a3f2a',
      '--bg-overlay': 'rgba(0, 0, 0, 0.75)',
      '--bg-badge': 'rgba(212, 160, 23, 0.15)',
      '--border-primary': '#2e2820',
      '--border-secondary': '#4a3f2a',
      '--border-input': '#4a3f2a',
      '--border-suggestion': '#2e2820',
      '--border-active': '#d4a017',
      '--text-primary': '#f5f0e0',
      '--text-secondary': '#c4b998',
      '--text-tertiary': '#8a7d5a',
      '--text-inverse': '#110f0a',
      '--text-accent': '#f0c040',
      '--text-muted': '#6b5f40',
      '--text-on-accent': '#110f0a',
      '--accent-primary': '#d4a017',
      '--accent-secondary': '#b8860b',
      '--accent-hover': '#c4960f',
      '--accent-glow': 'rgba(212, 160, 23, 0.2)',
      '--accent-gradient': 'linear-gradient(135deg, #d4a017 0%, #b8860b 50%, #f0c040 100%)',
      '--danger': '#ef4444',
      '--warning': '#f59e0b',
      '--premium-gradient': 'linear-gradient(135deg, #d4a017 0%, #f0c040 50%, #b8860b 100%)',
      '--shadow-sm': '0 2px 8px rgba(0, 0, 0, 0.4)',
      '--shadow-md': '0 4px 16px rgba(212, 160, 23, 0.1)',
      '--shadow-lg': '0 8px 32px rgba(212, 160, 23, 0.15)',
      '--shadow-glow': '0 0 25px rgba(212, 160, 23, 0.2)',
      '--radius-sm': '8px',
      '--radius-md': '12px',
      '--radius-lg': '16px',
      '--radius-xl': '20px',
      '--radius-full': '9999px',
    }
  },

  // ── Theme 5: Cosmic Purple (Premium) ──
  cosmic_purple: {
    id: 'cosmic_purple',
    name: 'Cosmic Purple',
    description: 'Mystical deep purple cosmos',
    tier: 'premium',
    preview: { bg: '#0d0a14', accent: '#a855f7', card: '#16112a' },
    vars: {
      '--bg-primary': '#0d0a14',
      '--bg-secondary': '#16112a',
      '--bg-tertiary': '#1e1638',
      '--bg-card': '#191330',
      '--bg-card-hover': '#221a40',
      '--bg-input': '#1e1638',
      '--bg-sidebar': '#0f0b18',
      '--bg-navbar': '#0d0a14',
      '--bg-modal': '#191330',
      '--bg-message-user': '#8b5cf6',
      '--bg-message-ai': '#1e1638',
      '--bg-suggestion': 'transparent',
      '--bg-suggestion-hover': '#221a40',
      '--bg-scrollbar-track': '#16112a',
      '--bg-scrollbar-thumb': '#3b2d6b',
      '--bg-overlay': 'rgba(0, 0, 0, 0.75)',
      '--bg-badge': 'rgba(168, 85, 247, 0.15)',
      '--border-primary': '#2a1f50',
      '--border-secondary': '#3b2d6b',
      '--border-input': '#3b2d6b',
      '--border-suggestion': '#2a1f50',
      '--border-active': '#a855f7',
      '--text-primary': '#ede8f5',
      '--text-secondary': '#b0a0d0',
      '--text-tertiary': '#7a6a9a',
      '--text-inverse': '#0d0a14',
      '--text-accent': '#c084fc',
      '--text-muted': '#5a4a7a',
      '--text-on-accent': '#ffffff',
      '--accent-primary': '#a855f7',
      '--accent-secondary': '#7c3aed',
      '--accent-hover': '#9333ea',
      '--accent-glow': 'rgba(168, 85, 247, 0.25)',
      '--accent-gradient': 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
      '--danger': '#ef4444',
      '--warning': '#f59e0b',
      '--premium-gradient': 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
      '--shadow-sm': '0 2px 8px rgba(0, 0, 0, 0.4)',
      '--shadow-md': '0 4px 16px rgba(168, 85, 247, 0.1)',
      '--shadow-lg': '0 8px 32px rgba(168, 85, 247, 0.15)',
      '--shadow-glow': '0 0 25px rgba(168, 85, 247, 0.2)',
      '--radius-sm': '8px',
      '--radius-md': '12px',
      '--radius-lg': '16px',
      '--radius-xl': '20px',
      '--radius-full': '9999px',
    }
  },
}

// Which themes each tier can access
const TIER_ACCESS = {
  guest: ['dark_emerald', 'light_ivory'],
  free: ['dark_emerald', 'light_ivory'],
  loggedin: ['dark_emerald', 'light_ivory', 'midnight_sapphire'],
  premium: ['dark_emerald', 'light_ivory', 'midnight_sapphire', 'royal_gold', 'cosmic_purple'],
}

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth()

  const getUserTier = useCallback(() => {
    if (!user) return 'guest'
    if (user.isPremium) return 'premium'
    return 'loggedin'
  }, [user])

  const [currentThemeId, setCurrentThemeId] = useState(() => {
    return localStorage.getItem('hidhaya_theme') || 'dark_emerald'
  })

  const availableThemeIds = TIER_ACCESS[getUserTier()] || TIER_ACCESS.guest
  const availableThemes = availableThemeIds.map(id => THEMES[id])
  const currentTheme = THEMES[currentThemeId] || THEMES.dark_emerald

  // Apply theme CSS variables to :root
  useEffect(() => {
    const root = document.documentElement
    const vars = currentTheme.vars
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
    // Also set body background
    document.body.style.backgroundColor = vars['--bg-primary']
    document.body.style.color = vars['--text-primary']
  }, [currentTheme])

  // If user tier changes and current theme is not available, reset to default
  useEffect(() => {
    if (!availableThemeIds.includes(currentThemeId)) {
      setCurrentThemeId('dark_emerald')
      localStorage.setItem('hidhaya_theme', 'dark_emerald')
    }
  }, [availableThemeIds, currentThemeId])

  const setTheme = (themeId) => {
    if (availableThemeIds.includes(themeId)) {
      setCurrentThemeId(themeId)
      localStorage.setItem('hidhaya_theme', themeId)
    }
  }

  const isThemeLocked = (themeId) => {
    return !availableThemeIds.includes(themeId)
  }

  const getThemeTier = (themeId) => {
    return THEMES[themeId]?.tier || 'free'
  }

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      currentThemeId,
      availableThemes,
      allThemes: Object.values(THEMES),
      setTheme,
      isThemeLocked,
      getThemeTier,
      userTier: getUserTier(),
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
