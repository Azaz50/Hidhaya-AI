const fs = require('fs');
const path = require('path');
const Fuse = require('fuse.js');

// Synonym dictionary for query expansion
const synonyms = {
  "sabr": ["patience", "endurance", "perseverance", "steadfastness"],
  "shirk": ["associating partners with Allah", "polytheism", "idolatry"],
  "salah": ["prayer", "namaz", "worship"],
  "salat": ["prayer", "namaz", "worship"],
  "zakat": ["charity", "alms", "poor due"],
  "sawm": ["fasting", "roza"],
  "hajj": ["pilgrimage", "mecca"],
  "jannah": ["heaven", "paradise"],
  "jahannam": ["hell", "hellfire", "fire"],
  "tawbah": ["repentance", "forgiveness"],
  "iman": ["faith", "belief"],
  "taqwa": ["piety", "fear of allah", "righteousness", "god-consciousness"],
  "dua": ["supplication", "prayer", "request"],
  "halal": ["permissible", "lawful"],
  "haram": ["forbidden", "prohibited", "unlawful"]
};

let documents = [];
let fuseIndex = null;

const loadData = () => {
  try {
    // 1. Load Quran Data
    const quranPath = path.join(__dirname, '../data/quran/quran.json');
    if (fs.existsSync(quranPath)) {
      const quranData = JSON.parse(fs.readFileSync(quranPath, 'utf8'));
      // quranData is an object with chapter numbers as keys
      for (const chapterKey in quranData) {
        const verses = quranData[chapterKey];
        if (Array.isArray(verses)) {
          verses.forEach(verse => {
            documents.push({
              type: 'quran',
              text: verse.text,
              english: verse.EnglishTarjuma,
              urdu: verse.UrduTarjuma,
              source: `Surah ${verse.chapter}:${verse.verse}`
            });
          });
        }
      }
      console.log(`Loaded Quran data. Total documents so far: ${documents.length}`);
    } else {
      console.warn(`Quran data not found at ${quranPath}`);
    }

    // 2. Load Bukhari Data
    const bukhariPath = path.join(__dirname, '../data/hadith/bukhari.json');
    if (fs.existsSync(bukhariPath)) {
      const bukhariData = JSON.parse(fs.readFileSync(bukhariPath, 'utf8'));
      if (bukhariData && Array.isArray(bukhariData.hadiths)) {
        bukhariData.hadiths.forEach(hadith => {
          documents.push({
            type: 'hadith',
            text: hadith.arabic,
            english: hadith.english?.text || '',
            urdu: hadith.urdu?.text || '',
            source: `Bukhari Hadith ${hadith.idInBook}`
          });
        });
      }
      console.log(`Loaded Bukhari data. Total documents so far: ${documents.length}`);
    } else {
      console.warn(`Bukhari data not found at ${bukhariPath}`);
    }

    // 3. Initialize Fuse.js
    const options = {
      includeScore: true,
      threshold: 0.4, // Lower threshold for stricter matching, increase for fuzzier matching
      ignoreLocation: true, // Search anywhere in the string
      keys: [
        { name: 'english', weight: 0.5 },
        { name: 'urdu', weight: 0.3 },
        { name: 'text', weight: 0.2 } // Arabic text
      ]
    };
    
    fuseIndex = new Fuse(documents, options);
    console.log("Semantic Search Engine initialized with Fuse.js");
  } catch (error) {
    console.error("Error initializing Semantic Search Engine:", error);
  }
};

// Expand query with synonyms
const expandQuery = (query) => {
  if (!query) return '';
  
  let expandedQuery = query.toLowerCase();
  
  // Replace synonym keys with their expansions (we can just append them to give more context to Fuse)
  const words = expandedQuery.split(/\s+/);
  const expansions = [];
  
  words.forEach(word => {
    // Strip punctuation
    const cleanWord = word.replace(/[^\w\s]/gi, '');
    if (synonyms[cleanWord]) {
      expansions.push(...synonyms[cleanWord]);
    }
  });
  
  if (expansions.length > 0) {
    expandedQuery = `${expandedQuery} ${expansions.join(' ')}`;
  }
  
  return expandedQuery;
};

const search = (query, language = 'english') => {
  if (!fuseIndex || !query) {
    return [];
  }

  const expandedQuery = expandQuery(query);
  
  const results = fuseIndex.search(expandedQuery);
  
  // Return top 5 matches
  return results.slice(0, 5).map(result => result.item);
};

// Load data synchronously on startup
loadData();

module.exports = {
  search,
  expandQuery
};
