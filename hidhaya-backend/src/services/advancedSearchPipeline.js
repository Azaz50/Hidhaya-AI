/**
 * Advanced 4-Layer Islamic Search Pipeline
 * Phase 2: BM25, Fuzzy, Cross-language, Phonetic Matching
 * Layer 1: Exact Match
 * Layer 2: Relaxed Match (partial words)
 * Layer 3: Semantic Expansion (concept mapping)
 * Layer 4: Fuzzy Match (typo tolerance)
 */

const mongoose = require('mongoose');
const Fuse = require('fuse.js');
const Quran = require('../models/Quran');
const Hadith = require('../models/Hadith');
// Import the new comprehensive semantic engine
const semanticEngine = require('./islamicSemanticEngine');
const processQuery = semanticEngine.processQuery;
const semanticDetectConcepts = semanticEngine.detectConcepts;
const expandQueryWithConcepts = semanticEngine.expandQueryWithConcepts;
const semanticNormalizeQuery = semanticEngine.normalizeQuery;
const semanticDetectLanguage = semanticEngine.detectLanguage;
const islamicConcepts = semanticEngine.islamicConcepts;
// Import Phase 2 advanced search module
const { hybridSearch, BM25, fuzzyMatch, expandQueryCrossLanguage, phoneticSimilarity } = require('./advancedSearch');
// Import Phase 3 performance optimizer
const { searchCache, searchMetrics, getSearchField, optimizedQuranSearch, optimizedHadithSearch, createIndexes } = require('./performanceOptimizer');
// Keep old imports for backward compatibility
const { detectProphet, detectAllahConcept, ALLAH_CONCEPTS, PROPHETS } = require('./semanticMapping');

// Check MongoDB connection - dynamic check for each operation
const isMongoConnected = () => {
  try {
    return mongoose.connection.readyState === 1;
  } catch {
    return false;
  }
};

// Fallback to in-memory search if MongoDB not available
let fallbackDocuments = [];
let fuseIndex = null;

const HADITH_SOURCES = [
  'bukhari', 'muslim', 'ahmed', 'nasai', 'abudawud',
  'ibnmajah', 'aladab_almufrad', 'bulugh_almaram', 'malik',
  'mishkat_almasabih', 'nawawi40', 'qudsi40', 'riyad_assalihin',
  'shahwaliullah40', 'shamail_muhammadiah'
];

// Load fallback data
const loadFallbackData = () => {
  if (fallbackDocuments.length > 0) return;

  const fs = require('fs');
  const path = require('path');

  try {
    // Load Quran
    const quranPath = path.join(__dirname, '../data/quran/quran.json');
    if (fs.existsSync(quranPath)) {
      const quranData = JSON.parse(fs.readFileSync(quranPath, 'utf8'));
      for (const chapterKey in quranData) {
        const verses = quranData[chapterKey];
        if (Array.isArray(verses)) {
          verses.forEach(verse => {
            fallbackDocuments.push({
              type: 'quran',
              text: verse.text || '',
              english: verse.EnglishTarjuma || '',
              urdu: verse.UrduTarjuma || '',
              hindi: verse.HindiTarjuma || '',
              bengali: verse.BengaliTarjuma || '',
              source: `Quran ${verse.chapter}:${verse.verse}`,
              chapter: verse.chapter,
              grade: ''
            });
          });
        }
      }
    }

    // Load Hadith
    const hadithDir = path.join(__dirname, '../data/hadith');
    HADITH_SOURCES.forEach(source => {
      const hadithPath = path.join(hadithDir, `${source}.json`);
      if (fs.existsSync(hadithPath)) {
        try {
          const data = JSON.parse(fs.readFileSync(hadithPath, 'utf8'));
          let hadiths = [];
          if (Array.isArray(data)) hadiths = data;
          else if (data.hadiths) hadiths = data.hadiths;
          else for (const key of Object.keys(data)) { if (Array.isArray(data[key])) { hadiths = data[key]; break; } }

          hadiths.forEach((hadith, idx) => {
            fallbackDocuments.push({
              type: 'hadith',
              text: hadith.arabic || '',
              english: typeof hadith.english === 'object' ? (hadith.english.text || '') : (hadith.english || ''),
              urdu: typeof hadith.urdu === 'object' ? (hadith.urdu.text || '') : (hadith.urdu || ''),
              hindi: typeof hadith.hindi === 'object' ? (hadith.hindi.text || '') : (hadith.hindi || ''),
              bengali: typeof hadith.bengali === 'object' ? (hadith.bengali.text || '') : (hadith.bengali || ''),
              source: `${source} ${hadith.idInBook || hadith.id || idx + 1}`,
              book: source,
              grade: hadith.grade || ''
            });
          });
        } catch (e) { /* skip */ }
      }
    });

    // Initialize Fuse for fallback
    fuseIndex = new Fuse(fallbackDocuments, {
      includeScore: true,
      threshold: 0.4,
      ignoreLocation: true,
      keys: [
        { name: 'english', weight: 0.4 },
        { name: 'urdu', weight: 0.3 },
        { name: 'hindi', weight: 0.15 },
        { name: 'bengali', weight: 0.15 }
      ]
    });

    console.log(`✅ Fallback loaded: ${fallbackDocuments.length} documents`);
  } catch (error) {
    console.error('Error loading fallback data:', error);
  }
};

// ============================================================
// LAYER 2: Relaxed Match - Old function (replaced by layer1ExactMatchWithTerms)
// Kept for reference, not used by new search()
// ============================================================
const layer2RelaxedMatch = async (query, language) => {
  if (!query) return [];

  // Split into words and get terms with 3+ characters
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  if (words.length === 0) return [];

  // Expand with semantic terms
  let searchTerms = [...words];
  const detectedProphet = detectProphet(query);
  const detectedAllahConcept = detectAllahConcept(query);

  if (detectedProphet && PROPHETS[detectedProphet]) {
    searchTerms = [...searchTerms, ...PROPHETS[detectedProphet].synonyms];
  }
  if (detectedAllahConcept && ALLAH_CONCEPTS[detectedAllahConcept]) {
    searchTerms = [...searchTerms, ...ALLAH_CONCEPTS[detectedAllahConcept].synonyms];
  }
  searchTerms = [...new Set(searchTerms)];

  let results = [];

  try {
    if (isMongoConnected()) {
      // Build OR conditions for all search terms across all language fields
      const orConditions = searchTerms.flatMap(term =>
        ['english', 'urdu', 'hindi', 'bengali', 'arabic'].map(field => ({
          [field]: { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
        }))
      );

      const quranResults = await Quran.find({ $or: orConditions }).limit(12).lean();
      const hadithResults = await Hadith.find({ $or: orConditions }).limit(12).lean();

      results = [
        ...quranResults.map(r => ({ ...r, type: 'quran', matchLayer: 'relaxed', confidence: 0.7 })),
        ...hadithResults.map(r => ({ ...r, type: 'hadith', matchLayer: 'relaxed', confidence: 0.7 }))
      ];
    }
  } catch {}

  if (results.length === 0 && fuseIndex) {
    results = fuseIndex.search(query, { limit: 10 })
      .filter(r => r.score > 0.1 && r.score < 0.4)
      .map(r => ({ ...r.item, matchLayer: 'relaxed', confidence: Math.max(0, 1 - r.score) }));
  }

  return results;
};

// ============================================================
// LAYER 3: Semantic Expansion - Concept mapping
// ============================================================
const layer3SemanticMatch = async (query, concepts) => {
  if (!concepts || concepts.length === 0) return [];

  // Expand concepts to related terms
  const expandedTerms = [];
  for (const concept of concepts) {
    const semanticTerms = getSemanticTerms(concept);
    expandedTerms.push(...semanticTerms);
  }

  // Also add prophet and Allah concept terms
  const detectedProphet = detectProphet(query);
  const detectedAllahConcept = detectAllahConcept(query);

  if (detectedProphet && PROPHETS[detectedProphet]) {
    expandedTerms.push(...PROPHETS[detectedProphet].synonyms);
    expandedTerms.push(...PROPHETS[detectedProphet].topics || []);
  }

  if (detectedAllahConcept && ALLAH_CONCEPTS[detectedAllahConcept]) {
    expandedTerms.push(...ALLAH_CONCEPTS[detectedAllahConcept].synonyms);
    expandedTerms.push(...ALLAH_CONCEPTS[detectedAllahConcept].topics || []);
  }

  const uniqueTerms = [...new Set(expandedTerms)];

  let results = [];

  try {
    if (isMongoConnected()) {
      const orConditions = uniqueTerms.flatMap(term =>
        ['topics', 'keywords', 'english', 'urdu', 'hindi', 'bengali', 'arabic'].map(field => ({
          [field]: { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
        }))
      );

      const quranResults = await Quran.find({ $or: orConditions }).limit(10).lean();
      const hadithResults = await Hadith.find({ $or: orConditions }).limit(10).lean();

      results = [
        ...quranResults.map(r => ({ ...r, type: 'quran', matchLayer: 'semantic', confidence: 0.6 })),
        ...hadithResults.map(r => ({ ...r, type: 'hadith', matchLayer: 'semantic', confidence: 0.6 }))
      ];
    }
  } catch {}

  return results;
};

// ============================================================
// LAYER 4: Fuzzy Match - Handle typos
// ============================================================
const layer4FuzzyMatch = async (query) => {
  if (!query || query.length < 3) return [];

  let results = [];

  try {
    if (isMongoConnected()) {
      // Use regex with slight variations for fuzzy matching
      const fuzzyQuery = query.split('').join('.*');
      const searchFields = ['english', 'urdu', 'hindi', 'bengali'];

      const orConditions = [];
      for (const field of searchFields) {
        orConditions.push({ [field]: { $regex: fuzzyQuery, $options: 'i' } });
      }

      const quranResults = await Quran.find({ $or: orConditions }).limit(5).lean();
      const hadithResults = await Hadith.find({ $or: orConditions }).limit(5).lean();

      results = [
        ...quranResults.map(r => ({ ...r, type: 'quran', matchLayer: 'fuzzy', confidence: 0.4 })),
        ...hadithResults.map(r => ({ ...r, type: 'hadith', matchLayer: 'fuzzy', confidence: 0.4 }))
      ];
    }
  } catch {}

  return results;
};

// ============================================================
// Helper Functions
// ============================================================
const getLanguageField = (language) => {
  const fields = { english: 'english', urdu: 'urdu', hindi: 'hindi', bengali: 'bengali' };
  return fields[language] || 'english';
};

const getSemanticTerms = (concept) => {
  const conceptMap = {
    'sabr': ['patience', 'sabr', 'endurance', 'steadfast', 'धैर्य', 'صبر', 'ধৈর্য'],
    'shukr': ['gratitude', 'shukr', 'thanks', 'appreciate', 'शुक्र', 'شکر', 'কৃতজ্ঞতা'],
    'iman': ['faith', 'iman', 'belief', 'trust', 'ईमान', 'ایمان', 'বিশ্বাস'],
    'taqwa': ['taqwa', 'piety', 'righteous', 'परहेज़गारی', 'تقوی', 'তাকওয়া'],
    'tawheed': ['tawheed', 'monotheism', 'oneness', 'توحید', 'তাওহীদ'],
    'shirk': ['shirk', 'polytheism', 'شرک', 'শিরক'],
    'prayer': ['prayer', 'salat', 'namaz', 'dua', 'नमाज़', 'نماز', 'নামাজ'],
    'zakat': ['zakat', 'charity', 'sadaqah', 'زکات', 'যাকাত'],
    'fasting': ['fasting', 'ramadan', 'sawm', 'روزہ', 'রোজা'],
    'hajj': ['hajj', 'pilgrimage', 'حج', 'হজ্জ'],
    'forgiveness': ['forgiveness', 'tawbah', 'repent', 'توبہ', 'ক্ষমা'],
    'mercy': ['mercy', 'rahmah', 'compassion', 'رحمہ', 'রহমত'],
    'anger': ['anger', 'angry', 'rage', 'गुस्सा', 'غصہ', 'ক্রোধ'],
    'honesty': ['honesty', 'truthful', 'sidiq', 'سچ', 'সততা'],
    'knowledge': ['knowledge', 'ilm', 'learn', 'علم', 'জ্ঞান'],
    'patience': ['patience', 'sabr', 'dheeraj', 'धैर्य', 'صبر', 'ধৈর্য'],
    'guidance': ['guidance', 'hidayah', ' hidayat', 'ہدایت', 'হিদায়াহ'],
    'hope': ['hope', 'raja', 'umeed', 'उम्मीद', 'امید', 'আশা'],
    'fear': ['fear', 'khauf', 'darr', 'ڈر', 'ভয়']
  };

  return conceptMap[concept] || [concept];
};

// ============================================================
// PHASE 2: ADVANCED SEARCH - BM25, Fuzzy, Cross-language, Phonetic
// ============================================================

const performAdvancedSearch = async (query, documents) => {
  if (!documents || documents.length === 0) {
    return { results: [], scores: {} };
  }

  try {
    const result = await hybridSearch(query, documents, {
      enableBM25: true,
      enableFuzzy: true,
      enableCrossLanguage: true,
      enablePhonetic: true,
      bm25Weight: 0.4,
      fuzzyWeight: 0.3,
      crossLangWeight: 0.2,
      phoneticWeight: 0.1,
      topN: 15
    });

    return result;
  } catch (error) {
    console.error('Advanced search error:', error.message);
    return { results: [], scores: {} };
  }
};

// ============================================================
// Main Search Function - 4 Layer Pipeline with Phase 2 & 3
// ============================================================
const search = async (query, language = 'english') => {
  const startTime = Date.now();
  if (!query) {
    return { results: [], confidence: 'none', searchMetadata: { query, detectedConcepts: [] } };
  }

  // Phase 3: Check cache first
  const cachedResults = searchCache.get(query, language);
  if (cachedResults) {
    searchMetrics.recordQuery({ cacheHit: true, responseTime: Date.now() - startTime });
    return { ...cachedResults, fromCache: true };
  }

  // Use the new comprehensive semantic engine for query processing
  let semanticResult = { detectedConcepts: [], normalizedQuery: query, expandedQuery: '', detectedLanguage: 'english', emotion: 'neutral' };
  try {
    semanticResult = processQuery(query, language);
  } catch (e) {
    console.error('Semantic engine error:', e.message);
  }

  const detectedConcepts = semanticResult.detectedConcepts || [];
  const normalizedQuery = semanticResult.normalizedQuery || query;
  const expandedQuery = semanticResult.expandedQuery || '';

  // Debug: Log what we're searching for
  console.log(`🔍 Search query: "${query}" -> normalized: "${normalizedQuery}"`);
  console.log(`   Detected concepts: ${detectedConcepts.join(', ') || 'none'}`);
  console.log(`   MongoDB connected: ${isMongoConnected()}`);

  // Build expanded search terms using both old and new semantic systems
  let searchTerms = [normalizedQuery];

  // Add terms from detected concepts (new semantic engine)
  for (const concept of detectedConcepts) {
    const conceptData = islamicConcepts[concept];
    if (conceptData) {
      // Add all synonyms
      searchTerms.push(...conceptData.synonyms);
      // Add translations
      for (const translations of Object.values(conceptData.translations)) {
        searchTerms.push(...translations);
      }
    }
  }

  // Also check for prophets and Allah concepts (old semantic mapping)
  const detectedProphet = detectProphet(query);
  const detectedAllahConcept = detectAllahConcept(query);

  if (detectedProphet && PROPHETS[detectedProphet]) {
    searchTerms.push(...PROPHETS[detectedProphet].synonyms);
  }
  if (detectedAllahConcept && ALLAH_CONCEPTS[detectedAllahConcept]) {
    searchTerms.push(...ALLAH_CONCEPTS[detectedAllahConcept].synonyms);
  }

  // Add expanded query terms
  if (expandedQuery) {
    searchTerms.push(...expandedQuery.split(/\s+/).filter(w => w.length > 2));
  }

  // Add cross-language expansions
  const crossLangTerms = expandQueryCrossLanguage(query, language);
  if (crossLangTerms.length > 0) {
    searchTerms.push(...crossLangTerms);
  }

  // Remove duplicates and short terms
  searchTerms = [...new Set(searchTerms)].filter(t => t.length > 1);

  let results = [];
  let matchLayers = { exact: 0, relaxed: 0, semantic: 0, fuzzy: 0, advanced: 0 };

  // Try MongoDB first
  if (isMongoConnected()) {
    // Check if collections have data
    try {
      const quranCount = await Quran.countDocuments();
      const hadithCount = await Hadith.countDocuments();
      console.log(`   MongoDB collections: Quran=${quranCount}, Hadith=${hadithCount}`);

      if (quranCount === 0 && hadithCount === 0) {
        console.log('   ⚠️ MongoDB collections are empty! Data may not be seeded.');
      }
    } catch (countErr) {
      console.error('   Count error:', countErr.message);
    }

    // Use Phase 3 optimized search functions
    try {
      const quranResults = await optimizedQuranSearch(normalizedQuery, language, Quran);
      const hadithResults = await optimizedHadithSearch(normalizedQuery, language, Hadith);

      console.log(`   MongoDB results: Quran=${quranResults.length}, Hadith=${hadithResults.length}`);

      results = [
        ...quranResults.slice(0, 5).map(r => ({ ...r, type: 'quran', matchLayer: 'exact', confidence: 1.0 })),
        ...hadithResults.slice(0, 5).map(r => ({ ...r, type: 'hadith', matchLayer: 'exact', confidence: 1.0 }))
      ];
      matchLayers.exact = results.length;
    } catch (error) {
      console.log('Optimized search error:', error.message);
      console.log('Falling back to layer-based search');
      // Layer 1: Exact Match (highest priority)
      let exactResults = await layer1ExactMatchWithTerms(searchTerms, language);
      matchLayers.exact = exactResults.length;
      results = [...results, ...exactResults];
    }

    // Layer 2: Relaxed Match (if exact didn't find enough)
    if (results.length < 5) {
      const relaxed = await layer2RelaxedMatchWithTerms(searchTerms, language);
      results = [...results, ...relaxed];
      matchLayers.relaxed = relaxed.length;
    }

    // Layer 3: Semantic Expansion (if still not enough)
    if (results.length < 5 && detectedConcepts.length > 0) {
      const semantic = await layer3SemanticMatchWithTerms(detectedConcepts);
      results = [...results, ...semantic];
      matchLayers.semantic = semantic.length;
    }
  } else {
    // Use fallback data with Phase 2 advanced search
    console.log('   MongoDB not connected, using fallback data');
    loadFallbackData();

    // Phase 2: Use advanced search (BM25, Fuzzy, Cross-language, Phonetic)
    const advancedResults = await performAdvancedSearch(query, fallbackDocuments);

    if (advancedResults.results && advancedResults.results.length > 0) {
      matchLayers.advanced = advancedResults.results.length;
      results = advancedResults.results.map(r => ({
        ...r,
        matchLayer: 'advanced',
        confidence: r.searchScore || 0.6,
        advancedScores: r.scoreBreakdown
      }));
    } else {
      // Fallback to basic search if advanced fails
      results = fallbackDocuments
        .filter(doc => searchTerms.some(term => {
          const searchText = `${doc.english || ''} ${doc.urdu || ''} ${doc.hindi || ''} ${doc.bengali || ''}`.toLowerCase();
          return searchText.includes(term.toLowerCase());
        }))
        .slice(0, 10)
        .map(doc => ({ ...doc, matchLayer: 'exact', confidence: 0.7 }));
      matchLayers.exact = results.length;
    }
  }

  // Phase 2 Enhancement: Fuzzy matching for remaining queries
  if (results.length < 3) {
    const fuzzyResults = await layer4FuzzyMatch(normalizedQuery);
    results = [...results, ...fuzzyResults];
    matchLayers.fuzzy = fuzzyResults.length;
  }

  // Deduplicate and rank results
  results = deduplicateAndRank(results);

  // Calculate confidence
  const confidence = calculateConfidence(results);

  // Debug: Log which data source is being used
  console.log(`🔍 Search using: ${isMongoConnected() ? 'MongoDB' : 'Fallback'}, results: ${results.length}, concepts: ${detectedConcepts.join(',')}`);
  console.log(`   Match layers: ${JSON.stringify(matchLayers)}`);

  // Record metrics
  const responseTime = Date.now() - startTime;
  searchMetrics.recordQuery({
    cacheHit: false,
    responseTime,
    dataSource: isMongoConnected() ? 'mongodb' : 'fallback',
    layer: results[0]?.matchLayer || 'unknown'
  });

  // Cache results for future queries
  const finalSearchMetadata = {
    query,
    normalizedQuery,
    detectedConcepts,
    detectedLanguage: semanticResult.detectedLanguage,
    emotion: semanticResult.emotion,
    expandedQuery,
    totalDocuments: isMongoConnected() ? 'indexed' : fallbackDocuments.length,
    layerStats: matchLayers,
    responseTime
  };

  if (results.length > 0) {
    searchCache.set(query, language, { results, confidence, searchMetadata: finalSearchMetadata });
  }

  return {
    results: results.slice(0, 10),
    confidence,
    searchMetadata: finalSearchMetadata
  };
};

// Updated Layer 1 with terms array
const layer1ExactMatchWithTerms = async (searchTerms, language) => {
  if (!searchTerms || searchTerms.length === 0) return [];

  let results = [];

  try {
    if (isMongoConnected()) {
      // Build OR conditions for all search terms across all language fields
      const orConditions = searchTerms.flatMap(term =>
        ['english', 'urdu', 'hindi', 'bengali', 'arabic', 'text'].map(field => ({
          [field]: { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
        }))
      );

      console.log(`🔍 Layer1 MongoDB search: ${searchTerms.length} terms, language=${language}`);

      const quranResults = await Quran.find({ $or: orConditions }).limit(8).lean();
      const hadithResults = await Hadith.find({ $or: orConditions }).limit(8).lean();

      results = [
        ...quranResults.map(r => ({ ...r, type: 'quran', matchLayer: 'exact', confidence: 1.0 })),
        ...hadithResults.map(r => ({ ...r, type: 'hadith', matchLayer: 'exact', confidence: 1.0 }))
      ];
    }
  } catch (e) { console.error('Layer1 error:', e.message); }

  // If no results, use fallback exact matching
  if (results.length === 0) {
    loadFallbackData();
    const searchText = (doc) => {
      return [
        doc.english?.toLowerCase() || '',
        doc.urdu?.toLowerCase() || '',
        doc.hindi?.toLowerCase() || '',
        doc.bengali?.toLowerCase() || '',
        doc.text?.toLowerCase() || ''
      ].join(' ');
    };

    results = fallbackDocuments
      .filter(doc => searchTerms.some(term => searchText(doc).includes(term)))
      .slice(0, 10)
      .map(doc => ({ ...doc, matchLayer: 'exact', confidence: 1.0 }));
  }

  return results;
};

// Updated Layer 2 with terms array
const layer2RelaxedMatchWithTerms = async (searchTerms, language) => {
  if (!searchTerms || searchTerms.length === 0) return [];

  let results = [];

  try {
    if (isMongoConnected()) {
      const orConditions = searchTerms.flatMap(term =>
        ['english', 'urdu', 'hindi', 'bengali', 'arabic', 'text'].map(field => ({
          [field]: { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
        }))
      );

      const quranResults = await Quran.find({ $or: orConditions }).limit(12).lean();
      const hadithResults = await Hadith.find({ $or: orConditions }).limit(12).lean();

      results = [
        ...quranResults.map(r => ({ ...r, type: 'quran', matchLayer: 'relaxed', confidence: 0.7 })),
        ...hadithResults.map(r => ({ ...r, type: 'hadith', matchLayer: 'relaxed', confidence: 0.7 }))
      ];
    }
  } catch {}

  if (results.length === 0 && fuseIndex) {
    results = fuseIndex.search(searchTerms.join(' '), { limit: 10 })
      .filter(r => r.score > 0.1 && r.score < 0.4)
      .map(r => ({ ...r.item, matchLayer: 'relaxed', confidence: Math.max(0, 1 - r.score) }));
  }

  return results;
};

// Updated Layer 3 with detected concepts
const layer3SemanticMatchWithTerms = async (detectedConcepts) => {
  if (!detectedConcepts || detectedConcepts.length === 0) return [];

  // Expand concepts to related terms
  const expandedTerms = [];
  for (const conceptKey of detectedConcepts) {
    const conceptData = islamicConcepts[conceptKey];
    if (conceptData) {
      // Add topic
      expandedTerms.push(conceptData.topic);
      // Add synonyms
      expandedTerms.push(...conceptData.synonyms);
      // Add translations
      for (const translations of Object.values(conceptData.translations)) {
        expandedTerms.push(...translations);
      }
      // Add related topics
      expandedTerms.push(...conceptData.relatedTopics);
    }
  }

  const uniqueTerms = [...new Set(expandedTerms)];

  let results = [];

  try {
    if (isMongoConnected()) {
      const orConditions = uniqueTerms.flatMap(term =>
        ['topics', 'keywords', 'english', 'urdu', 'hindi', 'bengali', 'arabic', 'text'].map(field => ({
          [field]: { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
        }))
      );

      const quranResults = await Quran.find({ $or: orConditions }).limit(10).lean();
      const hadithResults = await Hadith.find({ $or: orConditions }).limit(10).lean();

      results = [
        ...quranResults.map(r => ({ ...r, type: 'quran', matchLayer: 'semantic', confidence: 0.6 })),
        ...hadithResults.map(r => ({ ...r, type: 'hadith', matchLayer: 'semantic', confidence: 0.6 }))
      ];
    }
  } catch {}

  return results;
};

// ============================================================
// Query Normalization - Remove noise words
// ============================================================
const normalizeQuery = (query, language) => {
  let normalized = query.toLowerCase().trim();

  // Language-specific noise words to remove
  const noiseWords = {
    english: ['what is', 'who is', 'how to', 'explain', 'tell me about', 'what does islam say about', 'can you', 'please', 'tell'],
    hindi: ['क्या है', 'कैसे', 'इस्लाम में क्या', 'बताइए', 'बता दो', 'क्या'],
    urdu: ['کیا ہے', 'کیسے', 'اسلام میں کیا', 'بتائیں', 'کیا'],
    bengali: ['কি', 'কিভাবে', 'ইসলামে কি', 'বলো'],
    roman_urdu: ['kya hai', 'kaise', 'islam mein', 'batao', 'ke']
  };

  const words = noiseWords[language] || noiseWords.english;
  for (const word of words) {
    normalized = normalized.replace(new RegExp(word, 'gi'), '');
  }

  // Remove punctuation and extra spaces
  normalized = normalized.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();

  return normalized;
};

// ============================================================
// Extract Islamic Concepts from Query
// ============================================================
const extractConcepts = (query) => {
  const concepts = [];
  const lower = query.toLowerCase();

  const keywords = {
    'sabr': ['patience', 'patient', 'sabr', 'dheeraj', 'dhairya', 'धैर्य', 'صبر', 'ধৈর্য'],
    'shukr': ['gratitude', 'thanks', 'shukr', 'shukriya', 'शुक्र', 'شکر', 'কৃতজ্ঞতা'],
    'iman': ['faith', 'belief', 'iman', 'imaan', 'trust', 'ईमान', 'ایمان', 'বিশ্বাস'],
    'taqwa': ['taqwa', 'piety', 'god-consciousness', 'righteous', 'परहेज़गारی', 'تقوی', 'তাকওয়া'],
    'tawheed': ['tawheed', 'tawhid', 'monotheism', 'oneness', 'توحید', 'তাওহীদ'],
    'shirk': ['shirk', 'polytheism', 'idolatry', 'شرک', 'শিরক'],
    'prayer': ['prayer', 'salat', 'namaz', 'dua', 'worship', 'नमाज़', 'نماز', 'নামাজ'],
    'zakat': ['zakat', 'charity', 'sadaqah', 'zakaat', 'زکات', 'যাকাত'],
    'fasting': ['fasting', 'ramadan', 'sawm', 'roza', 'روزہ', 'রোজা'],
    'hajj': ['hajj', 'pilgrimage', 'حج', 'হজ্জ'],
    'forgiveness': ['forgiveness', 'tawbah', 'repent', 'maafi', 'توبہ', 'ক্ষমা'],
    'mercy': ['mercy', 'rahmah', 'compassion', 'رحمہ', 'রহমত'],
    'anger': ['anger', 'angry', 'rage', 'gussa', 'krodh', 'गुस्सा', 'غصہ', 'ক্রোধ'],
    'honesty': ['honesty', 'truthful', 'sadiq', 'ameen', 'سچ', 'সততা'],
    'knowledge': ['knowledge', 'ilm', 'learn', 'study', 'علم', 'জ্ঞান'],
    'guidance': ['guidance', 'hidayah', 'hidayat', 'ہدایت', 'হিদায়াহ'],
    'hope': ['hope', 'raja', 'umeed', 'expects', 'उम्मीद', 'امید', 'আশা'],
    'fear': ['fear', 'khauf', 'darr', 'wariness', 'ڈر', 'ভয়'],
    'shahadah': ['shahadah', 'testimony', 'شهادت', 'শাহাদাত'],
    'sunnah': ['sunnah', 'prophet tradition', ' سنت', 'সুন্নাহ'],
    'aqeedah': ['aqeedah', 'beliefs', 'عقائد', 'আকিদা'],
    'halal': ['halal', 'permissible', 'حلال', 'হালাল'],
    'haram': ['haram', 'forbidden', 'حرام', 'হারাম'],
    'riba': ['riba', 'interest', 'usury', 'ربا', 'সুদ'],
    'backbiting': ['backbiting', 'ghibah', 'slander', 'غیبت', 'পাঁচকানি'],
    'jealousy': ['jealousy', 'hasad', 'envy', 'حسد', 'হিংসা'],
    'sadaqah': ['sadaqah', 'voluntary charity', 'صدقہ', 'সাদাকাহ'],
    'dhikr': ['dhikr', 'remembrance', 'ذکر', 'যিক্র'],
    'tafakkur': ['tafakkur', 'reflection', 'تفکر', 'চিন্তা'],
    'repentance': ['repentance', 'tawbah', 'istighfar', 'استغفار', 'তওবাহ'],
    'parenting': ['parenting', 'tarbiyah', 'children', 'تربیت', 'তরবিয়ত'],
    'kindness': ['kindness', 'ihsan', 'niceness', 'احسان', 'দয়া'],
    'modesty': ['modesty', 'haya', 'shyness', 'حیا', 'লজ্জা']
  };

  for (const [concept, words] of Object.entries(keywords)) {
    if (words.some(w => lower.includes(w))) {
      concepts.push(concept);
    }
  }

  return concepts;
};

// ============================================================
// Detect Emotional Intent
// ============================================================
const detectEmotion = (query) => {
  const lower = query.toLowerCase();

  const emotions = {
    sadness: ['sad', 'depressed', 'upset', 'worried', 'anxious', 'grief', 'pain'],
    anger: ['angry', 'furious', 'rage', 'mad', 'frustrated'],
    fear: ['afraid', 'scared', 'fear', 'terrified', 'nervous'],
    joy: ['happy', 'joy', 'excited', 'grateful', 'thankful', 'blessed'],
    confusion: ['confused', 'lost', 'uncertain', 'don\'t understand'],
    hope: ['hope', 'hopeful', 'wish', 'pray', 'dua']
  };

  for (const [emotion, keywords] of Object.entries(emotions)) {
    if (keywords.some(w => lower.includes(w))) return emotion;
  }

  return 'neutral';
};

// ============================================================
// Deduplicate and Rank Results
// ============================================================
const deduplicateAndRank = (results) => {
  const seen = new Map();
  const ranked = [];

  for (const result of results) {
    const key = `${result.type}-${result.source}`;
    if (!seen.has(key)) {
      seen.set(key, result);
      ranked.push(result);
    } else {
      // Boost confidence if found in multiple layers
      const existing = seen.get(key);
      existing.confidence = Math.min(1, existing.confidence + 0.1);
      existing.matchLayers = [...new Set([...(existing.matchLayers || []), result.matchLayer])];
    }
  }

  // Sort by confidence and priority
  return ranked.sort((a, b) => {
    const priorityOrder = { exact: 1, relaxed: 2, semantic: 3, fuzzy: 4 };
    const aPriority = priorityOrder[a.matchLayer] || 5;
    const bPriority = priorityOrder[b.matchLayer] || 5;

    if (aPriority !== bPriority) return aPriority - bPriority;
    return b.confidence - a.confidence;
  });
};

// ============================================================
// Calculate Confidence Level
// ============================================================
const calculateConfidence = (results) => {
  if (results.length === 0) return 'none';

  const avgConfidence = results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length;
  const topConfidence = results[0]?.confidence || 0;

  if (topConfidence >= 0.8 && avgConfidence >= 0.6) return 'high';
  if (topConfidence >= 0.5 && avgConfidence >= 0.3) return 'medium';
  return 'low';
};

// ============================================================
// Get Statistics
// ============================================================
const getStats = async () => {
  try {
    if (isMongoConnected()) {
      const [quranCount, hadithCount] = await Promise.all([
        Quran.countDocuments(),
        Hadith.countDocuments()
      ]);
      return { totalDocuments: quranCount + hadithCount, quranVerses: quranCount, hadithCount };
    }
  } catch {}

  loadFallbackData();
  return {
    totalDocuments: fallbackDocuments.length,
    quranVerses: fallbackDocuments.filter(d => d.type === 'quran').length,
    hadithCount: fallbackDocuments.filter(d => d.type === 'hadith').length
  };
};

// ============================================================
// Initialize Database Indexes (call on startup)
// ============================================================
const initializeIndexes = async () => {
  if (isMongoConnected()) {
    try {
      const results = await createIndexes(Quran, Hadith);
      console.log('✅ Database indexes created:', results.length);
      return results;
    } catch (error) {
      console.error('Index creation error:', error);
      return [];
    }
  }
  return [];
};

// Get performance metrics
const getMetrics = () => searchMetrics.getMetrics();

// Clear cache
const clearCache = () => searchCache.clear();

module.exports = {
  search,
  getStats,
  normalizeQuery,
  extractConcepts,
  detectEmotion,
  initializeIndexes,
  getMetrics,
  clearCache,
  searchCache
};