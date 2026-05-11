import { Search } from 'lucide-react'

const HadithSearchPage = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center animate-fade-in-up max-w-md px-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'var(--accent-glow)', border: '1px solid var(--border-primary)', boxShadow: 'var(--shadow-glow)' }}>
          <Search className="h-8 w-8" style={{ color: 'var(--accent-primary)' }} />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>Hadith Search</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Search through collections of authentic Hadith from Bukhari, Muslim, Tirmidhi, and more.
        </p>
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}>
            <Search className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Search Hadith...</span>
          </div>
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>🚧 This feature is coming soon</p>
        </div>
      </div>
    </div>
  )
}

export default HadithSearchPage
