import { useEffect } from 'react'
import { useChat } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'
import BookmarkedChats from '../components/BookmarkedChats'
import { Bookmark, LogIn } from 'lucide-react'

const BookmarksPage = () => {
  const { fetchChats } = useChat()
  const { user } = useAuth()

  useEffect(() => {
    if (user) fetchChats()
  }, [user, fetchChats])

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center animate-fade-in-up">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--accent-glow)', border: '1px solid var(--border-primary)' }}>
            <LogIn className="h-7 w-7" style={{ color: 'var(--accent-primary)' }} />
          </div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>Login Required</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Please login to view your bookmarks</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 overflow-y-auto h-full">
      <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
        <Bookmark className="h-6 w-6" style={{ color: 'var(--text-accent)' }} />
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>Bookmarks</h1>
      </div>
      <BookmarkedChats />
    </div>
  )
}

export default BookmarksPage