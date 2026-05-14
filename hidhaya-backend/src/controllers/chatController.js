/**
 * Hidhaya AI Chat Controller
 */

const { search } = require('../services/advancedSearchPipeline');
const { buildPrompt, getFallbackMessage, formatReferencesForResponse, getNormalizedLanguage, HADITH_COLLECTION_NAMES } = require('../services/promptGenerator');
const { generateText } = require('../config/gemini');
const Chat = require('../models/Chat');

const AI_TIMEOUT = 25000;

const withTimeout = (promise, timeoutMs) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), timeoutMs))
]);

// Format reference for response - select text based on language
const formatReferenceForResponse = (r, language) => {
  const normalizedLang = getNormalizedLanguage(language);

  let source = r.source || '';
  if (!source) {
    if (r.type === 'quran') {
      source = `Quran ${r.chapter}:${r.verse}`;
    } else if (r.type === 'hadith') {
      // Use proper collection name and idInBook for Hadith number
      const bookName = HADITH_COLLECTION_NAMES[r.book] || r.book;
      const hadithNum = r.idInBook || r.id || '?';
      source = `${bookName} — Hadith ${hadithNum}`;
    }
  }

  // Select primary text based on language
  let text = '';
  switch (normalizedLang) {
    case 'hindi': text = r.hindi || r.english || ''; break;
    case 'urdu': text = r.urdu || r.english || ''; break;
    case 'bengali': text = r.bengali || r.english || ''; break;
    case 'roman_urdu': text = r.romanUrdu || r.english || ''; break;
    default: text = r.english || '';
  }

  return {
    type: r.type,
    text: text,
    source,
    reference: source,
    english: r.english || '',
    urdu: r.urdu || '',
    hindi: r.hindi || '',
    bengali: r.bengali || '',
    romanUrdu: r.romanUrdu || '',
    grade: r.grade || ''
  };
};

// Generate fallback response when AI fails
const generateManualFallback = (query, references, language) => {
  const normalizedLang = getNormalizedLanguage(language);

  if (references.length === 0) return getFallbackMessage(language);

  // Map language codes to full intros
  const intros = {
    english: 'Al Salamu Alaikum! Here is what the Quran and Hadith teach about this topic:\n\n',
    hindi: 'अस्सलामु अलैकुम! कुरान और हदीस के अनुसार इस विषय पर:\n\n',
    urdu: 'السلام علیکم! قرآن اور حدیث کے مطابق اس موضوع پر:\n\n',
    bengali: 'আসসালামু আলাইকুম! কুরআন ও হাদিস অনুসারে এই বিষয়ে:\n\n',
    roman_urdu: 'Al Salamu Alaikum! Quran aur Hadith ke mutabiq is topic par:\n\n'
  };

  const closings = {
    english: 'Please consult a qualified Islamic scholar for detailed guidance.',
    hindi: 'कृपया विस्तृत मार्गदर्शन के लिए किसी योग्य इस्लामिक विद्वान से परामर्श करें।',
    urdu: 'براہ کرم تفصیلی رہنمائی کے لئے کسی اہل علم سے مشورہ کریں۔',
    bengali: 'অনুগ্রহ করে বিস্তারিত guidance-এর জন্য একজন যোগ্য আলেমের সাথে পরামর্শ করুন।',
    roman_urdu: 'Please ek qualified Islamic scholar se guidance lein.'
  };

  let response = intros[normalizedLang] || intros.english;

  references.slice(0, 3).forEach((ref, i) => {
    let src = ref.source || '';
    if (!src) {
      if (ref.type === 'quran') {
        src = `Quran ${ref.chapter || '?'}:${ref.verse || '?'}`;
      } else {
        // Use proper Hadith collection name and idInBook
        const bookName = HADITH_COLLECTION_NAMES[ref.book] || ref.book || 'Unknown';
        const hadithNum = ref.idInBook || ref.id || '?';
        src = `${bookName} — Hadith ${hadithNum}`;
      }
    }

    // Get translation in selected language
    let text = '';
    switch (normalizedLang) {
      case 'hindi': text = ref.hindi || ref.english || ''; break;
      case 'urdu': text = ref.urdu || ref.english || ''; break;
      case 'bengali': text = ref.bengali || ref.english || ''; break;
      case 'roman_urdu': text = ref.romanUrdu || ref.english || ''; break;
      default: text = ref.english || '';
    }

    response += `[${i + 1}] ${ref.type === 'quran' ? 'Quran' : 'Hadith'} - ${src}\n${text.substring(0, 300)}\n\n`;
  });

  response += closings[normalizedLang] || closings.english;
  return response;
};

// ============================================================
// MAIN ASK QUESTION ENDPOINT (NON-STREAMING)
// ============================================================
exports.askQuestion = async (req, res) => {
  try {
    const { query, question, language = 'english', guestId } = req.body;
    const searchQuery = query || question;

    if (!searchQuery || searchQuery.trim().length < 2) {
      return res.status(400).json({ message: 'Query must be at least 2 characters' });
    }

    const { results: references, confidence, searchMetadata } = await search(searchQuery, language);
    const prompt = buildPrompt(searchQuery, references, language, searchMetadata);

    let responseText;
    try {
      responseText = await withTimeout(generateText(prompt), AI_TIMEOUT);
    } catch (error) {
      responseText = generateManualFallback(searchQuery, references, language);
    }

    const chatData = {
      query: searchQuery,
      response: responseText,
      title: searchQuery.length > 50 ? searchQuery.substring(0, 50) + '...' : searchQuery,
      language: getNormalizedLanguage(language),
      references: references.slice(0, 5).map(r => formatReferenceForResponse(r, language)),
      metadata: { confidence, detectedConcepts: searchMetadata.detectedConcepts || [] }
    };
    if (req.user) chatData.userId = req.user._id;
    else chatData.guestId = guestId || `guest_${Date.now()}`;

    const savedChat = await Chat.create(chatData);
    res.json({ ...savedChat.toObject(), references: savedChat.references });

  } catch (error) {
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ============================================================
// STREAMING ENDPOINT
// ============================================================
exports.askQuestionStream = async (req, res) => {
  const timeoutMs = 30000;
  let timeoutId = null;

  const clearResponseTimeout = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  timeoutId = setTimeout(() => {
    if (!res.writableEnded) {
      res.write(`data: {"type":"error","message":"Request timed out"}\n\n`);
      res.end();
    }
  }, timeoutMs);

  try {
    const { query, question, language = 'english', guestId } = req.body;
    const searchQuery = query || question;

    if (!searchQuery || searchQuery.trim().length < 2) {
      clearResponseTimeout();
      return res.status(400).json({ message: 'Query must be at least 2 characters' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Search for references
    const { results: references, confidence, searchMetadata } = await search(searchQuery, language);
    const searchData = { type: 'search_complete', references: references.slice(0, 3) };
    res.write(`data: ${JSON.stringify(searchData)}\n\n`);

    // Generate response
    let streamText;
    try {
      streamText = await withTimeout(generateText(buildPrompt(searchQuery, references, language, searchMetadata)), AI_TIMEOUT);
    } catch (err) {
      console.error('AI generation failed, using fallback:', err.message);
      try {
        streamText = generateManualFallback(searchQuery, references, language);
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr.message);
        streamText = getFallbackMessage(language);
      }
    }

    // Send complete response
    const completeData = { type: 'complete', response: streamText, confidence };
    res.write(`data: ${JSON.stringify(completeData)}\n\n`);

    // Save chat (don't fail the response if save fails)
    try {
      const normalizedLanguage = getNormalizedLanguage(language);
      const { chatId } = req.body;
      let savedChat;

      if (chatId) {
        // Continue existing chat - append messages
        savedChat = await Chat.findById(chatId);
        if (savedChat) {
          savedChat.messages.push({
            role: 'user',
            content: searchQuery,
            timestamp: new Date()
          });
          savedChat.messages.push({
            role: 'assistant',
            content: streamText,
            references: references.slice(0, 5).map(r => formatReferenceForResponse(r, language)),
            timestamp: new Date()
          });
          if (!savedChat.title) {
            savedChat.title = searchQuery.length > 50 ? searchQuery.substring(0, 50) + '...' : searchQuery;
          }
          savedChat.metadata = { confidence, detectedConcepts: searchMetadata.detectedConcepts || [] };
          await savedChat.save();
        }
      }

      // Create new chat if no existing one
      if (!savedChat) {
        const chatTitle = searchQuery.length > 50 ? searchQuery.substring(0, 50) + '...' : searchQuery;
        const chatData = {
          title: chatTitle,
          language: normalizedLanguage,
          messages: [
            { role: 'user', content: searchQuery, timestamp: new Date() },
            { role: 'assistant', content: streamText, references: references.slice(0, 5).map(r => formatReferenceForResponse(r, language)), timestamp: new Date() }
          ],
          metadata: { confidence, detectedConcepts: searchMetadata.detectedConcepts || [] }
        };

        if (req.user) chatData.userId = req.user._id;
        else if (guestId) chatData.guestId = guestId;
        else chatData.guestId = `guest_${Date.now()}`;

        savedChat = await Chat.create(chatData);
      }

      // Send back the chatId
      const chatIdData = { type: 'chat_id', chatId: savedChat._id.toString() };
      res.write(`data: ${JSON.stringify(chatIdData)}\n\n`);

    } catch (saveErr) {
      console.error('Chat save error (non-fatal):', saveErr.message);
    }

    clearResponseTimeout();
    res.end();

  } catch (error) {
    clearResponseTimeout();
    if (!res.writableEnded) {
      res.write(`data: {"type":"error","message":"Failed to generate response"}\n\n`);
    }
    res.end();
  }
};

// ============================================================
// CHAT HISTORY
// ============================================================
exports.getChatHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, guestId } = req.query;
    const filter = req.user ? { userId: req.user._id } : (guestId ? { guestId } : {});

    const chats = await Chat.find(filter).sort({ createdAt: -1 }).skip((parseInt(page) - 1) * parseInt(limit)).limit(parseInt(limit));
    const total = await Chat.countDocuments(filter);

    res.json({ chats, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), total });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================================
// GET SINGLE CHAT
// ============================================================
exports.getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    // Check user access
    if (chat.userId) {
      if (!req.user || chat.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (chat.guestId) {
      // For guest chats, verify guestId matches
      const requestedGuestId = req.query.guestId || req.body.guestId;
      if (chat.guestId !== requestedGuestId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================================
// TOGGLE BOOKMARK
// ============================================================
exports.toggleBookmark = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    if (chat.userId && req.user && chat.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    chat.isBookmarked = !chat.isBookmarked;
    await chat.save();
    res.json({ _id: chat._id, isBookmarked: chat.isBookmarked });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================================
// DELETE CHAT
// ============================================================
exports.deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    // Check user access
    if (chat.userId) {
      if (!req.user || chat.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (chat.guestId) {
      // For guest chats, verify guestId matches
      const requestedGuestId = req.query.guestId || req.body.guestId;
      if (chat.guestId !== requestedGuestId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    await Chat.deleteOne({ _id: req.params.id });
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================================
// REGENERATE RESPONSE
// ============================================================
exports.regenerateResponse = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    if (chat.userId && req.user && chat.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { results: references, confidence, searchMetadata } = await search(chat.query, chat.language);
    const prompt = buildPrompt(chat.query, references, chat.language, searchMetadata);

    let newResponse;
    try {
      newResponse = await withTimeout(generateText(prompt), AI_TIMEOUT);
    } catch (error) {
      newResponse = generateManualFallback(chat.query, references, chat.language);
    }

    chat.response = newResponse;
    chat.references = references.slice(0, 5).map(r => formatReferenceForResponse(r, chat.language));
    chat.metadata = { ...chat.metadata, confidence, regeneratedAt: new Date() };
    await chat.save();

    res.json({ _id: chat._id, query: chat.query, response: chat.response, references: chat.references });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================================
// USAGE STATS
// ============================================================
exports.getUsage = async (req, res) => {
  try {
    const { userId, guestId } = req.query;
    if (!userId && !guestId) return res.status(400).json({ message: 'userId or guestId required' });

    const filter = userId ? { userId } : { guestId };

    // Count user messages (each question = 1 usage)
    const chats = await Chat.find(filter);
    let usedToday = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    chats.forEach(chat => {
      const userMessages = (chat.messages || []).filter(m => m.role === 'user');
      const chatDate = new Date(chat.createdAt);
      chatDate.setHours(0, 0, 0, 0);
      if (chatDate.getTime() >= today.getTime()) {
        usedToday += userMessages.length;
      }
    });

    const totalChats = chats.length;
    let limit = req.user?.plan === 'premium' ? -1 : (req.user ? 20 : 10);
    const remaining = limit === -1 ? -1 : Math.max(0, limit - usedToday);

    res.json({ usedToday, totalChats, limit, remaining, plan: req.user?.plan || 'free' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================================
// SEARCH HISTORY
// ============================================================
exports.searchHistory = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    if (!q) return res.status(400).json({ message: 'Search query required' });
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = { userId: req.user._id, $or: [{ query: { $regex: q, $options: 'i' } }, { response: { $regex: q, $options: 'i' } }] };

    const [chats, total] = await Promise.all([
      Chat.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Chat.countDocuments(filter)
    ]);

    res.json({ chats, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), total });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================================
// SEARCH STATS
// ============================================================
exports.getSearchStats = async (req, res) => {
  res.json({ status: 'ok', message: 'Search stats endpoint' });
};

module.exports = exports;