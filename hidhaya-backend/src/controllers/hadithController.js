/**
 * Hadith Search Controller
 * Provides Hadith search, book, and suggestions APIs
 */

const fs = require('fs');
const path = require('path');
const Fuse = require('fuse.js');

// Full authentic Hadith collection names mapping
const HADITH_COLLECTION_NAMES = {
  'bukhari': 'Sahih al-Bukhari',
  'muslim': 'Sahih Muslim',
  'abudawud': 'Sunan Abu Dawood',
  'tirmidhi': 'Jami al-Tirmidhi',
  'nasai': 'Sunan al-Nasa\'i',
  'ibnmajah': 'Sunan Ibn Majah',
  'malik': 'Muwatta Imam Malik',
  'darimi': 'Sunan al-Darimi',
  'ahmed': 'Musnad Ahmad bin Hanbal',
  'mishkat_almasabih': 'Mishkat al-Masabih',
  'aladab_almufrad': 'Al-Adab al-Mufrad',
  'bulugh_almaram': 'Bulugh al-Maram',
  'nawawi40': 'Forty Hadith of Imam Nawawi',
  'qudsi40': 'Forty Hadith Qudsi',
  'riyad_assalihin': 'Riyad al-Salihin',
  'shahwaliullah40': 'Forty Hadith of Shah Waliullah',
  'shamail_muhammadiah': 'Shamail al-Muhammadiah',
  'shamail_muhammadiya': 'Shamail al-Muhammadiah'
};

// Load all Hadith data (cached in memory)
let hadithData = null;
let fuseIndex = null;

const HADITH_SOURCES = [
  'bukhari', 'muslim', 'ahmed', 'nasai', 'abudawud',
  'ibnmajah', 'aladab_almufrad', 'bulugh_almaram', 'malik',
  'mishkat_almasabih', 'nawawi40', 'qudsi40', 'riyad_assalihin',
  'shahwaliullah40', 'shamail_muhammadiah'
];

const loadHadithData = () => {
  if (hadithData) return hadithData;

  hadithData = [];
  const hadithDir = path.join(__dirname, '../data/hadith');

  for (const source of HADITH_SOURCES) {
    try {
      const filePath = path.join(hadithDir, `${source}.json`);
      if (fs.existsSync(filePath)) {
        const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        if (rawData.hadiths && Array.isArray(rawData.hadiths)) {
          for (const h of rawData.hadiths) {
            // Handle nested translation objects
            const englishText = h.english?.text || h.english || '';
            const englishNarrator = h.english?.narrator || '';
            const urduText = h.urdu?.text || '';
            const urduNarrator = h.urdu?.narrator || '';
            const hindiText = h.hindi?.text || '';
            const bengaliText = h.bengali?.text || '';

            hadithData.push({
              id: `${source}_${h.id}`,
              source,
              idInBook: h.idInBook || h.id || null,
              arabic: h.arabic || '',
              english: englishText,
              english: englishText,
              englishNarrator: englishNarrator,
              urdu: urduText,
              urduNarrator: urduNarrator,
              hindi: hindiText,
              bengali: bengaliText,
              narrator: englishNarrator || urduNarrator || '',
              chapterId: h.chapterId || '',
              bookId: h.bookId || '',
              searchText: [
                englishText, h.arabic, urduText, hindiText, englishNarrator, urduNarrator
              ].filter(Boolean).join(' ').toLowerCase()
            });
          }
          console.log(`Loaded ${rawData.hadiths.length} hadiths from ${source}`);
        }
      }
    } catch (err) {
      console.warn(`Error loading ${source}:`, err.message);
    }
  }

  // Create Fuse index for search
  fuseIndex = new Fuse(hadithData, {
    keys: ['searchText', 'narrator', 'english'],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 2
  });

  console.log(`Total loaded: ${hadithData.length} hadiths`);
  return hadithData;
};

// Search Hadith
exports.searchHadith = async (req, res) => {
  try {
    const { q, source, narrator, language = 'english', limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: "Search query is required (min 2 characters)" });
    }

    const data = loadHadithData();
    const query = q.toLowerCase().trim();

    let results = [];

    // Try exact match first
    results = data.filter(h => {
      const matchesQuery = h.searchText.includes(query);
      const matchesSource = !source || h.source === source;
      const matchesNarrator = !narrator || (h.narrator && h.narrator.toLowerCase().includes(narrator.toLowerCase()));
      return matchesQuery && matchesSource && matchesNarrator;
    }).slice(0, limit);

    // If no exact matches, use fuzzy search
    if (results.length === 0 && fuseIndex) {
      const fuzzyResults = fuseIndex.search(query, { limit: parseInt(limit) });
      results = fuzzyResults.map(r => r.item);
    }

    // Format response
    const formatHadith = (h) => {
      const collectionName = HADITH_COLLECTION_NAMES[h.source] || h.source;
      const hadithNum = h.idInBook || h.id || '?';

      const response = {
        id: h.id,
        source: h.source,
        collection: collectionName,
        reference: `${collectionName} — Hadith ${hadithNum}`,
        idInBook: h.idInBook || null,
        narrator: h.narrator || h.englishNarrator || '',
        arabic: h.arabic
      };

      switch (language) {
        case 'urdu':
          response.text = h.urdu || h.english;
          break;
        case 'hindi':
          response.text = h.hindi || h.english;
          break;
        case 'bengali':
          response.text = h.bengali || h.english;
          break;
        default:
          response.text = h.english;
      }

      if (h.chapterId) response.chapterId = h.chapterId;
      return response;
    };

    res.json({
      query: q,
      total: results.length,
      results: results.map(formatHadith)
    });

  } catch (error) {
    console.error("Hadith search error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get book (collection) by ID
exports.getBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { language = 'english', limit = 50, page = 1 } = req.query;

    const data = loadHadithData();
    const hadiths = data.filter(h => h.source === bookId);

    if (hadiths.length === 0) {
      return res.status(404).json({ message: "Book not found", availableSources: HADITH_SOURCES });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedHadiths = hadiths.slice(skip, skip + parseInt(limit));

    const formatHadith = (h) => ({
      id: h.id,
      narrator: h.narrator,
      arabic: h.arabic,
      text: language === 'urdu' ? (h.urdu || h.english) : h.english
    });

    res.json({
      book: bookId,
      total: hadiths.length,
      page: parseInt(page),
      pages: Math.ceil(hadiths.length / parseInt(limit)),
      hadiths: paginatedHadiths.map(formatHadith)
    });

  } catch (error) {
    console.error("Get book error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get specific Hadith by ID
exports.getHadithById = async (req, res) => {
  try {
    const { id } = req.params;
    const { language = 'english' } = req.query;

    const data = loadHadithData();
    const hadith = data.find(h => h.id === id);

    if (!hadith) {
      return res.status(404).json({ message: "Hadith not found" });
    }

    const response = {
      id: hadith.id,
      source: hadith.source,
      narrator: hadith.narrator,
      arabic: hadith.arabic
    };

    switch (language) {
      case 'urdu':
        response.text = hadith.urdu || hadith.english;
        break;
      case 'hindi':
        response.text = hadith.hindi || hadith.english;
        break;
      default:
        response.text = hadith.english;
    }

    if (hadith.chapter) response.chapter = hadith.chapter;

    res.json(response);

  } catch (error) {
    console.error("Get hadith error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get search suggestions
exports.getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 1) {
      return res.json({
        suggestions: [
          'sabr', 'patience', 'iman', 'faith', 'shirk', 'polytheism',
          'tawakkul', 'trust in Allah', 'forgiveness', 'niyyah', 'intention'
        ]
      });
    }

    const data = loadHadithData();
    const query = q.toLowerCase().trim();

    // Find narrators that match
    const narrators = new Set();
    const limitedData = data.slice(0, 1000);

    for (const h of limitedData) {
      if (h.narrator && h.narrator.toLowerCase().includes(query)) {
        narrators.add(h.narrator);
      }
    }

    res.json({
      query: q,
      suggestions: Array.from(narrators).slice(0, 10),
      availableSources: HADITH_SOURCES
    });

  } catch (error) {
    console.error("Get suggestions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};