import { useEffect, useState, useRef } from 'react';
import { MessageSquare, BookOpen, Library, Bookmark, User, Plus, Trash2, Clock, MessageCircle } from 'lucide-react';
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
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
          : 'hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400 text-muted-foreground'
      }`}
      onClick={onSelect}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <MessageCircle className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{chat.title || 'Untitled Chat'}</p>
        <p className="text-[10px] opacity-50">{timeAgo(chat.updatedAt)}</p>
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
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo & Title - Fixed at top */}
      <div className="flex-shrink-0 p-4 pb-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center ring-2 ring-emerald-200 dark:ring-emerald-800 flex-shrink-0 aspect-square">
            <img src={hidhayaLogo}
              alt="Hidhaya"
              width={44}
              height={44}
              className="object-cover w-full h-full rounded-[10px]"
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-lg text-emerald-800 dark:text-emerald-300 leading-tight">Hidhaya</h1>
            <p className="text-[11px] text-muted-foreground">Islamic Guidance AI</p>
          </div>
        </div>

        <Button
          onClick={handleNewChat}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      <Separator className="flex-shrink-0 mx-4 w-auto" />

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
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 shadow-sm'
                    : 'text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                <span>{item.label}</span>
                {item.id === 'chat' && usage && !isPremium && (
                  <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                    {remaining}/{usage.limit}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <Separator className="flex-shrink-0 mx-4 w-auto" />

      {/* Chat History Section - Scrollable, takes remaining space */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {chatHistory.length > 0 && (
          <>
            <div className="flex-shrink-0 px-3 py-2">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Recent Chats
                </span>
                {chatHistory.length > 10 && (
                  <span className="text-[10px] text-muted-foreground ml-auto">
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

      <Separator className="flex-shrink-0 mx-4 w-auto" />

      {/* Footer - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 pt-3">
        {usage && !isPremium && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Daily Usage</span>
              <span>{usage.usedToday}/{usage.limit}</span>
            </div>
            <div className="h-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  usage.remaining <= 2 && usage.remaining > 0
                    ? 'bg-amber-500'
                    : usage.remaining === 0
                    ? 'bg-red-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (usage.usedToday / usage.limit) * 100)}%` }}
              />
            </div>
          </div>
        )}
        {isPremium && (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800">
            Premium
          </Badge>
        )}
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Bismillah hir Rahman nir Raheem
          {language !== 'en' && (
            <span className="ml-1 text-emerald-600 dark:text-emerald-400">
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
    <aside className="hidden md:flex w-[280px] border-r border-emerald-100 dark:border-emerald-900/50 bg-white dark:bg-background flex-col h-full overflow-hidden">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar() {
  const { sidebarOpen, setSidebarOpen } = useHidhayaStore();

  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetContent side="left" className="w-[280px] p-0 bg-white dark:bg-background">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <SidebarContent onClose={() => setSidebarOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
