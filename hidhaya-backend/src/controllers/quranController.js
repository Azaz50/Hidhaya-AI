/**
 * Quran Search Controller
 * Provides Quran search, surah, ayah, and suggestions APIs
 */

const fs = require('fs');
const path = require('path');
const Fuse = require('fuse.js');

// Load Quran data (cached in memory)
let quranData = null;
let fuseIndex = null;

const loadQuranData = () => {
  if (quranData) return quranData;

  const quranPath = path.join(__dirname, '../data/quran/quran.json');
  const rawData = JSON.parse(fs.readFileSync(quranPath, 'utf8'));

  // Convert to flat array with metadata
  quranData = [];
  for (const [surahNum, verses] of Object.entries(rawData)) {
    for (const verse of verses) {
      quranData.push({
        id: `${verse.chapter}:${verse.verse}`,
        chapter: parseInt(surahNum),
        verse: verse.verse,
        arabic: verse.text,
        english: verse.EnglishTarjuma || '',
        urdu: verse.UrduTarjuma || '',
        hindi: verse.HindiTarjuma || '',
        bengali: verse.BengaliTarjuma || '',
        romanUrdu: verse.RomanUrduTarjuma || '',
        // Search text combines all translations
        searchText: [
          verse.EnglishTarjuma,
          verse.UrduTarjuma,
          verse.HindiTarjuma,
          verse.BengaliTarjuma,
          verse.RomanUrduTarjuma
        ].filter(Boolean).join(' ').toLowerCase()
      });
    }
  }

  // Create Fuse.js index for search
  fuseIndex = new Fuse(quranData, {
    keys: ['searchText', 'arabic', 'english', 'urdu', 'hindi'],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 2
  });

  console.log(`Loaded ${quranData.length} Quran verses`);
  return quranData;
};

// Search Quran
exports.searchQuran = async (req, res) => {
  try {
    const { q, language = 'english', limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: "Search query is required (min 2 characters)" });
    }

    const data = loadQuranData();
    const query = q.toLowerCase().trim();

    let results = [];

    // Check if it's a reference-style query like "2:157" or "2 157" or "surah 2 ayah 157"
    const refMatch = query.match(/^(\d+)(?::|\s|_|\.)\s*(\d+)$/);
    if (refMatch) {
      const surahNum = parseInt(refMatch[1]);
      const ayahNum = parseInt(refMatch[2]);
      // Direct lookup by reference
      results = data.filter(v => v.chapter === surahNum && v.verse === ayahNum);
    }

    // Check if it's just a surah number (like "2" or "Al-Baqarah")
    const surahOnlyMatch = query.match(/^(\d+)$/);
    if (results.length === 0 && surahOnlyMatch) {
      const surahNum = parseInt(surahOnlyMatch[1]);
      if (surahNum >= 1 && surahNum <= 114) {
        results = data.filter(v => v.chapter === surahNum).slice(0, limit);
      }
    }

    // Check for common surah name keywords
    if (results.length === 0) {
      const surahNames = {
        'fatiha': 1, 'al-fatiha': 1, 'opener': 1,
        'baqarah': 2, 'al-baqarah': 2, 'cow': 2,
        ' Imran': 3, 'al-imran': 3, 'family': 3,
        'nisa': 4, 'al-nisa': 4, 'women': 4,
        'maida': 5, 'al-maida': 5, 'table': 5,
        'anaam': 6, 'al-anaam': 6, 'cattle': 6,
        'araf': 7, 'al-araf': 7, 'heights': 7,
        'anfal': 8, 'al-anfal': 8, 'spoils': 8,
        'taubah': 9, 'al-taubah': 9, 'repentance': 9,
        'yusuf': 12, 'yusuf': 12, 'joseph': 12,
        'kahf': 18, 'al-kahf': 18, 'cave': 18,
        ' Rahman': 55, 'al-rahman': 55, 'merciful': 55,
        'naas': 114, 'al-naas': 114, 'mankind': 114
      };

      for (const [name, num] of Object.entries(surahNames)) {
        if (query.includes(name)) {
          results = data.filter(v => v.chapter === num).slice(0, limit);
          break;
        }
      }
    }

    // If no reference match, try keyword search
    if (results.length === 0) {
      // First try exact match
      results = data.filter(v =>
        v.searchText.includes(query) ||
        v.arabic.includes(query)
      ).slice(0, limit);

      // If no exact matches, use fuzzy search
      if (results.length === 0 && fuseIndex) {
        const fuzzyResults = fuseIndex.search(query, { limit: parseInt(limit) });
        results = fuzzyResults.map(r => r.item);
      }
    }

    // Format response based on language
    const formatVerse = (verse) => {
      const response = {
        id: verse.id,
        chapter: verse.chapter,
        verse: verse.verse,
        arabic: verse.arabic
      };

      switch (language) {
        case 'urdu':
          response.translation = verse.urdu;
          break;
        case 'hindi':
          response.translation = verse.hindi;
          break;
        case 'bengali':
          response.translation = verse.bengali;
          break;
        case 'romanUrdu':
          response.translation = verse.romanUrdu;
          break;
        default:
          response.translation = verse.english;
      }

      return response;
    };

    res.json({
      query: q,
      total: results.length,
      results: results.map(formatVerse)
    });

  } catch (error) {
    console.error("Quran search error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Surah by ID
exports.getSurah = async (req, res) => {
  try {
    const { id } = req.params;
    const { language = 'english' } = req.query;
    const surahNum = parseInt(id);

    if (isNaN(surahNum) || surahNum < 1 || surahNum > 114) {
      return res.status(400).json({ message: "Invalid surah ID (1-114)" });
    }

    const data = loadQuranData();
    const surahVerses = data.filter(v => v.chapter === surahNum);

    if (surahVerses.length === 0) {
      return res.status(404).json({ message: "Surah not found" });
    }

    const formatVerse = (verse) => {
      const response = {
        verse: verse.verse,
        arabic: verse.arabic
      };

      switch (language) {
        case 'urdu':
          response.translation = verse.urdu;
          break;
        case 'hindi':
          response.translation = verse.hindi;
          break;
        case 'bengali':
          response.translation = verse.bengali;
          break;
        default:
          response.translation = verse.english;
      }

      return response;
    };

    res.json({
      surah: surahNum,
      totalVerses: surahVerses.length,
      verses: surahVerses.map(formatVerse)
    });

  } catch (error) {
    console.error("Get surah error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get specific Ayah
exports.getAyah = async (req, res) => {
  try {
    const { surah, ayah } = req.params;
    const { language = 'english' } = req.query;

    const surahNum = parseInt(surah);
    const ayahNum = parseInt(ayah);

    if (isNaN(surahNum) || surahNum < 1 || surahNum > 114) {
      return res.status(400).json({ message: "Invalid surah number (1-114)" });
    }

    if (isNaN(ayahNum) || ayahNum < 1) {
      return res.status(400).json({ message: "Invalid ayah number" });
    }

    const data = loadQuranData();
    const verse = data.find(v => v.chapter === surahNum && v.verse === ayahNum);

    if (!verse) {
      return res.status(404).json({ message: "Ayah not found" });
    }

    const response = {
      id: verse.id,
      chapter: verse.chapter,
      verse: verse.verse,
      arabic: verse.arabic
    };

    switch (language) {
      case 'urdu':
        response.translation = verse.urdu;
        break;
      case 'hindi':
        response.translation = verse.hindi;
        break;
      case 'bengali':
        response.translation = verse.bengali;
        break;
      default:
        response.translation = verse.english;
    }

    res.json(response);

  } catch (error) {
    console.error("Get ayah error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get search suggestions
exports.getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 1) {
      // Return default suggestions
      return res.json({
        suggestions: [
          'sabr', 'iman', 'shirk', 'tawakkul', 'forgiveness',
          'patience', 'prayer', 'zakat', 'hajj', 'quran'
        ]
      });
    }

    const data = loadQuranData();
    const query = q.toLowerCase().trim();

    // Find unique words from translations
    const words = new Set();
    const limitedData = data.slice(0, 500); // Check first 500 verses for performance

    for (const verse of limitedData) {
      const text = verse.searchText;
      const wordsArray = text.split(/\s+/).filter(w => w.includes(query));
      wordsArray.slice(0, 10).forEach(w => words.add(w));
    }

    res.json({
      query: q,
      suggestions: Array.from(words).slice(0, 10)
    });

  } catch (error) {
    console.error("Get suggestions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};