import { create } from 'zustand';

export type Language = 'English' | 'Hindi' | 'Urdu' | 'Bengali' | 'Roman Urdu';
export type AppMode = 'standard' | 'beginner' | 'kids';
export type ActiveTab = 'chat' | 'quran' | 'hadith' | 'duas' | 'bookmarks' | 'daily';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  quranReferences?: Array<{
    chapter: number;
    verse: number;
    text: string;
    translation: string;
  }>;
  hadithReferences?: Array<{
    id: number;
    book: string;
    text: string;
    narrator: string;
  }>;
  duaReferences?: Array<{
    title: string;
    arabic: string;
    translation: string;
  }>;
  isLoading?: boolean;
  timestamp: number;
}

export interface BookmarkItem {
  id: string;
  type: 'quran' | 'hadith' | 'chat';
  reference: string;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

interface AppState {
  language: Language;
  mode: AppMode;
  activeTab: ActiveTab;
  chatMessages: ChatMessage[];
  bookmarks: BookmarkItem[];
  isSidebarOpen: boolean;

  setLanguage: (lang: Language) => void;
  setMode: (mode: AppMode) => void;
  setActiveTab: (tab: ActiveTab) => void;
  addChatMessage: (msg: ChatMessage) => void;
  updateChatMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearChat: () => void;
  addBookmark: (item: BookmarkItem) => void;
  removeBookmark: (id: string) => void;
  setBookmarks: (items: BookmarkItem[]) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: 'English',
  mode: 'standard',
  activeTab: 'chat',
  chatMessages: [],
  bookmarks: [],
  isSidebarOpen: false,

  setLanguage: (lang) => set({ language: lang }),
  setMode: (mode) => set({ mode }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  addChatMessage: (msg) =>
    set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
  updateChatMessage: (id, updates) =>
    set((state) => ({
      chatMessages: state.chatMessages.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),
  clearChat: () => set({ chatMessages: [] }),
  addBookmark: (item) =>
    set((state) => ({ bookmarks: [item, ...state.bookmarks] })),
  removeBookmark: (id) =>
    set((state) => ({
      bookmarks: state.bookmarks.filter((b) => b.id !== id),
    })),
  setBookmarks: (items) => set({ bookmarks: items }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
