import { useEffect, useState, useRef } from 'react';
import { MessageSquare, BookOpen, Library, Bookmark, User, Plus, Trash2, Clock, MessageCircle, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useHidhayaStore } from '@/store/hidhaya-store';
import hidhayaLogo from '@/assets/hidhaya-logo.png';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const navItems = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'quran', label: 'Quran Search', icon: BookOpen },
  { id: 'hadith', label: 'Hadith Search', icon: Library },
  { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  { id: 'profile', label: 'Profile', icon: User },
];

function ChatHistoryItemRow({ chat, isActive, onSelect, onDelete }) {
  const [showDelete, setShowDelete] = useState(false);

  const timeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 ${
        isActive
          ? 'bg-[var(--color-sidebar-active-bg)] text-[var(--color-sidebar-active-text)]'
          : 'bg-transparent text-[var(--color-sidebar-muted)] hover:bg-[var(--color-accent)] hover:text-[var(--color-sidebar-text)]'
      }`}
      onClick={onSelect}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <MessageCircle className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{chat.title || 'Untitled Chat'}</p>
        <p className="text-[10px] opacity-60">{timeAgo(chat.updatedAt)}</p>
      </div>
      {showDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0 opacity-60 hover:opacity-100 hover:text-red-500 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Chat?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this conversation. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-red-500 hover:bg-red-600 text-white">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

function SidebarContent({ onClose }) {
  const {
    activeView,
    setActiveView,
    usage,
    chatId,
    chatHistory,
    loadChatHistory,
    loadChat,
    deleteChat,
    startNewChat,
    setSidebarOpen,
    user,
    language,
  } = useHidhayaStore();

  const chatListRef = useRef(null);

  const handleNavClick = (view) => {
    setActiveView(view);
    if (onClose) onClose();
  };

  const handleNewChat = () => {
    startNewChat();
    if (onClose) onClose();
  };

  const handleLoadChat = async (chatIdToLoad) => {
    await loadChat(chatIdToLoad);
    if (onClose) onClose();
  };

  const handleDeleteChat = async (chatIdToDelete) => {
    await deleteChat(chatIdToDelete);
  };

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, [user?.id, user?.guestId]);

  // Auto-scroll chat history to show latest conversations
  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const remaining = usage?.remaining ?? -1;
  const isPremium = user?.plan === 'premium';

  return (
    <div className="flex flex-col h-full bg-[var(--color-sidebar-bg)]">
      {/* Logo & Title - Fixed at top */}
      <div className="flex-shrink-0 p-4 pb-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-12 h-12 rounded-xl bg-[var(--color-accent)] flex items-center justify-center ring-2 ring-[var(--color-border)] flex-shrink-0 aspect-square">
            <img src={hidhayaLogo}
              alt="Hidhaya"
              width={44}
              height={44}
              className="object-cover w-full h-full rounded-[10px]"
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-lg text-[var(--color-sidebar-text)] leading-tight">Hidhaya</h1>
            <p className="text-[11px] text-[var(--color-sidebar-muted)]">Islamic Guidance AI</p>
          </div>
        </div>

        <Button
          onClick={handleNewChat}
          className="w-full bg-[var(--color-primary)] hover:opacity-90 text-[var(--color-primary-foreground)] gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      <Separator className="flex-shrink-0 mx-4 w-auto border-[var(--color-sidebar-border)]" />

      {/* Navigation - Fixed, no scroll */}
      <div className="flex-shrink-0 px-2 py-3">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[var(--color-sidebar-active-bg)] text-[var(--color-sidebar-active-text)] shadow-sm'
                    : 'text-[var(--color-sidebar-muted)] hover:bg-[var(--color-accent)] hover:text-[var(--color-sidebar-text)]'
                }`}
              >
                <Icon className={`w-4.5 h-4.5`} />
                <span>{item.label}</span>
                {item.id === 'chat' && usage && !isPremium && (
                  <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 bg-[var(--color-accent)] text-[var(--color-sidebar-text)]">
                    {remaining}/{usage.limit}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <Separator className="flex-shrink-0 mx-4 w-auto border-[var(--color-sidebar-border)]" />

      {/* Chat History Section - Scrollable, takes remaining space */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {chatHistory.length > 0 && (
          <>
            <div className="flex-shrink-0 px-3 py-2">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[var(--color-sidebar-muted)]" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-sidebar-muted)]">
                  Recent Chats
                </span>
                {chatHistory.length > 10 && (
                  <span className="text-[10px] text-[var(--color-sidebar-muted)] ml-auto">
                    {chatHistory.length}
                  </span>
                )}
              </div>
            </div>
            <div
              ref={chatListRef}
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-1 pb-2 space-y-0.5"
              style={{
                scrollbarGutter: 'stable',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {chatHistory.map((chat) => (
                <ChatHistoryItemRow
                  key={chat.id}
                  chat={chat}
                  isActive={chatId === chat.id}
                  onSelect={() => handleLoadChat(chat.id)}
                  onDelete={() => handleDeleteChat(chat.id)}
                />
              ))}
            </div>
          </>
        )}
        {chatHistory.length === 0 && (
          <div className="flex-1 flex items-center justify-center px-4 py-8">
            <p className="text-xs text-muted-foreground text-center">No chat history yet.<br />Start a new conversation</p>
          </div>
        )}
      </div>

      <Separator className="flex-shrink-0 mx-4 w-auto border-[var(--color-sidebar-border)]" />

      {/* Footer - Fixed at bottom with beautiful usage bar */}
      <div className="flex-shrink-0 p-4 pt-3">
        {/* Premium Badge */}
        {isPremium ? (
          <div className="mb-3 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                Premium Member
              </span>
            </div>
          </div>
        ) : usage ? (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-[var(--color-sidebar-muted)] mb-1.5">
              <div className="flex items-center gap-1.5">
                <Zap className={`w-3.5 h-3.5 ${
                  usage.remaining <= 0 ? 'text-red-500' : usage.remaining <= 2 ? 'text-amber-500' : 'text-[var(--color-primary)]'
                }`} />
                <span>Daily Usage</span>
              </div>
              <span className={`font-medium ${
                usage.remaining <= 0 ? 'text-red-500' : usage.remaining <= 2 ? 'text-amber-500' : 'text-[var(--color-primary)]'
              }`}>
                {usage.remaining <= 0 ? 'Limit reached' : `${usage.remaining}/${usage.limit} left`}
              </span>
            </div>
            <div className={`h-2 rounded-full overflow-hidden ${
              usage.remaining <= 0 ? 'bg-red-100 dark:bg-red-900/20' :
              usage.remaining <= 2 ? 'bg-amber-100 dark:bg-amber-900/20' :
              'bg-[var(--color-accent)]'
            }`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usage.remaining <= 0
                    ? 'bg-red-500'
                    : usage.remaining <= 2
                    ? 'bg-amber-500'
                    : 'bg-[var(--color-primary)]'
                }`}
                style={{ width: `${Math.min(100, (usage.usedToday / usage.limit) * 100)}%` }}
              />
            </div>
          </div>
        ) : null}
        <p className="text-[10px] text-[var(--color-sidebar-muted)] mt-2 text-center">
          Bismillah hir Rahman nir Raheem
          {language !== 'en' && (
            <span className="ml-1 text-[var(--color-primary)]">
              · {language === 'ur' ? 'اردو' : language === 'hi' ? 'हिन्दी' : language === 'bn' ? 'বাংলা' : language === 'roman_urdu' ? 'Roman Urdu' : language}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

export function SidebarNav() {
  return (
    <aside className="hidden md:flex border-r border-[var(--color-sidebar-border)] bg-[var(--color-sidebar-bg)] h-[100dvh]">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar() {
  const { sidebarOpen, setSidebarOpen } = useHidhayaStore();

  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetContent side="left" className="w-[280px] p-0 bg-[var(--color-sidebar-bg)]">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <SidebarContent onClose={() => setSidebarOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}