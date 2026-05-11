import { useEffect, useState } from 'react'
import { useHidhayaStore } from '@/store/hidhaya-store'
import { SidebarNav, MobileSidebar } from '@/components/hidhaya/sidebar-nav'
import { ChatPanel } from '@/components/hidhaya/chat-panel'
import { SearchPanel } from '@/components/hidhaya/search-panel'
import { BookmarksPanel } from '@/components/hidhaya/bookmarks-panel'
import { ProfilePanel } from '@/components/hidhaya/profile-panel'
import { AuthDialog } from '@/components/hidhaya/auth-dialog'
import { PremiumPopup } from '@/components/hidhaya/premium-popup'
import { Toaster } from 'sonner'
import { themes, getAvailableThemes } from '@/themes/themes'
import {
  Menu,
  Palette,
  User,
  MessageSquare,
  BookOpen,
  Library,
  Bookmark,
  X,
  Lock,
  Crown,
  Zap,
} from 'lucide-react'

const THEMES = themes
import hidhayaLogo from '@/assets/hidhaya-logo.png'

// ═══════════════════════════════════════════════════════
// THEME PICKER POPOVER
// ═══════════════════════════════════════════════════════
function ThemePicker({ isOpen, onClose }) {
  const { theme, setTheme, user, setShowAuthDialog, setShowPremiumPopup } = useHidhayaStore()
  const available = getAvailableThemes(user)
  const availableIds = available.map((t) => t.id)

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">Themes</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-accent transition-colors">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        <div className="px-3 pb-3 space-y-1.5">
          {THEMES.map((t) => {
            const isAvailable = availableIds.includes(t.id)
            const isActive = theme === t.id
            const isLocked = !isAvailable

            return (
              <button
                key={t.id}
                onClick={() => {
                  if (isLocked) {
                    if (t.tier === 'logged_in') setShowAuthDialog(true)
                    else setShowPremiumPopup(true)
                    onClose()
                    return
                  }
                  setTheme(t.id)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary/10 ring-1.5 ring-primary/40'
                    : isLocked
                    ? 'opacity-50 hover:opacity-70'
                    : 'hover:bg-accent'
                }`}
              >
                {/* Color preview dots */}
                <div className="flex gap-0.5 flex-shrink-0">
                  {t.preview.map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full ring-1 ring-white/20"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                {/* Name & description */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-foreground">{t.icon} {t.name}</span>
                    {isActive && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-bold">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{t.description}</p>
                </div>

                {/* Lock indicator */}
                {isLocked && (
                  <div className="flex-shrink-0">
                    {t.tier === 'premium' ? (
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Upgrade hint */}
        {!user?.plan && (
          <div className="px-4 py-2.5 border-t border-border bg-accent/30">
            <p className="text-[10px] text-muted-foreground text-center">
              <span className="font-semibold text-primary">Sign in</span> for more themes • <span className="font-semibold text-amber-500">Premium</span> unlocks all
            </p>
          </div>
        )}
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════
// TOP NAVBAR
// ═══════════════════════════════════════════════════════
function Navbar() {
  const { activeView, setActiveView, setSidebarOpen, usage, user, theme } = useHidhayaStore()
  const [themePickerOpen, setThemePickerOpen] = useState(false)

  const remaining = usage?.remaining ?? -1
  const isPremium = user?.plan === 'premium'

  const viewTitles = {
    chat: 'Hidhaya AI',
    quran: 'Quran Search',
    hadith: 'Hadith Search',
    bookmarks: 'Bookmarks',
    profile: 'Profile',
  }

  const currentTheme = THEMES.find((t) => t.id === theme)

  return (
    <header className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-b border-border bg-card/80 backdrop-blur-lg z-20 relative">
      {/* Left: menu + logo + title */}
      <div className="flex items-center gap-2">
        <button
          className="md:hidden p-1.5 rounded-xl hover:bg-accent transition-colors"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>

        <div className="flex items-center gap-2">
          <img
            src={hidhayaLogo}
            alt="Hidhaya"
            className="w-8 h-8 rounded-lg object-cover shadow-sm"
          />
          <h1 className="text-sm font-bold text-foreground">
            {viewTitles[activeView] || 'Hidhaya'}
          </h1>
        </div>
      </div>

      {/* Right: usage + theme picker + profile */}
      <div className="flex items-center gap-1">
        {/* Usage counter — desktop only */}
        {usage && remaining >= 0 && !isPremium && (
          <span
            className={`text-[11px] font-medium mr-1.5 hidden sm:inline ${
              remaining === 0
                ? 'text-red-500'
                : remaining <= 2
                ? 'text-amber-500'
                : 'text-primary'
            }`}
          >
            ✨ {remaining} left
          </span>
        )}

        {/* Theme Picker */}
        <div className="relative">
          <button
            onClick={() => setThemePickerOpen(!themePickerOpen)}
            className={`p-2 rounded-xl transition-all duration-200 ${
              themePickerOpen
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-accent text-muted-foreground hover:text-foreground'
            }`}
            aria-label="Change theme"
          >
            <Palette className="w-[18px] h-[18px]" />
          </button>

          <ThemePicker isOpen={themePickerOpen} onClose={() => setThemePickerOpen(false)} />
        </div>

        {/* Profile / Settings */}
        <button
          onClick={() => setActiveView('profile')}
          className={`p-2 rounded-xl transition-all duration-200 ${
            activeView === 'profile'
              ? 'bg-primary/15 text-primary'
              : 'hover:bg-accent text-muted-foreground hover:text-foreground'
          }`}
          aria-label="Profile"
        >
          <User className="w-[18px] h-[18px]" />
        </button>
      </div>
    </header>
  )
}

// ═══════════════════════════════════════════════════════
// MOBILE BOTTOM TAB BAR
// ═══════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════
// USAGE PROGRESS BAR (shown on mobile)
// ═══════════════════════════════════════════════════════
function UsageProgressBar() {
  const { usage, user } = useHidhayaStore()

  const usedToday = usage?.usedToday ?? 0
  const limit = usage?.limit ?? 10
  const remaining = usage?.remaining ?? 10
  const isPremium = user?.plan === 'premium'
  const isUnlimited = limit === -1

  // Don't show for premium users with unlimited
  if (isUnlimited) return null

  // Calculate percentage
  const percentage = limit > 0 ? Math.min((usedToday / limit) * 100, 100) : 0

  // Color based on remaining
  const getColor = () => {
    if (remaining <= 0) return 'bg-red-500'
    if (remaining <= 3) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  return (
    <div className="md:hidden px-3 py-2 border-t border-border bg-card/90">
      <div className="flex items-center justify-between text-xs mb-1">
        <div className="flex items-center gap-1.5">
          <Zap className={`w-3.5 h-3.5 ${remaining <= 0 ? 'text-red-500' : 'text-emerald-500'}`} />
          <span className="text-muted-foreground">
            {isPremium ? 'Premium' : user ? 'Free Plan' : 'Guest'}
          </span>
        </div>
        <span className={`${remaining <= 0 ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
          {remaining <= 0 ? 'Limit reached' : `${remaining} left today`}
        </span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

const mobileNavItems = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'quran', label: 'Quran', icon: BookOpen },
  { id: 'hadith', label: 'Hadith', icon: Library },
  { id: 'bookmarks', label: 'Saved', icon: Bookmark },
  { id: 'profile', label: 'Profile', icon: User },
]

function MobileBottomNav() {
  const { activeView, setActiveView } = useHidhayaStore()

  return (
    <nav className="md:hidden flex-shrink-0 flex items-center justify-around border-t border-border bg-card/90 backdrop-blur-lg py-1 px-1 safe-area-bottom">
      {mobileNavItems.map((item) => {
        const Icon = item.icon
        const isActive = activeView === item.id
        return (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[52px] ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <div
              className={`p-1 rounded-lg transition-all duration-200 ${
                isActive ? 'bg-primary/12 scale-110' : ''
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-all ${
                  isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'
                }`}
              />
            </div>
            <span
              className={`text-[10px] leading-tight ${
                isActive ? 'font-bold' : 'font-medium'
              }`}
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

// ═══════════════════════════════════════════════════════
// MAIN CONTENT ROUTER
// ═══════════════════════════════════════════════════════
function MainContent() {
  const { activeView } = useHidhayaStore()

  switch (activeView) {
    case 'quran':
      return <SearchPanel type="quran" />
    case 'hadith':
      return <SearchPanel type="hadith" />
    case 'bookmarks':
      return <BookmarksPanel />
    case 'profile':
      return <ProfilePanel />
    case 'chat':
    default:
      return <ChatPanel />
  }
}

// ═══════════════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════════════
function App() {
  const { initialize } = useHidhayaStore()

  useEffect(() => {
    initialize()
  }, [])

  return (
    <>
      <div className="flex h-[100dvh] bg-background overflow-hidden">
        {/* Desktop Sidebar */}
        <SidebarNav />
        {/* Mobile Sidebar (Sheet) */}
        <MobileSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <Navbar />
          <main className="flex-1 min-h-0 overflow-hidden">
            <MainContent />
          </main>
          <UsageProgressBar />
          <MobileBottomNav />
        </div>
      </div>

      {/* Global Modals */}
      <AuthDialog />
      <PremiumPopup />

      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--color-card)',
            color: 'var(--color-foreground)',
            border: '1px solid var(--color-border)',
          },
        }}
      />
    </>
  )
}

export default App