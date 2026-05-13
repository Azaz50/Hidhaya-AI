/**
 * Hidhaya AI Chat Controller
 */

const { search } = require('../services/advancedSearchPipeline');
const { buildPrompt, getFallbackMessage } = require('../services/promptGenerator');
const { generateText } = require('../config/gemini');
const Chat = require('../models/Chat');

const AI_TIMEOUT = 25000;

const withTimeout = (promise, timeoutMs) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), timeoutMs))
]);

// Format reference for response
const formatReferenceForResponse = (r) => {
  let source = r.source || '';
  if (!source) {
    if (r.type === 'quran') source = `Quran ${r.chapter}:${r.verse}`;
    else if (r.type === 'hadith') source = `${r.book} ${r.idInBook}`;
  }
  return { type: r.type, text: r.text || '', source, english: r.english || '', urdu: r.urdu || '', hindi: r.hindi || '', bengali: r.bengali || '', grade: r.grade || '' };
};

// Generate fallback response when AI fails
const generateManualFallback = (query, references, language) => {
  if (references.length === 0) return getFallbackMessage(language);
  const intros = { english: 'Al Salamu Alaikum! Here is what the Quran and Hadith teach about this topic:\n\n', hindi: 'अस्सलामु अलैकुम! कुरान और हदीस के अनुसार:\n\n', urdu: 'السلام علیکم! قرآن اور حدیث کے مطابق:\n\n', bengali: 'আসসালামু আলাইকুম! কুরআন ও হাদিস অনুসারে:\n\n' };
  let response = intros[language] || intros.english;
  references.slice(0, 3).forEach((ref, i) => {
    let src = ref.source || '';
    if (!src) src = ref.type === 'quran' ? `Quran ${ref.chapter || '?'}:${ref.verse || '?'}` : `${ref.book || 'Unknown'} ${ref.idInBook || ref.id || '?'}`;
    response += `[${i + 1}] ${ref.type === 'quran' ? 'Quran' : 'Hadith'} - ${src}\n${(ref.english || ref.urdu || ref.text || '').substring(0, 300)}\n\n`;
  });
  response += 'Please consult a qualified Islamic scholar for detailed guidance.';
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
      language,
      references: references.slice(0, 5).map(formatReferenceForResponse),
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
      streamText = generateManualFallback(searchQuery, references, language);
    }

    // Send complete response
    const completeData = { type: 'complete', response: streamText, confidence };
    res.write(`data: ${JSON.stringify(completeData)}\n\n`);

    // Save chat (don't fail the response if save fails)
    try {
      const chatTitle = searchQuery.length > 50 ? searchQuery.substring(0, 50) + '...' : searchQuery;
      const chatData = {
        query: searchQuery,
        response: streamText,
        title: chatTitle,
        language,
        references: references.slice(0, 5).map(formatReferenceForResponse),
        metadata: { confidence, detectedConcepts: searchMetadata.detectedConcepts || [] }
      };

      if (req.user) chatData.userId = req.user._id;
      else if (guestId) chatData.guestId = guestId;
      else chatData.guestId = `guest_${Date.now()}`;

      await Chat.create(chatData);
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
    chat.references = references.slice(0, 5).map(formatReferenceForResponse);
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [usedToday, totalChats] = await Promise.all([
      Chat.countDocuments({ ...filter, createdAt: { $gte: today } }),
      Chat.countDocuments(filter)
    ]);

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