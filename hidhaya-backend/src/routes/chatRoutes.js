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

const router = express.Router();

// Main chat endpoints - optimized for speed (no rate limiter since Redis not available)
router.post("/ask", optionalAuth, askQuestion);
router.post("/", optionalAuth, askQuestion);

// Streaming endpoint
router.post("/ask/stream", optionalAuth, askQuestionStream);

// Get chat history
router.get("/history", optionalAuth, getChatHistory);

// Search in chat history
router.get("/history/search", auth, searchHistory);

// Usage stats
router.get("/usage", optionalAuth, getUsage);

// Get single chat
router.get("/:id", optionalAuth, getChat);

// Toggle bookmark
router.put("/:id/bookmark", auth, toggleBookmark);

// Delete chat
router.delete("/:id", optionalAuth, deleteChat);

// Regenerate response
router.post("/:id/regenerate", auth, regenerateResponse);

// Search stats (public)
router.get("/stats", getSearchStats);

module.exports = router;