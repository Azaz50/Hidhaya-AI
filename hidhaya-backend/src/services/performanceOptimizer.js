/**
 * Phase 3: Performance & Scale - MongoDB Atlas Search & Vector Integration
 * Indexed search, aggregation pipeline, performance optimization
 */

const mongoose = require('mongoose');

// ============================================================
// INDEX DEFINITIONS FOR OPTIMAL SEARCH
// ============================================================

const QURAN_INDEXES = [
  {
    name: 'quran_text_search',
    definition: {
      indexType: 'text',
      fields: ['text', 'EnglishTarjuma', 'UrduTarjuma', 'HindiTarjuma', 'BengaliTarjuma']
    },
    weights: {
      text: 1.5,
      EnglishTarjuma: 1.2,
      UrduTarjuma: 1.0,
      HindiTarjuma: 0.8,
      BengaliTarjuma: 0.8
    }
  },
  {
    name: 'quran_chapter_verse',
    definition: { chapter: 1, verse: 1 },
    options: { unique: true }
  },
  {
    name: 'quran_arabic_search',
    definition: { text: 'text' }
  }
];

const HADITH_INDEXES = [
  {
    name: 'hadith_text_search',
    definition: {
      indexType: 'text',
      fields: ['english.text', 'urdu.text', 'hindi.text', 'bengali.text', 'arabic']
    },
    weights: {
      'english.text': 1.2,
      arabic: 1.5,
      'urdu.text': 1.0,
      'hindi.text': 0.8,
      'bengali.text': 0.8
    }
  },
  {
    name: 'hadith_book_id',
    definition: { book: 1, idInBook: 1 },
    options: { unique: true }
  },
  {
    name: 'hadith_collection',
    definition: { book: 1 }
  },
  {
    name: 'hadith_narrator',
    definition: { 'english.narrator': 'text' }
  }
];

// ============================================================
// INDEX CREATION UTILITY
// ============================================================

const createIndexes = async (Quran, Hadith) => {
  const results = [];

  try {
    // Quran indexes
    for (const idx of QURAN_INDEXES) {
      try {
        if (idx.definition.indexType === 'text') {
          await Quran.collection.createIndex(
            idx.definition,
            idx.weights ? { weights: idx.weights } : { background: true }
          );
        } else {
          await Quran.collection.createIndex(
            idx.definition,
            idx.options || { background: true }
          );
        }
        results.push({ collection: 'quran', index: idx.name, status: 'created' });
      } catch (e) {
        if (e.code !== 85) { // Index already exists
          results.push({ collection: 'quran', index: idx.name, status: 'error', error: e.message });
        }
      }
    }

    // Hadith indexes
    for (const idx of HADITH_INDEXES) {
      try {
        if (idx.definition.indexType === 'text') {
          await Hadith.collection.createIndex(
            idx.definition,
            idx.weights ? { weights: idx.weights } : { background: true }
          );
        } else {
          await Hadith.collection.createIndex(
            idx.definition,
            idx.options || { background: true }
          );
        }
        results.push({ collection: 'hadith', index: idx.name, status: 'created' });
      } catch (e) {
        if (e.code !== 85) {
          results.push({ collection: 'hadith', index: idx.name, status: 'error', error: e.message });
        }
      }
    }
  } catch (error) {
    console.error('Index creation error:', error);
    results.push({ status: 'error', error: error.message });
  }

  return results;
};

// ============================================================
// ATLAS SEARCH AGGREGATION PIPELINE
// ============================================================

const buildAtlasSearchPipeline = (query, language = 'english', options = {}) => {
  const {
    limit = 10,
    boostExact = true,
    minScore = 0.1
  } = options;

  // Determine which field to search based on language
  let searchField = 'text';
  if (language === 'urdu') searchField = 'urdu';
  else if (language === 'hindi') searchField = 'hindi';
  else if (language === 'bengali') searchField = 'bengali';
  else if (language === 'english') searchField = 'EnglishTarjuma';

  return [
    {
      $search: {
        index: 'default',
        compound: {
          should: [
            {
              text: {
                query: query,
                path: searchField,
                score: { boost: { value: boostExact ? 2 : 1 } }
              }
            },
            {
              text: {
                query: query,
                path: { value: ['text', 'EnglishTarjuma', 'UrduTarjuma', 'HindiTarjuma', 'BengaliTarjuma'] },
                score: { boost: { value: 0.5 } }
              }
            }
          ],
          minimumShouldMatch: 1
        }
      }
    },
    {
      $match: {
        $or: [
          { type: 'quran' },
          { type: 'hadith' }
        ]
      }
    },
    {
      $addFields: {
        score: { $meta: 'searchScore' }
      }
    },
    {
      $sort: { score: -1 }
    },
    {
      $limit: limit
    },
    {
      $project: {
        _id: 1,
        type: 1,
        text: 1,
        english: 1,
        urdu: 1,
        hindi: 1,
        bengali: 1,
        chapter: 1,
        verse: 1,
        book: 1,
        idInBook: 1,
        source: 1,
        score: 1,
        matchLayer: 'atlas_search'
      }
    }
  ];
};

// ============================================================
// OPTIMIZED SEARCH QUERIES
// ============================================================

const optimizedQuranSearch = async (query, language = 'english', Quran) => {
  const searchField = getSearchField('quran', language);
  console.log(`   Quran search: query="${query}", field=${searchField}`);

  // First try regex search (more reliable)
  try {
    const results = await Quran.find({
      $or: [
        { english: { $regex: query, $options: 'i' } },
        { urdu: { $regex: query, $options: 'i' } },
        { hindi: { $regex: query, $options: 'i' } },
        { bengali: { $regex: query, $options: 'i' } },
        { text: { $regex: query, $options: 'i' } }
      ]
    })
    .limit(15)
    .lean();

    console.log(`   Quran regex results: ${results.length}`);
    return results.map(r => ({
      ...r,
      type: 'quran',
      matchLayer: 'regex_search',
      confidence: 0.7
    }));
  } catch (error) {
    console.error('   Quran search error:', error.message);
    return [];
  }
};

const optimizedHadithSearch = async (query, language = 'english', Hadith) => {
  const searchField = getSearchField('hadith', language);
  console.log(`   Hadith search: query="${query}", field=${searchField}`);

  // First try regex search (more reliable)
  try {
    const results = await Hadith.find({
      $or: [
        { english: { $regex: query, $options: 'i' } },
        { urdu: { $regex: query, $options: 'i' } },
        { hindi: { $regex: query, $options: 'i' } },
        { bengali: { $regex: query, $options: 'i' } },
        { arabic: { $regex: query, $options: 'i' } }
      ]
    })
    .limit(15)
    .lean();

    console.log(`   Hadith regex results: ${results.length}`);
    return results.map(r => ({
      ...r,
      type: 'hadith',
      matchLayer: 'regex_search',
      confidence: 0.7
    }));
  } catch (error) {
    console.error('   Hadith search error:', error.message);
    return [];
  }
};

// Get appropriate search field
const getSearchField = (collection, language) => {
  if (collection === 'quran') {
    const fields = {
      english: 'EnglishTarjuma',
      urdu: 'UrduTarjuma',
      hindi: 'HindiTarjuma',
      bengali: 'BengaliTarjuma',
      arabic: 'text'
    };
    return fields[language] || fields.english;
  } else {
    const fields = {
      english: 'english.text',
      urdu: 'urdu.text',
      hindi: 'hindi.text',
      bengali: 'bengali.text',
      arabic: 'arabic'
    };
    return fields[language] || fields.english;
  }
};

// ============================================================
// CACHING LAYER
// ============================================================

class SearchCache {
  constructor(maxSize = 1000, ttl = 300000) { // 5 minutes TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  generateKey(query, language) {
    return `${language}:${query.toLowerCase().trim()}`;
  }

  get(query, language) {
    const key = this.generateKey(query, language);
    const entry = this.cache.get(key);

    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.results;
  }

  set(query, language, results) {
    const key = this.generateKey(query, language);

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      results,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl
    };
  }
}

// Create singleton cache instance
const searchCache = new SearchCache();

// ============================================================
// BATCH PROCESSING FOR LARGE DATASETS
// ============================================================

const batchSearch = async (queries, language = 'english', searchFn) => {
  const results = {};

  // Process in batches of 10
  const batchSize = 10;
  for (let i = 0; i < queries.length; i += batchSize) {
    const batch = queries.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(query => searchFn(query, language))
    );

    batch.forEach((query, idx) => {
      results[query] = batchResults[idx];
    });
  }

  return results;
};

// ============================================================
// PERFORMANCE METRICS
// ============================================================

class SearchMetrics {
  constructor() {
    this.metrics = {
      totalQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      avgResponseTime: 0,
      totalResponseTime: 0,
      mongoQueries: 0,
      fallbackQueries: 0,
      layerBreakdown: {
        exact: 0,
        relaxed: 0,
        semantic: 0,
        fuzzy: 0,
        advanced: 0,
        atlas_search: 0
      }
    };
  }

  recordQuery(params) {
    this.metrics.totalQueries++;
    if (params.cacheHit) this.metrics.cacheHits++;
    else this.metrics.cacheMisses++;

    if (params.responseTime) {
      this.metrics.totalResponseTime += params.responseTime;
      this.metrics.avgResponseTime = this.metrics.totalResponseTime / this.metrics.totalQueries;
    }

    if (params.dataSource === 'mongodb') this.metrics.mongoQueries++;
    else this.metrics.fallbackQueries++;

    if (params.layer) {
      this.metrics.layerBreakdown[params.layer]++;
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      cacheHitRate: this.metrics.totalQueries > 0
        ? (this.metrics.cacheHits / this.metrics.totalQueries * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  reset() {
    this.metrics = {
      totalQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      avgResponseTime: 0,
      totalResponseTime: 0,
      mongoQueries: 0,
      fallbackQueries: 0,
      layerBreakdown: {
        exact: 0,
        relaxed: 0,
        semantic: 0,
        fuzzy: 0,
        advanced: 0,
        atlas_search: 0
      }
    };
  }
}

const searchMetrics = new SearchMetrics();

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  QURAN_INDEXES,
  HADITH_INDEXES,
  createIndexes,
  buildAtlasSearchPipeline,
  optimizedQuranSearch,
  optimizedHadithSearch,
  getSearchField,
  SearchCache,
  searchCache,
  batchSearch,
  SearchMetrics,
  searchMetrics
};