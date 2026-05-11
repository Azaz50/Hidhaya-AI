/**
 * Comprehensive Islamic Semantic Mapping Engine
 * Supports: English, Hindi, Urdu, Bengali, Roman Urdu, Arabic
 */

// Core Islamic Concepts with extensive mappings
const islamicConcepts = {
  // Faith & Belief
  iman: {
    topic: "faith",
    synonyms: ["faith", "belief", "iman", "imaan", "trust", "conviction"],
    translations: {
      hindi: ["ईमान", "विश्वास", "एमान"],
      urdu: ["ایمان", "یقین", "عقیدہ"],
      bengali: ["বিশ্বাস", "ঈমান"],
      roman_urdu: ["iman", "imaan", "yaqeen", "aqeedah"],
      arabic: ["إيمان", "عقيدة"]
    },
    relatedTopics: ["taqwa", "shirk", "tawheed", "shahadah"]
  },

  shirk: {
    topic: "associating_partners_with_allah",
    synonyms: ["shirk", "polytheism", "idolatry", "associating partners", "sheirk", "shirak"],
    translations: {
      hindi: ["शिर्क", "मूर्तिपूजा", "बहुदेववाद"],
      urdu: ["شرک", "بت پرستی", "کفر"],
      bengali: ["শিরক", "মূর্তিপূজা"],
      roman_urdu: ["shirk", "shirk", "kufr"],
      arabic: ["شِرْك", "كفر", "اتخاذ الأولياء"]
    },
    relatedTopics: ["tawheed", "kufr", "nifaq", "taghut"]
  },

  tawheed: {
    topic: "oneness_of_allah",
    synonyms: ["tawheed", "tawhid", "oneness of god", "monotheism", "tauhid", "oneness"],
    translations: {
      hindi: ["तौहीद", "एकत्ववाद", "अल्लाह का एक होना"],
      urdu: ["توحید", "خدا کی یکتائی"],
      bengali: ["তাওহীদ", "একত্ববাদ"],
      roman_urdu: ["tawheed", "tauhid", "khuda ki yaktagai"],
      arabic: ["توحيد", "إله واحد"]
    },
    relatedTopics: ["iman", "shirk", "rabb", "ibadah"]
  },

  // Virtues & Character
  sabr: {
    topic: "patience",
    synonyms: ["patience", "sabr", "endurance", "perseverance", "steadfastness", "dheeraj", "dhairya"],
    translations: {
      hindi: ["सब्र", "धैर्य", "धीरज", "सबर", "साबर"],
      urdu: ["صبر", "برداشت", "ہمت"],
      bengali: ["ধৈর্য", "সবর"],
      roman_urdu: ["sabr", "sabar", "dhairya", "dheeraj", "himmat"],
      arabic: ["صَبْر", "حِلم", "ثبات"]
    },
    relatedTopics: ["shukr", "tawakkul", "qadar", "muslim"]
  },

  shukr: {
    topic: "gratitude",
    synonyms: ["gratitude", "thanks", "shukr", "appreciation", "shukriya"],
    translations: {
      hindi: ["शुक्र", "आभार", "कृतज्ञता"],
      urdu: ["شکر", "ممنونیت"],
      bengali: ["কৃতজ্ঞতা", "ধন্যবাদ"],
      roman_urdu: ["shukr", "meherbani", "shukriya"],
      arabic: ["شُكْر", "الحمد", "امتنان"]
    },
    relatedTopics: ["sabr", "tawakkul", "nemat", "ahlak"]
  },

  tawakkul: {
    topic: "trust_in_allah",
    synonyms: ["tawakkul", "trust allah", "reliance on god", "dependence on allah", "tawakal"],
    translations: {
      hindi: ["तवक्कुल", "अल्लाह पर भरोसा", "विश्वास"],
      urdu: ["تکلیف", "اللہ پر بھروسہ"],
      bengali: ["আল্লাহর উপর ভরসা"],
      roman_urdu: ["tawakkul", "Allah par bharosa", "awwal Allah"],
      arabic: ["توكُّل", "التوكل على الله", "الرضا"]
    },
    relatedTopics: ["sabr", "shukr", "iman", "qadar"]
  },

  taqwa: {
    topic: "piety",
    synonyms: ["taqwa", "piety", "god-consciousness", "righteousness", "fear of allah", "muttaqi"],
    translations: {
      hindi: ["तक़्वा", "परहेज़गारी", "ईश्वरभय"],
      urdu: ["تقویٰ", "پرہیزگاری", "خدا سے ڈرنا"],
      bengali: ["তাকওয়া", "পরহেযগারিতা"],
      roman_urdu: ["taqwa", "parheizgaari", "khuda se darna"],
      arabic: ["تَقْوى", "الورع", "الفلاح"]
    },
    relatedTopics: ["iman", "salah", "nafl", "ahlak"]
  },

  haya: {
    topic: "modesty",
    synonyms: ["haya", "modesty", "shame", "embarrassment", "hayaa", "shyness"],
    translations: {
      hindi: ["हया", "शर्म", "संकोच", "लाज"],
      urdu: ["حیا", "شرم", "ننگ"],
      bengali: ["লজ্জা", "হায়া"],
      roman_urdu: ["haya", "sharam", "laj", "nang"],
      arabic: ["حَياء", "عِفَّة", "صِيانة"]
    },
    relatedTopics: ["akhlaq", "salah", "purdah", "adab"]
  },

  akhlaq: {
    topic: "morality",
    synonyms: ["akhlaq", "morality", "ethics", "character", "good character", "akhlaq good", "morals"],
    translations: {
      hindi: ["अख्लाक", "चरित्र", "नैतिकता", "आचार"],
      urdu: ["اخلاق", "کردار", "معاشرت"],
      bengali: ["চরিত্র", "নৈতিকতা"],
      roman_urdu: ["akhlaq", "kirdar", "hawaiya"],
      arabic: ["أَخْلاق", "فِعَال", "سُجُود"]
    },
    relatedTopics: ["haya", "adab", "salah", "dua"]
  },

  // Worship
  salah: {
    topic: "prayer",
    synonyms: ["salah", "salat", "prayer", "namaz", "namazi", "worship", "duwa"],
    translations: {
      hindi: ["नमाज़", "प्रार्थना", "सलात", "इबादत"],
      urdu: ["نماز", "صلوٰۃ", "دعا"],
      bengali: ["নামাজ", "সালাত", "দোয়া"],
      roman_urdu: ["namaz", "salah", "salat", "dua"],
      arabic: ["صَلاة", "دُعَاء", "عِبَادَة"]
    },
    relatedTopics: ["wudu", "quran", "jamaat", "imam"]
  },

  zakat: {
    topic: "charity",
    synonyms: ["zakat", "charity", "alms", "poor due", "obligatory charity", "zakaat"],
    translations: {
      hindi: ["ज़कात", "दान", "सदका"],
      urdu: ["زکوٰۃ", "خیرات", "صدقات"],
      bengali: ["যাকাত", "চ্যারিটি"],
      roman_urdu: ["zakat", "khairat", "sadqa"],
      arabic: ["زَكَاة", "صَدَقة", "بر"]
    },
    relatedTopics: ["sadaqah", "sawab", "fatra", "maal"]
  },

  sawm: {
    topic: "fasting",
    synonyms: ["sawm", "fasting", "roza", "ramadan", "iftar", "suhoor", "ums"],
    translations: {
      hindi: ["रोज़ा", "उपवास", "व्रत", "सौम"],
      urdu: ["روزہ", "نیلا", "افطار", "سحور"],
      bengali: ["রোযা", "উপবাস", "ইফতার"],
      roman_urdu: ["roza", "roza", "iftar", "sehri"],
      arabic: ["صَوْم", "صِيَام", "إفطار", "سَحور"]
    },
    relatedTopics: ["ramadan", "zakat", "hajj", "ibadah"]
  },

  hajj: {
    topic: "pilgrimage",
    synonyms: ["hajj", "pilgrimage", "umrah", "haj", "pilgrim", "kaaba"],
    translations: {
      hindi: ["हज़", "तीर्थयात्रा", "काबा"],
      urdu: ["حج", "عمرہ", "کعبہ"],
      bengali: ["হজ", "তীর্থযাত্রা"],
      roman_urdu: ["hajj", "umrah", "kaaba"],
      arabic: ["حَجّ", "عُمرَة", "بَيْت"]
    },
    relatedTopics: ["umrah", "ihram", "tawaf", "maktat"]
  },

  dua: {
    topic: "supplication",
    synonyms: ["dua", "supplication", "prayer", "duwa", "duaa", "pray", "ruqya"],
    translations: {
      hindi: ["दुआ", "प्रार्थना", "खैर", "गुहार"],
      urdu: ["دعا", "خواہش", "عرض"],
      bengali: ["দোয়া", "প্রার্থনা"],
      roman_urdu: ["dua", "amana", "araz"],
      arabic: ["دُعَاء", "رِقْيَة", "تَضَرُّع"]
    },
    relatedTopics: ["salah", "dhikr", "quran", "taawwuz"]
  },

  dhikr: {
    topic: "remembrance_of_allah",
    synonyms: ["dhikr", "zekr", "remembrance", "spiritual practice", "tasbeeh", "astagfar"],
    translations: {
      hindi: ["ज़िक्र", "स्मरण", "तसबीह", "अस्तगफर"],
      urdu: ["ذکر", "یاد", "تسبیح", "استغفار"],
      bengali: ["যিকর", "স্মরণ"],
      roman_urdu: ["dhikr", "yaad", "tasbeeh", "istighfar"],
      arabic: ["ذِكْر", "تَسْبِيح", "اسْتِغْفار"]
    },
    relatedTopics: ["dua", "salah", "taawwuz", "quran"]
  },

  // Islamic Concepts
  jannah: {
    topic: "paradise",
    synonyms: ["jannah", "heaven", "paradise", "janat", "behesht", "firdous"],
    translations: {
      hindi: ["जन्नत", "स्वर्ग", "बेहिश्त"],
      urdu: ["جنت", "بہشت", "فردوس"],
      bengali: ["জান্নাত", "স্বর্গ"],
      roman_urdu: ["jannah", "behesht", "firdous"],
      arabic: ["جَنَّة", "فِرْدَوس", "بَرْزَخ"]
    },
    relatedTopics: ["jahannam", "qiyamah", "akhirah", "hisab"]
  },

  jahannam: {
    topic: "hell",
    synonyms: ["jahannam", "hell", "hellfire", "fire", "dozakh", "jahim"],
    translations: {
      hindi: ["जहन्नुम", "नर्क", "दोज़ख"],
      urdu: ["جہنم", "نار", "دوزخ"],
      bengali: ["জাহান্নাম", "নরক"],
      roman_urdu: ["jahannam", "dozakkh", "nar"],
      arabic: ["جَهَنَّم", "نَار", "هَلَك"]
    },
    relatedTopics: ["jannah", "qiyamah", "azab", "khulud"]
  },

  akhirah: {
    topic: "afterlife",
    synonyms: ["akhirah", "afterlife", "hereafter", "day of judgment", "qiyamah", "judgment day"],
    translations: {
      hindi: ["आखिरत", "परलोक", "क़यामत"],
      urdu: ["آخرت", "قیامت", "یوم الحساب"],
      bengali: ["আখিরাত", "পরলোক"],
      roman_urdu: ["akhirah", "qiyamat", "yawm al hisab"],
      arabic: ["الآخِرَة", "القِيَامَة", "يَوْم الحِسَاب"]
    },
    relatedTopics: ["qiyamah", "jannah", "jahannam", "hisab"]
  },

  qiyamah: {
    topic: "day_of_judgment",
    synonyms: ["qiyamah", "day of judgment", "doomsday", "judgment day", "resurrection", "yawm"],
    translations: {
      hindi: ["क़यामत", "मृत्यु के बाद का दिन", "प्रलय"],
      urdu: ["قیامت", "یوم قیامت"],
      bengali: ["কিয়ামত", "বিচার দিবস"],
      roman_urdu: ["qiyamah", "qiyamat", "yawm"],
      arabic: ["الْقِيَامَة", "الساعة", "نُشُور"]
    },
    relatedTopics: ["akhirah", "hisab", "mizan", "sirat"]
  },

  // Relationships & Social
  tarbiyah: {
    topic: "upbringing",
    synonyms: ["tarbiyah", "upbringing", "parenting", "child rearing", "education", "tarbiyat"],
    translations: {
      hindi: ["तरबीयाह", "पालन-पोषण", "शिक्षा"],
      urdu: ["تربیت", "پرورش", "بچوں کی تربیت"],
      bengali: ["তরবিয়াহ", "পালন-পোষণ"],
      roman_urdu: ["tarbiyah", "parwarish", "bachon ki tarbiyat"],
      arabic: ["تَرْبِيَة", "تَنْشِئَة", "تَأدِيب"]
    },
    relatedTopics: ["ulema", "hukm", "sunnah", "adab"]
  },

  brotherhood: {
    topic: "brotherhood",
    synonyms: ["brotherhood", "sisterhood", "unity", "fraternity", "ukhuwah", "ummah"],
    translations: {
      hindi: ["भाईचारा", "एकता", "उम्माह"],
      urdu: ["بھائی چارہ", "یکجہتی", "امت"],
      bengali: ["ভ্রাতৃত্ব", "ঐক্য"],
      roman_urdu: ["bhai chara", "ekjulti", "ummah"],
      arabic: ["أُخُوَّة", "وَحْدَة", "أُمَّة"]
    },
    relatedTopics: ["ummah", "nifaq", "fitnah", "salah"]
  },

  forgiveness: {
    topic: "forgiveness",
    synonyms: ["forgiveness", "maafi", "pardon", "afu", "azima", "auraan"],
    translations: {
      hindi: ["माफ़ी", "क्षमा", "क्षमा प्रार्थना"],
      urdu: ["معافی", "بخشش", "درگزر"],
      bengali: ["ক্ষমা", "মাফি"],
      roman_urdu: ["maafi", "bakshish", "darguzar"],
      arabic: ["مَغْفِرَة", "عَفْو", "صَفْح"]
    },
    relatedTopics: ["tawbah", "istighfar", "rahma", "dua"]
  },

  // Negative Traits
  anger: {
    topic: "anger",
    synonyms: ["anger", "rage", "gussa", "krodh", "kraadh", "gussaa", "昭e"],
    translations: {
      hindi: ["ग़ुस्सा", "क्रोध", "रोष", "गुस्सा"],
      urdu: ["غصہ", "غضب", "کروہ"],
      bengali: ["ক্রোধ", "রাগ"],
      roman_urdu: ["gussa", "gussa", "krodh", "ghadhab"],
      arabic: ["غَضَب", "سَخَط", "حَنَق"]
    },
    relatedTopics: ["sabr", "hilm", "afu", "muslim"]
  },

  jealousy: {
    topic: "jealousy",
    synonyms: ["jealousy", "hasad", "envy", " envies", "嫉妬"],
    translations: {
      hindi: ["ईर्ष्या", "हसद", "जलन"],
      urdu: ["حَسَد", "جَلاد", "رشک"],
      bengali: ["ঈর্ষ্যা", "হিংসা"],
      roman_urdu: ["hasad", "jaln", "rashk"],
      arabic: ["حَسَد", "غِلّ", "بُغْض"]
    },
    relatedTopics: ["sabr", "shukr", "nafs", "qanaa"]
  },

  backbiting: {
    topic: "backbiting",
    synonyms: ["backbiting", "ghibat", "tale-telling", "slander", "bukan"],
    translations: {
      hindi: ["गपशप", "चुगला", "पीठ behind पीठ बोलना"],
      urdu: ["غیبت", "چغلی", "بدگوئی"],
      bengali: ["পিঠে চোখ রাখা", "গিবত"],
      roman_urdu: ["ghibat", "chughli", "bad goi"],
      arabic: ["غِيبَة", "نَمِيمَة", "بهْت"]
    },
    relatedTopics: ["adab", "salah", "nafs", "munkar"]
  },

  // Other Islamic Concepts
  sunnah: {
    topic: "sunnah",
    synonyms: ["sunnah", "prophet way", "practice", "tradition", "sonnah", "sunan"],
    translations: {
      hindi: ["सुन्नत", "रसूल की राह", "तरीका"],
      urdu: ["سنت", "رسول کا طریقہ"],
      bengali: ["সুন্নাহ", "রাসূলের পথ"],
      roman_urdu: ["sunnah", "rasool ka tariqa"],
      arabic: ["سُنَّة", "سُنَن", "سيرة"]
    },
    relatedTopics: ["hadith", "salah", "sawm", "hijab"]
  },

  halal: {
    topic: "permissible",
    synonyms: ["halal", "permissible", "lawful", "allowed", "halaal"],
    translations: {
      hindi: ["हलाल", "वैध", "जायज़"],
      urdu: ["حلال", "جائز", "درست"],
      bengali: ["হালাল", "বৈধ"],
      roman_urdu: ["halal", "jaiz", "theek"],
      arabic: ["حَلَال", "جَائِز", "مُبَاح"]
    },
    relatedTopics: ["haram", "sharaab", "riba", "gharar"]
  },

  haram: {
    topic: "forbidden",
    synonyms: ["haram", "forbidden", "prohibited", "unlawful", "haraam"],
    translations: {
      hindi: ["हराम", "निषिद्ध", "गैरक़ानूनी"],
      urdu: ["حرام", "ممنوع", "ناواجب"],
      bengali: ["হারাম", "নিষিদ্ধ"],
      roman_urdu: ["haram", "mamnoo", "na jawaz"],
      arabic: ["حَرَام", "مَمْنُوع", "مُحَرَّم"]
    },
    relatedTopics: ["halal", "kufr", "shirk", "gunah"]
  },

  hijab: {
    topic: "modest_dress",
    synonyms: ["hijab", "modest dress", "covering", "purdah", "veil", "abaya"],
    translations: {
      hindi: ["हिजाब", "पर्दा", "आवरण"],
      urdu: ["حجاب", "پردہ", "چادر"],
      bengali: ["হিজাব", "পর্দা"],
      roman_urdu: ["hijab", "pardah", "chadar"],
      arabic: ["حِجَاب", "خِيمَة", "إزَار"]
    },
    relatedTopics: ["haya", "purdah", "aurat", "namaam"]
  },

  rizq: {
    topic: "sustenance",
    synonyms: ["rizq", "sustenance", "provision", "livelihood", "ruzie", "rozi"],
    translations: {
      hindi: ["रिज़क़", "रोज़ी", "जीविका"],
      urdu: ["رزق", "روزی", "کسب"],
      bengali: ["রিজক", "জীবিকা"],
      roman_urdu: ["rizq", "rozii", "kasb"],
      arabic: ["رِزْق", "عَيْش", "اكْتساب"]
    },
    relatedTopics: ["tawakkul", "shukr", "qadar", "sabr"]
  },

  fitnah: {
    topic: "trial_temptation",
    synonyms: ["fitnah", "trial", "temptation", "test", "فتنة", "فساد"],
    translations: {
      hindi: ["फितना", "परीक्षा", "प्रलोभन"],
      urdu: ["فتنہ", "آزمائش", "فریب"],
      bengali: ["ফিতনা", "পরীক্ষা"],
      roman_urdu: ["fitnah", "azmaish", "fareb"],
      arabic: ["فِتْنَة", "ابْتِلَاء", "اخْتِبَار"]
    },
    relatedTopics: ["sabr", "nifaq", "shirk", "kufr"]
  },

  ummah: {
    topic: "muslim_community",
    synonyms: ["ummah", "community", "muslim community", "ummat"],
    translations: {
      hindi: ["उम्माह", "समुदाय", "मुस्लिम समुदाय"],
      urdu: ["امت", "کمیونٹی", "مسلمان قوم"],
      bengali: ["উম্মাহ", "সম্প্রদায়"],
      roman_urdu: ["ummah", "qaum", "muslim samaj"],
      arabic: ["أُمَّة", "جَمَاعَة", "شَعْب"]
    },
    relatedTopics: ["brotherhood", "khilafat", "salah", "jamaat"]
  },

  quran: {
    topic: "holy_quran",
    synonyms: ["quran", "koran", "holy quran", "quran recitation", "kuran"],
    translations: {
      hindi: ["क़ुरान", "कुरआन", "इस्लामी किताब"],
      urdu: ["قرآن", "کuran"],
      bengali: ["কুরআন", "পবিত্র কিতাব"],
      roman_urdu: ["quran", "Quran"],
      arabic: ["الْقُرْآن", "كِتَاب", "مُصْحَف"]
    },
    relatedTopics: ["hadith", "salah", "dhikr", "jihad"]
  },

  hadith: {
    topic: "prophet_sayings",
    synonyms: ["hadith", "prophet sayings", "traditions", "sayings of prophet", "hadees"],
    translations: {
      hindi: ["हदीस", "हैदीस", "रसूल के कथन"],
      urdu: ["حدیث", "روایات"],
      bengali: ["হাদিস", "রাসূলের বাণী"],
      roman_urdu: ["hadith", "hadees", "riwayat"],
      arabic: ["حَدِيث", "رِوَايَة", "أَثَر"]
    },
    relatedTopics: ["quran", "sunnah", "sahabi", "imam"]
  },

  nikah: {
    topic: "marriage",
    synonyms: ["nikah", "marriage", "wedding", "nikah", "wazeefa"],
    translations: {
      hindi: ["निकाह", "विवाह", "शादी"],
      urdu: ["نکاح", "شادی", "ازدواج"],
      bengali: ["বিয়ে", "বিবাহ"],
      roman_urdu: ["nikah", "shadi", "zawaj"],
      arabic: ["نِكَاح", "زَوَاج", "فَرَاض"]
    },
    relatedTopics: ["mahr", "mehram", "walimah", "talaq"]
  },

  jihad: {
    topic: "struggle",
    synonyms: ["jihad", "struggle", "effort", "striving", "jehad"],
    translations: {
      hindi: ["जिहाद", "संघर्ष", "प्रयास"],
      urdu: ["جہاد", "جدوجہد", "محنت"],
      bengali: ["জিহাদ", "আন্দোলন"],
      roman_urdu: ["jihad", "muhim", "koshish"],
      arabic: ["جِهَاد", "مُحَاوَبَة", "سَعْي"]
    },
    relatedTopics: ["sabr", "shaheed", "qital", "ghazwa"]
  }
};

// Noise words to remove from queries by language
const noiseWords = {
  english: [
    "what", "is", "are", "was", "were", "how", "why", "who", "where", "when",
    "tell", "me", "about", "explain", "describe", "define", "does", "do",
    "in", "islam", "islamic", "muslim", "the", "a", "an", "and", "or", "but",
    "according", "to", "say", "says", "said", "it", "this", "that", "with",
    "for", "from", "by", "can", "could", "should", "would", "may", "might",
    "please", "kindly", "i", "want", "need", "know", "understand"
  ],
  hindi: [
    "क्या", "है", "हैं", "था", "थे", "कैसे", "क्यों", "कौन", "कहाँ", "कब",
    "मुझे", "बताओ", "के", "बारे", "में", "इस्लाम", "इस्लामी", "मुस्लिम",
    "के", "का", "की", "को", "से", "पर", "और", "या", "लेकिन", "है",
    "बताइए", "समझाइए", "दर्शाइए", "कर", "सकता", "चाहिए", "दीजिए"
  ],
  urdu: [
    "کیا", "ہے", "ہیں", "تھا", "تھے", "کیسے", "کیوں", "کون", "کہاں", "کب",
    "مجھے", "بتاؤ", "کے", "بارے", "میں", "اسلام", "اسلامی", "مسلمان",
    "کے", "کا", "کی", "کو", "سے", "پر", "اور", "یا", "لیکن", "ہے",
    "بتائیں", "سمجھائیں", "دکھائیں", "کر", "سکتا", "چاہیے", "دیجیۓ"
  ],
  bengali: [
    "কি", "হয়", "ছিল", "কিভাবে", "কেন", "কে", "কোথায়", "কখন",
    "আমাকে", "বলো", "সম্পর্কে", "ইসলাম", "ইসলামী", "মুসলিম",
    "এর", "একটি", "এই", "এবং", "অথবা", "কিন্তু", "কর",
    "দেখাও", "বুঝাও", "বল", "পার", "চাই"
  ],
  roman_urdu: [
    "kya", "hai", "hain", "tha", "the", "kaise", "kyun", "kaun", "kahan", "kab",
    "mujhe", " batao", "ke", "bare", "mein", "islam", "islami", "muslim",
    "ka", "ki", "ko", "se", "par", "aur", "ya", "lekin", "hai",
    " bataiye", "samjhaiye", "dikhaiye", "kar", "sakta", "chahiye", "diye"
  ]
};

// Emotion indicators
const emotionIndicators = {
  sadness: ["depression", "sad", "unhappy", "grief", "sorrow", "depressed", "udasi", "gam", "gham", "দুঃখ", "উদাসীন", "غم", "غمگین"],
  fear: ["afraid", "scared", "fear", "anxiety", "worried", "khauf", "dr", "خوف", "ڈر", "পরীক্ষা"],
  hope: ["hopeful", "hope", "optimistic", "umeed", "asha", "امید", "আশা"],
  anger: ["angry", "furious", "mad", "rage", "gussa", "krodh", "غصہ", "রাগ"],
  gratitude: ["grateful", "thankful", "appreciate", "shukriya", "shukr", "شکریہ", "কৃতজ্ঞ"],
  confusion: ["confused", "puzzled", "don't understand", "samajh nahi", "ग़लतफ़हमी", "বিভ্রান্ত"]
};

// Create reverse mapping from any word to concepts
const buildReverseMapping = () => {
  const reverseMap = new Map();

  for (const [conceptKey, conceptData] of Object.entries(islamicConcepts)) {
    // Map from topic
    reverseMap.set(conceptKey.toLowerCase(), conceptKey);
    reverseMap.set(conceptData.topic.toLowerCase().replace(/\s+/g, '_'), conceptKey);

    // Map all synonyms
    conceptData.synonyms.forEach(syn => {
      reverseMap.set(syn.toLowerCase(), conceptKey);
    });

    // Map translations
    for (const [lang, translations] of Object.entries(conceptData.translations)) {
      translations.forEach(trans => {
        reverseMap.set(trans.toLowerCase(), conceptKey);
        // Also add without diacritics
        reverseMap.set(trans.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''), conceptKey);
      });
    }
  }

  return reverseMap;
};

// Build the reverse mapping
const reverseConceptMap = buildReverseMapping();

/**
 * Normalize query by removing noise words
 */
const normalizeQuery = (query, language = 'english') => {
  if (!query) return '';

  let normalized = query.toLowerCase()
    .replace(/[^\w\sऀ-ॿ؀-ۿঀ-৿ᰀ-ᱏ]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = normalized.split(' ');
  const noiseSet = new Set(noiseWords[language] || noiseWords.english);
  const filtered = words.filter(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    return cleanWord.length > 1 && !noiseSet.has(cleanWord);
  });

  return filtered.join(' ');
};

/**
 * Detect concepts in query
 */
const detectConcepts = (query) => {
  const normalizedQuery = query.toLowerCase();
  const detectedConcepts = [];

  for (const [word, conceptKey] of reverseConceptMap.entries()) {
    if (normalizedQuery.includes(word)) {
      if (!detectedConcepts.includes(conceptKey)) {
        detectedConcepts.push(conceptKey);
      }
    }
  }

  return detectedConcepts;
};

/**
 * Detect emotional context
 */
const detectEmotion = (query) => {
  const normalizedQuery = query.toLowerCase();

  for (const [emotion, indicators] of Object.entries(emotionIndicators)) {
    for (const indicator of indicators) {
      if (normalizedQuery.includes(indicator.toLowerCase())) {
        return emotion;
      }
    }
  }

  return 'neutral';
};

/**
 * Expand query with related concepts
 */
const expandQueryWithConcepts = (query, detectedConcepts) => {
  const expansions = new Set([query]);

  for (const conceptKey of detectedConcepts) {
    const concept = islamicConcepts[conceptKey];
    if (concept) {
      // Add topic
      expansions.add(concept.topic);

      // Add synonyms
      concept.synonyms.forEach(syn => expansions.add(syn));

      // Add translations
      for (const translations of Object.values(concept.translations)) {
        translations.forEach(trans => expansions.add(trans));
      }

      // Add related topics
      concept.relatedTopics.forEach(related => {
        const relatedConcept = islamicConcepts[related];
        if (relatedConcept) {
          expansions.add(relatedConcept.topic);
          relatedConcept.synonyms.forEach(syn => expansions.add(syn));
        }
      });
    }
  }

  return Array.from(expansions).join(' ');
};

/**
 * Detect language from query
 */
const detectLanguage = (query) => {
  // Check for Arabic script
  if (/[؀-ۿ]/.test(query)) {
    return 'arabic';
  }

  // Check for Hindi/Devanagari script
  if (/[ऀ-ॿ]/.test(query)) {
    return 'hindi';
  }

  // Check for Bengali script
  if (/[ঀ-৿ᰀ-ᱏ]/.test(query)) {
    return 'bengali';
  }

  // Check for Urdu patterns (Arabic script mixed with certain words)
  if (/کی|ہے|نے|کے/.test(query)) {
    return 'urdu';
  }

  return 'english';
};

/**
 * Process query for semantic search
 */
const processQuery = (query, language = null) => {
  // Auto-detect language if not provided
  const detectedLang = language || detectLanguage(query);

  // Normalize query
  const normalizedQuery = normalizeQuery(query, detectedLang);

  // Detect concepts
  const detectedConcepts = detectConcepts(normalizedQuery);

  // Detect emotion
  const emotion = detectEmotion(query);

  // Expand query with concepts
  const expandedQuery = expandQueryWithConcepts(normalizedQuery, detectedConcepts);

  return {
    originalQuery: query,
    normalizedQuery,
    detectedConcepts,
    detectedLanguage: detectedLang,
    emotion,
    expandedQuery,
    searchTerms: Array.from(new Set([
      normalizedQuery,
      expandedQuery,
      ...detectedConcepts
    ]))
  };
};

module.exports = {
  islamicConcepts,
  noiseWords,
  emotionIndicators,
  reverseConceptMap,
  normalizeQuery,
  detectConcepts,
  detectEmotion,
  expandQueryWithConcepts,
  detectLanguage,
  processQuery
};