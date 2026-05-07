'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore, Language, AppMode, ActiveTab } from '@/lib/store';
import {
  MessageCircle, Book, BookOpen, Heart, Sparkles, Moon, Sun,
  Send, Search, Bookmark, BookmarkCheck, Copy, Check, Trash2,
  ChevronDown, Globe, Baby, GraduationCap, Menu, X, Star,
  AlertCircle, Loader2, Share2, Bot, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

// ─── Helper: generate unique IDs ─────────────────────────────────────────────
const uid = () => Math.random().toString(36).substring(2, 15);

// ─── Quick question suggestions ──────────────────────────────────────────────
const quickQuestions = [
  'How to control anger in Islam?',
  'What does Islam say about patience?',
  'Dua for forgiveness',
  'Importance of honesty in Islam',
  'How to seek forgiveness from Allah?',
  'What is Sabr in Islam?',
  'Dua for sadness and anxiety',
  'Rights of neighbors in Islam',
];

// ─── Component: Header ───────────────────────────────────────────────────────
function Header() {
  const { language, setLanguage, mode, setMode, isSidebarOpen, toggleSidebar } = useAppStore();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-3">
        {/* Mobile menu */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Logo & Title */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white">
            <Star className="h-4 w-4" />
          </div>
          <h1 className="text-lg font-bold tracking-tight hidden sm:block">
            Hidayah <span className="text-emerald-600">AI</span>
          </h1>
        </div>

        <div className="flex-1" />

        {/* Mode selector */}
        <div className="flex items-center gap-1.5">
          <Badge
            variant={mode === 'standard' ? 'default' : 'outline'}
            className={`cursor-pointer text-xs px-2 py-0.5 ${mode === 'standard' ? 'bg-emerald-600 hover:bg-emerald-700' : 'hover:bg-emerald-50 dark:hover:bg-emerald-950'}`}
            onClick={() => setMode('standard')}
          >
            Standard
          </Badge>
          <Badge
            variant={mode === 'beginner' ? 'default' : 'outline'}
            className={`cursor-pointer text-xs px-2 py-0.5 flex items-center gap-1 ${mode === 'beginner' ? 'bg-emerald-600 hover:bg-emerald-700' : 'hover:bg-emerald-50 dark:hover:bg-emerald-950'}`}
            onClick={() => setMode('beginner')}
          >
            <GraduationCap className="h-3 w-3" /> Beginner
          </Badge>
          <Badge
            variant={mode === 'kids' ? 'default' : 'outline'}
            className={`cursor-pointer text-xs px-2 py-0.5 flex items-center gap-1 ${mode === 'kids' ? 'bg-emerald-600 hover:bg-emerald-700' : 'hover:bg-emerald-50 dark:hover:bg-emerald-950'}`}
            onClick={() => setMode('kids')}
          >
            <Baby className="h-3 w-3" /> Kids
          </Badge>
        </div>

        {/* Language selector */}
        <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <Globe className="h-3.5 w-3.5 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="English">English</SelectItem>
            <SelectItem value="Hindi">हिन्दी</SelectItem>
            <SelectItem value="Urdu">اردو</SelectItem>
            <SelectItem value="Bengali">বাংলা</SelectItem>
            <SelectItem value="Roman Urdu">Roman Urdu</SelectItem>
          </SelectContent>
        </Select>

        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </header>
  );
}

// ─── Component: Tab Navigation ────────────────────────────────────────────────
function TabNavigation() {
  const { activeTab, setActiveTab } = useAppStore();

  const tabs: Array<{ id: ActiveTab; label: string; icon: React.ReactNode }> = [
    { id: 'chat', label: 'Chat', icon: <MessageCircle className="h-4 w-4" /> },
    { id: 'quran', label: 'Quran', icon: <Book className="h-4 w-4" /> },
    { id: 'hadith', label: 'Hadith', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'duas', label: 'Duas', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'bookmarks', label: 'Saved', icon: <Heart className="h-4 w-4" /> },
    { id: 'daily', label: 'Daily', icon: <Star className="h-4 w-4" /> },
  ];

  return (
    <div className="border-b bg-muted/30">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ActiveTab)}>
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-10">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="relative h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 sm:px-4 text-xs sm:text-sm flex items-center gap-1.5"
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

// ─── Component: Reference Card ────────────────────────────────────────────────
function QuranRefCard({ quranRef, language }: { quranRef: { chapter: number; verse: number; text: string; translation: string }; language: string }) {
  const [copied, setCopied] = useState(false);
  const { addBookmark } = useAppStore();
  const { toast } = useToast();

  const copyText = () => {
    navigator.clipboard.writeText(`Quran ${quranRef.chapter}:${quranRef.verse}\n\n${quranRef.text}\n\n${quranRef.translation}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveBookmark = () => {
    addBookmark({
      id: uid(),
      type: 'quran',
      reference: `${quranRef.chapter}:${quranRef.verse}`,
      content: `${quranRef.text}\n\n${quranRef.translation}`,
      metadata: { chapter: quranRef.chapter, verse: quranRef.verse },
      createdAt: new Date().toISOString(),
    });
    toast({ title: 'Bookmarked!', description: `Quran ${quranRef.chapter}:${quranRef.verse} saved.` });
  };

  return (
    <Card className="mb-3 border-l-4 border-l-emerald-500">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 shrink-0">
            Quran {quranRef.chapter}:{quranRef.verse}
          </Badge>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={saveBookmark}>
              <Bookmark className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyText}>
              {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </div>
        <p className="text-right mt-2 text-lg font-arabic leading-loose" dir="rtl">{quranRef.text}</p>
        <p className="mt-2 text-sm text-muted-foreground">{quranRef.translation}</p>
      </CardContent>
    </Card>
  );
}

function HadithRefCard({ hadithRef }: { hadithRef: { id: number; book: string; text: string; narrator: string } }) {
  const [copied, setCopied] = useState(false);
  const { addBookmark } = useAppStore();
  const { toast } = useToast();

  const copyText = () => {
    navigator.clipboard.writeText(`${hadithRef.book}, Hadith #${hadithRef.id}\n${hadithRef.narrator}\n\n${hadithRef.text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveBookmark = () => {
    addBookmark({
      id: uid(),
      type: 'hadith',
      reference: `${hadithRef.book} #${hadithRef.id}`,
      content: hadithRef.text,
      metadata: { id: hadithRef.id, book: hadithRef.book },
      createdAt: new Date().toISOString(),
    });
    toast({ title: 'Bookmarked!', description: `Hadith saved.` });
  };

  return (
    <Card className="mb-3 border-l-4 border-l-amber-500">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              {hadithRef.book} #{hadithRef.id}
            </Badge>
            {hadithRef.narrator && (
              <p className="text-xs text-muted-foreground mt-1">{hadithRef.narrator}</p>
            )}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={saveBookmark}>
              <Bookmark className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyText}>
              {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </div>
        <p className="mt-2 text-sm">{hadithRef.text}</p>
      </CardContent>
    </Card>
  );
}

// ─── Component: Chat Message ──────────────────────────────────────────────────
function ChatMessageBubble({ msg }: { msg: ReturnType<typeof useAppStore.getState>['chatMessages'][0] }) {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
          <Bot className="h-4 w-4 text-emerald-600" />
        </div>
      )}
      <div className={`max-w-[80%] ${isUser ? 'order-1' : ''}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            isUser
              ? 'bg-emerald-600 text-white rounded-br-md'
              : 'bg-muted rounded-bl-md'
          }`}
        >
          {msg.isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Searching Islamic sources...</span>
            </div>
          ) : isUser ? (
            <p>{msg.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* References */}
        {!isUser && !msg.isLoading && (
          <>
            {msg.quranReferences && msg.quranReferences.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-semibold text-emerald-600 mb-1.5 flex items-center gap-1">
                  <Book className="h-3 w-3" /> Quran References
                </p>
                {msg.quranReferences.map((qRef, i) => (
                  <QuranRefCard key={i} quranRef={qRef} language="English" />
                ))}
              </div>
            )}
            {msg.hadithReferences && msg.hadithReferences.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-semibold text-amber-600 mb-1.5 flex items-center gap-1">
                  <BookOpen className="h-3 w-3" /> Hadith References
                </p>
                {msg.hadithReferences.map((hRef, i) => (
                  <HadithRefCard key={i} hadithRef={hRef} />
                ))}
              </div>
            )}
            {msg.duaReferences && msg.duaReferences.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-semibold text-purple-600 mb-1.5 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Dua References
                </p>
                {msg.duaReferences.map((dRef, i) => (
                  <Card key={i} className="mb-2 border-l-4 border-l-purple-500">
                    <CardContent className="p-3">
                      <p className="font-semibold text-sm">{dRef.title}</p>
                      <p className="text-right mt-1 text-lg leading-loose" dir="rtl">{dRef.arabic}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{dRef.translation}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
}

// ─── Component: Chat Panel ────────────────────────────────────────────────────
function ChatPanel() {
  const { chatMessages, addChatMessage, updateChatMessage, language, mode, clearChat } = useAppStore();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  const sendMessage = async (question?: string) => {
    const q = question || input.trim();
    if (!q || isSending) return;

    setIsSending(true);
    setInput('');

    // Add user message
    const userMsgId = uid();
    addChatMessage({
      id: userMsgId,
      role: 'user',
      content: q,
      timestamp: Date.now(),
    });

    // Add loading message
    const botMsgId = uid();
    addChatMessage({
      id: botMsgId,
      role: 'assistant',
      content: '',
      isLoading: true,
      timestamp: Date.now(),
    });

    scrollToBottom();

    try {
      // Build chat history for context
      const chatHistory = chatMessages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          language,
          mode,
          chatHistory,
        }),
      });

      const data = await res.json();

      if (data.error) {
        updateChatMessage(botMsgId, {
          content: `I apologize, but I encountered an error: ${data.error}. Please try again.`,
          isLoading: false,
        });
      } else {
        updateChatMessage(botMsgId, {
          content: data.answer,
          quranReferences: data.quranReferences,
          hadithReferences: data.hadithReferences,
          duaReferences: data.duaReferences,
          isLoading: false,
        });
      }
    } catch (error) {
      updateChatMessage(botMsgId, {
        content: 'I apologize, but I encountered a network error. Please check your connection and try again.',
        isLoading: false,
      });
    }

    setIsSending(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1">
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-4">
              <Star className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold mb-1">As-salamu Alaykum!</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-md">
              Ask any question about Islam and I will answer using authentic Quran verses and Hadith references.
            </p>

            {/* Disclaimer */}
            <div className="flex items-center gap-2 mb-6 px-4 py-2 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                AI can make mistakes. Verify important matters with qualified scholars.
              </p>
            </div>

            {/* Quick questions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
              {quickQuestions.map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="text-xs h-auto py-2 px-3 justify-start text-left hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-emerald-950 dark:hover:border-emerald-700"
                  onClick={() => sendMessage(q)}
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
        )}

        {chatMessages.map((msg) => (
          <ChatMessageBubble key={msg.id} msg={msg} />
        ))}
      </div>

      {/* Input area */}
      <div className="border-t p-3 bg-background">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <div className="flex-1 flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask about Islam..."
              className="flex-1"
              disabled={isSending}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isSending}
              className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {chatMessages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearChat}
              className="shrink-0"
              title="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Component: Quran Search Panel ────────────────────────────────────────────
function QuranSearchPanel() {
  const { language } = useAppStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{
    chapter: number;
    verse: number;
    text: string;
    translation: string;
    reference: string;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/quran/search?q=${encodeURIComponent(query)}&language=${language}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    }
    setIsSearching(false);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
          <Book className="h-5 w-5 text-emerald-600" /> Quran Search
        </h2>
        <p className="text-sm text-muted-foreground">
          Search the Holy Quran by keyword, topic, or phrase in {language}
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="Search Quran... e.g., mercy, patience, prayer"
          className="flex-1"
        />
        <Button onClick={search} disabled={isSearching} className="bg-emerald-600 hover:bg-emerald-700">
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {results.length === 0 && query && !isSearching && (
        <p className="text-center text-muted-foreground py-8">No results found. Try a different search term.</p>
      )}

      {results.map((r, i) => (
        <QuranRefCard
          key={i}
          quranRef={{ chapter: r.chapter, verse: r.verse, text: r.text, translation: r.translation }}
          language={language}
        />
      ))}
    </div>
  );
}

// ─── Component: Hadith Search Panel ───────────────────────────────────────────
function HadithSearchPanel() {
  const { language } = useAppStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{
    id: number;
    bookName: string;
    chapterName: string;
    arabic: string;
    text: string;
    narrator: string;
    reference: string;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/hadith/search?q=${encodeURIComponent(query)}&language=${language}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    }
    setIsSearching(false);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-amber-600" /> Hadith Search
        </h2>
        <p className="text-sm text-muted-foreground">
          Search authentic Hadith collections — Bukhari, Muslim, and more
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="Search Hadith... e.g., patience, charity, prayer"
          className="flex-1"
        />
        <Button onClick={search} disabled={isSearching} className="bg-amber-600 hover:bg-amber-700">
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {results.length === 0 && query && !isSearching && (
        <p className="text-center text-muted-foreground py-8">No results found. Try a different search term.</p>
      )}

      {results.map((r, i) => (
        <HadithRefCard key={i} hadithRef={{ id: r.id, book: r.bookName, text: r.text, narrator: r.narrator }} />
      ))}
    </div>
  );
}

// ─── Component: Duas Panel ────────────────────────────────────────────────────
function DuasPanel() {
  const { language } = useAppStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{
    id: number;
    title: string;
    titleArabic: string;
    arabic: string;
    translation: string;
    reference: string;
    category: string;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { addBookmark } = useAppStore();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const search = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/duas/search?q=${encodeURIComponent(query)}&language=${language}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    }
    setIsSearching(false);
  };

  const copyDua = (dua: typeof results[0]) => {
    navigator.clipboard.writeText(`${dua.title}\n\n${dua.arabic}\n\n${dua.translation}\n\n${dua.reference}`);
    setCopiedId(dua.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const saveDua = (dua: typeof results[0]) => {
    addBookmark({
      id: uid(),
      type: 'chat',
      reference: dua.reference,
      content: `${dua.title}\n${dua.arabic}\n${dua.translation}`,
      createdAt: new Date().toISOString(),
    });
    toast({ title: 'Bookmarked!', description: `${dua.title} saved.` });
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" /> Duas & Supplications
        </h2>
        <p className="text-sm text-muted-foreground">
          Search for duas by topic, category, or keyword
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="Search duas... e.g., forgiveness, patience, guidance"
          className="flex-1"
        />
        <Button onClick={search} disabled={isSearching} className="bg-purple-600 hover:bg-purple-700">
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {/* Category quick buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['forgiveness', 'patience', 'guidance', 'anger', 'sadness', 'daily'].map((cat) => (
          <Badge
            key={cat}
            variant="outline"
            className="cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950 capitalize"
            onClick={() => { setQuery(cat); setTimeout(() => search(), 100); }}
          >
            {cat}
          </Badge>
        ))}
      </div>

      {results.length === 0 && query && !isSearching && (
        <p className="text-center text-muted-foreground py-8">No duas found. Try a different search term.</p>
      )}

      {results.map((dua) => (
        <Card key={dua.id} className="mb-3 border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-sm">{dua.title}</h3>
                <p className="text-xs text-muted-foreground">{dua.titleArabic}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => saveDua(dua)}>
                  <Bookmark className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyDua(dua)}>
                  {copiedId === dua.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
            <p className="text-right text-lg leading-loose" dir="rtl">{dua.arabic}</p>
            <p className="mt-2 text-sm text-muted-foreground">{dua.translation}</p>
            <Badge variant="secondary" className="mt-2 text-xs">{dua.reference}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Component: Bookmarks Panel ───────────────────────────────────────────────
function BookmarksPanel() {
  const { bookmarks, removeBookmark } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch bookmarks from API
    fetch('/api/bookmarks')
      .then((res) => res.json())
      .then((data) => {
        if (data.bookmarks) {
          useAppStore.getState().setBookmarks(data.bookmarks);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const deleteBookmark = async (id: string) => {
    removeBookmark(id);
    try {
      await fetch('/api/bookmarks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch {}
  };

  const typeIcons = {
    quran: <Book className="h-4 w-4 text-emerald-600" />,
    hadith: <BookOpen className="h-4 w-4 text-amber-600" />,
    chat: <MessageCircle className="h-4 w-4 text-purple-600" />,
  };

  const typeColors = {
    quran: 'border-l-emerald-500',
    hadith: 'border-l-amber-500',
    chat: 'border-l-purple-500',
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
          <Heart className="h-5 w-5 text-rose-600" /> Saved Items
        </h2>
        <p className="text-sm text-muted-foreground">
          Your bookmarked Quran verses, Hadith, and Duas
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && bookmarks.length === 0 && (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No saved items yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Bookmark Quran verses, Hadith, or chat responses to save them here.
          </p>
        </div>
      )}

      {bookmarks.map((bm) => (
        <Card key={bm.id} className={`mb-3 border-l-4 ${typeColors[bm.type]}`}>
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {typeIcons[bm.type]}
                <Badge variant="secondary" className="text-xs capitalize">{bm.type}</Badge>
                <span className="text-xs text-muted-foreground">{bm.reference}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive hover:text-destructive"
                onClick={() => deleteBookmark(bm.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <p className="mt-2 text-sm line-clamp-3">{bm.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Component: Daily Feed Panel ──────────────────────────────────────────────
function DailyFeedPanel() {
  const { language } = useAppStore();
  const [feed, setFeed] = useState<{
    verse: { text: string; translation: string; reference: string };
    hadith: { text: string; narrator: string; reference: string; book: string };
    dua: { arabic: string; translation: string; reference: string };
    reminder: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/daily-feed')
      .then((res) => res.json())
      .then(setFeed)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!feed) return null;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500" /> Daily Islamic Feed
        </h2>
        <p className="text-sm text-muted-foreground">
          Your daily dose of Islamic inspiration
        </p>
      </div>

      {/* Verse of the day */}
      <Card className="mb-4 border-emerald-200 dark:border-emerald-800 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <Book className="h-4 w-4" /> Verse of the Day
          </h3>
        </div>
        <CardContent className="p-4">
          <p className="text-right text-xl leading-loose" dir="rtl">{feed.verse.text}</p>
          <p className="mt-3 text-sm text-muted-foreground">{feed.verse.translation}</p>
          <Badge variant="secondary" className="mt-2 text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
            {feed.verse.reference}
          </Badge>
        </CardContent>
      </Card>

      {/* Hadith of the day */}
      <Card className="mb-4 border-amber-200 dark:border-amber-800 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Hadith of the Day
          </h3>
        </div>
        <CardContent className="p-4">
          {feed.hadith.narrator && (
            <p className="text-xs text-muted-foreground mb-1">{feed.hadith.narrator}</p>
          )}
          <p className="text-sm">{feed.hadith.text}</p>
          <Badge variant="secondary" className="mt-2 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            {feed.hadith.reference}
          </Badge>
        </CardContent>
      </Card>

      {/* Dua of the day */}
      <Card className="mb-4 border-purple-200 dark:border-purple-800 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Dua of the Day
          </h3>
        </div>
        <CardContent className="p-4">
          <p className="text-right text-xl leading-loose" dir="rtl">{feed.dua.arabic}</p>
          <p className="mt-3 text-sm text-muted-foreground">{feed.dua.translation}</p>
          <Badge variant="secondary" className="mt-2 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            {feed.dua.reference}
          </Badge>
        </CardContent>
      </Card>

      {/* Sunnah Reminder */}
      <Card className="border-rose-200 dark:border-rose-800 overflow-hidden">
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 p-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <Heart className="h-4 w-4" /> Sunnah Reminder
          </h3>
        </div>
        <CardContent className="p-4">
          <p className="text-sm">{feed.reminder}</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Mobile Sidebar ───────────────────────────────────────────────────────────
function MobileSidebar() {
  const { isSidebarOpen, toggleSidebar, setActiveTab } = useAppStore();

  if (!isSidebarOpen) return null;

  const tabs: Array<{ id: ActiveTab; label: string; icon: React.ReactNode }> = [
    { id: 'chat', label: 'Chat', icon: <MessageCircle className="h-5 w-5" /> },
    { id: 'quran', label: 'Quran Search', icon: <Book className="h-5 w-5" /> },
    { id: 'hadith', label: 'Hadith Search', icon: <BookOpen className="h-5 w-5" /> },
    { id: 'duas', label: 'Duas', icon: <Sparkles className="h-5 w-5" /> },
    { id: 'bookmarks', label: 'Saved', icon: <Heart className="h-5 w-5" /> },
    { id: 'daily', label: 'Daily Feed', icon: <Star className="h-5 w-5" /> },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={toggleSidebar} />
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-background border-r shadow-lg md:hidden">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
              <Star className="h-4 w-4 text-white" />
            </div>
            <h2 className="font-bold">Hidayah AI</h2>
          </div>
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors"
                onClick={() => {
                  setActiveTab(tab.id);
                  toggleSidebar();
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const { activeTab } = useAppStore();

  const renderPanel = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatPanel />;
      case 'quran':
        return <QuranSearchPanel />;
      case 'hadith':
        return <HadithSearchPanel />;
      case 'duas':
        return <DuasPanel />;
      case 'bookmarks':
        return <BookmarksPanel />;
      case 'daily':
        return <DailyFeedPanel />;
      default:
        return <ChatPanel />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <MobileSidebar />
      <TabNavigation />
      <main className="flex-1 flex flex-col overflow-hidden">
        {renderPanel()}
      </main>
      <footer className="border-t py-3 px-4 text-center">
        <p className="text-xs text-muted-foreground">
          Hidayah AI — AI can make mistakes. Verify important matters with qualified scholars.
        </p>
      </footer>
    </div>
  );
}
