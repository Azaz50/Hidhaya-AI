/**
 * Fast Islamic Search - Direct filtering approach
 */

const fs = require('fs');
const path = require('path');

let documents = [];

const HADITH_SOURCES = [
  'bukhari', 'muslim', 'ahmed', 'nasai', 'abudawud',
  'ibnmajah', 'aladab_almufrad', 'bulugh_almaram', 'malik',
  'mishkat_almasabih', 'nawawi40', 'qudsi40', 'riyad_assalihin',
  'shahwaliullah40', 'shamail_muhammadiah'
];

const loadAllData = () => {
  try {
    // Load Quran
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
            documents.push({
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
        } catch (e) { /* skip bad files */ }
      }
    });

    console.log(`✅ Loaded ${documents.length} documents (search ready)`);
  } catch (error) {
    console.error('Error initializing search:', error);
  }
};

loadAllData();

const search = (query, language = 'english') => {
  if (!query || !documents.length) {
    return { results: [], confidence: 'none', searchMetadata: { query, detectedConcepts: [] } };
  }

  const cleanQuery = query.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
  const queryWords = cleanQuery.split(/\s+/).filter(w => w.length > 2);

  if (queryWords.length === 0) {
    return { results: [], confidence: 'none', searchMetadata: { query, detectedConcepts: [] } };
  }

  // Fast scoring with direct matching across all languages
  const scored = [];

  for (const doc of documents) {
    // Search in English, Urdu, Hindi, Bengali
    const allText = [
      (doc.english || '').toLowerCase(),
      (doc.urdu || '').toLowerCase(),
      (doc.hindi || '').toLowerCase(),
      (doc.bengali || '').toLowerCase()
    ].join(' ');

    let score = 0;
    let matches = 0;

    for (const word of queryWords) {
      if (allText.includes(word)) {
        matches++;
        if (allText.includes(word + ' ') || allText.includes(' ' + word)) {
          score += 2;
        } else {
          score += 1;
        }
      }
    }

    if (matches > 0) {
      scored.push({ ...doc, score: score / queryWords.length, matchLayer: 'direct' });
    }
  }

  // Sort by score and take top results
  scored.sort((a, b) => b.score - a.score);
  const results = scored.slice(0, 10).map((r, i) => ({
    ...r,
    confidence: Math.min(1, r.score / 2)
  }));

  let confidence = 'none';
  if (results.length > 0) {
    const avgScore = results.reduce((s, r) => s + r.score, 0) / results.length;
    if (avgScore > 1.5) confidence = 'high';
    else if (avgScore > 0.5) confidence = 'medium';
    else confidence = 'low';
  }

  return {
    results,
    confidence,
    searchMetadata: {
      query,
      normalizedQuery: cleanQuery,
      detectedConcepts: extractConcepts(cleanQuery),
      detectedLanguage: language,
      emotion: 'neutral',
      totalDocuments: documents.length
    }
  };
};

const extractConcepts = (query) => {
  const concepts = [];
  const keywords = {
    anger: ['anger', 'angry', 'rage', 'wrath'],
    patience: ['patience', 'patient', 'calm'],
    prayer: ['prayer', 'salat', 'dua'],
    charity: ['charity', 'zakat', 'sadaqah'],
    fasting: ['fasting', 'ramadan'],
    faith: ['faith', 'belief', 'iman'],
    gratitude: ['gratitude', 'thanks', 'shukr']
  };

  for (const [concept, words] of Object.entries(keywords)) {
    if (words.some(w => query.includes(w))) concepts.push(concept);
  }
  return concepts;
};

const getStats = () => ({
  totalDocuments: documents.length,
  quranVerses: documents.filter(d => d.type === 'quran').length,
  hadithCount: documents.filter(d => d.type === 'hadith').length
});

module.exports = { search, getStats, loadAllData };