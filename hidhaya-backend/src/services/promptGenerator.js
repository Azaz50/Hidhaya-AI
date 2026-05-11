/**
 * Advanced Islamic AI Prompt Generator
 * Creates contextually aware, emotionally supportive prompts
 */

const {
  processQuery,
  islamicConcepts,
  emotionIndicators
} = require('./islamicSemanticEngine');

// Language-specific configurations
const LANGUAGE_CONFIG = {
  english: {
    name: 'English',
    systemPrompt: 'You are Hidhaya AI, a knowledgeable, respectful, and emotionally supportive Islamic assistant. You provide guidance based ONLY on the Quran and authentic Hadith references from the provided dataset.',
    tone: 'respectful and warm',
    responseGuidelines: [
      'Use clear, beginner-friendly language',
      'Be emotionally supportive and empathetic',
      'Always reference authentic sources',
      'Encourage consultation with qualified scholars when needed'
    ]
  },
  hindi: {
    name: 'Hindi',
    systemPrompt: 'आप हिदाया AI हैं, एक जानकार, सम्मानजनक और भावनात्मक रूप से सहायक इस्लामी सहायक। आप प्रदान किए गए कुरान और प्रामाणिक हदीस संदर्भों के आधार पर मार्गदर्शन प्रदान करते हैं।',
    tone: 'सम्मानजनक और गर्मजोशी से भरा',
    responseGuidelines: [
      'स्पष्ट, शुरुआती-अनुकूल भाषा का प्रयोग करें',
      'भावनात्मक रूप से सहायक और समानुभूतिपूर्ण बनें',
      'हमेशा प्रामाणिक स्रोतों का संदर्भ दें',
      'जब आवश्यक हो, योग्य विद्वानों से परामर्श करने के लिए प्रोत्साहित करें'
    ]
  },
  urdu: {
    name: 'Urdu',
    systemPrompt: 'آپ ہدیاے AI ہیں، ایک جاننے والے، احترام والے اور جذباتی طور پر معاون اسلامی معاون۔ آپ فراہم کردہ قرآن اور مستند حدیث کے حوالہ جات کی بنیاد پر رہنمائی فراہم کرتے ہیں۔',
    tone: 'احترام والا اور گرم جوشی سے بھرا',
    responseGuidelines: [
      'واضح، ابتدائی دوستانہ زبان کا استعمال کریں',
      'جذباتی طور پر معاون اور ہمدرد ہوں',
      'ہمیشہ مستند ذرائع کا حوالہ دیں',
      'جب ضرورت ہو تو اہل علم سے مشورہ کرنے کی ترغیب دیں'
    ]
  },
  bengali: {
    name: 'Bengali',
    systemPrompt: 'আপনি হিদায়া AI, একজন জ্ঞানী, সম্মানজনক এবং আবেগপূর্ণভাবে সহায়ক ইসলামিক সহায়ক। আপনি প্রদত্ত কুরআন এবং প্রামাণিক হাদিসের উদ্ধৃতির ভিত্তিতে নির্দেশনা প্রদান করেন।',
    tone: 'সম্মানজনক এবং উষ্ণ',
    responseGuidelines: [
      'স্পষ্ট, প্রারম্ভিক-বান্ধব ভাষা ব্যবহার করুন',
      'আবেগপূর্ণভাবে সহায়ক এবং সহানুভূতিশীল হন',
      'সর্বদা প্রামাণিক উৎসের উদ্ধৃতি দিন',
      'প্রয়োজনে যোগ্য আলেমদের সাথে পরামর্শ করার উৎসাহ দিন'
    ]
  },
  roman_urdu: {
    name: 'Roman Urdu',
    systemPrompt: 'Aap Hidhaya AI hain, ek jaankariwala, admiyana aur hissiyati tor par madadgaar Islamic assistant hain. Aap diye gaye Quran aur sahih Hadith ki reenforcement ke base par hidayat dete hain.',
    tone: 'admiyana aur garam',
    responseGuidelines: [
      'Saaf, shuruaati-dostana zaban ka istemaal karein',
      'Hissiyati tor par madadgaar aur hamdardiya hain',
      'Hamesha sahih watano ka zikr karein',
      'Jab zaroorat ho to qualified ulema se mashwara karne ki targhib dein'
    ]
  }
};

// Response templates based on confidence and emotion
const RESPONSE_TEMPLATES = {
  high: {
    emotional: {
      english: "May Allah guide you with this understanding from His Book and the authentic traditions of His Messenger (peace be upon him).",
      hindi: "अल्लाह आपको उसकी किताब और उसके रसूल (सलाम पर हो) की प्रामाणिक परंपराओं से इस समझ के साथ मार्गदर्शन दे।",
      urdu: "اللہ آپ کو اس کی کتاب اور اس کے رسول (صلی اللہ علیہ و سلم) کی مستند روایات سے اس سمجھ کے ساتھ ہدایت دے۔",
      bengali: "আল্লাহ আপনাকে তাঁর কিতাব এবং তাঁর রাসূলের (সালামু আলাইহি ওয়াসাল্লাম) প্রামাণিক ঐতিহ্য থেকে এই বোধগম্যতার সাথে পথ প্রদর্শন করুন।"
    },
    neutral: {
      english: "Here is guidance from the authentic Islamic sources:",
      hindi: "प्रामाणिक इस्लामी स्रोतों से यहाँ मार्गदर्शन है:",
      urdu: "یہاں مستند اسلامی ذرائع سے ہدایت ہے:",
      bengali: "এখানে প্রামাণিক ইসলামিক উৎস থেকে নির্দেশনা রয়েছে:"
    }
  },
  medium: {
    emotional: {
      english: "I understand this might be a sensitive matter. Let me share what our scholars have taught us from the Quran and Hadith.",
      hindi: "मैं समझ सकता/सकती हूँ कि यह एक संवेदनशील मामला हो सकता है। मुझे आपके साथ साझा करने दें कि हमारे विद्वानों ने कुरान और हदीस से हमें क्या सिखाया है।",
      urdu: "میں سمجھتا/سمجھتی ہوں کہ یہ ایک حساس معاملہ ہو سکتا ہے۔ مجھے بتانے دیں کہ ہمارے علماؤ نے ہمیں قرآن اور حدیث سے کیا سکھایا ہے۔",
      bengali: "আমি বুঝতে পারি এটি একটি সংবেদনশীল বিষয় হতে পারে। আমাকে বলতে দিন যে আমাদের আলেমরা কুরআন এবং হাদিস থেকে আমাদের কী শিখিয়েছেন।"
    },
    neutral: {
      english: "Based on related teachings from our Islamic sources:",
      hindi: "हमारे इस्लामी स्रोतों से संबंधित शिक्षाओं के आधार पर:",
      urdu: "ہمارے اسلامی ذرائع سے متعلقہ تعلیمات کی بنیاد پر:",
      bengali: "আমাদের ইসলামিক উৎস থেকে সম্পর্কিত শিক্ষার ভিত্তিতে:"
    }
  },
  low: {
    emotional: {
      english: "This is indeed a profound question. While I search for specific guidance from the Quran and Hadith, let me share what general principles Islam teaches us about this.",
      hindi: "यह वास्तव में एक गहन प्रश्न है। जब तक मैं कुरान और हदीस से विशिष्ट मार्गदर्शन खोजता/खोजती हूँ, मुझे आपके साथ साझा करने दें कि इसके बारे में इस्लाम हमें क्या सामान्य सिद्धांत सिखाता है।",
      urdu: "یہ واقعی ایک گہرا سوال ہے۔ جب تک میں قرآن اور حدیث سے مخصوص ہدایت تلاش کرتا/کرتی ہوں، مجھے آپ کے ساتھ شیئر کرنے دیں کہ اسلام ہمیں اس کے بارے میں کیا عمومی اصول سکھاتا ہے۔",
      bengali: "এটি সত্যিই একটি গভীর প্রশ্ন। যখন আমি কুরআন এবং হাদিস থেকে নির্দিষ্ট নির্দেশনা খুঁজছি, আমাকে বলতে দিন যে ইসলাম আমাদের এটি সম্পর্কে কী সাধারণ নীতি শেখায়।"
    },
    neutral: {
      english: "While seeking specific references, here's what Islamic teachings share on this topic:",
      hindi: "विशिष्ट संदर्भ खोजते हुए, यहाँ इस विषय पर इस्लामी शिक्षाओं का क्या कहना है:",
      urdu: "مخصوص حوالہ جات تلاش کرتے ہوئے، یہاں اس موضوع پر اسلامی تعلیمات کیا کہتی ہیں:",
      bengali: "নির্দিষ্ট উদ্ধৃতি খুঁজতে খুঁজতে, এই বিষয়ে ইসলামিক শিক্ষা কী বলে:"
    }
  }
};

// Fallback messages when no references are found
const FALLBACK_MESSAGES = {
  english: `Currently, Hidhaya AI could not find strongly related Quran or Hadith references from the available dataset for this topic. Our Islamic database is continuously expanding, and more authentic references will be added soon, In Sha Allah.

May Allah grant you clarity and guidance. Please consult a qualified Islamic scholar for deeper understanding on this matter.`,

  hindi: `वर्तमान में, हिदाया AI इस विषय के लिए उपलब्ध डेटासेट से कुरान या हदीस के प्रबल संबंधित संदर्भ नहीं खोज सका। हमारी इस्लामी डेटाबेस लगातार विस्तार कर रही है, और अधिक प्रामाणिक संदर्भ जल्द ही जोड़े जाएंगे, इंशाअल्लाह।

अल्लाह आपको स्पष्टता और मार्गदर्शन प्रदान करे। इस मामले में गहरी समझ के लिए कृपया एक योग्य इस्लामी विद्वान से परामर्श करें।`,

  urdu: `موجودہ طور پر، ہدیاے AI اس موضوع کے لئے دستیاب ڈیٹا سیٹ سے قرآن یا حدیث کے مضبوط متعلقہ حوالہ جات نہیں تلاش کر سکی۔ ہماری اسلامی ڈیٹا بیس مسلسل توسیع کر رہی ہے، اور مزید مستند حوالہ جات جلد شامل کیے جائیں گے، ان شاءاللہ۔

اللہ آپ کو کھلواڑ اور ہدایت عطا فرمائے۔ اس معاملے میں گہری سمجھ کے لئے براہ کرم ایک اہل علم اسلامی عالم سے مشورہ کریں۔`,

  bengali: `বর্তমানে, হিদায়া AI এই বিষয়ের জন্য উপলব্ধ ডেটাসেট থেকে কুরআন বা হাদিসের কোনো দৃঢ়ভাবে সম্পর্কিত উদ্ধৃতি খুঁজে পায়নি। আমাদের ইসলামিক ডেটাবেস ক্রমাগত বৃদ্ধি পাচ্ছে, এবং আরও প্রামাণিক উদ্ধৃতি শীঘ্রই যোগ করা হবে, ইনশাআল্লাহ।

আল্লাহ আপনাকে স্বচ্ছতা এবং পথ প্রদর্শন দান করুন। এই বিষয়ে গভীর বোঝার জন্য অনুগ্রহ করে একজন যোগ্য ইসলামিক আলেমের সাথে পরামর্শ করুন।`
};

/**
 * Format references for the prompt
 */
const formatReferences = (references, language = 'english') => {
  if (!references || references.length === 0) return '';

  return references.map((ref, index) => {
    const arabic = ref.text || '';
    let translation = '';

    // Get translation based on language
    switch (language) {
      case 'hindi':
        translation = ref.hindi || ref.english || '';
        break;
      case 'urdu':
      case 'roman_urdu':
        translation = ref.urdu || ref.english || '';
        break;
      case 'bengali':
        translation = ref.bengali || ref.english || '';
        break;
      default:
        translation = ref.english || '';
    }

    const typeLabel = ref.type === 'quran' ? 'Quran' : 'Hadith';
    const source = ref.source || '';
    const grade = ref.grade ? ` (${ref.grade})` : '';

    return `[${index + 1}] ${typeLabel} - ${source}${grade}
Arabic: ${arabic}
Translation: ${translation}`;
  }).join('\n\n');
};

/**
 * Build the main prompt for AI generation
 */
const buildPrompt = (query, references, language = 'english', searchMetadata = {}) => {
  const langConfig = LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG.english;
  const { confidence = 'low', detectedConcepts = [], emotion = 'neutral' } = searchMetadata;

  const template = RESPONSE_TEMPLATES[confidence]?.[emotion] || RESPONSE_TEMPLATES[confidence]?.neutral;
  const introText = template?.[language] || template?.english || '';

  // Build context about detected concepts
  let conceptContext = '';
  if (detectedConcepts.length > 0) {
    const conceptNames = detectedConcepts.map(key => {
      const concept = islamicConcepts[key];
      return concept ? concept.topic.replace(/_/g, ' ') : key;
    }).join(', ');

    conceptContext = `
Context: The question relates to Islamic concepts such as: ${conceptNames}
`;
  }

  // Build the prompt
  let prompt = `${langConfig.systemPrompt}

IMPORTANT RULES:
1. Answer ONLY in ${langConfig.name} language
2. Use ONLY the provided references - NEVER invent Quran or Hadith citations
3. Never add hadith grades/authenticity ratings unless explicitly stated in the references
4. Be emotionally supportive, respectful, and beginner-friendly
5. If no strong references are found, politely state this and encourage consulting a scholar
6. Always maintain Islamic authenticity and humility

${conceptContext}
${introText}

Question: ${query}

${references.length > 0 ? `References from Quran and Hadith:\n${formatReferences(references, language)}\n\n` : ''}
Please provide a well-structured, emotionally supportive answer based on Islamic teachings.`;

  return prompt;
};

/**
 * Build streaming prompt for faster responses
 */
const buildStreamingPrompt = (query, references, language = 'english', searchMetadata = {}) => {
  // Simplified version for streaming
  return buildPrompt(query, references, language, searchMetadata);
};

/**
 * Get fallback message for no references found
 */
const getFallbackMessage = (language = 'english') => {
  return FALLBACK_MESSAGES[language] || FALLBACK_MESSAGES.english;
};

/**
 * Check if references meet quality threshold
 */
const meetsQualityThreshold = (references, minReferences = 2) => {
  return references && references.length >= minReferences;
};

/**
 * Generate metadata for the response
 */
const generateResponseMetadata = (query, language, searchMetadata, processingTime) => {
  return {
    query,
    language,
    detectedConcepts: searchMetadata.detectedConcepts || [],
    detectedEmotion: searchMetadata.emotion || 'neutral',
    totalReferences: searchMetadata.totalDocuments || 0,
    processingTime: processingTime || 0,
    model: 'gemini-1.5-flash',
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  LANGUAGE_CONFIG,
  RESPONSE_TEMPLATES,
  FALLBACK_MESSAGES,
  buildPrompt,
  buildStreamingPrompt,
  getFallbackMessage,
  formatReferences,
  meetsQualityThreshold,
  generateResponseMetadata
};