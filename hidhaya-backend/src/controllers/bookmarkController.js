/**
 * Bookmark Controller
 * Handles bookmarking Quran verses and Hadiths
 */

const Bookmark = require('../models/Bookmark');
const crypto = require('crypto');

// Add bookmark
exports.addBookmark = async (req, res) => {
  try {
    const { type, reference, text, translation, language = 'english' } = req.body;
    const { guestId } = req.query;

    if (!type || !reference) {
      return res.status(400).json({ message: "Type and reference are required" });
    }

    if (!['quran', 'hadith'].includes(type)) {
      return res.status(400).json({ message: "Type must be 'quran' or 'hadith'" });
    }

    const bookmarkData = {
      type,
      reference, // e.g., "2:255" for Quran or "bukhari:123" for Hadith
      text: text || '',
      translation: translation || '',
      language
    };

    if (req.user && !req.user.isGuest) {
      bookmarkData.userId = req.user._id;
    } else if (guestId) {
      bookmarkData.guestId = guestId;
    } else {
      // Generate anonymous guest ID
      bookmarkData.guestId = crypto.randomBytes(8).toString('hex');
    }

    const bookmark = await Bookmark.create(bookmarkData);

    res.status(201).json({
      _id: bookmark._id,
      type: bookmark.type,
      reference: bookmark.reference,
      text: bookmark.text,
      translation: bookmark.translation,
      createdAt: bookmark.createdAt
    });

  } catch (error) {
    console.error("Add bookmark error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get bookmarks
exports.getBookmarks = async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const { guestId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = {};

    if (req.user && !req.user.isGuest) {
      filter.userId = req.user._id;
    } else if (guestId) {
      filter.guestId = guestId;
    } else {
      return res.status(400).json({ message: "Authentication required or guestId needed" });
    }

    if (type) {
      filter.type = type;
    }

    const bookmarks = await Bookmark.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Bookmark.countDocuments(filter);

    res.json({
      bookmarks,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total
    });

  } catch (error) {
    console.error("Get bookmarks error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete bookmark
exports.deleteBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const { guestId } = req.query;

    const bookmark = await Bookmark.findById(id);

    if (!bookmark) {
      return res.status(404).json({ message: "Bookmark not found" });
    }

    // Check ownership
    if (req.user && !req.user.isGuest) {
      if (bookmark.userId && bookmark.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    } else if (guestId) {
      if (bookmark.guestId !== guestId) {
        return res.status(403).json({ message: "Access denied" });
      }
    } else {
      return res.status(401).json({ message: "Authentication required" });
    }

    await Bookmark.findByIdAndDelete(id);

    res.json({ message: "Bookmark deleted successfully" });

  } catch (error) {
    console.error("Delete bookmark error:", error);
    res.status(500).json({ message: "Server error" });
  }
};