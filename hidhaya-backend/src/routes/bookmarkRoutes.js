const express = require("express");
const { addBookmark, getBookmarks, deleteBookmark } = require("../controllers/bookmarkController");
const { auth, optionalAuth } = require("../middleware/auth");

const router = express.Router();

// Add bookmark (auth optional - guests can also bookmark)
router.post("/", optionalAuth, addBookmark);

// Get bookmarks (auth optional)
router.get("/", optionalAuth, getBookmarks);

// Delete bookmark (auth optional)
router.delete("/:id", optionalAuth, deleteBookmark);

module.exports = router;