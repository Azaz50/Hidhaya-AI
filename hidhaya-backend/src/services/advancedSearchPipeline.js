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
// Smart Entity Detection - Built-in for common Islamic queries
// This prevents random retrieval by boosting high-priority content

// Priority Surahs/Ayahs for specific questions (per Planning.md PRD #11)
const PRIORITY_CONTENT = {
  // Allah-related queries - these Surahs MUST appear first
  allah: {
    topic: 'tawheed',
    prioritySurahs: [112, 1, 2], // Ikhlas, Fatiha, Baqarah (Ayatul Kursi)
    keywords: ['tawheed', 'oneness', 'one', 'single', 'alone', ' creator', 'sustainer', 'mercy', 'merciful'],
    boostKeywords: ['hu', 'huwa', 'ahad', 'wahid', 'khuda', 'rabb', 'ilaah']
  },
  // Prophet Muhammad related queries
  muhammad: {
    topic: 'prophethood',
    prioritySurahs: [33, 21, 3], // Ahzab, Anbiya, Ale Imran
    keywords: ['prophet', 'messenger', 'nabi', 'rasul', 'muhammad', ' Muhammad'],
    boostKeywords: ['rahma', 'mercy', 'huda', 'guidance', 'sunnah']
  },
  // Tawheed queries
  tawheed: {
    topic: 'tawheed',
    prioritySurahs: [112, 6, 2],
    keywords: ['tawheed', 'tawhid', 'oneness', 'monotheism'],
    boostKeywords: ['shirk', 'partner', 'alone', 'single', 'one god']
  },
  // Shirk queries
  shirk: {
    topic: 'shirk',
    prioritySurahs: [6, 2, 4],
    keywords: ['shirk', 'polytheism', 'idolatry', 'partner'],
    boostKeywords: ['shirk', 'mushrik', 'kufr', 'disbelief']
  },
  // Prayer/Salah
  salah: {
    topic: 'prayer',
    prioritySurahs: [2, 4, 33],
    keywords: ['prayer', 'salah', 'namaz', 'worship'],
    boostKeywords: ['salah', 'rakat', 'qibla', 'wudu']
  },
  // Patience
  sabr: {
    topic: 'patience',
    prioritySurahs: [2, 3, 4],
    keywords: ['patience', 'sabr', 'endurance'],
    boostKeywords: ['sabr', 'patient', 'steadfast']
  },
  // Faith/Iman
  iman: {
    topic: 'faith',
    prioritySurahs: [2, 8, 9],
    keywords: ['faith', 'iman', 'belief'],
    boostKeywords: ['shahadah', 'believe', 'faith']
  },
  // Guidance
  hidayah: {
    topic: 'guidance',
    prioritySurahs: [2, 1, 3],
    keywords: ['guidance', 'hidayah', 'hidayat', 'guide'],
    boostKeywords: ['huda', 'guide', 'right path', 'straight']
  }
};

// Detect what entity/topic the user is asking about
const detectSmartEntity = (query) => {
  const lower = query.toLowerCase();

  // Check for Allah-related queries first
  const allahPatterns = ['allah', 'khuda', 'rab', 'god', 'rabb', 'who is god', 'kon hai allah', 'allah kon hain', 'who is allah', 'what is allah'];
  if (allahPatterns.some(p => lower.includes(p))) {
    return 'allah';
  }

  // Check for Prophet Muhammad
  const muhammadPatterns = ['muhammad', 'prophet muhammad', 'nabi', 'rasulullah', 'messenger of allah', 'who is muhammad'];
  if (muhammadPatterns.some(p => lower.includes(p))) {
    return 'muhammad';
  }

  // Check for Tawheed
  const tawheedPatterns = ['tawheed', 'tawhid', 'oneness of god', 'monotheism'];
  if (tawheedPatterns.some(p => lower.includes(p))) {
    return 'tawheed';
  }

  // Check for Shirk
  const shirkPatterns = ['shirk', 'polytheism', 'idolatry', 'associating partners'];
  if (shirkPatterns.some(p => lower.includes(p))) {
    return 'shirk';
  }

  // Check for Prayer
  const salahPatterns = ['salah', 'namaz', 'prayer', 'how to pray'];
  if (salahPatterns.some(p => lower.includes(p))) {
    return 'salah';
  }

  // Check for Sabr/Patience
  const sabrPatterns = ['sabr', 'patience', 'patient', 'endurance'];
  if (sabrPatterns.some(p => lower.includes(p))) {
    return 'sabr';
  }

  // Check for Iman/Faith
  const imanPatterns = ['iman', 'faith', 'belief', 'believe'];
  if (imanPatterns.some(p => lower.includes(p))) {
    return 'iman';
  }

  // Check for Guidance
  const hidayahPatterns = ['hidayah', 'guidance', 'guide', 'hidayat'];
  if (hidayahPatterns.some(p => lower.includes(p))) {
    return 'hidayah';
  }

  return null;
};

// Check if this is a "who is" or "what is" type question (topic question)
const isTopicQuestion = (query) => {
  const lower = query.toLowerCase();
  const topicPatterns = [
    'who is', 'what is', 'who was', 'what was',
    'kya hai', 'kon hai', 'kaun hai',
    'کیا ہے', 'کون ہے',
    'কি', 'কে'
  ];
  return topicPatterns.some(p => lower.includes(p));
};

// Get priority search terms for entity
const getPrioritySearchTerms = (entityKey) => {
  const entity = PRIORITY_CONTENT[entityKey];
  if (!entity) return [];
  return [...entity.keywords, ...entity.boostKeywords];
};

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

  // ============================================================
  // ENHANCED: Query Normalization with Question Type Detection
  // ============================================================
  // Remove noise words based on language - expanded list
  const noiseWords = {
    english: [
      'what is', 'who is', 'how to', 'explain', 'tell me about',
      'can you', 'please', 'tell', 'define', 'meaning of', 'according to',
      'in the quran', 'in the hadith', 'from quran', 'from hadith',
      'does quran say', 'does hadith say', 'what does the quran say', 'what does the hadith say',
      'is it allowed', 'is it halal', 'is it haram', 'is it permissible', 'is it forbidden',
      'should i', 'should we', 'can i', 'can we', 'may i', 'would', 'could',
      'tell me', 'explain to me', 'i want to know', 'i want to understand',
      'looking for', 'searching for', 'need information', 'need to know',
      'give me', 'provide me', 'share with me', 'teach me', 'learn about',
      'write about', 'discuss', 'describe', 'elaborate on', 'clarify',
      'difference between', 'what\'s the difference', 'compare', 'vs', 'versus'
    ],
    hindi: [
      'क्या है', 'कैसे', 'बताइए', 'बता दो', 'क्या',
      'कुरान में क्या है', 'हैं', 'किसे कहते हैं', 'कौन है', 'कौन सा है', 'किसका',
      'क्या कहता है', 'क्या बताता है', 'हलाल है', 'हराम है',
      'जाइए', 'करें', 'सकते हैं', 'चाहिए', 'होगी', 'होगा', 'किया जा सकता है',
      'बताइए', 'समझाइए', 'बताओ', 'जानना चाहता हूं', 'जानना चाहती हूं',
      'के बारे में', 'के विषय में', 'से संबंधित', 'के बारे में जानकारी'
    ],
    urdu: [
      'کیا ہے', 'کیسے', 'بتائیں', 'کیا',
      'قرآن میں کیا ہے', 'کون ہے', 'کسے کہتے ہیں', 'کس کو کہتے ہیں',
      'کیا کہتا ہے', 'کیا بیان کرتا ہے',
      'حلال ہے', 'حرام ہے', 'جایز ہے', 'ممنوع ہے',
      'کر سکتے ہیں', 'کرنا چاہیے', 'ہونا چاہیے', 'کیا جائے',
      'بتائیے', 'سمجھائیے', 'بیان کریں', 'وضاحت کریں',
      'کے بارے میں', 'کے متعلق', 'سے متعلق معلومات'
    ],
    bengali: [
      'কি', 'কিভাবে', 'বলো', 'কুরআনে কি বলে', 'কে',
      'কাকে বলে', 'কারা', 'কোন', 'কিরূপ', 'কীভাবে', 'কিসের',
      'কি বলে', 'কি বলেছে', 'কুরআন কি বলে',
      'হালাল', 'হারাম', 'জায়েজ', 'নাজায়েজ',
      'করা যায়', 'করা উচিত', 'করা সম্ভব', 'হবে',
      'বলুন', 'বুঝান', 'বর্ণনা করুন', 'ব্যাখ্যা করুন',
      'সম্পর্কে', 'সম্পর্কিত', 'সম্পর্কে তথ্য'
    ],
    roman_urdu: [
      'kya hai', 'kaise', 'batao', 'ke', 'kya',
      'kon hai', 'kise kahte hain', 'kiska', 'konsa', 'kaisa', 'kaisi', 'kaise',
      'kya kehta hai', 'kya bolta hai', 'quran kya kehta hai',
      'halal hai', 'haram hai', 'jaiz hai', 'mana hai',
      'kar sakte hain', 'karna chahiye', 'hona chahiye', 'kar sakega',
      'batao', 'samjhao', 'bayan karein', 'wazahat karein',
      'ke baray mein', 'ke mutaliq', 'ke bare mein', 'information ke liye'
    ],
    arabic: [
      'ما هو', 'كيف', 'في الإسلام', 'من هو', 'ما هي', 'ما هو تعريف', 'ما معنى',
      'ما حكم', 'ما حكم الدين في', 'هل', 'هل يجوز', 'هل يحل', 'هل يحرم',
      'ما الفرق بين', 'ما العلاقة بين', 'اشرح', 'فسر', 'بين', 'عرف',
      'من', 'ماذا', 'كيف', 'لماذا', 'متى', 'أين'
    ]
  };

  let normalizedQuery = query.toLowerCase().trim();
  const detectedLang = language.split('-')[0];
  const langNoiseWords = noiseWords[detectedLang] || noiseWords.english;

  // Detect question type for better response generation
  const questionTypes = {
    definition: ['what is', 'who is', 'define', 'meaning of', 'kya hai', 'کیا ہے', 'কি'],
    explanation: ['explain', 'tell me about', 'how does', 'why', 'kaise', 'کیسے', 'কিভাবে'],
    comparison: ['difference between', 'vs', 'versus', 'compare', 'farq', ' فرق', 'পার্থক্য'],
    permission: ['is it allowed', 'is it halal', 'is it permissible', 'can i', 'halal hai', 'jaiz hai', 'হালাল', 'জায়েজ'],
    prohibition: ['is it forbidden', 'is it haram', 'can\'t', 'haram hai', 'mana hai', 'হারাম', 'মানা'],
    action: ['should i', 'what should', 'how to', 'karna chahiye', 'کرنا چاہیے', 'করা উচিত'],
    location: ['where', 'kahan', 'kaha', 'কোথায়'],
    person: ['who', 'kon', 'kaun', 'কে']
  };

  // Detect question type
  let detectedQuestionType = 'general';
  for (const [qType, patterns] of Object.entries(questionTypes)) {
    if (patterns.some(p => normalizedQuery.includes(p.toLowerCase()))) {
      detectedQuestionType = qType;
      break;
    }
  }

  // Remove noise words - handle both single and multi-word phrases
  // Sort by length descending to handle longer phrases first
  const sortedNoiseWords = [...langNoiseWords].sort((a, b) => b.length - a.length);
  for (const word of sortedNoiseWords) {
    normalizedQuery = normalizedQuery.replace(new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), ' ');
  }
  // Clean up
  normalizedQuery = normalizedQuery.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();

  // Use the new comprehensive semantic engine for query processing
  let semanticResult = { detectedConcepts: [], normalizedQuery: normalizedQuery, expandedQuery: '', detectedLanguage: detectedLang, emotion: 'neutral' };
  try {
    semanticResult = processQuery(query, language);
    if (semanticResult.normalizedQuery) {
      normalizedQuery = semanticResult.normalizedQuery;
    }
  } catch (e) {
    console.error('Semantic engine error:', e.message);
  }

  const detectedConcepts = semanticResult.detectedConcepts || [];
  const expandedQuery = semanticResult.expandedQuery || '';

  // ============================================================
  // PRIORITY: Detect Islamic Entity FIRST (PRD #5, #8)
  // This prevents random retrieval - entity search before keyword search
  // Using smart built-in entity detection
  // ============================================================
  let detectedEntity = null;
  let entitySearchQuery = null;
  let isEntityQuestion = false;

  // Use smart built-in entity detection
  isEntityQuestion = isTopicQuestion(query);
  const smartEntityKey = detectSmartEntity(query);

  if (smartEntityKey) {
    detectedEntity = {
      key: smartEntityKey,
      type: 'smart',
      entity: PRIORITY_CONTENT[smartEntityKey]
    };
    console.log(`🎯 Smart Entity detected: ${smartEntityKey} (topic: ${detectedEntity.entity?.topic})`);

    // Build entity-specific search query
    entitySearchQuery = smartEntityKey;
    console.log(`   Entity search query: "${entitySearchQuery}"`);
  }

  // Debug: Log what we're searching for
  console.log(`🔍 Search query: "${query}" -> normalized: "${normalizedQuery}"`);
  console.log(`   Detected concepts: ${detectedConcepts.join(', ') || 'none'}`);
  console.log(`   Entity question: ${isEntityQuestion}, Entity: ${detectedEntity ? detectedEntity.key : 'none'}`);
  console.log(`   MongoDB connected: ${isMongoConnected()}`);

  // Build expanded search terms using both old and new semantic systems
  // PRIORITY: If entity detected, use entity-specific terms FIRST (PRD #8 - prevent random retrieval)
  let searchTerms = [];

  if (detectedEntity && detectedEntity.key) {
    // Use entity-specific search terms to prevent random retrieval
    const entityTerms = getPrioritySearchTerms(detectedEntity.key);
    searchTerms = [...entityTerms];
    console.log(`   Entity search terms: ${searchTerms.join(', ')}`);
  } else {
    // Fallback to regular normalized query
    searchTerms = [normalizedQuery];
  }

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
    let mongoHasData = false;
    try {
      const quranCount = await Quran.countDocuments();
      const hadithCount = await Hadith.countDocuments();
      console.log(`   MongoDB collections: Quran=${quranCount}, Hadith=${hadithCount}`);

      if (quranCount === 0 && hadithCount === 0) {
        console.log('   ⚠️ MongoDB collections are empty! Using fallback data.');
        mongoHasData = false;
      } else {
        mongoHasData = true;
      }
    } catch (countErr) {
      console.error('   Count error:', countErr.message);
    }

    // If MongoDB has no data, use fallback
    if (!mongoHasData) {
      console.log('   MongoDB has no data, using fallback data');
      loadFallbackData();

      // Use advanced search on fallback
      const advancedResults = await performAdvancedSearch(normalizedQuery, fallbackDocuments);

      if (advancedResults.results && advancedResults.results.length > 0) {
        matchLayers.advanced = advancedResults.results.length;
        results = advancedResults.results.map(r => ({
          ...r,
          matchLayer: 'advanced',
          confidence: r.searchScore || 0.6,
          advancedScores: r.scoreBreakdown
        }));
      } else {
        // Basic fallback search
        results = fallbackDocuments
          .filter(doc => {
            const searchText = `${doc.english || ''} ${doc.urdu || ''} ${doc.hindi || ''} ${doc.bengali || ''}`.toLowerCase();
            return searchTerms.some(term => searchText.includes(term.toLowerCase()));
          })
          .slice(0, 10)
          .map(doc => ({ ...doc, matchLayer: 'fallback', confidence: 0.7 }));
        matchLayers.fallback = results.length;
      }
    } else {
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

  // ============================================================
  // RE-RANKING ENGINE - PRD Requirement #18, #9
  // Score results by: topic relevance, semantic similarity,
  // exact phrase presence, narrator match, confidence, concept match, entity relevance
  // ============================================================
  results = rerankResults(results, normalizedQuery, detectedConcepts, detectedEntity);

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

  // Cache results for future queries - include question type for better response generation
  const finalSearchMetadata = {
    query,
    normalizedQuery,
    detectedConcepts,
    detectedLanguage: semanticResult.detectedLanguage,
    emotion: semanticResult.emotion,
    expandedQuery,
    questionType: detectedQuestionType, // Add detected question type for intelligent responses
    // Add Islamic entity detection for intelligent retrieval (PRD #5, #6, #7)
    detectedEntity: detectedEntity ? {
      type: detectedEntity.type,
      key: detectedEntity.key,
      name: detectedEntity.entity.name,
      topic: detectedEntity.entity.topic,
      isTopicQuestion: isEntityQuestion
    } : null,
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
// RE-RANKING ENGINE - PRD Requirement #18, #9 (Intelligent Re-ranking)
// Score results by: topic relevance, semantic similarity,
// exact phrase presence, narrator match, confidence, concept match, entity relevance
// ============================================================
const rerankResults = (results, normalizedQuery, detectedConcepts, detectedEntity = null) => {
  if (!results || results.length === 0) return results;

  const queryWords = normalizedQuery.toLowerCase().split(/\s+/).filter(w => w.length > 1);

  // Score each result based on multiple factors
  const scoredResults = results.map(result => {
    let score = result.confidence || 0.5;
    const scoreBreakdown = {};

    // Get text for matching
    const allText = `${result.english || ''} ${result.urdu || ''} ${result.hindi || ''} ${result.bengali || ''}`.toLowerCase();

    // ============================================================
    // Entity-based scoring (PRD #9) - priority for topic questions
    // This prevents random retrieval by boosting topic-relevant content
    // ============================================================
    // Handle both old format and new smart entity format
    const entityTopic = detectedEntity?.entity?.topic || detectedEntity?.topic;
    const entityKey = detectedEntity?.key || null;

    if (entityTopic) {
      const resultTopics = result.topics || result.keywords || [];
      const topicLower = entityTopic.toLowerCase();

      // Check if result matches the detected entity's topic
      const topicMatch = resultTopics.some(topic =>
        topic.toLowerCase().includes(topicLower) || topicLower.includes(topic.toLowerCase())
      );

      if (topicMatch) {
        // Strong boost for topic match
        score += 0.25;
        scoreBreakdown.entityTopicMatch = 0.25;
      }

      // Check for specific topic keywords in the result
      const topicKeywords = {
        tawheed: ['tawheed', 'oneness', 'unity', 'single', 'one', 'alone'],
        prophethood: ['prophet', 'messenger', 'revelation', 'nabi', 'rasul'],
        sabr: ['patience', 'sabr', 'endurance', 'steady'],
        iman: ['faith', 'iman', 'belief', 'shahadah'],
        salah: ['prayer', 'salah', 'namaz', 'worship'],
        shirk: ['shirk', 'polytheism', 'partners', 'associate']
      };

      const entityKeywords = topicKeywords[topicLower] || [];
      if (entityKeywords.length > 0) {
        const keywordMatchCount = entityKeywords.filter(kw =>
          allText.includes(kw.toLowerCase())
        ).length;
        if (keywordMatchCount > 0) {
          const keywordBonus = Math.min(0.15, keywordMatchCount * 0.05);
          score += keywordBonus;
          scoreBreakdown.entityKeywordMatch = keywordBonus;
        }
      }

      // Priority Surah/Ayah boost for smart entities (PRD #11)
      if (entityKey && PRIORITY_CONTENT[entityKey]) {
        const priority = PRIORITY_CONTENT[entityKey];
        const resultChapter = result.chapter;
        // Boost if result is from priority Surahs (e.g., Surah Ikhlas for Allah queries)
        if (resultChapter && priority.prioritySurahs?.includes(parseInt(resultChapter))) {
          score += 0.2;
          scoreBreakdown.prioritySurah = 0.2;
        }
      }
    }

    // Factor 1: Exact phrase match in content (highest priority)
    const exactMatches = queryWords.filter(word => allText.includes(word)).length;
    const exactMatchBonus = Math.min(0.3, exactMatches * 0.1);
    score += exactMatchBonus;
    scoreBreakdown.exactMatch = exactMatchBonus;

    // Factor 2: Topic/Concept match (if detected)
    if (detectedConcepts.length > 0) {
      const resultTopics = result.topics || result.keywords || [];
      const conceptMatches = detectedConcepts.filter(concept =>
        resultTopics.some(topic => topic.toLowerCase().includes(concept.toLowerCase()))
      ).length;
      const conceptBonus = Math.min(0.2, conceptMatches * 0.1);
      score += conceptBonus;
      scoreBreakdown.conceptMatch = conceptBonus;
    }

    // Factor 3: Source quality bonus (Quran preferred)
    if (result.type === 'quran') {
      score += 0.1;
      scoreBreakdown.sourceBonus = 0.1;
    } else if (result.type === 'hadith' && result.grade) {
      // Boost authenticated hadiths
      if (result.grade.toLowerCase().includes('sahih')) {
        score += 0.08;
        scoreBreakdown.gradeBonus = 0.08;
      } else if (result.grade.toLowerCase().includes('hasan')) {
        score += 0.05;
        scoreBreakdown.gradeBonus = 0.05;
      }
    }

    // Factor 4: Content length relevance (medium length is often better)
    const contentLength = allText.length;
    if (contentLength > 50 && contentLength < 500) {
      score += 0.05;
      scoreBreakdown.lengthBonus = 0.05;
    }

    // Factor 5: Layer priority boost (exact > semantic > relaxed > fuzzy)
    const layerBoost = {
      exact: 0.15,
      semantic: 0.1,
      relaxed: 0.05,
      fuzzy: 0,
      advanced: 0.08,
      bm25: 0.05,
      crossLanguage: 0.03,
      phonetic: 0.02
    };
    const layerBonus = layerBoost[result.matchLayer] || 0;
    score += layerBonus;
    scoreBreakdown.layerBonus = layerBonus;

    // Cap score at 1.0
    score = Math.min(1, score);

    return {
      ...result,
      rerankScore: score,
      rerankBreakdown: scoreBreakdown
    };
  });

  // Sort by rerank score (highest first)
  return scoredResults.sort((a, b) => b.rerankScore - a.rerankScore);
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