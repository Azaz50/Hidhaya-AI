/**
 * Islamic AI Prompt Generator
 * Implements AI Response Requirements from planning.txt:
 * - Simplify difficult Islamic concepts
 * - Explain emotionally and politely
 * - Use beginner-friendly language
 * - Maintain trustworthiness
 * - Generate structured beautiful responses
 * - NEVER invent references
 * - ALWAYS respond in the user's selected language
 */

// Map frontend language codes to backend language names
const LANGUAGE_MAP = {
  'en': 'english',
  'english': 'english',
  'hi': 'hindi',
  'hindi': 'hindi',
  'ur': 'urdu',
  'urdu': 'urdu',
  'bn': 'bengali',
  'bengali': 'bengali',
  'roman_urdu': 'roman_urdu'
};

const getNormalizedLanguage = (lang) => LANGUAGE_MAP[lang] || 'english';

const FALLBACK_MESSAGES = {
  english: `I could not find strongly related Quran or Hadith references for this topic. Our Islamic database is expanding continuously. May Allah grant you clarity. Please consult a qualified Islamic scholar for deeper guidance.`,
  hindi: `इस विषय के लिए कुरान या हदीस के प्रबल संदर्भ नहीं मिले। अल्लाह आपको स्पष्टता प्रदान करे। कृपया योग्य विद्वान से परामर्श करें।`,
  urdu: `اس موضوع کے لئے قرآن یا حدیث کے مضبوط حوالہ جات نہیں ملے۔ اللہ آپ کو کھلواڑ دے۔ براہ کرم اہل علم سے مشورہ کریں۔`,
  bengali: `এই বিষয়ের জন্য কুরআন বা হাদিসের দৃঢ় উদ্ধৃতি খুঁজে পাইনি। আল্লাহ আপনাকে স্বচ্ছতা দান করুন। যোগ্য আলেমের সাথে পরামর্শ করুন।`,
  roman_urdu: `Is topic ke liye Quran ya Hadith ke strong reference nahi mile. Allah aapko clarity de. Please ek qualified Islamic scholar se guidance lein.`
};

// Truncate text to avoid huge prompts
const truncateText = (text, maxLen = 250) => {
  if (!text) return '';
  return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
};

// Format references for prompt - using idInBook for hadith as per planning.txt
const formatReferences = (references, language) => {
  if (!references?.length) return '';

  const normalizedLang = getNormalizedLanguage(language);
  const topRefs = references.slice(0, 3);

  return topRefs.map((ref, i) => {
    const type = ref.type === 'quran' ? 'Quran' : 'Hadith';

    // Build source from available fields
    let source = ref.source || '';
    if (!source) {
      if (ref.type === 'quran') {
        source = `Quran ${ref.chapter}:${ref.verse}`;
      } else if (ref.type === 'hadith') {
        source = `${ref.book} ${ref.idInBook}`;
      }
    }

    const grade = ref.grade ? ` (${ref.grade})` : '';

    // Get translation based on language (prioritize selected language)
    let text = '';
    switch (normalizedLang) {
      case 'bengali': text = ref.bengali || ref.english || ''; break;
      case 'urdu': text = ref.urdu || ref.english || ''; break;
      case 'hindi': text = ref.hindi || ref.english || ''; break;
      case 'roman_urdu': text = ref.romanUrdu || ref.english || ''; break;
      default: text = ref.english || '';
    }

    // Use idInBook for hadith references as per planning.txt Hadith Number Rule
    return `[${i + 1}] ${type} - ${source}${grade}\n${truncateText(text, 250)}`;
  }).join('\n\n');
};

// Build the main prompt following planning.txt AI Response Requirements
const buildPrompt = (query, references, language = 'english', searchMetadata = {}) => {
  const normalizedLang = getNormalizedLanguage(language);

  const langNames = {
    english: 'English',
    hindi: 'Hindi',
    urdu: 'Urdu',
    bengali: 'Bengali',
    roman_urdu: 'Roman Urdu (Romanized Urdu - use Latin letters)'
  };
  const langName = langNames[normalizedLang] || 'English';

  // Get detected concepts for context
  const concepts = searchMetadata?.detectedConcepts || [];
  const conceptContext = concepts.length > 0
    ? `Related Islamic concepts: ${concepts.join(', ')}`
    : '';

  const refs = formatReferences(references, normalizedLang);

  // Build prompt following planning.txt requirements:
  // - MUST respond in user's selected language only
  // - Simplify difficult concepts
  // - Explain emotionally and politely
  // - Use beginner-friendly language
  // - NEVER invent references
  return `You are Hidhaya AI, a warm and compassionate Islamic guidance assistant. You help Muslims understand their faith with love and empathy.

IMPORTANT LANGUAGE RULE:
You MUST respond ENTIRELY in ${langName} language only. Do NOT switch to any other language during your response. Every word, sentence, and paragraph must be in ${langName}.

IMPORTANT RULES:
1. Answer ONLY in ${langName} language - 100% in this language, zero exceptions
2. Use ONLY the provided Quran and Hadith references below - NEVER invent citations
3. Be emotionally supportive, like a caring friend
4. Explain concepts in simple, easy-to-understand language
5. If no strong references are found, gently encourage consulting a scholar

YOUR RESPONSE STYLE:
- Start with a warm opening acknowledging the user's question (in ${langName})
- Explain the Islamic perspective on the topic in simple terms (in ${langName})
- Include practical, actionable advice they can apply in daily life (in ${langName})
- Reference the Quran/Hadith naturally within your explanation (in ${langName})
- End with a heartfelt du'a or encouraging words (in ${langName})
- Keep paragraphs short and easy to read
- NEVER just list references - weave them into a beautiful narrative

${conceptContext}

User's Question (in ${langName}): ${query}

${refs ? `Here are the authentic references from Quran and Hadith:\n${refs}\n\nNow write a warm, helpful response that explains this topic using these references (MUST be in ${langName} only):` : 'No strong references found. Respond warmly in ' + langName + ' and suggest consulting a qualified Islamic scholar for guidance.'}`;
};

const getFallbackMessage = (language = 'english') => {
  const normalizedLang = getNormalizedLanguage(language);
  return FALLBACK_MESSAGES[normalizedLang] || FALLBACK_MESSAGES.english;
};

// Format reference for response output - include all translations
const formatReferencesForResponse = (references, language) => {
  if (!references?.length) return [];

  const normalizedLang = getNormalizedLanguage(language);

  return references.map(ref => {
    // Select primary text based on language
    let primaryText = '';
    switch (normalizedLang) {
      case 'hindi': primaryText = ref.hindi || ref.english || ''; break;
      case 'urdu': primaryText = ref.urdu || ref.english || ''; break;
      case 'bengali': primaryText = ref.bengali || ref.english || ''; break;
      case 'roman_urdu': primaryText = ref.romanUrdu || ref.english || ''; break;
      default: primaryText = ref.english || '';
    }

    return {
      type: ref.type,
      text: primaryText,
      source: ref.source || '',
      english: ref.english || '',
      urdu: ref.urdu || '',
      hindi: ref.hindi || '',
      bengali: ref.bengali || '',
      romanUrdu: ref.romanUrdu || '',
      grade: ref.grade || ''
    };
  });
};

module.exports = {
  buildPrompt,
  getFallbackMessage,
  formatReferences,
  formatReferencesForResponse,
  getNormalizedLanguage
};