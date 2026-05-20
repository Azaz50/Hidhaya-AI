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
// EMOTIONAL CONTEXT FOR RAG PROMPTS
// ============================================================

const RAG_EMOTIONAL_OPENINGS = {
  neutral: {
    english: 'Assalamu Alaikum! Let me share what the Quran and Hadith teach about this.',
    hindi: 'अस्सलामु अलैकुम! मुझे बताने दीजिए कि कुरान और हदीस इस विषय पर क्या कहती हैं।',
    urdu: 'السلام علیکم! مجھے بتانے دیں کہ قرآن اور حدیث اس موضوع پر کیا کہتے ہیں۔',
    bengali: 'আসসালামু আলাইকুম! আমাকে বলতে দিন কুরআন ও হাদিস এই বিষয়ে কী বলে।',
    roman_urdu: 'Assalamu Alaikum! Mujhe batane dein ki Quran aur Hadith is topic par kya kehte hain.'
  },
  sadness: {
    english: 'May Allah ease your heart. Let me share beautiful guidance from the Quran and Hadith for you.',
    hindi: 'अल्लाह आपके दिल को आराम दे। मुझे आपके लिए कुरान और हदीस से खूबसूरत मार्गदर्शन साझा करने दें।',
    urdu: 'اللہ آپ کے دل کو آرام دے۔ مجھے آپ کے لئے قرآن اور حدیث سے خوبصورت رہنمائی دینے دیں۔',
    bengali: 'আল্লাহ আপনার মনকে শান্ত করুন। আমাকে আপনার জন্য কুরআন ও হাদিস থেকে সুন্দর দিকনির্দেশনা দিতে দিন।',
    roman_urdu: 'Allah aapke dil ko araam de. Mujhe aapke liye Quran aur Hadith se khoobsurat hidayat dene dein.'
  },
  fear: {
    english: 'Do not worry. Allah is with you. Let me share His guidance that brings peace.',
    hindi: 'चिंता मत करो। अल्लाह तुम्हारे साथ है। मुझे उसका मार्गदर्शन साझा करने दें जो शांति लाता है।',
    urdu: 'پریشان مت ہوں۔ اللہ آپ کے ساتھ ہے۔ مجھے اس کی رہنمائی دینے دیں جو سکون بخش ہے۔',
    bengali: 'চিন্তা করবেন না। আল্লাহ আপনার সাথে আছেন। আমাকে তাঁর দিকনির্দেশনা দিতে দিন যা শান্তি এনে দেয়।',
    roman_urdu: 'Pareshan mat hoiye. Allah aapke saath hai. Mujhe uski hidayat dene dein jo sukoon bakhshi hai.'
  },
  joy: {
    english: 'Alhamdulillah! Let me help you understand this beautiful teaching from the Quran and Hadith.',
    hindi: 'अल्हम्दुलिल्लाह! मुझे आपको कुरान और हदीस की इस खूबसूरत शिक्षा को समझने में मदद करने दें।',
    urdu: 'الحمد للہ! مجھے آپ کو قرآن اور حدیث کی اس خوبصورت تعلیم کو سمجھنے میں مدد کرنے دیں۔',
    bengali: 'আলহামদুলিল্লাহ! আমাকে আপনাকে কুরআন ও হাদিসের এই সুন্দর শিক্ষা বুঝতে সাহায্য করতে দিন।',
    roman_urdu: 'Alhamdulillah! Mujhe aapko Quran aur Hadith ki is khoobsurat taleem samajhne mein madad karein.'
  },
  confusion: {
    english: 'Let me help clarify this for you. Here is what the authentic sources say.',
    hindi: 'मुझे आपके लिए इसे स्पष्ट करने में मदद करने दें। यहाँ प्रामाणिक स्रोत क्या कहते हैं।',
    urdu: 'مجھے آپ کے لئے اسے واضح کرنے میں مدد کرنے دیں۔ یہاں مستند ذرائع کیا کہتے ہیں۔',
    bengali: 'আমাকে আপনার জন্য এটি স্পষ্ট করতে সাহায্য করতে দিন। এখানে প্রামাণিক উৎস কী বলে।',
    roman_urdu: 'Mujhe aapke liye ise saaf karein. Yehaan authentic sources kya kehte hain.'
  },
  hope: {
    english: 'May Allah fulfill your hope! Here is guidance from the Quran and Hadith.',
    hindi: 'अल्लाह आपकी उम्मीद पूरी करे! यहाँ कुरान और हदीस से मार्गदर्शन है।',
    urdu: 'اللہ آپ کی امید پوری کرے! یہاں قرآن اور حدیث سے رہنمائی ہے۔',
    bengali: 'আল্লাহ আপনার আশা পূরণ করুন! এখানে কুরআন ও হাদিস থেকে দিকনির্দেশনা।',
    roman_urdu: 'Allah aapki umeed puri karein! Yehaan Quran aur Hadith se hidayat hai.'
  },
  anger: {
    english: 'May Allah calm your heart. Let me share wisdom from the Quran and Hadith to help you.',
    hindi: 'अल्लाह आपके दिल को शांत करे। मुझे आपकी मदद के लिए कुरान और हदीस से ज्ञान साझा करने दें।',
    urdu: 'اللہ آپ کے دل کو سکون دے۔ مجھے آپ کی مدد کے لئے قرآن اور حدیث سے حکمت دینے دیں۔',
    bengali: 'আল্লাহ আপনার মনকে শান্ত করুন। আমাকে আপনার সাহায্যে কুরআন ও হাদিস থেকে জ্ঞান দিতে দিন।',
    roman_urdu: 'Allah aapke dil ko shant karein. Mujhe aapki madad ke liye Quran aur Hadith se hikmat dene dein.'
  }
};

const getRAGEmotionalOpening = (emotion, language) => {
  const normalizedLang = language.toLowerCase().split('-')[0].trim();
  return RAG_EMOTIONAL_OPENINGS[emotion]?.[normalizedLang] || RAG_EMOTIONAL_OPENINGS.neutral[normalizedLang];
};

// ============================================================
// RAG PROMPT BUILDER
// ============================================================

const buildRAGPrompt = (query, references, language, confidence, options = {}) => {
  const { format = 'detailed' } = options;
  const normalizedLang = language.toLowerCase().split('-')[0].trim();

  // Get question type and emotion from options (if provided)
  const questionType = options.questionType || 'general';
  const emotion = options.emotion || 'neutral';

  // Get emotional opening
  const emotionalOpening = getRAGEmotionalOpening(emotion, normalizedLang);

  // Get formatted references for context
  const quranRefs = references.filter(r => r.type === 'quran');
  const hadithRefs = references.filter(r => r.type === 'hadith');

  // Build reference context - IMPORTANT: Use user's selected language for references
  let referenceContext = '\n\n**References from Quran and Hadith (in your selected language):**\n';

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

  // Build format-specific instructions with emotional awareness
  const formatInstructions = {
    detailed: `
**Response Format (Detailed):**
1. **Warm Opening**: Start with empathy - acknowledge their question and feelings
2. **Title**: A brief, meaningful title for the topic
3. **Summary**: A short 2-3 sentence summary of the guidance
4. **Quran Guidance**: Key Quranic verses relevant to the topic
5. **Hadith Guidance**: Key hadith relevant to the topic
6. **Explanation**: A simple explanation of the Islamic perspective
7. **Practical Steps**: 2-3 actionable steps one can take
8. **Closing**: An encouraging/reminder message with a heartfelt du'a`,
    standard: `
**Response Format (Standard):**
1. **Warm Opening**: Acknowledge their question empathetically
2. **Summary**: Brief overview
3. **Guidance**: Key teachings from Quran and/or Hadith
4. **Explanation**: Simple explanation
5. **Closing**: Encouraging reminder with du'a`,
    simple: `
**Response Format (Simple):**
1. Warm, friendly opening
2. Simple explanation of the topic
3. Key guidance from sources
4. Brief closing message with du'a`
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

  // Build question type specific instructions
  const questionTypeInstructions = {
    definition: 'Focus on clear definition first, then explain with examples from references.',
    explanation: 'Provide comprehensive but easy-to-understand explanation.',
    comparison: 'Clearly explain differences using the references provided.',
    permission: 'Be clear about what is allowed/permissible according to the sources.',
    prohibition: 'Explain kindly what is discouraged/prohibited and why.',
    action: 'Provide practical steps and actionable guidance.',
    person: 'Describe with respect, providing authentic information from sources.',
    general: 'Address the question clearly and helpfully.'
  };

  const prompt = `You are an Islamic scholar assistant providing guidance based on authentic Quran and Hadith sources.

**User Query**: ${query}
${referenceContext}
${confidenceCaution}
${antiHallucinationRules}

**Instructions:**
- ${langInstructions[normalizedLang] || langInstructions.english}
- Start with a warm, empathetic opening: "${emotionalOpening}"
- ${questionTypeInstructions[questionType] || questionTypeInstructions.general}
- ONLY use information from the provided references
- Do NOT invent or assume any references
- If references are insufficient, state "Not enough authentic references found. Please consult a qualified Islamic scholar."
- Be respectful, accurate, and emotionally supportive
- Make the response feel personal and caring, not robotic

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

const optimizeContextWindow = (references, maxTokens = 4000, language = 'english') => {
  // Estimate tokens (rough: 4 chars per token)
  const maxChars = maxTokens * 4;

  let totalChars = 0;
  const selectedRefs = [];

  // Normalize language
  const normalizedLang = language.toLowerCase().split('-')[0].trim();

  for (const ref of references) {
    // Use the user's selected language for text
    const text = getTextByLanguage(ref, normalizedLang);
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