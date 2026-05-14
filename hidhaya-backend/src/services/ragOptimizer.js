/**
 * Phase 4: RAG Pipeline Optimization
 * Enhanced confidence scoring, structured response format, context window management
 */

const { HADITH_COLLECTION_NAMES } = require('./promptGenerator');

// ============================================================
// ENHANCED CONFIDENCE SCORING
// ============================================================

class ConfidenceScorer {
  constructor() {
    this.layerWeights = {
      exact: 1.0,
      relaxed: 0.8,
      semantic: 0.6,
      fuzzy: 0.4,
      advanced: 0.7,
      bm25: 0.75,
      crossLanguage: 0.5,
      phonetic: 0.3
    };

    this.sourceWeights = {
      quran: 1.0,
      hadith: 0.85
    };

    this.gradeWeights = {
      'Sahih': 1.0,
      'Hasan': 0.9,
      'Daif': 0.6,
      'Fabricated': 0.2,
      '': 0.7
    };
  }

  // Calculate overall confidence from search results
  calculateConfidence(searchResults, searchMetadata = {}) {
    if (!searchResults || searchResults.length === 0) {
      return { score: 0, level: 'none', factors: {} };
    }

    const factors = {};

    // Factor 1: Number of relevant references
    const refCount = searchResults.length;
    factors.referenceCount = Math.min(1, refCount / 5);
    factors.referenceCountScore = refCount >= 5 ? 1.0 : (refCount >= 3 ? 0.8 : (refCount >= 1 ? 0.6 : 0.2));

    // Factor 2: Quality of match layers
    const layerScores = searchResults.map(r => this.layerWeights[r.matchLayer] || 0.5);
    const avgLayerScore = layerScores.reduce((a, b) => a + b, 0) / layerScores.length;
    factors.avgLayerScore = avgLayerScore;

    // Factor 3: Source distribution (Quran preferred)
    const quranCount = searchResults.filter(r => r.type === 'quran').length;
    const hadithCount = searchResults.filter(r => r.type === 'hadith').length;
    const hasBothSources = quranCount > 0 && hadithCount > 0;
    factors.bothSourcesBonus = hasBothSources ? 0.1 : 0;

    // Factor 4: Grade quality for hadiths
    const hadithGrades = searchResults.filter(r => r.type === 'hadith').map(r => r.grade || '');
    const gradeScore = hadithGrades.length > 0
      ? hadithGrades.reduce((sum, g) => sum + (this.gradeWeights[g] || 0.7), 0) / hadithGrades.length
      : 1;
    factors.gradeQuality = gradeScore;

    // Factor 5: Search score from advanced search
    const avgSearchScore = searchResults.reduce((sum, r) => sum + (r.searchScore || r.confidence || 0.5), 0) / searchResults.length;
    factors.searchScore = avgSearchScore;

    // Factor 6: Text length relevance (longer matches = better relevance)
    const avgTextLength = searchResults.reduce((sum, r) => {
      const text = r.english || r.urdu || r.hindi || r.bengali || r.text || '';
      return sum + Math.min(1, text.length / 100);
    }, 0) / searchResults.length;
    factors.textRelevance = avgTextLength;

    // Calculate weighted final score
    const score =
      (factors.referenceCountScore * 0.15) +
      (factors.avgLayerScore * 0.25) +
      (factors.searchScore * 0.25) +
      (factors.gradeQuality * 0.15) +
      (factors.textRelevance * 0.1) +
      (factors.bothSourcesBonus * 0.1);

    // Determine confidence level
    let level;
    if (score >= 0.8) level = 'very_high';
    else if (score >= 0.65) level = 'high';
    else if (score >= 0.45) level = 'medium';
    else if (score >= 0.25) level = 'low';
    else level = 'very_low';

    return {
      score: Math.round(score * 100) / 100,
      level,
      factors,
      breakdown: {
        referenceCount: Math.round(factors.referenceCountScore * 100) / 100,
        layerQuality: Math.round(avgLayerScore * 100) / 100,
        searchAccuracy: Math.round(avgSearchScore * 100) / 100,
        gradeQuality: Math.round(gradeScore * 100) / 100,
        sourceDiversity: hasBothSources ? 'both' : (quranCount > 0 ? 'quran_only' : 'hadith_only')
      }
    };
  }

  // Get recommended response format based on confidence
  getRecommendedFormat(confidence, searchResults) {
    const hasQuran = searchResults.some(r => r.type === 'quran');
    const hasHadith = searchResults.some(r => r.type === 'hadith');

    if (confidence.score >= 0.75) {
      return {
        format: 'detailed',
        includeQuran: hasQuran,
        includeHadith: hasHadith,
        sections: ['title', 'summary', 'quranGuidance', 'hadithGuidance', 'explanation', 'practical', 'closing', 'references']
      };
    } else if (confidence.score >= 0.5) {
      return {
        format: 'standard',
        includeQuran: hasQuran,
        includeHadith: hasHadith,
        sections: ['title', 'summary', 'guidance', 'explanation', 'closing', 'references']
      };
    } else {
      return {
        format: 'simple',
        includeQuran: hasQuran,
        includeHadith: hasHadith,
        sections: ['summary', 'guidance', 'closing', 'references']
      };
    }
  }
}

const confidenceScorer = new ConfidenceScorer();

// ============================================================
// STRUCTURED RESPONSE FORMATTER
// ============================================================

class ResponseFormatter {
  constructor() {
    this.templates = {
      english: {
        title: 'Islamic Guidance',
        summary: 'Summary',
        quranGuidance: 'Quranic Guidance',
        hadithGuidance: 'Hadith Guidance',
        guidance: 'Islamic Guidance',
        explanation: 'Understanding',
        practical: 'Practical Steps',
        closing: 'Closing Reminder',
        references: 'References',
        consultScholar: 'Please consult a qualified Islamic scholar for detailed guidance.'
      },
      hindi: {
        title: 'इस्लामिक मार्गदर्शन',
        summary: 'सारांश',
        quranGuidance: 'क़ुरानी मार्गदर्शन',
        hadithGuidance: 'हदीस मार्गदर्शन',
        guidance: 'इस्लामी मार्गदर्शन',
        explanation: 'समझना',
        practical: 'व्यावहारिक कदम',
        closing: 'अंतिम संदेश',
        references: 'संदर्भ',
        consultScholar: 'कृपया विस्तृत मार्गदर्शन के लिए किसी योग्य इस्लामिक विद्वान से परामर्श करें।'
      },
      urdu: {
        title: 'اسلامی رہنمائی',
        summary: 'خلاصہ',
        quranGuidance: 'قرآنی رہنمائی',
        hadithGuidance: 'حدیث رہنمائی',
        guidance: 'اسلامی رہنمائی',
        explanation: 'سمجھنا',
        practical: 'عملی اقدامات',
        closing: 'اختتامی پیغام',
        references: 'حوالے',
        consultScholar: 'براہ کرم تفصیلی رہنمائی کے لئے کسی اہل علم سے مشورہ کریں۔'
      },
      bengali: {
        title: 'ইসলামিক গাইডেন্স',
        summary: 'সারসংক্ষেপ',
        quranGuidance: 'কুরআনিক গাইডেন্স',
        hadithGuidance: 'হাদিস গাইডেন্স',
        guidance: 'ইসলামি নির্দেশনা',
        explanation: 'বোঝাপড়া',
        practical: 'বাস্তব পদক্ষেপ',
        closing: 'শেষ বার্তা',
        references: 'তথ্যসূত্র',
        consultScholar: 'অনুগ্রহ করে বিস্তারিত guidance-এর জন্য একজন যোগ্য আলেমের সাথে পরামর্শ করুন।'
      }
    };
  }

  // Format a structured response
  formatStructuredResponse(references, language = 'english', options = {}) {
    const {
      format = 'detailed',
      sections = ['title', 'summary', 'guidance', 'closing', 'references']
    } = options;

    const t = this.templates[language] || this.templates.english;
    const normalizedLang = language;

    // Separate Quran and Hadith references
    const quranRefs = references.filter(r => r.type === 'quran');
    const hadithRefs = references.filter(r => r.type === 'hadith');

    const response = {
      title: t.title,
      summary: '',
      quranGuidance: '',
      hadithGuidance: '',
      explanation: '',
      practical: '',
      closing: t.consultScholar,
      references: this.formatReferences(references, normalizedLang)
    };

    // Build content based on available references
    if (quranRefs.length > 0) {
      response.quranGuidance = this.formatQuranSection(quranRefs, normalizedLang);
    }

    if (hadithRefs.length > 0) {
      response.hadithGuidance = this.formatHadithSection(hadithRefs, normalizedLang);
    }

    // If no specific sections, combine into guidance
    if (!response.quranGuidance && !response.hadithGuidance) {
      response.guidance = this.formatGenericGuidance(references, normalizedLang);
    }

    return response;
  }

  formatQuranSection(quranRefs, language) {
    return quranRefs.slice(0, 3).map(r => {
      const text = this.getTextByLanguage(r, language);
      return `**Quran ${r.chapter || '?'}:${r.verse || '?'}**\n"${text}"`;
    }).join('\n\n');
  }

  formatHadithSection(hadithRefs, language) {
    return hadithRefs.slice(0, 3).map(r => {
      const bookName = HADITH_COLLECTION_NAMES[r.book] || r.book || 'Unknown';
      const hadithNum = r.idInBook || r.id || '?';
      const text = this.getTextByLanguage(r, language);
      const gradeText = r.grade ? ` [${r.grade}]` : '';
      return `**${bookName} — Hadith ${hadithNum}**${gradeText}\n"${text}"`;
    }).join('\n\n');
  }

  formatGenericGuidance(references, language) {
    return references.slice(0, 3).map(r => {
      const text = this.getTextByLanguage(r, language);
      const src = this.getSourceLabel(r);
      return `**${src}**\n"${text}"`;
    }).join('\n\n');
  }

  getTextByLanguage(doc, language) {
    switch (language) {
      case 'hindi': return doc.hindi || doc.english || '';
      case 'urdu': return doc.urdu || doc.english || '';
      case 'bengali': return doc.bengali || doc.english || '';
      case 'roman_urdu': return doc.romanUrdu || doc.english || '';
      default: return doc.english || '';
    }
  }

  getSourceLabel(doc) {
    if (doc.type === 'quran') {
      return `Quran ${doc.chapter || '?'}:${doc.verse || '?'}`;
    } else {
      const bookName = HADITH_COLLECTION_NAMES[doc.book] || doc.book || 'Unknown';
      const hadithNum = doc.idInBook || doc.id || '?';
      return `${bookName} — Hadith ${hadithNum}`;
    }
  }

  formatReferences(references, language) {
    return references.slice(0, 5).map((r, i) => {
      const text = this.getTextByLanguage(r, language);
      const src = this.getSourceLabel(r);
      const grade = r.grade ? ` [${r.grade}]` : '';
      return `${i + 1}. ${src}${grade}: ${text.substring(0, 150)}${text.length > 150 ? '...' : ''}`;
    });
  }
}

const responseFormatter = new ResponseFormatter();

// ============================================================
// RAG PROMPT BUILDER
// ============================================================

const buildRAGPrompt = (query, references, language, confidence, options = {}) => {
  const { format = 'detailed' } = options;
  const normalizedLang = language.toLowerCase().split('-')[0].trim();

  // Get formatted references for context
  const quranRefs = references.filter(r => r.type === 'quran');
  const hadithRefs = references.filter(r => r.type === 'hadith');

  // Build reference context
  let referenceContext = '\n\n**References from Quran and Hadith:**\n';

  if (quranRefs.length > 0) {
    referenceContext += '\n📖 **From the Quran:**\n';
    quranRefs.forEach(r => {
      const text = getTextByLanguage(r, normalizedLang);
      referenceContext += `- Quran ${r.chapter}:${r.verse}: "${text}"\n`;
    });
  }

  if (hadithRefs.length > 0) {
    referenceContext += '\n📚 **From Hadith:**\n';
    hadithRefs.forEach(r => {
      const bookName = HADITH_COLLECTION_NAMES[r.book] || r.book;
      const hadithNum = r.idInBook || r.id;
      const text = getTextByLanguage(r, normalizedLang);
      const grade = r.grade ? ` [${r.grade}]` : '';
      referenceContext += `- ${bookName} — Hadith ${hadithNum}${grade}: "${text}"\n`;
    });
  }

  // Build language-specific instructions
  const langInstructions = {
    english: 'Respond in English. Use simple, clear language.',
    hindi: 'Respond in Hindi (हिंदी). Use simple, clear language.',
    urdu: 'Respond in Urdu (اردو). Use simple, clear language.',
    bengali: 'Respond in Bengali (বাংলা). Use simple, clear language.',
    roman_urdu: 'Respond in Roman Urdu. Use simple, clear language.'
  };

  // Build format-specific instructions
  const formatInstructions = {
    detailed: `
**Response Format (Detailed):**
1. **Title**: A brief, meaningful title for the topic
2. **Summary**: A short 2-3 sentence summary of the guidance
3. **Quran Guidance**: Key Quranic verses relevant to the topic
4. **Hadith Guidance**: Key hadith relevant to the topic
5. **Explanation**: A simple explanation of the Islamic perspective
6. **Practical Steps**: 2-3 actionable steps one can take
7. **Closing**: An encouraging/reminder message
8. **References**: List the sources used (already provided above)`,
    standard: `
**Response Format (Standard):**
1. **Summary**: Brief overview
2. **Guidance**: Key teachings from Quran and/or Hadith
3. **Explanation**: Simple explanation
4. **Closing**: Encouraging reminder
5. **References**: List sources`,
    simple: `
**Response Format (Simple):**
1. Simple explanation of the topic
2. Key guidance from sources
3. Brief closing message
4. Sources mentioned`
  };

  // Build confidence-based caution
  const confidenceCaution = confidence.score < 0.5
    ? '\n⚠️ Note: Limited references were found. Please consult a scholar for detailed guidance.'
    : '';

  // STRICT ANTI-HALLUCINATION RULES
  const antiHallucinationRules = `
**🔒 STRICT ANTI-HALLUCINATION RULES (CRITICAL):**
1. **NEVER invent Quran verses or Surah numbers** - Only use verses explicitly provided above
2. **NEVER fabricate Hadith narrators, chain of narrators, or hadith text** - Only use hadith explicitly provided above
3. **NEVER create references** - Only cite sources that are explicitly listed above
4. **NEVER guess book names, hadith numbers, or verse numbers** - If uncertain, say "This reference is not in our current dataset"
5. **If no relevant reference exists for a specific point**, say: "This aspect is not covered in the available references. Please consult a qualified Islamic scholar."
6. **NEVER combine unrelated verses/hadith** - Each reference must be used in its original context

**Example of FORBIDDEN behavior:**
- ❌ "As Prophet Muhammad ﷺ said in Sahih Bukhari 1234..."
- ❌ "The Quran states in Surah Al-Baqarah 2:45..."
- ❌ Creating any reference not explicitly provided above

**Example of CORRECT behavior:**
- ✅ "According to the reference from [exact source]..."
- ✅ "The Quranic guidance provided above teaches us..."

If you cannot support a point with the provided references, clearly state that limitation.`;

  const prompt = `You are an Islamic scholar assistant providing guidance based on authentic Quran and Hadith sources.

**User Query**: ${query}
${referenceContext}
${confidenceCaution}
${antiHallucinationRules}

**Instructions:**
- ${langInstructions[normalizedLang] || langInstructions.english}
- ONLY use information from the provided references
- Do NOT invent or assume any references
- If references are insufficient, state "Not enough authentic references found. Please consult a qualified Islamic scholar."
- Be respectful, accurate, and helpful

${formatInstructions[format] || formatInstructions.detailed}

Generate your response:`;

  return prompt;
};

// Helper function
const getTextByLanguage = (doc, language) => {
  switch (language) {
    case 'hindi': return doc.hindi || doc.english || '';
    case 'urdu': return doc.urdu || doc.english || '';
    case 'bengali': return doc.bengali || doc.english || '';
    case 'roman_urdu': return doc.romanUrdu || doc.english || '';
    default: return doc.english || '';
  }
};

// ============================================================
// CONTEXT WINDOW OPTIMIZATION
// ============================================================

const optimizeContextWindow = (references, maxTokens = 4000) => {
  // Estimate tokens (rough: 4 chars per token)
  const maxChars = maxTokens * 4;

  let totalChars = 0;
  const selectedRefs = [];

  for (const ref of references) {
    const text = getTextByLanguage(ref, 'english');
    const src = ref.type === 'quran'
      ? `Quran ${ref.chapter}:${ref.verse}`
      : `${HADITH_COLLECTION_NAMES[ref.book] || ref.book} Hadith ${ref.idInBook || ref.id}`;

    const refChars = text.length + src.length + 50; // 50 for formatting

    if (totalChars + refChars <= maxChars) {
      selectedRefs.push(ref);
      totalChars += refChars;
    } else {
      break; // Stop adding more references
    }
  }

  return selectedRefs;
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  confidenceScorer,
  ResponseFormatter,
  responseFormatter,
  buildRAGPrompt,
  optimizeContextWindow,
  getTextByLanguage
};