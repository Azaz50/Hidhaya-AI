/**
 * Enhanced 4-Layer Islamic Search Pipeline
 * Layer 1: Exact Matching
 * Layer 2: Relaxed Word Matching
 * Layer 3: Semantic Topic Expansion
 * Layer 4: Fuzzy Matching
 */

const fs = require('fs');
const path = require('path');
const Fuse = require('fuse.js');
const {
  processQuery,
  normalizeQuery,
  detectConcepts,
  expandQueryWithConcepts,
  islamicConcepts
} = require('./islamicSemanticEngine');

let documents = [];
let fuseIndex = null;
let categoryIndex = null;

// Configuration
const SEARCH_CONFIG = {
  exactMatchLimit: 5,
  relaxedMatchLimit: 5,
  semanticMatchLimit: 10,
  fuzzyMatchLimit: 5,
  minScoreThreshold: 0.6,
  confidenceThreshold: {
    high: 0.7,
    medium: 0.4,
    low: 0.2
  }
};

// Hadith book sources
const HADITH_SOURCES = [
  'bukhari', 'muslim', 'ahmed', 'nasai', 'abudawud',
  'ibnmajah', 'aladab_almufrad', 'bulugh_almaram', 'malik',
  'mishkat_almasabih', 'nawawi40', 'qudsi40', 'riyad_assalihin',
  'shahwaliullah40', 'shamail_muhammadiyah'
];

/**
 * Load all Quran and Hadith data
 */
const loadAllData = () => {
  try {
    // 1. Load Quran Data
    const quranPath = path.join(__dirname, '../data/quran/quran.json');
    if (fs.existsSync(quranPath)) {
      const quranData = JSON.parse(fs.readFileSync(quranPath, 'utf8'));
      for (const chapterKey in quranData) {
        const verses = quranData[chapterKey];
        if (Array.isArray(verses)) {
          verses.forEach(verse => {
            documents.push({
              type: 'quran',
              text: verse.text || '',
              english: verse.EnglishTarjuma || '',
              urdu: verse.UrduTarjuma || '',
              hindi: verse.HindiTarjuma || '',
              bengali: verse.BengaliTarjuma || '',
              romanUrdu: verse.RomanUrduTarjuma || '',
              source: `Quran ${verse.chapter}:${verse.verse}`,
              chapter: verse.chapter,
              verse: verse.verse,
              topics: extractTopics(verse.EnglishTarjuma || '')
            });
          });
        }
      }
      console.log(`✅ Loaded Quran data. Total documents: ${documents.length}`);
    }

    // 2. Load all Hadith data
    const hadithDir = path.join(__dirname, '../data/hadith');
    HADITH_SOURCES.forEach(source => {
      const hadithPath = path.join(hadithDir, `${source}.json`);
      if (fs.existsSync(hadithPath)) {
        try {
          const hadithData = JSON.parse(fs.readFileSync(hadithPath, 'utf8'));
          loadHadithSource(hadithData, source);
        } catch (e) {
          if (fs.existsSync(hadithPath) && fs.statSync(hadithPath).size > 0) {
            console.warn(`Warning: Could not load ${source}: ${e.message}`);
          }
        }
      }
    });

    console.log(`✅ Loaded all Hadith data. Total documents: ${documents.length}`);

    // 3. Initialize Fuse.js indices
    initializeSearchIndices();

    console.log('✅ Islamic Search Engine initialized successfully');
  } catch (error) {
    console.error('Error initializing search engine:', error);
  }
};

/**
 * Load hadith from a specific source
 */
const loadHadithSource = (data, sourceName) => {
  let hadiths = [];

  // Handle different data structures
  if (Array.isArray(data)) {
    hadiths = data;
  } else if (data.hadiths && Array.isArray(data.hadiths)) {
    hadiths = data.hadiths;
  } else if (typeof data === 'object') {
    // Try to find hadiths array in any property
    for (const key of Object.keys(data)) {
      if (Array.isArray(data[key])) {
        hadiths = data[key];
        break;
      }
    }
  }

  hadiths.forEach((hadith, index) => {
    const englishText = hadith.english?.text || hadith.english || '';
    const urduText = hadith.urdu?.text || hadith.urdu || '';
    const arabicText = hadith.arabic || '';

    documents.push({
      type: 'hadith',
      text: arabicText,
      english: englishText,
      urdu: urduText,
      hindi: hadith.hindi || '',
      bengali: hadith.bengali || '',
      romanUrdu: hadith.romanUrdu || '',
      source: formatSource(sourceName, hadith),
      book: sourceName,
      idInBook: hadith.idInBook || hadith.id || index + 1,
      chapter: hadith.chapter || hadith.bookId || '',
      grade: hadith.grade || hadith.authenticity || '',
      topics: extractTopics(englishText + ' ' + urduText)
    });
  });

  console.log(`  - Loaded ${hadiths.length} hadiths from ${sourceName}`);
};

/**
 * Format hadith source string
 */
const formatSource = (source, hadith) => {
  const bookNames = {
    'bukhari': 'Sahih Bukhari',
    'muslim': 'Sahih Muslim',
    'ahmed': 'Musnad Ahmad',
    'nasai': 'Sunan An-Nasai',
    'abudawud': 'Sunan Abu Dawud',
    'ibnmajah': 'Sunan Ibn Majah',
    'aladab_almufrad': 'Al-Adab Al-Mufrad',
    'bulugh_almaram': 'Bulugh al-Maram',
    'malik': 'Muwatta Malik',
    'mishkat_almasabih': 'Mishkat al-Masabih',
    'nawawi40': 'Forty Nawawi',
    'qudsi40': 'Forty Qudsi',
    'riyad_assalihin': 'Riyad as-Salihin',
    'shahwaliullah40': 'Shah Waliullah',
    'shamail_muhammadiyah': 'Shamail Muhammadiyah'
  };

  const bookName = bookNames[source] || source;
  const hadithId = hadith.idInBook || hadith.id || '';

  return hadithId ? `${bookName}, Hadith ${hadithId}` : bookName;
};

/**
 * Extract topics/concepts from text
 */
const extractTopics = (text) => {
  const topics = [];
  const lowerText = text.toLowerCase();

  for (const [conceptKey, concept] of Object.entries(islamicConcepts)) {
    // Check if any synonym appears in text
    for (const synonym of concept.synonyms) {
      if (lowerText.includes(synonym.toLowerCase())) {
        topics.push(conceptKey);
        topics.push(concept.topic);
        break;
      }
    }
  }

  return topics;
};

/**
 * Initialize search indices
 */
const initializeSearchIndices = () => {
  // Main search index
  const searchOptions = {
    includeScore: true,
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 2,
    keys: [
      { name: 'english', weight: 0.35 },
      { name: 'urdu', weight: 0.2 },
      { name: 'hindi', weight: 0.15 },
      { name: 'text', weight: 0.15 },
      { name: 'topics', weight: 0.15 }
    ]
  };

  fuseIndex = new Fuse(documents, searchOptions);

  // Category index for topic-based search
  const categoryOptions = {
    includeScore: true,
    threshold: 0.3,
    ignoreLocation: true,
    keys: [
      { name: 'topics', weight: 0.8 },
      { name: 'source', weight: 0.2 }
    ]
  };

  categoryIndex = new Fuse(documents, categoryOptions);
};

/**
 * Layer 1: Exact Match - Find direct phrase matches
 */
const exactMatch = (query, limit = SEARCH_CONFIG.exactMatchLimit) => {
  const normalizedQuery = normalizeQuery(query).toLowerCase();

  const results = documents.filter(doc => {
    const englishLower = (doc.english || '').toLowerCase();
    const urduLower = (doc.urdu || '').toLowerCase();
    const textLower = (doc.text || '').toLowerCase();

    return englishLower.includes(normalizedQuery) ||
           urduLower.includes(normalizedQuery) ||
           textLower.includes(normalizedQuery);
  });

  return results.slice(0, limit).map(doc => ({
    ...doc,
    matchLayer: 'exact',
    confidence: 1.0
  }));
};

/**
 * Layer 2: Relaxed Match - Partial word matching
 */
const relaxedMatch = (query, limit = SEARCH_CONFIG.relaxedMatchLimit) => {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery || !fuseIndex) return [];

  const results = fuseIndex.search(normalizedQuery, { limit: limit * 2 });

  return results
    .filter(result => result.score > 0.1 && result.score < 0.4)
    .slice(0, limit)
    .map(result => ({
      ...result.item,
      matchLayer: 'relaxed',
      confidence: Math.max(0, 1 - result.score)
    }));
};

/**
 * Layer 3: Semantic Expansion - Using topic maps
 */
const semanticMatch = (query, detectedConcepts, limit = SEARCH_CONFIG.semanticMatchLimit) => {
  if (!categoryIndex) return [];

  let searchTerms = [query];

  // Add concepts and their expansions
  detectedConcepts.forEach(conceptKey => {
    const concept = islamicConcepts[conceptKey];
    if (concept) {
      searchTerms.push(concept.topic);
      searchTerms.push(...concept.synonyms);
    }
  });

  // Search with expanded terms
  const allResults = [];
  const seen = new Set();

  for (const term of searchTerms) {
    const results = categoryIndex.search(term, { limit: limit });
    results.forEach(result => {
      const key = `${result.item.type}-${result.item.source}`;
      if (!seen.has(key)) {
        seen.add(key);
        allResults.push({
          ...result.item,
          matchLayer: 'semantic',
          matchTerm: term,
          confidence: Math.max(0, 0.8 - result.score)
        });
      }
    });
  }

  // Sort by confidence and limit
  return allResults
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
};

/**
 * Layer 4: Fuzzy Match - Handle typos and misspellings
 */
const fuzzyMatch = (query, limit = SEARCH_CONFIG.fuzzyMatchLimit) => {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery || !fuseIndex) return [];

  // Create a more lenient Fuse index for fuzzy search
  const fuzzyOptions = {
    includeScore: true,
    threshold: 0.6, // Higher threshold for fuzzy
    ignoreLocation: true,
    minMatchCharLength: 1,
    keys: [
      { name: 'english', weight: 0.4 },
      { name: 'urdu', weight: 0.3 },
      { name: 'text', weight: 0.3 }
    ]
  };

  const fuzzyFuse = new Fuse(documents, fuzzyOptions);
  const results = fuzzyFuse.search(normalizedQuery, { limit: limit * 2 });

  return results
    .filter(result => result.score > 0.2)
    .slice(0, limit)
    .map(result => ({
      ...result.item,
      matchLayer: 'fuzzy',
      confidence: Math.max(0, 0.6 - result.score)
    }));
};

/**
 * Aggregate and rank results from all layers
 */
const aggregateResults = (exactResults, relaxedResults, semanticResults, fuzzyResults) => {
  const resultMap = new Map();
  const allResults = [
    ...exactResults.map(r => ({ ...r, priority: 1 })),
    ...relaxedResults.map(r => ({ ...r, priority: 2 })),
    ...semanticResults.map(r => ({ ...r, priority: 3 })),
    ...fuzzyResults.map(r => ({ ...r, priority: 4 }))
  ];

  // Deduplicate and boost confidence for matches from multiple layers
  allResults.forEach(result => {
    const key = `${result.type}-${result.source}`;
    const existing = resultMap.get(key);

    if (existing) {
      // Boost confidence and add layer info
      existing.confidence = Math.min(1, existing.confidence + 0.1);
      existing.matchLayers = existing.matchLayers || [existing.matchLayer];
      existing.matchLayers.push(result.matchLayer);
    } else {
      resultMap.set(key, {
        ...result,
        matchLayers: [result.matchLayer]
      });
    }
  });

  // Sort by priority then confidence
  return Array.from(resultMap.values())
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.confidence - a.confidence;
    });
};

/**
 * Calculate overall confidence level
 */
const calculateConfidenceLevel = (results) => {
  if (results.length === 0) return 'none';

  const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
  const topConfidence = results[0].confidence;

  if (topConfidence >= SEARCH_CONFIG.confidenceThreshold.high) return 'high';
  if (avgConfidence >= SEARCH_CONFIG.confidenceThreshold.medium) return 'medium';
  if (avgConfidence >= SEARCH_CONFIG.confidenceThreshold.low) return 'low';
  return 'none';
};

/**
 * Main search function - 4-layer pipeline
 */
const search = (query, language = 'english') => {
  if (!query || !documents.length) {
    return {
      results: [],
      confidence: 'none',
      searchMetadata: {
        query,
        detectedConcepts: [],
        expandedQuery: ''
      }
    };
  }

  // Process query for semantic understanding
  const processedQuery = processQuery(query, language);

  // Layer 1: Exact Match
  const exactResults = exactMatch(query);

  // Layer 2: Relaxed Match
  const relaxedResults = relaxedMatch(query);

  // Layer 3: Semantic Expansion
  const semanticResults = semanticMatch(
    processedQuery.expandedQuery,
    processedQuery.detectedConcepts
  );

  // Layer 4: Fuzzy Match (only if other layers didn't find much)
  const fuzzyResults = exactResults.length < 2 || relaxedResults.length < 2
    ? fuzzyMatch(query)
    : [];

  // Aggregate results
  const aggregatedResults = aggregateResults(
    exactResults,
    relaxedResults,
    semanticResults,
    fuzzyResults
  );

  // Calculate confidence
  const confidence = calculateConfidenceLevel(aggregatedResults);

  // Limit final results
  const finalResults = aggregatedResults.slice(0, 10);

  return {
    results: finalResults,
    confidence,
    searchMetadata: {
      query,
      normalizedQuery: processedQuery.normalizedQuery,
      detectedConcepts: processedQuery.detectedConcepts,
      detectedLanguage: processedQuery.detectedLanguage,
      emotion: processedQuery.emotion,
      expandedQuery: processedQuery.expandedQuery,
      totalDocuments: documents.length,
      layerStats: {
        exact: exactResults.length,
        relaxed: relaxedResults.length,
        semantic: semanticResults.length,
        fuzzy: fuzzyResults.length
      }
    }
  };
};

/**
 * Search with specific filters
 */
const searchWithFilters = (query, language = 'english', filters = {}) => {
  const { types = ['quran', 'hadith'], books = [], chapters = [] } = filters;

  const result = search(query, language);

  let filteredResults = result.results.filter(doc => {
    if (!types.includes(doc.type)) return false;
    if (books.length > 0 && !books.includes(doc.book)) return false;
    if (chapters.length > 0 && doc.chapter && !chapters.includes(doc.chapter)) return false;
    return true;
  });

  return {
    ...result,
    results: filteredResults
  };
};

/**
 * Get statistics about loaded data
 */
const getStats = () => {
  const quranCount = documents.filter(d => d.type === 'quran').length;
  const hadithCount = documents.filter(d => d.type === 'hadith').length;
  const books = [...new Set(documents.filter(d => d.type === 'hadith').map(d => d.book))];

  return {
    totalDocuments: documents.length,
    quranVerses: quranCount,
    hadithCount,
    hadithBooks: books.length,
    loadedBooks: books
  };
};

// Load data on initialization
loadAllData();

module.exports = {
  search,
  searchWithFilters,
  processQuery,
  getStats,
  loadAllData,
  // Export for testing
  exactMatch,
  relaxedMatch,
  semanticMatch,
  fuzzyMatch,
  SEARCH_CONFIG
};