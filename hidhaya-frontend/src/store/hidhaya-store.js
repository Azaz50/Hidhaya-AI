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

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    })),

  clearMessages: () =>
    set({
      messages: [],
      chatId: null,
    }),

  setMessages: (msgs) => set({ messages: msgs }),

  isLoading: false,

  setIsLoading: (loading) =>
    set({ isLoading: loading }),

  // ═══════════════════════════════════════════════════════
  // CHAT HISTORY
  // ═══════════════════════════════════════════════════════
  chatHistory: [],

  loadChatHistory: async () => {
    const state = get();
    const userId = state.user?._id;
    const guestId = typeof window !== 'undefined' ? localStorage.getItem('hidhaya_guest_id') : null;
    const token = typeof window !== 'undefined' ? localStorage.getItem('hidhaya_token') : null;

    if (!userId && !guestId) return;

    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const param = userId ? `userId=${userId}` : `guestId=${guestId}`;
      const res = await fetch(`${API_BASE}/api/chat/history?${param}`, { headers });
      const data = await res.json();
      set({ chatHistory: data.chats || [] });
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  },

  loadChat: async (chatIdToLoad) => {
    try {
      const state = get();
      const userId = state.user?._id;
      const guestId = typeof window !== 'undefined' ? localStorage.getItem('hidhaya_guest_id') : null;
      const token = typeof window !== 'undefined' ? localStorage.getItem('hidhaya_token') : null;

      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const param = userId ? `userId=${userId}` : (guestId ? `guestId=${guestId}` : '');

      const res = await fetch(`${API_BASE}/api/chat/${chatIdToLoad}${param ? '?' + param : ''}`, { headers });
      const chat = await res.json();

      if (chat._id) {
        const messages = [
          {
            id: crypto.randomUUID(),
            role: 'user',
            content: chat.query,
            timestamp: chat.createdAt
          },
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: chat.response,
            references: {
              quran: (chat.references || []).filter(r => r.type === 'quran'),
              hadith: (chat.references || []).filter(r => r.type === 'hadith')
            },
            timestamp: chat.createdAt
          }
        ];

        set({
          messages: messages,
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
      const state = get();
      const userId = state.user?._id;
      const guestId = typeof window !== 'undefined' ? localStorage.getItem('hidhaya_guest_id') : null;
      const token = typeof window !== 'undefined' ? localStorage.getItem('hidhaya_token') : null;

      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const param = userId ? `userId=${userId}` : (guestId ? `guestId=${guestId}` : '');

      await fetch(
        `${API_BASE}/api/chat/${chatIdToDelete}${param ? '?' + param : ''}`,
        {
          method: 'DELETE',
          headers,
        }
      );

      set((state) => ({
        chatHistory: state.chatHistory.filter(
          (chat) => chat._id !== chatIdToDelete
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

    // Restore user from localStorage if token exists
    const token = localStorage.getItem('hidhaya_token');
    const savedUserJson = localStorage.getItem('hidhaya_user');
    let restoredUser = null;

    if (token && savedUserJson) {
      try {
        restoredUser = JSON.parse(savedUserJson);
        set({ user: restoredUser });
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }

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

    // Use restoredUser from above instead of calling get()
    const userId = restoredUser?._id;

    // Build usage API query - use userId if logged in, otherwise guestId
    let usageQuery = '';
    if (userId) {
      usageQuery = `userId=${userId}`;
    } else {
      usageQuery = `guestId=${guestId}`;
    }

    // Load usage
    try {
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(
        `${API_BASE}/api/chat/usage?${usageQuery}`,
        { headers }
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

    // Load chat history after initialization
    if (userId) {
      set({ chatHistory: [] });
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      try {
        const res = await fetch(`${API_BASE}/api/chat/history?userId=${userId}`, { headers });
        const data = await res.json();
        set({ chatHistory: data.chats || [] });
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    } else if (guestId) {
      set({ chatHistory: [] });
      try {
        const res = await fetch(`${API_BASE}/api/chat/history?guestId=${guestId}`);
        const data = await res.json();
        set({ chatHistory: data.chats || [] });
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    }
  },
}));