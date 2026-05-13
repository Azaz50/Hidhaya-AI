/**
 * Advanced 4-Layer Islamic Search Pipeline
 * As per planning.txt requirements
 * Layer 1: Exact Match
 * Layer 2: Relaxed Match (partial words)
 * Layer 3: Semantic Expansion (concept mapping)
 * Layer 4: Fuzzy Match (typo tolerance)
 */

const mongoose = require('mongoose');
const Fuse = require('fuse.js');
const Quran = require('../models/Quran');
const Hadith = require('../models/Hadith');
// Semantic mapping functions are already defined in this file

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
// LAYER 1: Exact Match - Highest priority
// ============================================================
const layer1ExactMatch = async (query, language) => {
  if (!query) return [];

  const normalizedQuery = query.toLowerCase().trim();
  let results = [];

  try {
    // Try MongoDB first
    if (isMongoConnected()) {
      const searchField = getLanguageField(language);
      console.log(`🔍 Layer1 MongoDB search: field="${searchField}", query="${normalizedQuery}"`);
      const quranResults = await Quran.find({
        [searchField]: { $regex: normalizedQuery, $options: 'i' }
      }).limit(5).lean();

      const hadithResults = await Hadith.find({
        [searchField]: { $regex: normalizedQuery, $options: 'i' }
      }).limit(5).lean();

      console.log(`🔍 Layer1 results: quran=${quranResults.length}, hadith=${hadithResults.length}`);

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
      switch (language) {
        case 'urdu': return doc.urdu?.toLowerCase() || '';
        case 'hindi': return doc.hindi?.toLowerCase() || '';
        case 'bengali': return doc.bengali?.toLowerCase() || '';
        default: return doc.english?.toLowerCase() || '';
      }
    };

    results = fallbackDocuments
      .filter(doc => searchText(doc).includes(normalizedQuery))
      .slice(0, 10)
      .map(doc => ({ ...doc, matchLayer: 'exact', confidence: 1.0 }));
  }

  return results;
};

// ============================================================
// LAYER 2: Relaxed Match - Partial word matching
// ============================================================
const layer2RelaxedMatch = async (query, language) => {
  if (!query) return [];

  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  if (words.length === 0) return [];

  let results = [];

  try {
    if (isMongoConnected()) {
      const searchField = getLanguageField(language);
      const orConditions = words.map(w => ({ [searchField]: { $regex: w, $options: 'i' } }));

      const quranResults = await Quran.find({ $or: orConditions }).limit(10).lean();
      const hadithResults = await Hadith.find({ $or: orConditions }).limit(10).lean();

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

  let results = [];

  try {
    if (isMongoConnected()) {
      const orConditions = expandedTerms.map(term => ({
        $or: [
          { topics: term },
          { english: { $regex: term, $options: 'i' } },
          { urdu: { $regex: term, $options: 'i' } }
        ]
      }));

      const quranResults = await Quran.find({ $or: orConditions }).limit(8).lean();
      const hadithResults = await Hadith.find({ $or: orConditions }).limit(8).lean();

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
// Main Search Function - 4 Layer Pipeline
// ============================================================
const search = async (query, language = 'english') => {
  if (!query) {
    return { results: [], confidence: 'none', searchMetadata: { query, detectedConcepts: [] } };
  }

  // Parse concepts from query
  const detectedConcepts = extractConcepts(query);
  const normalizedQuery = normalizeQuery(query, language);

  // Layer 1: Exact Match (highest priority)
  let results = await layer1ExactMatch(normalizedQuery, language);
  let matchLayers = { exact: results.length };

  // Layer 2: Relaxed Match (if exact didn't find enough)
  if (results.length < 5) {
    const relaxed = await layer2RelaxedMatch(normalizedQuery, language);
    results = [...results, ...relaxed];
    matchLayers.relaxed = relaxed.length;
  }

  // Layer 3: Semantic Expansion (if still not enough)
  if (results.length < 5 && detectedConcepts.length > 0) {
    const semantic = await layer3SemanticMatch(normalizedQuery, detectedConcepts);
    results = [...results, ...semantic];
    matchLayers.semantic = semantic.length;
  }

  // Layer 4: Fuzzy Match (fallback for typos)
  if (results.length < 3) {
    const fuzzy = await layer4FuzzyMatch(normalizedQuery);
    results = [...results, ...fuzzy];
    matchLayers.fuzzy = fuzzy.length;
  }

  // Deduplicate and rank results
  results = deduplicateAndRank(results);

  // Calculate confidence
  const confidence = calculateConfidence(results);

  // Debug: Log which data source is being used
  console.log(`🔍 Search using: ${isMongoConnected() ? 'MongoDB' : 'Fallback'}, results: ${results.length}, concepts: ${detectedConcepts.join(',')}`);

  return {
    results: results.slice(0, 10),
    confidence,
    searchMetadata: {
      query,
      normalizedQuery,
      detectedConcepts,
      detectedLanguage: language,
      emotion: detectEmotion(query),
      expandedQuery: normalizedQuery,
      totalDocuments: isMongoConnected() ? 'indexed' : fallbackDocuments.length,
      layerStats: matchLayers
    }
  };
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

module.exports = { search, getStats, normalizeQuery, extractConcepts, detectEmotion };