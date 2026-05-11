const express = require("express");
const { searchQuran, getSurah, getAyah, getSuggestions } = require("../controllers/quranController");

const router = express.Router();

// Search Quran
router.get("/search", searchQuran);

// Get Surah by ID
router.get("/surah/:id", getSurah);

// Get specific Ayah
router.get("/ayah/:surah/:ayah", getAyah);

// Get search suggestions
router.get("/suggestions", getSuggestions);

module.exports = router;