const express = require("express");
const { kidsChat, getTopics } = require("../controllers/kidsController");

const router = express.Router();

// Kids chat (simple responses)
router.post("/chat", kidsChat);

// Get available topics for kids
router.get("/topics", getTopics);

module.exports = router;