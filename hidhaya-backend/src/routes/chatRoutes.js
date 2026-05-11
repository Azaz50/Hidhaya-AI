const express = require("express");
const {
  askQuestion,
  askQuestionStream,
  getChatHistory,
  getChat,
  toggleBookmark,
  deleteChat,
  regenerateResponse,
  searchHistory,
  getSearchStats,
  getUsage
} = require("../controllers/chatController");
const { auth, optionalAuth } = require("../middleware/auth");
const { rateLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// Main chat endpoint (also handles /api/chat)
router.post("/ask", optionalAuth, rateLimiter, askQuestion);

// Also mount askQuestion at / for backwards compatibility with frontend calling /api/chat
router.post("/", optionalAuth, rateLimiter, askQuestion);

// Streaming endpoint for real-time responses
router.post("/ask/stream", optionalAuth, rateLimiter, askQuestionStream);

// Get chat history (supports both user and guest)
router.get("/history", optionalAuth, getChatHistory);

// Search in chat history (requires authentication)
router.get("/history/search", auth, searchHistory);

// Get single chat (requires authentication)
router.get("/:id", auth, getChat);

// Toggle bookmark (requires authentication)
router.patch("/:id/bookmark", auth, toggleBookmark);

// Delete chat (requires authentication)
router.delete("/:id", auth, deleteChat);

// Regenerate response (requires authentication)
router.post("/:id/regenerate", auth, rateLimiter, regenerateResponse);

// Search statistics (for debugging, requires authentication)
router.get("/stats/search", auth, getSearchStats);

// Usage stats (supports both user and guest)
router.get("/usage", optionalAuth, getUsage);

module.exports = router;