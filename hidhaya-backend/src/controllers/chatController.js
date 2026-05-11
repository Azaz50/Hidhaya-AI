const { search, searchWithFilters, getStats } = require('../services/searchPipeline');
const { buildPrompt, buildStreamingPrompt, getFallbackMessage, generateResponseMetadata } = require('../services/promptGenerator');
const { processQuery } = require('../services/islamicSemanticEngine');
const { generateText, generateStreamText, getGeminiModel } = require('../config/gemini');
const Chat = require('../models/Chat');
const { client: redis } = require('../config/redis');
const crypto = require('crypto');

/**
 * Ask a question - Main chat endpoint
 */
exports.askQuestion = async (req, res) => {
  try {
    const { query, language = 'english', guestId } = req.body;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        message: "Query is required and must be at least 2 characters"
      });
    }

    const startTime = Date.now();

    // 1. Semantic Search for References
    const searchResult = search(query, language);
    const { results: references, confidence, searchMetadata } = searchResult;

    // 2. Build prompt and generate response
    let responseText;
    const prompt = buildPrompt(query, references, language, searchMetadata);

    try {
      responseText = await generateText(prompt);
    } catch (error) {
      console.error("Gemini API error:", error);

      // Fallback response if AI fails
      if (references.length > 0) {
        responseText = generateManualResponse(query, references, language);
      } else {
        responseText = getFallbackMessage(language);
      }
    }

    const processingTime = Date.now() - startTime;

    // 3. Prepare chat data
    const chatData = {
      query,
      response: responseText,
      language,
      references: references.map(r => ({
        type: r.type,
        text: r.text,
        source: r.source,
        english: r.english,
        urdu: r.urdu,
        grade: r.grade || ''
      })),
      metadata: {
        confidence,
        detectedConcepts: searchMetadata.detectedConcepts,
        detectedEmotion: searchMetadata.emotion,
        processingTime,
        matchLayers: references.map(r => r.matchLayer)
      }
    };

    // Assign user or guest ID
    if (req.user) {
      chatData.userId = req.user._id;
    } else {
      const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || 'unknown';
      chatData.guestId = guestId || crypto.createHash('md5').update(ip + Date.now()).digest('hex');
    }

    // 4. Save to database
    const newChat = await Chat.create(chatData);

    // 5. Cache search results for similar queries
    try {
      if (redis?.isOpen) {
        const cacheKey = `search:${crypto.createHash('md5').update(query.toLowerCase()).digest('hex')}`;
        await redis.setEx(cacheKey, 3600, JSON.stringify(searchResult));
      }
    } catch (cacheError) {
      console.warn("Redis cache error:", cacheError.message);
    }

    // 6. Return response
    res.json({
      _id: newChat._id,
      query: newChat.query,
      response: newChat.response,
      references: newChat.references,
      language: newChat.language,
      metadata: newChat.metadata,
      createdAt: newChat.createdAt,
      confidence,
      searchMetadata
    });

  } catch (error) {
    console.error("Ask question error:", error);
    res.status(500).json({
      message: "Server error while processing your question. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Stream response for real-time updates
 */
exports.askQuestionStream = async (req, res) => {
  try {
    const { query, language = 'english', guestId } = req.body;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ message: "Query is required" });
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Transfer-Encoding', 'chunked');

    // 1. Search for references
    const searchResult = search(query, language);
    const { results: references, confidence, searchMetadata } = searchResult;

    // Send initial search metadata
    res.write(`data: ${JSON.stringify({ type: 'search_start', searchMetadata })}\n\n`);

    // 2. Build prompt and generate streaming response
    const prompt = buildPrompt(query, references, language, searchMetadata);

    try {
      const stream = await generateStreamText(prompt);
      let fullResponse = '';

      for await (const chunk of stream) {
        const text = chunk.text();
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk.text() })}\n\n`);
      }

      // Send completion
      res.write(`data: ${JSON.stringify({
        type: 'complete',
        response: fullResponse,
        references,
        confidence
      })}\n\n`);

      // Save chat to database
      const chatData = {
        query,
        response: fullResponse,
        language,
        references: references.map(r => ({
          type: r.type,
          text: r.text,
          source: r.source,
          english: r.english,
          grade: r.grade || ''
        })),
        metadata: { confidence, detectedConcepts: searchMetadata.detectedConcepts }
      };

      if (req.user) {
        chatData.userId = req.user._id;
      } else {
        chatData.guestId = guestId || crypto.createHash('md5').update(Date.now().toString()).digest('hex');
      }

      await Chat.create(chatData);

    } catch (error) {
      console.error("Stream error:", error);
      res.write(`data: ${JSON.stringify({
        type: 'error',
        message: "Failed to generate response. Please try again."
      })}\n\n`);
    }

    res.end();

  } catch (error) {
    console.error("Stream endpoint error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get chat history
 */
exports.getChatHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, bookmarked, guestId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = {};

    if (req.user) {
      filter.userId = req.user._id;
    } else if (guestId) {
      filter.guestId = guestId;
    } else {
      return res.status(401).json({ message: "Authentication required for chat history" });
    }

    if (bookmarked === 'true') {
      filter.isBookmarked = true;
    }

    const chats = await Chat.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Chat.countDocuments(filter);

    res.json({
      chats,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total
    });

  } catch (error) {
    console.error("Get chat history error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get single chat
 */
exports.getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check ownership
    if (chat.userId && req.user && chat.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (chat.guestId && !req.user) {
      return res.status(403).json({ message: "Authentication required" });
    }

    res.json(chat);

  } catch (error) {
    console.error("Get chat error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Toggle bookmark
 */
exports.toggleBookmark = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (chat.userId && req.user && chat.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    chat.isBookmarked = !chat.isBookmarked;
    await chat.save();

    res.json({
      _id: chat._id,
      isBookmarked: chat.isBookmarked,
      message: chat.isBookmarked ? "Chat bookmarked" : "Bookmark removed"
    });

  } catch (error) {
    console.error("Toggle bookmark error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete chat
 */
exports.deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (chat.userId && req.user && chat.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Chat.deleteOne({ _id: req.params.id });

    res.json({ message: "Chat deleted successfully" });

  } catch (error) {
    console.error("Delete chat error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Regenerate response for existing chat
 */
exports.regenerateResponse = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (chat.userId && req.user && chat.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const startTime = Date.now();

    // Search again with the same query
    const searchResult = search(chat.query, chat.language);
    const { results: references, confidence, searchMetadata } = searchResult;

    // Build new prompt
    const prompt = buildPrompt(chat.query, references, chat.language, searchMetadata);

    let newResponse;
    try {
      newResponse = await generateText(prompt);
    } catch (error) {
      console.error("Regenerate error:", error);
      newResponse = generateManualResponse(chat.query, references, chat.language);
    }

    // Update chat
    chat.response = newResponse;
    chat.references = references.map(r => ({
      type: r.type,
      text: r.text,
      source: r.source,
      english: r.english,
      urdu: r.urdu,
      grade: r.grade || ''
    }));
    chat.metadata = {
      ...chat.metadata,
      confidence,
      regeneratedAt: new Date(),
      processingTime: Date.now() - startTime
    };

    await chat.save();

    res.json({
      _id: chat._id,
      query: chat.query,
      response: chat.response,
      references: chat.references,
      metadata: chat.metadata,
      confidence
    });

  } catch (error) {
    console.error("Regenerate response error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Search in chat history
 */
exports.searchHistory = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query required" });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const chats = await Chat.find({
      userId: req.user._id,
      $or: [
        { query: { $regex: q, $options: 'i' } },
        { response: { $regex: q, $options: 'i' } }
      ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Chat.countDocuments({
      userId: req.user._id,
      $or: [
        { query: { $regex: q, $options: 'i' } },
        { response: { $regex: q, $options: 'i' } }
      ]
    });

    res.json({
      chats,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total
    });

  } catch (error) {
    console.error("Search history error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get search statistics
 */
exports.getSearchStats = async (req, res) => {
  try {
    const stats = getStats();
    res.json(stats);
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get usage stats for user or guest
 */
exports.getUsage = async (req, res) => {
  try {
    const { userId, guestId } = req.query;
    console.log('getUsage called:', { userId, guestId });

    if (!userId && !guestId) {
      return res.status(400).json({ message: "userId or guestId is required" });
    }

    let filter = {};
    if (userId) {
      filter.userId = userId;
    } else if (guestId) {
      filter.guestId = guestId;
    }

    console.log('Querying with filter:', filter);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usedToday = await Chat.countDocuments({
      ...filter,
      createdAt: { $gte: today }
    });

    const totalChats = await Chat.countDocuments(filter);

    // Usage limits: Guest=10, Logged in free=20, Premium=unlimited
    let limit;
    if (req.user?.plan === 'premium') {
      limit = -1; // unlimited
    } else if (req.user) {
      limit = 20; // logged in free user
    } else {
      limit = 10; // guest user
    }
    const remaining = limit === -1 ? -1 : Math.max(0, limit - usedToday);

    res.json({
      usedToday,
      totalChats,
      limit,
      remaining,
      plan: req.user?.plan || 'free'
    });

  } catch (error) {
    console.error("Get usage error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Generate manual response when AI fails but references exist
 */
const generateManualResponse = (query, references, language) => {
  if (references.length === 0) {
    return getFallbackMessage(language);
  }

  // Simple response generator from references
  const langMessages = {
    english: "Based on the Quran and Hadith, here is guidance regarding your question:",
    hindi: "कुरान और हदीस के आधार पर, यहाँ आपके प्रश्न के बारे में मार्गदर्शन है:",
    urdu: "قرآن اور حدیث کی بنیاد پر، یہاں آپ کے سوال کے بارے میں ہدایت ہے:",
    bengali: "কুরআন এবং হাদিসের ভিত্তিতে, এখানে আপনার প্রশ্ন সম্পর্কে নির্দেশনা রয়েছে:"
  };

  let response = langMessages[language] || langMessages.english;

  references.slice(0, 3).forEach((ref, index) => {
    response += `\n\n[${index + 1}] ${ref.type === 'quran' ? 'Quran' : 'Hadith'}: ${ref.source}`;
    response += `\n${ref.english || ref.text}`;
  });

  response += "\n\nPlease consult a qualified Islamic scholar for detailed guidance.";

  return response;
};

module.exports = exports;