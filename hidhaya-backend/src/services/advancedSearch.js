/**
 * Phase 2: Advanced Search System
 * BM25 Full-text Search, Phonetic Matching, Cross-language Matching
 */

const Fuse = require('fuse.js');

// ============================================================
// BM25 IMPLEMENTATION
// ============================================================

class BM25 {
  constructor(documents, k1 = 1.5, b = 0.75) {
    this.documents = documents;
    this.k1 = k1;
    this.b = b;
    this.avgdl = 0;
    this.docFreqs = new Map();
    this.idf = new Map();
    this.docLengths = new Map();

    this.buildIndex();
  }

  // Tokenize text
  tokenize(text) {
    if (!text) return [];
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 1);
  }

  // Calculate document frequencies
  buildIndex() {
    const N = this.documents.length;
    let totalLength = 0;
    const dfCounts = new Map();

    this.documents.forEach((doc, idx) => {
      const text = `${doc.english || ''} ${doc.urdu || ''} ${doc.hindi || ''} ${doc.bengali || ''} ${doc.text || ''}`.toLowerCase();
      const tokens = this.tokenize(text);
      totalLength += tokens.length;
      this.docLengths.set(idx, tokens.length);

      // Get unique tokens in this doc
      const uniqueTokens = new Set(tokens);
      uniqueTokens.forEach(token => {
        dfCounts.set(token, (dfCounts.get(token) || 0) + 1);
      });
    });

    this.avgdl = totalLength / N;

    // Calculate IDF for each term
    dfCounts.forEach((df, term) => {
      this.idf.set(term, Math.log((N - df + 0.5) / (df + 0.5) + 1));
    });
  }

  // Get BM25 score for a query
  score(query) {
    const scores = new Array(this.documents.length).fill(0);
    const queryTokens = this.tokenize(query);

    if (queryTokens.length === 0) return scores;

    this.documents.forEach((doc, idx) => {
      const text = `${doc.english || ''} ${doc.urdu || ''} ${doc.hindi || ''} ${doc.bengali || ''} ${doc.text || ''}`.toLowerCase();
      const docTokens = this.tokenize(text);
      const docLength = this.docLengths.get(idx) || docTokens.length;

      let score = 0;
      queryTokens.forEach(qTerm => {
        const tf = docTokens.filter(t => t === qTerm).length;
        if (tf > 0) {
          const idf = this.idf.get(qTerm) || 0;
          const termFreq = (tf * (this.k1 + 1)) / (tf + this.k1 * (1 - this.b + this.b * (docLength / this.avgdl)));
          score += idf * termFreq;
        }
      });

      scores[idx] = score;
    });

    return scores;
  }

  // Get top N documents
  getTopDocuments(query, n = 10) {
    const scores = this.score(query);
    const indexed = scores.map((score, idx) => ({ score, idx, doc: this.documents[idx] }));

    return indexed
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, n);
  }
}

// ============================================================
// PHONETIC MATCHING (for Arabic/Script variations)
// ============================================================

const phoneticMap = {
  // Arabic script normalization
  'ا': 'alif',
  'ب': 'ba',
  'ت': 'ta', 'ة': 'ta',
  'ث': 'tha',
  'ج': 'jim',
  'ح': 'ha',
  'خ': 'kha',
  'د': 'dal',
  'ذ': 'dhal',
  'ر': 'ra',
  'ز': 'zay',
  'س': 'sin',
  'ش': 'shin',
  'ص': 'sad',
  'ض': 'dad',
  'ط': 'ta',
  'ظ': 'zad',
  'ع': 'ain',
  'غ': 'ghain',
  'ف': 'fa',
  'ق': 'qaf',
  'ك': 'kaf', 'ک': 'kaf',
  'ل': 'lam',
  'م': 'mim',
  'ن': 'nun',
  'ه': 'ha',
  'و': 'waw',
  'ي': 'ya', 'ی': 'ya',
  'ؤ': 'waw',
  'ئ': 'ya',
  'ى': 'ya',
  'أ': 'alif',
  'إ': 'alif',
  'آ': 'alif',
};

// Remove diacritics from Arabic text
const removeArabicDiacritics = (text) => {
  if (!text) return '';
  return text.normalize('NFD').replace(/[ً-ٰٟ]/g, '');
};

// Normalize Arabic script for comparison
const normalizeArabic = (text) => {
  if (!text) return '';
  const normalized = removeArabicDiacritics(text.toLowerCase());
  let result = '';
  for (const char of normalized) {
    if (phoneticMap[char]) {
      result += phoneticMap[char];
    } else if (/[a-z0-9]/.test(char)) {
      result += char;
    }
  }
  return result;
};

// Phonetic similarity score
const phoneticSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;

  const s1 = normalizeArabic(str1);
  const s2 = normalizeArabic(str2);

  if (s1 === s2) return 1;

  // Levenshtein-based similarity
  const len1 = s1.length;
  const len2 = s2.length;

  if (len1 === 0 || len2 === 0) return 0;

  const matrix = [];
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i-1] === s2[j-1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i-1][j] + 1,
        matrix[i][j-1] + 1,
        matrix[i-1][j-1] + cost
      );
    }
  }

  const maxLen = Math.max(len1, len2);
  return 1 - (matrix[len1][len2] / maxLen);
};

// ============================================================
// CROSS-LANGUAGE MATCHING
// ============================================================

const transliterationMap = {
  // Common Islamic terms cross-language mapping
  'quran': { arabic: 'قرآن', hindi: 'क़ुरान', urdu: 'قرآن', bengali: 'কুরআন' },
  'prayer': { arabic: 'صلاة', hindi: 'नमाज़', urdu: 'نماز', bengali: 'নামাজ' },
  'faith': { arabic: 'إيمان', hindi: 'ईमान', urdu: 'ایمان', bengali: 'বিশ্বাস' },
  'god': { arabic: 'الله', hindi: 'परमात्मा', urdu: 'اللہ', bengali: 'আল্লাহ' },
  'patience': { arabic: 'صبر', hindi: 'सब्र', urdu: 'صبر', bengali: 'সবর' },
  'gratitude': { arabic: 'شکر', hindi: 'शुक्र', urdu: 'شکر', bengali: 'কৃতজ্ঞতা' },
  'mercy': { arabic: 'رحم', hindi: 'दया', urdu: 'رحم', bengali: 'দয়া' },
  'forgiveness': { arabic: 'مغفرة', hindi: 'माफ़ी', urdu: 'معافی', bengali: 'ক্ষমা' },
  'guidance': { arabic: 'هداية', hindi: 'हिदायत', urdu: 'ہدایت', bengali: 'হিদায়াহ' },
  'heaven': { arabic: 'جنة', hindi: 'जन्नत', urdu: 'جنت', bengali: 'জান্নাত' },
  'hell': { arabic: 'جهنم', hindi: 'जहन्नुम', urdu: 'جہنم', bengali: 'জাহান্নাম' },
  'prophet': { arabic: 'نبی', hindi: 'पैगंबर', urdu: 'نبی', bengali: 'নবী' },
  'mosque': { arabic: 'مسجد', hindi: 'मस्जिद', urdu: 'مسجد', bengali: 'মসজিদ' },
  'fasting': { arabic: 'صوم', hindi: 'रोज़ा', urdu: 'روزہ', bengali: 'রোযা' },
  'charity': { arabic: 'زكاة', hindi: 'ज़कात', urdu: 'زکوٰۃ', bengali: 'যাকাত' },
  'pilgrimage': { arabic: 'حج', hindi: 'हज़', urdu: 'حج', bengali: 'হজ' },
  'islam': { arabic: 'إسلام', hindi: 'इस्लाम', urdu: 'اسلام', bengali: 'ইসলাম' },
  'muslim': { arabic: 'مسلم', hindi: 'मुस्लिम', urdu: 'مسلمان', bengali: 'মুসলিম' },
  'sunnah': { arabic: 'سنة', hindi: 'सुन्नत', urdu: 'سنت', bengali: 'সুন্নাহ' },
  'hadith': { arabic: 'حديث', hindi: 'हदीस', urdu: 'حدیث', bengali: 'হাদিস' },
};

// Expand query with cross-language terms
const expandQueryCrossLanguage = (query, language) => {
  const expansions = new Set();
  const lowerQuery = query.toLowerCase();

  for (const [term, translations] of Object.entries(transliterationMap)) {
    // If the English term or any translation matches
    if (lowerQuery.includes(term) || Object.values(translations).some(t => lowerQuery.includes(t.toLowerCase()))) {
      expansions.add(term);
      Object.values(translations).forEach(t => expansions.add(t));
    }
  }

  // Add all translations for detected terms
  for (const [term, translations] of Object.entries(transliterationMap)) {
    for (const trans of Object.values(translations)) {
      if (lowerQuery.includes(trans.toLowerCase())) {
        expansions.add(term);
        Object.values(translations).forEach(t => expansions.add(t));
      }
    }
  }

  return Array.from(expansions);
};

// ============================================================
// FUZZY MATCHING
// ============================================================

// Create Fuse instance for fuzzy search
const createFuzzySearcher = (documents) => {
  return new Fuse(documents, {
    includeScore: true,
    threshold: 0.4,
    ignoreLocation: true,
    keys: [
      { name: 'english', weight: 0.35 },
      { name: 'urdu', weight: 0.25 },
      { name: 'hindi', weight: 0.2 },
      { name: 'bengali', weight: 0.15 },
      { name: 'text', weight: 0.05 }
    ],
    minMatchCharLength: 2
  });
};

// Levenshtein distance for typo tolerance
const levenshteinDistance = (str1, str2) => {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i-1] === str2[j-1]) {
        dp[i][j] = dp[i-1][j-1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
      }
    }
  }

  return dp[m][n];
};

// Fuzzy match score
const fuzzyMatch = (query, text, threshold = 3) => {
  if (!query || !text) return { match: false, score: 0 };

  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const textLower = text.toLowerCase();

  let totalScore = 0;
  let matchedWords = 0;

  for (const word of queryWords) {
    // Exact match
    if (textLower.includes(word)) {
      totalScore += 1;
      matchedWords++;
      continue;
    }

    // Check for close matches in text words
    const textWords = textLower.split(/\s+/);
    for (const textWord of textWords) {
      if (textWord.length < 2) continue;

      const distance = levenshteinDistance(word, textWord);
      const maxLen = Math.max(word.length, textWord.length);

      // If distance is within threshold
      if (distance <= threshold && distance / maxLen <= 0.3) {
        totalScore += 0.8;
        matchedWords++;
        break;
      }
    }
  }

  const avgScore = queryWords.length > 0 ? totalScore / queryWords.length : 0;
  return {
    match: matchedWords > 0,
    score: avgScore,
    matchedWords
  };
};

// ============================================================
// HYBRID SEARCH ORCHESTRATOR
// ============================================================

const hybridSearch = async (query, documents, options = {}) => {
  const {
    enableBM25 = true,
    enableFuzzy = true,
    enableCrossLanguage = true,
    enablePhonetic = true,
    bm25Weight = 0.4,
    fuzzyWeight = 0.3,
    crossLangWeight = 0.2,
    phoneticWeight = 0.1,
    topN = 10
  } = options;

  if (!documents || documents.length === 0) {
    return { results: [], scores: {} };
  }

  const finalScores = new Array(documents.length).fill(0);
  const scoreBreakdown = documents.map(() => ({ bm25: 0, fuzzy: 0, crossLang: 0, phonetic: 0 }));

  // 1. BM25 Scoring
  if (enableBM25 && query.length > 2) {
    try {
      const bm25 = new BM25(documents);
      const bm25Scores = bm25.score(query);
      const maxBM25 = Math.max(...bm25Scores, 0.001);

      bm25Scores.forEach((score, idx) => {
        const normalized = score / maxBM25;
        finalScores[idx] += normalized * bm25Weight;
        scoreBreakdown[idx].bm25 = normalized * bm25Weight;
      });
    } catch (e) {
      console.log('BM25 search error:', e.message);
    }
  }

  // 2. Fuzzy Matching
  if (enableFuzzy && query.length > 2) {
    try {
      const fuzzySearcher = createFuzzySearcher(documents);
      const fuzzyResults = fuzzySearcher.search(query, { limit: documents.length });

      const maxFuzzy = Math.max(...fuzzyResults.map(r => 1 - r.score), 0.001);

      fuzzyResults.forEach(result => {
        const normalized = (1 - result.score) / maxFuzzy;
        finalScores[result.refIndex] += normalized * fuzzyWeight;
        scoreBreakdown[result.refIndex].fuzzy = normalized * fuzzyWeight;
      });
    } catch (e) {
      console.log('Fuzzy search error:', e.message);
    }
  }

  // 3. Cross-Language Expansion
  if (enableCrossLanguage) {
    const crossTerms = expandQueryCrossLanguage(query, options.language || 'english');
    if (crossTerms.length > 0) {
      const crossQuery = crossTerms.join(' ');

      documents.forEach((doc, idx) => {
        const docText = `${doc.english || ''} ${doc.urdu || ''} ${doc.hindi || ''} ${doc.bengali || ''} ${doc.text || ''}`.toLowerCase();

        let matchCount = 0;
        for (const term of crossTerms) {
          if (docText.includes(term.toLowerCase())) {
            matchCount++;
          }
        }

        const score = matchCount / crossTerms.length;
        finalScores[idx] += score * crossLangWeight;
        scoreBreakdown[idx].crossLang = score * crossLangWeight;
      });
    }
  }

  // 4. Phonetic Matching (for Arabic script)
  if (enablePhonetic) {
    const normalizedQuery = normalizeArabic(query);

    documents.forEach((doc, idx) => {
      const textFields = [doc.text, doc.english, doc.urdu, doc.hindi, doc.bengali]
        .filter(Boolean)
        .join(' ');

      const similarity = phoneticSimilarity(normalizedQuery, normalizeArabic(textFields));

      if (similarity > 0.5) {
        finalScores[idx] += similarity * phoneticWeight;
        scoreBreakdown[idx].phonetic = similarity * phoneticWeight;
      }
    });
  }

  // Normalize scores and rank
  const maxScore = Math.max(...finalScores, 0.001);
  const ranked = finalScores.map((score, idx) => ({
    doc: documents[idx],
    idx,
    totalScore: score / maxScore,
    breakdown: scoreBreakdown[idx],
    matchLayers: getMatchLayers(scoreBreakdown[idx])
  }));

  // Sort by total score
  ranked.sort((a, b) => b.totalScore - a.totalScore);

  return {
    results: ranked.slice(0, topN).map(r => ({
      ...r.doc,
      searchScore: r.totalScore,
      scoreBreakdown: r.breakdown,
      matchLayers: r.matchLayers
    })),
    scores: Object.fromEntries(ranked.slice(0, topN).map((r, i) => [i, { total: r.totalScore, ...r.breakdown }]))
  };
};

// Get match layers from score breakdown
const getMatchLayers = (breakdown) => {
  const layers = [];
  if (breakdown.bm25 > 0) layers.push('bm25');
  if (breakdown.fuzzy > 0) layers.push('fuzzy');
  if (breakdown.crossLang > 0) layers.push('cross-language');
  if (breakdown.phonetic > 0) layers.push('phonetic');
  return layers;
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  BM25,
  hybridSearch,
  normalizeArabic,
  removeArabicDiacritics,
  phoneticSimilarity,
  expandQueryCrossLanguage,
  createFuzzySearcher,
  levenshteinDistance,
  fuzzyMatch,
  transliterationMap
};