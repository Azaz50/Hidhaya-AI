import { User, LogIn, LogOut, Crown, Mail, Calendar } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const ProfilePage = () => {
  const { user, logout } = useAuth()
  const { userTier } = useTheme()

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center animate-fade-in-up">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--accent-glow)', border: '1px solid var(--border-primary)' }}>
            <LogIn className="h-7 w-7" style={{ color: 'var(--accent-primary)' }} />
          </div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>Login Required</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Please login to view your profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4 overflow-y-auto h-full">
      <div className="flex items-center gap-3 mb-8 animate-fade-in-up">
        <User className="h-6 w-6" style={{ color: 'var(--text-accent)' }} />
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>Profile</h1>
      </div>

      {/* Avatar card */}
      <div className="p-6 rounded-2xl mb-4 animate-fade-in-up stagger-1" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold" style={{ background: 'var(--accent-gradient)', color: 'var(--text-on-accent)' }}>
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{user.name}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tier badge */}
      <div className="p-4 rounded-xl mb-4 animate-fade-in-up stagger-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4" style={{ color: userTier === 'premium' ? '#f59e0b' : 'var(--text-accent)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Subscription</span>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: userTier === 'premium' ? 'var(--premium-gradient)' : 'var(--bg-badge)', color: userTier === 'premium' ? '#fff' : 'var(--text-accent)' }}>
            {userTier === 'premium' ? 'Premium' : 'Free'}
          </span>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-smooth animate-fade-in-up stagger-3"
        style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </div>
  )
}

export default ProfilePage
