import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bookmark,
  BookOpen,
  Library,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { useHidhayaStore } from '@/store/hidhaya-store';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';

function BookmarkCard({
  bookmark,
  onDelete,
}) {
  const [open, setOpen] = useState(false);
  const isQuran = bookmark.type === 'quran';

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className={`overflow-hidden border-l-4 ${
            isQuran
              ? 'border-l-emerald-500'
              : 'border-l-amber-500'
          }`}
        >
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
              {isQuran ? (
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              ) : (
                <Library className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {bookmark.reference}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {(bookmark.text || bookmark.translation || '').slice(0, 80)}...
                </p>
              </div>
              <Badge
                variant="secondary"
                className={`text-[10px] px-1.5 py-0 flex-shrink-0 ${
                  isQuran
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                }`}
              >
                {bookmark.type}
              </Badge>
              {open ? (
                <ChevronUp className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-3 pb-3 pt-0">
              <Separator className="mb-2" />
              <p className="text-sm text-foreground leading-relaxed">{bookmark.text}</p>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(bookmark._id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </motion.div>
    </Collapsible>
  );
}

export function BookmarksPanel() {
  const { user } = useHidhayaStore();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('quran');

  const fetchBookmarks = useCallback(async () => {
    // Get guestId from localStorage if user is not logged in
    const currentGuestId = typeof window !== 'undefined'
      ? localStorage.getItem('hidhaya_guest_id')
      : null;

    const currentUserId = user?._id;

    if (!currentUserId && !currentGuestId) {
      return;
    }

    setLoading(true);
    try {
      const query = currentUserId ? `userId=${currentUserId}` : `guestId=${currentGuestId}`;
      const token = localStorage.getItem('hidhaya_token');

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/bookmarks?${query}`, { headers });
      const data = await res.json();
      setBookmarks(data.bookmarks || []);
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
      toast.error('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  // Fetch bookmarks on mount
  useEffect(() => {
    // Small delay to ensure localStorage is ready
    setTimeout(() => {
      fetchBookmarks();
    }, 100);
  }, []);

  const handleDelete = async (id) => {
    try {
      const guestId = typeof window !== 'undefined'
        ? localStorage.getItem('hidhaya_guest_id')
        : null;
      const token = localStorage.getItem('hidhaya_token');

      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const query = user?._id ? `userId=${user._id}` : (guestId ? `guestId=${guestId}` : '');
      await fetch(`/api/bookmarks/${id}${query ? '?' + query : ''}`, { method: 'DELETE', headers });
      setBookmarks((prev) => prev.filter((b) => b._id !== id));
      toast.success('🗑️ Removed from Bookmarks', { duration: 2000 });
    } catch {
      toast.error('Failed to remove bookmark');
    }
  };

  const quranBookmarks = bookmarks.filter((b) => b.type === 'quran');
  const hadithBookmarks = bookmarks.filter((b) => b.type === 'hadith');

  // Check if user is truly not logged in (no user.id AND no guestId)
  const guestId = typeof window !== 'undefined' ? localStorage.getItem('hidhaya_guest_id') : null;
  const isLoggedOut = !user?._id && !guestId;

  console.log('Bookmarks panel:', { userId: user?._id, guestId, isLoggedOut, bookmarkCount: bookmarks.length });

  if (isLoggedOut) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
          <Bookmark className="w-8 h-8 text-emerald-300 dark:text-emerald-600" />
        </div>
        <p className="text-muted-foreground text-sm mb-2">Sign in to save bookmarks</p>
        <p className="text-muted-foreground text-xs">
          Bookmarks let you save your favorite verses and hadith for quick access
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-[var(--color-primary)]" />
          <h2 className="text-lg font-semibold text-foreground">Bookmarks</h2>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1">
        <div className="px-4 pt-3">
          <TabsList className="w-full bg-[var(--color-accent)]">
            <TabsTrigger
              value="quran"
              className="flex-1 data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-[var(--color-primary-foreground)]"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1.5" />
              Quran ({quranBookmarks.length})
            </TabsTrigger>
            <TabsTrigger
              value="hadith"
              className="flex-1 data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-[var(--color-primary-foreground)]"
            >
              <Library className="w-3.5 h-3.5 mr-1.5" />
              Hadith ({hadithBookmarks.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="quran" className="flex-1 mt-0 overflow-y-auto min-h-0" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            <div className="p-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-4 h-4 rounded" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-3 w-full mt-2" />
                    </Card>
                  ))}
                </div>
              ) : quranBookmarks.length > 0 ? (
                <div className="space-y-2.5">
                  <AnimatePresence>
                    {quranBookmarks.map((b) => (
                      <BookmarkCard key={b._id} bookmark={b} onDelete={handleDelete} />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-3">
                    <BookOpen className="w-6 h-6 text-emerald-300 dark:text-emerald-600" />
                  </div>
                  <p className="text-sm text-muted-foreground">No Quran bookmarks yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Bookmark verses from search results or chat
                  </p>
                </div>
              )}
            </div>
        </TabsContent>

        <TabsContent value="hadith" className="flex-1 mt-0 overflow-y-auto min-h-0" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            <div className="p-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-4 h-4 rounded" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-3 w-full mt-2" />
                    </Card>
                  ))}
                </div>
              ) : hadithBookmarks.length > 0 ? (
                <div className="space-y-2.5">
                  <AnimatePresence>
                    {hadithBookmarks.map((b) => (
                      <BookmarkCard key={b._id} bookmark={b} onDelete={handleDelete} />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-3">
                    <Library className="w-6 h-6 text-amber-300 dark:text-amber-600" />
                  </div>
                  <p className="text-sm text-muted-foreground">No Hadith bookmarks yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Bookmark hadith from search results or chat
                  </p>
                </div>
              )}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
