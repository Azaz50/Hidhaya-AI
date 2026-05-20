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
 * - STRICT anti-hallucination rules
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

// ============================================================
// EMOTIONAL CONTEXT HELPERS - For intelligent responses
// ============================================================
const EMOTIONAL_OPENINGS = {
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

const getEmotionalOpening = (emotion, language) => {
  const lang = getNormalizedLanguage(language);
  return EMOTIONAL_OPENINGS[emotion]?.[lang] || EMOTIONAL_OPENINGS.neutral[lang];
};

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

    let source = '';
    if (ref.type === 'quran') {
      source = `Quran ${ref.chapter}:${ref.verse}`;
    } else if (ref.type === 'hadith') {
      // Use proper collection name and idInBook for Hadith
      const bookName = HADITH_COLLECTION_NAMES[ref.book] || ref.book;
      const hadithNum = ref.idInBook || ref.id || '?';
      source = `${bookName} — Hadith ${hadithNum}`;
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

  // STRICT ANTI-HALLUCINATION RULES
  const antiHallucinationRules = `
**🔒 STRICT ANTI-HALLUCINATION RULES (MANDATORY):**
1. **NEVER invent or guess any reference** - Only use the references explicitly provided above
2. **NEVER fabricate Surah names, verse numbers, Hadith book names, or Hadith numbers**
3. **If no reference is provided for a point**, clearly state: "This information is not in our available dataset. Please consult a qualified Islamic scholar."
4. **NEVER claim a source exists that wasn't explicitly given** - The system only knows what is in its database

**FORBIDDEN EXAMPLES:**
- ❌ "As the Quran says in Surah Al-Fatiha..." (unless that verse was in the references)
- ❌ "Prophet Muhammad ﷺ said in Sahih Bukhari..." (unless that hadith was in the references)
- ❌ "According to Islamic scholars..." followed by invented details

**CORRECT APPROACH:**
- ✅ Use only the references given above
- ✅ If a point cannot be supported, say "Not in our dataset"

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

// Full authentic Hadith collection names mapping
const HADITH_COLLECTION_NAMES = {
  'bukhari': 'Sahih al-Bukhari',
  'muslim': 'Sahih Muslim',
  'abudawud': 'Sunan Abu Dawood',
  'tirmidhi': 'Jami al-Tirmidhi',
  'nasai': 'Sunan al-Nasa\'i',
  'ibnmajah': 'Sunan Ibn Majah',
  'malik': 'Muwatta Imam Malik',
  'darimi': 'Sunan al-Darimi',
  'ahmed': 'Musnad Ahmad bin Hanbal',
  'mishkat_almasabih': 'Mishkat al-Masabih',
  'aladab_almufrad': 'Al-Adab al-Mufrad',
  'bulugh_almaram': 'Bulugh al-Maram',
  'nawawi40': 'Forty Hadith of Imam Nawawi',
  'qudsi40': 'Forty Hadith Qudsi',
  'riyad_assalihin': 'Riyad al-Salihin',
  'shahwaliullah40': 'Forty Hadith of Shah Waliullah',
  'shamail_muhammadiah': 'Shamail al-Muhammadiah'
};

// Format reference for response output - include all translations and proper formatting
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

    // Build proper reference string
    let reference = '';
    if (ref.type === 'quran') {
      reference = `Quran ${ref.chapter}:${ref.verse}`;
    } else if (ref.type === 'hadith') {
      // Use idInBook for the actual Hadith number, NOT internal id
      const bookName = HADITH_COLLECTION_NAMES[ref.book] || ref.book;
      const hadithNum = ref.idInBook || ref.id || '?';
      reference = `${bookName} — Hadith ${hadithNum}`;
    }

    return {
      type: ref.type,
      text: primaryText,
      reference: reference,
      source: ref.source || '',
      english: ref.english || '',
      urdu: ref.urdu || '',
      hindi: ref.hindi || '',
      bengali: ref.bengali || '',
      romanUrdu: ref.romanUrdu || '',
      grade: ref.grade || '',
      collection: ref.book ? (HADITH_COLLECTION_NAMES[ref.book] || ref.book) : '',
      idInBook: ref.idInBook || null
    };
  });
};

module.exports = {
  buildPrompt,
  getFallbackMessage,
  formatReferences,
  formatReferencesForResponse,
  getNormalizedLanguage,
  getEmotionalOpening,
  HADITH_COLLECTION_NAMES
};