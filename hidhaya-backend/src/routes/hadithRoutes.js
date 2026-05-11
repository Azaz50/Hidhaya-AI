const express = require("express");
const { searchHadith, getBook, getHadithById, getSuggestions } = require("../controllers/hadithController");

const router = express.Router();

// Search Hadith
router.get("/search", searchHadith);

// Get book (collection) by ID
router.get("/book/:bookId", getBook);

// Get specific Hadith by ID
router.get("/:id", getHadithById);

// Get search suggestions
router.get("/suggestions", getSuggestions);

module.exports = router;