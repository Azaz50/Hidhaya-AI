import { create } from 'zustand';

import {
  applyTheme,
  getSavedTheme,
} from '@/themes/theme-utils';

const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useHidhayaStore = create((set, get) => ({
  // ═══════════════════════════════════════════════════════
  // ACTIVE VIEW
  // ═══════════════════════════════════════════════════════
  activeView: 'chat',

  setActiveView: (view) =>
    set({ activeView: view }),

  // ═══════════════════════════════════════════════════════
  // SIDEBAR
  // ═══════════════════════════════════════════════════════
  sidebarOpen: false,

  setSidebarOpen: (open) =>
    set({ sidebarOpen: open }),

  // ═══════════════════════════════════════════════════════
  // THEME
  // ═══════════════════════════════════════════════════════
  theme: getSavedTheme(),

  setTheme: (themeId) => {
    applyTheme(themeId);
    set({ theme: themeId });
  },

  // ═══════════════════════════════════════════════════════
  // AUTH
  // ═══════════════════════════════════════════════════════
  user: null,

  setUser: (user) =>
    set({ user }),

  showAuthDialog: false,

  setShowAuthDialog: (show) =>
    set({ showAuthDialog: show }),

  // ═══════════════════════════════════════════════════════
  // PREMIUM
  // ═══════════════════════════════════════════════════════
  showPremiumPopup: false,

  setShowPremiumPopup: (show) =>
    set({ showPremiumPopup: show }),

  // ═══════════════════════════════════════════════════════
  // USAGE
  // ═══════════════════════════════════════════════════════
  usage: null,

  setUsage: (usage) =>
    set({ usage }),

  limitReached: false,

  setLimitReached: (reached) =>
    set({ limitReached: reached }),

  // ═══════════════════════════════════════════════════════
  // CHAT
  // ═══════════════════════════════════════════════════════
  messages: [],

  chatId: null,

  setChatId: (id) =>
    set({ chatId: id }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  clearMessages: () =>
    set({
      messages: [],
      chatId: null,
    }),

  isLoading: false,

  setIsLoading: (loading) =>
    set({ isLoading: loading }),

  // ═══════════════════════════════════════════════════════
  // CHAT HISTORY
  // ═══════════════════════════════════════════════════════
  chatHistory: [],

  loadChatHistory: async () => {
    const state = get();

    const userId = state.user?.id;

    const guestId =
      typeof window !== 'undefined'
        ? localStorage.getItem('hidhaya_guest_id')
        : null;

    if (!userId && !guestId) return;

    try {
      const param = userId
        ? `userId=${userId}`
        : `guestId=${guestId}`;

      const res = await fetch(
        `${API_BASE}/api/chat/history?${param}`
      );

      const data = await res.json();

      set({
        chatHistory: data.chats || [],
      });
    } catch (error) {
      console.error(
        'Failed to load chat history:',
        error
      );
    }
  },

  loadChat: async (chatIdToLoad) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/chat/${chatIdToLoad}`
      );

      const data = await res.json();

      if (data.messages) {
        set({
          messages: data.messages,
          chatId: chatIdToLoad,
          activeView: 'chat',
        });
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
    }
  },

  deleteChat: async (chatIdToDelete) => {
    try {
      await fetch(
        `${API_BASE}/api/chat/${chatIdToDelete}`,
        {
          method: 'DELETE',
        }
      );

      set((state) => ({
        chatHistory: state.chatHistory.filter(
          (chat) => chat.id !== chatIdToDelete
        ),

        ...(state.chatId === chatIdToDelete
          ? {
              messages: [],
              chatId: null,
            }
          : {}),
      }));
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  },

  startNewChat: () => {
    set({
      messages: [],
      chatId: null,
      activeView: 'chat',
      limitReached: false,
    });
  },

  // ═══════════════════════════════════════════════════════
  // LANGUAGE
  // ═══════════════════════════════════════════════════════
  language:
    typeof window !== 'undefined'
      ? localStorage.getItem('hidhaya_language') || 'en'
      : 'en',

  setLanguage: (lang) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'hidhaya_language',
        lang
      );
    }

    set({ language: lang });
  },

  // ═══════════════════════════════════════════════════════
  // SEARCH
  // ═══════════════════════════════════════════════════════
  searchQuery: '',

  setSearchQuery: (query) =>
    set({ searchQuery: query }),

  // ═══════════════════════════════════════════════════════
  // INITIALIZE
  // ═══════════════════════════════════════════════════════
  initialize: async () => {
    // Apply saved theme
    const savedTheme = getSavedTheme();

    applyTheme(savedTheme);

    set({
      theme: savedTheme,
    });

    // Guest ID setup
    let guestId =
      typeof window !== 'undefined'
        ? localStorage.getItem('hidhaya_guest_id')
        : null;

    if (!guestId) {
      guestId = crypto.randomUUID();

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'hidhaya_guest_id',
          guestId
        );
      }
    }

    // Load usage
    try {
      const res = await fetch(
        `${API_BASE}/api/chat/usage?guestId=${guestId}`
      );

      const data = await res.json();

      if (data.usedToday !== undefined) {
        set({
          usage: data,
        });
      }
    } catch (error) {
      console.error(
        'Failed to load usage:',
        error
      );

      set({
        usage: {
          usedToday: 0,
          limit: 10,
          remaining: 10,
          isGuest: true,
        },
      });
    }
  },
}));