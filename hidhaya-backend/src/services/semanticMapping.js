/**
 * Massive Islamic Semantic Mapping Engine
 * Per planning.txt requirements:
 * - Cross-language semantic mapping
 * - Advanced Islamic concept mapping
 * - Query normalization
 * - 4-Layer search pipeline support
 */

const ISLAMIC_CONCEPTS = {
  // Core Beliefs
  tawheed: {
    synonyms: ['tawhid', 'oneness', 'monotheism', 'tauhid', 'توحيد', 'توحید', 'একত্ব', 'एकत्व'],
    related: ['shirk', 'rububiyyah', 'uloohiyyah'],
    emotional: ['peace', 'certainty', 'tranquility']
  },
  shirk: {
    synonyms: ['polytheism', 'associating partners', 'idolatry', 'shirak', 'شرک', 'শিরক', 'मूर्तिपूजा'],
    related: ['tawheed', 'kufr', 'bidah'],
    emotional: ['confusion', 'lost', 'misguidance']
  },
  imaan: {
    synonyms: ['faith', 'belief', 'trust', 'imaan', 'eiman', 'ایمان', 'বিশ্বাস', 'ईमान'],
    related: ['shahadah', 'yaqeen', 'tawakkul'],
    emotional: ['hopeful', 'secure', 'confident']
  },
  yaqeen: {
    synonyms: ['certainty', 'conviction', 'strong faith', 'yaqueen', 'يقين', 'নিশ্চয়ता', 'निश्चय'],
    related: ['iman', 'ilm', 'tawheed'],
    emotional: ['certain', 'assured', 'steadfast']
  },

  // Character & Ethics
  sabr: {
    synonyms: ['patience', 'patience', 'endurance', 'dheeraj', 'dhairya', 'sabr', 'صبر', 'ধৈর্য', 'धैर्य', 'sabar', 'dhiraj'],
    related: ['shukr', 'tawakkul', 'riza'],
    emotional: ['calm', 'still', 'perseverant']
  },
  shukr: {
    synonyms: ['gratitude', 'thanks', 'appreciation', 'shukriya', 'shukr', 'شکر', 'কৃতজ্ঞতা', 'शुक्र', 'shukriya'],
    related: ['sabr', 'niyamat', 'barakah'],
    emotional: ['grateful', 'blessed', 'content']
  },
  anger: {
    synonyms: ['anger', 'rage', 'fury', 'gussa', 'krodh', 'krodh', 'غصہ', 'ক্রোধ', 'गुस्सा', 'gazab'],
    related: ['forgiveness', 'sabr', 'rahma'],
    emotional: ['angry', 'frustrated', 'irritated']
  },
  hasad: {
    synonyms: ['jealousy', 'envy', 'hasad', 'حسد', 'হিংসা', 'ईर्ष्या', 'jealous'],
    related: ['shukr', 'qanaa', 'riba'],
    emotional: ['jealous', 'resentful', 'bitter']
  },
  kibr: {
    synonyms: ['pride', 'arrogance', 'kibr', '骄傲', 'अहंकार'],
    related: ['tawadhu', 'khushu', '-humility'],
    emotional: ['proud', 'arrogant', 'superior']
  },
  riya: {
    synonyms: ['showoff', 'hypocrisy', 'riya', 'رياء', 'দেখানো', 'प्रदर्शन'],
    related: ['ikhlas', 'niyyah', 'sidq'],
    emotional: ['fake', 'performing', 'insincere']
  },

  // Worship
  salah: {
    synonyms: ['prayer', 'salat', 'namaz', 'dua', 'worship', 'namaz', 'نماز', 'নামাজ', 'नमाज़'],
    related: ['zakat', 'sawm', 'hajj', 'dhikr'],
    emotional: ['connected', 'peaceful', 'humble']
  },
  dua: {
    synonyms: ['supplication', 'prayer', 'duwa', 'dua', 'دعاء', 'দোয়া', 'प्रार्थना'],
    related: ['salah', 'tasbih', 'istighfar'],
    emotional: ['hopeful', 'humble', 'dependent']
  },
  dhikr: {
    synonyms: ['remembrance', 'zikr', 'zikir', 'ذکر', 'যিক্র', 'ज़िक्र'],
    related: ['dua', 'tasbih', 'tafakkur'],
    emotional: ['mindful', 'grateful', 'present']
  },
  zakát: {
    synonyms: ['zakat', 'charity', 'sadaqah', 'zakaat', 'زکات', 'যাকাত', 'ज़कात'],
    related: ['sadaqah', 'haya', 'shukr'],
    emotional: ['generous', 'sharing', 'blessed']
  },
  sawm: {
    synonyms: ['fasting', 'ramadan', 'roza', 'روزہ', 'রোজা', 'रोज़ा'],
    related: ['salah', 'shukr', 'taqwa'],
    emotional: ['disciplined', 'reflective', 'spiritual']
  },
  hajj: {
    synonyms: ['pilgrimage', 'haj', 'حج', 'হজ্জ', 'हज्ज'],
    related: ['umrah', 'ihram', 'tawaf'],
    emotional: ['humbled', 'forgiven', 'renewed']
  },

  // Social & Family
  birr: {
    synonyms: ['kindness to parents', 'goodness', 'birr', 'بر', 'সদ্ব্যবহার', 'माता-पिता की सेवा'],
    related: ['wasiyyah', 'silat', 'refinement'],
    emotional: ['loving', 'respectful', 'dutiful']
  },
  silat: {
    synonyms: ['maintaining family ties', 'family bonds', 'silat', 'صلة الرحم', 'সম্পর্ক', 'रिश्तेदारी'],
    related: ['birr', 'ulfah', 'peace'],
    emotional: ['connected', 'caring', 'responsible']
  },
  adl: {
    synonyms: ['justice', 'fairness', 'qist', 'عدالة', 'ন্যায়', 'न्याय'],
    related: ['shura', 'haq', 'truth'],
    emotional: ['fair', 'just', 'balanced']
  },
  aman: {
    synonyms: ['trust', 'safety', 'security', 'amaanah', 'امانت', 'আমানত', 'अमानत'],
    related: ['sidq', 'wafa', 'honesty'],
    emotional: ['secure', 'trusted', 'reliable']
  },

  // Spiritual States
  taqwa: {
    synonyms: ['piety', 'god-consciousness', 'righteousness', 'taqwa', 'تقوی', 'তাকওয়া', 'परहेज़गारी'],
    related: ['iman', 'salah', 'zakat'],
    emotional: ['conscious', 'mindful', 'god-conscious']
  },
  tawakkul: {
    synonyms: ['trust in Allah', 'reliance', 'tawakul', 'توكّل', 'তোয়াকুল', 'तौक़ल'],
    related: ['iman', 'sabr', 'shukr'],
    emotional: ['peaceful', 'relieved', 'content']
  },
  tawbah: {
    synonyms: ['repentance', 'forgiveness', 'astagfar', 'توبہ', 'তওবাহ', 'तौबा'],
    related: ['istighfar', 'rahma', 'forgiveness'],
    emotional: ['humble', 'regretful', 'hopeful']
  },
  istigfar: {
    synonyms: ['seeking forgiveness', 'astagfar', 'istighfar', 'استغفار', 'ইস্তিগফার', 'इस्तिगफार'],
    related: ['tawbah', 'dua', 'rahma'],
    emotional: ['humble', 'regretful', 'forgiven']
  },
  rahma: {
    synonyms: ['mercy', 'compassion', 'rahmah', 'رحمہ', 'রহমত', 'दया'],
    related: ['tawbah', 'forgiveness', 'love'],
    emotional: ['compassionate', 'merciful', 'loving']
  },
  khushu: {
    synonyms: ['humility', 'khushoo', 'خشوع', 'বিনয়', 'विनम्रता'],
    related: ['tawadhu', 'salah', 'taqwa'],
    emotional: ['humble', 'submissive', 'reverent']
  },

  // Islamic Sciences
  ilm: {
    synonyms: ['knowledge', 'ilm', 'learning', 'علم', 'জ্ঞান', 'ज़िल्म'],
    related: ['hikma', 'tafakkur', 'dawah'],
    emotional: ['curious', 'wise', 'learned']
  },
  hikma: {
    synonyms: ['wisdom', 'hikma', 'حكمة', 'হিকমত', 'हिकमत'],
    related: ['ilm', 'fatwa', 'guidance'],
    emotional: ['wise', 'judicious', 'prudent']
  },
  tafakkur: {
    synonyms: ['reflection', 'contemplation', 'tafakkur', 'تفکر', 'চিন্তা', 'विचार'],
    related: ['ilm', 'dhikr', 'ayat'],
    emotional: ['thoughtful', 'deep', 'reflective']
  },

  // Negative Concepts
  ghibah: {
    synonyms: ['backbiting', 'slander', 'gossip', 'backbiting', 'غیبت', 'পাঁচকানি', 'गossip'],
    related: ['name', 'sin', 'haram'],
    emotional: ['hurt', 'damaging', 'sinful']
  },
  fitnah: {
    synonyms: ['temptation', 'trials', 'fitna', 'فتنة', 'ফিতনা', 'फ़ितना'],
    related: ['shirk', 'bidah', 'kufr'],
    emotional: ['tempted', 'tested', 'confused']
  },
  bidah: {
    synonyms: ['innovation', 'heretical', 'bidah', 'بدعة', 'বিদআ', 'बिदअ'],
    related: ['sunnah', 'shirk', 'haram'],
    emotional: ['misguided', 'innovated', 'wrong']
  },
  kufr: {
    synonyms: ['disbelief', 'unbelief', 'kufr', 'كفر', 'কুফর', 'कुफ़'],
    related: ['shirk', 'shahadah', 'iman'],
    emotional: ['denying', 'rejecting', 'lost']
  },

  // Additional Concepts (from planning.txt)
  modesty: {
    synonyms: ['haya', 'shyness', 'hijab', 'احیا', 'লজ্জা', 'शर्म'],
    related: ['satar', 'parda', '尊重'],
    emotional: ['shy', 'modest', 'demure']
  },
  honesty: {
    synonyms: ['truthful', 'sadiq', 'ameen', 'امانت', 'সততা', 'सत्य'],
    related: ['aman', 'sidq', 'trust'],
    emotional: ['truthful', 'reliable', 'sincere']
  },
  forgiveness: {
    synonyms: ['forgive', 'maafi', 'tawbah', 'معافی', 'ক্ষমা', 'माफ़ी'],
    related: ['tawbah', 'rahma', 'sabr'],
    emotional: ['forgiving', 'merciful', 'releasing']
  },
  mercy: {
    synonyms: ['compassion', 'rahmah', 'rahim', 'رحم', 'দয়া', 'करुणा'],
    related: ['rahma', 'love', 'forgiveness'],
    emotional: ['compassionate', 'kind', 'caring']
  },
  guidance: {
    synonyms: ['hidayah', 'guidance', 'hidayat', 'hidaya', 'ہدایت', 'হিদায়াহ', 'हिदायत'],
    related: ['iman', 'quran', 'sunnah'],
    emotional: ['guided', 'directed', 'clear']
  },
  hope: {
    synonyms: ['hope', 'raja', 'umeed', 'optimism', 'امید', 'আশা', 'उम्मीद'],
    related: ['dua', 'tawakkul', 'iman'],
    emotional: ['hopeful', 'optimistic', 'positive']
  },
  fear: {
    synonyms: ['fear', 'khauf', 'scared', 'terrified', 'ڈر', 'ভয়', 'डर'],
    related: ['khushu', 'taqwa', 'reverence'],
    emotional: ['fearful', 'scared', 'awe']
  },
  peace: {
    synonyms: ['salam', 'peace', 'aman', 'سلام', 'শান্তি', 'शांति'],
    related: ['iman', 'rahma', 'salam'],
    emotional: ['peaceful', 'calm', 'serene']
  },
  love: {
    synonyms: ['love', 'hub', 'muhabbat', 'محبت', 'ভালোবাসা', 'प्रेम'],
    related: ['rahma', 'wali', 'sunnah'],
    emotional: ['loving', 'affectionate', 'devoted']
  }
};

// Cross-language noise words to remove (per planning.txt)
const NOISE_WORDS = {
  english: ['what is', 'who is', 'how to', 'explain', 'tell me about', 'what does islam say about', 'can you', 'please', 'tell', 'define', 'meaning of', 'according to'],
  hindi: ['क्या है', 'कैसे', 'इस्लाम में क्या', 'बताइए', 'बता दो', 'क्या', 'इस्लाम के अनुसार', 'कुरान में क्या है'],
  urdu: ['کیا ہے', 'کیسے', 'اسلام میں کیا', 'بتائیں', 'کیا', 'اسلام کے مطابق', 'قرآن میں کیا ہے'],
  bengali: ['কি', 'কিভাবে', 'ইসলামে কি', 'বলো', 'ইসলামের মতে', 'কুরআনে কি বলে'],
  roman_urdu: ['kya hai', 'kaise', 'islam mein', 'batao', 'ke', 'kya', 'islam ke mutabiq'],
  arabic: ['ما هو', 'كيف', 'في الإسلام', 'ما هي']
};

// Expand concept to related terms
const expandConcept = (concept) => {
  const conceptData = ISLAMIC_CONCEPTS[concept];
  if (!conceptData) return [concept];

  return [concept, ...(conceptData.synonyms || []), ...(conceptData.related || [])];
};

// Normalize query by removing noise words
const normalizeQuery = (query, language = 'english') => {
  let normalized = query.toLowerCase().trim();

  // Get language-specific noise words
  const noiseWords = NOISE_WORDS[language] || NOISE_WORDS.english;

  // Remove noise words
  for (const word of noiseWords) {
    normalized = normalized.replace(new RegExp(word, 'gi'), '');
  }

  // Remove punctuation and extra spaces
  normalized = normalized.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();

  return normalized;
};

// Extract concepts from query
const extractConcepts = (query) => {
  const concepts = [];
  const lower = query.toLowerCase();

  for (const [concept, data] of Object.entries(ISLAMIC_CONCEPTS)) {
    const allTerms = [concept, ...(data.synonyms || []), ...(data.related || [])];
    for (const term of allTerms) {
      if (lower.includes(term.toLowerCase())) {
        concepts.push(concept);
        break;
      }
    }
  }

  return [...new Set(concepts)]; // Remove duplicates
};

// Get semantic terms for concept
const getSemanticTerms = (concept) => {
  return expandConcept(concept);
};

// Detect emotional intent (per planning.txt)
const detectEmotion = (query) => {
  const lower = query.toLowerCase();

  const emotions = {
    sadness: ['sad', 'depressed', 'upset', 'worried', 'anxious', 'grief', 'pain', 'suffering', 'hurt'],
    anger: ['angry', 'furious', 'rage', 'mad', 'frustrated', 'annoyed', 'irritated'],
    fear: ['afraid', 'scared', 'fear', 'terrified', 'nervous', 'worried', 'anxious'],
    joy: ['happy', 'joy', 'excited', 'grateful', 'thankful', 'blessed', 'excited'],
    confusion: ['confused', 'lost', 'uncertain', 'don\'t understand', 'puzzled', 'perplexed'],
    hope: ['hope', 'hopeful', 'wish', 'pray', 'dua', 'want', 'desire', 'longing'],
    love: ['love', 'adore', 'miss', 'affection', 'care', 'fond'],
    gratitude: ['thankful', 'grateful', 'appreciative', 'blessed', 'fortunate']
  };

  for (const [emotion, keywords] of Object.entries(emotions)) {
    if (keywords.some(w => lower.includes(w))) return emotion;
  }

  return 'neutral';
};

// Cross-language mapping helper
const mapLanguageTerm = (term, targetLanguage) => {
  // This maps the same concept across languages
  const languageMap = {
    patience: { english: 'patience', hindi: 'धैर्य', urdu: 'صبر', bengali: 'ধৈর্য', arabic: 'صبر' },
    anger: { english: 'anger', hindi: 'गुस्सा', urdu: 'غصہ', bengali: 'ক্রোধ', arabic: 'غضب' },
    faith: { english: 'faith', hindi: 'ईमान', urdu: 'ایمان', bengali: 'বিশ্বাস', arabic: 'إيمان' },
    prayer: { english: 'prayer', hindi: 'नमाज़', urdu: 'نماز', bengali: 'নামাজ', arabic: 'صلاة' },
    forgiveness: { english: 'forgiveness', hindi: 'माफ़ी', urdu: 'معافی', bengali: 'ক্ষমা', arabic: 'مغفرة' },
    mercy: { english: 'mercy', hindi: 'दया', urdu: 'رحمہ', bengali: 'দয়া', arabic: 'رحمة' },
    guidance: { english: 'guidance', hindi: 'हिदायत', urdu: 'ہدایت', bengali: 'হিদায়াহ', arabic: 'هداية' },
    hope: { english: 'hope', hindi: 'उम्मीद', urdu: 'امید', bengali: 'আশা', arabic: 'أمل' },
    knowledge: { english: 'knowledge', hindi: 'ज्ञान', urdu: 'علم', bengali: 'জ্ঞান', arabic: 'علم' }
  };

  return languageMap[term]?.[targetLanguage] || term;
};

// Full authentic Hadith collection names mapping (per planning.txt)
const HADITH_COLLECTION_NAMES = {
  'bukhari': 'Sahih al-Bukhari',
  'muslim': 'Sahih Muslim',
  'abudawud': 'Sunan Abu Dawood',
  'tirmidhi': "Jami' al-Tirmidhi",
  'nasai': "Sunan al-Nasa'i",
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
  'shamail_muhammadiah': 'Shamail al-Muhammadiah',
  'shamail_muhammadiya': 'Shamail al-Muhammadiah'
};

module.exports = {
  ISLAMIC_CONCEPTS,
  NOISE_WORDS,
  HADITH_COLLECTION_NAMES,
  normalizeQuery,
  extractConcepts,
  expandConcept,
  getSemanticTerms,
  detectEmotion,
  mapLanguageTerm,

  // Prophet Semantic Mapping (per planning.txt)
  PROPHETS: {
    muhammad: {
      synonyms: ['muhammad pbuh', 'muhammad ﷺ', 'prophet muhammad', 'hazrat muhammad', 'holy prophet', 'saw', 'our prophet', 'sallallahu alaihi wasallam'],
      languages: { arabic: 'محمد', urdu: 'نبی کریم', hindi: 'पैगंबर मुहम्मद', bengali: 'নবী মুহাম্মদ' },
      topics: ['sunnah', 'quran', 'mercy', 'guidance', 'final prophet']
    },
    ibrahim: {
      synonyms: ['ibrahim alaihisalam', 'abraham', 'khalilullah', 'hazrat ibrahim', 'prophet ibrahim', 'ibraheem'],
      languages: { arabic: 'إبراهيم', urdu: 'حضرت ابراہیم', hindi: 'हजरत इब्राहिम', bengali: 'হজরত ইব্রাহিম' },
      topics: ['sacrifice', 'tawheed', 'kaaba', 'building', 'monotheism']
    },
    musa: {
      synonyms: ['musa alaihisalam', 'moses', 'moosa', 'hazrat musa', 'prophet musa'],
      languages: { arabic: 'موسى', urdu: 'حضرت موسیٰ', hindi: 'हजरत मूसा', bengali: 'হজরত মুসা' },
      topics: ['torah', 'prophecy', 'pharaoh', 'guidance', 'ten commandments']
    },
    isa: {
      synonyms: ['isa alaihisalam', 'jesus', 'hazrat isa', 'prophet isa', ' Masih'],
      languages: { arabic: 'عيسى', urdu: 'حضرت عیسیٰ', hindi: 'हजरत ईसा', bengali: 'হজরত ঈসা' },
      topics: ['injil', 'prophecy', 'miracle', 'second coming']
    },
    nooh: {
      synonyms: ['nooh alaihisalam', 'noah', 'hazrat nooh', 'prophet nooh', 'nuh'],
      languages: { arabic: 'نوح', urdu: 'حضرت نوح', hindi: 'हजरत नूह', bengali: 'হজরত নূহ' },
      topics: ['ark', 'flood', 'warning', 'salvation']
    },
    yusuf: {
      synonyms: ['yusuf alaihisalam', 'joseph', 'hazrat yusuf', 'prophet yusuf'],
      languages: { arabic: 'يوسف', urdu: 'حضرت یوسف', hindi: 'हजरत यूसुफ', bengali: 'হজরত ইউসুফ' },
      topics: ['dream', 'wisdom', 'governance', 'family', 'patience']
    },
    dawood: {
      synonyms: ['dawood alaihisalam', 'david', 'prophet dawood'],
      languages: { arabic: 'داوود', urdu: 'حضرت داوود', hindi: 'हजरत दाऊद', bengali: 'হজরত দাউদ' },
      topics: ['zabur', 'psalms', 'kingdom', 'justice']
    },
    sulaiman: {
      synonyms: ['sulaiman alaihisalam', 'solomon', 'prophet sulaiman'],
      languages: { arabic: 'سليمان', urdu: 'حضرت سلیمان', hindi: 'हजरत सुलेमान', bengali: 'হজরত সুলাইমান' },
      topics: ['kingdom', 'wisdom', 'nature', 'judgment']
    },
    adam: {
      synonyms: ['adam alaihisalam', 'prophet adam', 'adam'],
      languages: { arabic: 'آدم', urdu: 'حضرت آدم', hindi: 'हजरत आदम', bengali: 'হজরত আদম' },
      topics: ['creation', 'first man', 'knowledge', 'repentance']
    },
    ismail: {
      synonyms: ['ismail alaihisalam', 'ishmael', 'prophet ismail'],
      languages: { arabic: 'إسماعيل', urdu: 'حضرت اسماعیل', hindi: 'हजरत इस्माइल', bengali: 'হজরত ইসমাইল' },
      topics: ['sacrifice', 'hajj', 'building', 'monotheism']
    },
    ishaq: {
      synonyms: ['ishaq alaihisalam', 'isaac', 'prophet ishaq'],
      languages: { arabic: 'إسحاق', urdu: 'حضرت اسحاق', hindi: 'हजरत इशाक', bengali: 'হজরত ইসহাক' },
      topics: ['sacrifice', 'promise', 'prophecy']
    },
    ayyub: {
      synonyms: ['ayyub alaihisalam', 'job', 'prophet ayyub'],
      languages: { arabic: 'أيوب', urdu: 'حضرت ایوب', hindi: 'हजरत আইয়ুব', bengali: 'হজরত আইয়ুব' },
      topics: ['patience', 'testing', 'perseverance', 'recovery']
    },
    yunus: {
      synonyms: ['yunus alaihisalam', 'jonah', 'prophet yunus'],
      languages: { arabic: 'يونيس', urdu: 'حضرت یونس', hindi: 'हजरत ইউনুস', bengali: 'হজরত ইউনুস' },
      topics: ['whale', 'warning', 'repentance', 'prophecy']
    },
    hud: {
      synonyms: ['hud alaihisalam', 'prophet hud', 'ever'],
      languages: { arabic: 'هود', urdu: 'حضرت ہود', hindi: 'हजरत हूद', bengali: 'হজরত হুদ' },
      topics: ['ad', 'warning', 'message']
    },
    salih: {
      synonyms: ['salih alaihisalam', 'prophet salih'],
      languages: { arabic: 'صالح', urdu: 'حضرت صالح', hindi: 'हजरत सालिह', bengali: 'হজরত সালেহ' },
      topics: ['thamud', 'she-camel', 'warning']
    },
    lut: {
      synonyms: ['lut alaihisalam', 'lot', 'prophet lut'],
      languages: { arabic: 'لوط', urdu: 'حضرت لوط', hindi: 'हजरत लूत', bengali: 'হজরত লুত' },
      topics: ['sodom', 'warning', 'hospitality']
    },
    zakariya: {
      synonyms: ['zakariya alaihisalam', 'zachariah', 'prophet zakariya'],
      languages: { arabic: 'زكريا', urdu: 'حضرت زکریا', hindi: 'हजरত জাকারিয়া', bengali: 'হজরত জাকারিয়াহ' },
      topics: ['john the baptist', 'yusuf', 'patience']
    },
    harun: {
      synonyms: ['harun alaihisalam', 'aaron', 'prophet harun'],
      languages: { arabic: 'هارون', urdu: 'حضرت ہارون', hindi: 'हजरत হারুন', bengali: 'হজরত হারুন' },
      topics: ['musa', 'leadership', 'guidance']
    }
  },

  // Allah/Rab Semantic Mapping (per planning.txt)
  ALLAH_CONCEPTS: {
    allah: {
      synonyms: ['khuda', 'rab', 'parvardigar', 'ilah', 'maalik', 'god', 'lord', 'creator'],
      languages: { arabic: 'الله', urdu: 'اللہ', hindi: 'परमात्मा', bengali: 'আল্লাহ' },
      topics: ['oneness', 'creator', 'sustainer', 'merciful', 'most powerful']
    },
    rab: {
      synonyms: ['lord', 'master', 'cherisher', 'sustainer', 'rabb'],
      languages: { arabic: 'رب', urdu: 'رب', hindi: 'प्रभु', bengali: 'রব' },
      topics: ['lord', 'provider', 'sustainer']
    },
    tawheed: {
      synonyms: ['oneness', 'monotheism', 'unity of god'],
      languages: { arabic: 'توحید', urdu: 'توحید', hindi: 'एकत्व', bengali: 'তাওহীদ' },
      topics: ['shirk', 'belief', 'oneness']
    },
    shirk: {
      synonyms: ['polytheism', 'associating partners', 'idolatry'],
      languages: { arabic: 'شرک', urdu: 'شرک', hindi: 'मूर्तिपूजा', bengali: 'শিরক' },
      topics: ['tawheed', 'unforgivable', 'mushrik']
    }
  },

  // Detect prophet from query
  detectProphet: (query) => {
    const lower = query.toLowerCase();
    for (const [prophet, data] of Object.entries(module.exports.PROPHETS || {})) {
      if (data.synonyms.some(s => lower.includes(s.toLowerCase()))) {
        return prophet;
      }
    }
    return null;
  },

  // Detect Allah concept from query
  detectAllahConcept: (query) => {
    const lower = query.toLowerCase();
    for (const [concept, data] of Object.entries(module.exports.ALLAH_CONCEPTS || {})) {
      if (data.synonyms.some(s => lower.includes(s.toLowerCase()))) {
        return concept;
      }
    }
    return null;
  }
};