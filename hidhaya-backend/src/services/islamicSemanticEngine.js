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
  },

  // PROPHETS
  muhammad: {
    topic: "prophet_muhammad",
    synonyms: ["muhammad", "muhammad pbuh", "muhammad ﷺ", "prophet muhammad", "hazrat muhammad", "rasulullah", "sallallahu alaihi wasallam"],
    translations: {
      hindi: ["पैगंबर मुहम्मद", "हज़रत मुहम्मद"],
      urdu: ["نبی کریم", "حضور", "رسول", "پیغمبر"],
      bengali: ["নবী মুহাম্মদ", "হজরত মুহাম্মদ"],
      roman_urdu: ["nabi karim", "huzoor", "rasool"],
      arabic: ["مُحَمَّد", "رَسُول اللَّهِ", "النَّبِي"]
    },
    relatedTopics: ["quran", "sunnah", "hijra", "makkah", "madinah"]
  },

  ibrahim: {
    topic: "prophet_ibrahim",
    synonyms: ["ibrahim", "abraham", "khalilullah", "prophet ibrahim"],
    translations: {
      hindi: ["इब्राहिम", "हज़रत इब्राहिम"],
      urdu: ["حضرت ابراہیم", "خليل اللہ"],
      bengali: ["হজরত ইব্রাহিম", "খলিলুল্লাহ"],
      roman_urdu: ["hazrat ibrahim", "khalilullah"],
      arabic: ["إبْرَاهِيم", "خَلِيل اللَّهِ"]
    },
    relatedTopics: ["tawheed", "sacrifice", "kaaba", "hajj", "ismail"]
  },

  musa: {
    topic: "prophet_musa",
    synonyms: ["musa", "moses", "kalimullah", "prophet musa"],
    translations: {
      hindi: ["मूसा", "हज़रत मूसा"],
      urdu: ["حضرت موسیٰ", "کلیم اللہ"],
      bengali: ["হজরত মুসা", "কালিমুল্লাহ"],
      roman_urdu: ["hazrat musa", "kalimullah"],
      arabic: ["مُوسَى", "كَلِيمُ اللَّهِ"]
    },
    relatedTopics: ["torah", "pharaoh", "ten commandments", "hijab"]
  },

  isa: {
    topic: "prophet_isa",
    synonyms: ["isa", "jesus", "masih", "prophet isa"],
    translations: {
      hindi: ["ईसा", "हज़रत ईसा"],
      urdu: ["حضرت عیسیٰ", "مسیح"],
      bengali: ["হজরত ঈসা", "মসীহ"],
      roman_urdu: ["hazrat isa", "masih"],
      arabic: ["عِيسَى", "المَسِيح"]
    },
    relatedTopics: ["injil", "miracles", "second coming", "mariam"]
  },

  nooh: {
    topic: "prophet_nooh",
    synonyms: ["nooh", "noah", "prophet nooh"],
    translations: {
      hindi: ["नूह", "हज़रत नूह"],
      urdu: ["حضرت نوح", "نوح علیہ السلام"],
      bengali: ["হজরত নূহ", "নূহ আলাইহি ওয়াসাল্লাম"],
      roman_urdu: ["hazrat nooh", "nooh alaihisalam"],
      arabic: ["نُوح", "نُوحٌ عَلَيْهِ السَّلَام"]
    },
    relatedTopics: ["ark", "flood", "qawm", "warning"]
  },

  adam: {
    topic: "prophet_adam",
    synonyms: ["adam", "prophet adam", "first man"],
    translations: {
      hindi: ["आदम", "हज़रत आदम"],
      urdu: ["حضرت آدم", "آدم علیہ السلام"],
      bengali: ["হজরত আদম", "আদম আলাইহি ওয়াসাল্লাম"],
      roman_urdu: ["hazrat adam", "adam alaihisalam"],
      arabic: ["آدَم", "أَبُو الْبَشَر"]
    },
    relatedTopics: ["creation", "heaven", "knowledge", "tawbah"]
  },

  yusuf: {
    topic: "prophet_yusuf",
    synonyms: ["yusuf", "joseph", "prophet yusuf"],
    translations: {
      hindi: ["यूसुफ़", "हज़रत यूसुफ़"],
      urdu: ["حضرت یوسف", "یوسف علیہ السلام"],
      bengali: ["হজরত ইউসুফ", "ইউসুফ আলাইহি ওয়াসাল্লাম"],
      roman_urdu: ["hazrat yusuf", "yusuf alaihisalam"],
      arabic: ["يُوسُف", "يُوسُف عَلَيْهِ السَّلَام"]
    },
    relatedTopics: ["dream", "wisdom", "governance", "sabr"]
  },

  dawood: {
    topic: "prophet_dawood",
    synonyms: ["dawood", "david", "prophet dawood"],
    translations: {
      hindi: ["दाऊद", "हज़रत दाऊद"],
      urdu: ["حضرت داوود", "داؤد علیہ السلام"],
      bengali: ["হজরত দাউদ", "দাউদ আলাইহি ওয়াসাল্লাম"],
      roman_urdu: ["hazrat dawood", "dawood alaihisalam"],
      arabic: ["دَاوُود", "دَاوُود عَلَيْهِ السَّلَام"]
    },
    relatedTopics: ["zabur", "psalms", "kingdom", "justice"]
  },

  sulaiman: {
    topic: "prophet_sulaiman",
    synonyms: ["sulaiman", "solomon", "prophet sulaiman"],
    translations: {
      hindi: ["सुलेमान", "हज़रत सुलेमान"],
      urdu: ["حضرت سلیمان", "سلیمان علیہ السلام"],
      bengali: ["হজরত সুলাইমান", "সুলাইমান আলাইহি ওয়াসাল্লাম"],
      roman_urdu: ["hazrat sulaiman", "sulaiman alaihisalam"],
      arabic: ["سُلَيْمَان", "سُلَيْمَان عَلَيْهِ السَّلَام"]
    },
    relatedTopics: ["kingdom", "wisdom", "birds", "wind"]
  },

  ismail: {
    topic: "prophet_ismail",
    synonyms: ["ismail", "ishmael", "prophet ismail"],
    translations: {
      hindi: ["इस्माइल", "हज़रत इस्माइल"],
      urdu: ["حضرت اسماعیل", "اسماعیل علیہ السلام"],
      bengali: ["হজরত ইসমাইল", "ইসমাইল আলাইহি ওয়াসাল্লাম"],
      roman_urdu: ["hazrat ismail", "ismail alaihisalam"],
      arabic: ["إِسْمَاعِيل", "إِسْمَاعِيل عَلَيْهِ السَّلَام"]
    },
    relatedTopics: ["sacrifice", "zamzam", "kaaba", "hajj"]
  },

  // ALL COMPREHENSIVE TERMS ADDED
  // Add remaining Islamic concepts
  shahadah: {
    topic: "declaration_of_faith",
    synonyms: ["shahada", "shahadah", "kalima", "testimony of faith"],
    translations: {
      hindi: ["शहादत", "कलिमा", "ईमान"],
      urdu: ["شہادت", "کلمہ", "ایمان کا اعلان"],
      bengali: ["শাহাদাত", "কালিমা", "বিশ্বাস ঘোষণা"],
      roman_urdu: ["shahadah", "kalima", "iqrar"],
      arabic: ["شَهَادَة", "كَلِمَة", "أَشْهَدُ أَن"]
    },
    relatedTopics: ["iman", "tawheed", "shirk"]
  },

  wudu: {
    topic: "ablution",
    synonyms: ["wudu", "ablution", "washing", "purification"],
    translations: {
      hindi: ["वुज़ू", "अब्देस्त"],
      urdu: ["وضو", "پاکی"],
      bengali: ["উযু", "অজু"],
      roman_urdu: ["wudu", "wazu", "paki"],
      arabic: ["وُضُوء", "تَطَهُّر", "غُسْل"]
    },
    relatedTopics: ["salah", "hadath", "tahara"]
  },

  sawm_fasting: {
    topic: "fasting_ramadan",
    synonyms: ["sawm", "fasting", "roza", "ramadan", "iftar", "suhoor"],
    translations: {
      hindi: ["रोज़ा", "उपवास", "रमज़ान"],
      urdu: ["روزہ", "افطار", "سحور"],
      bengali: ["রোযা", "ইফতার", "সেহরি"],
      roman_urdu: ["roza", "iftar", "sehri"],
      arabic: ["صَوْم", "إفطار", "سَحور", "رَمَضَان"]
    },
    relatedTopics: ["zakat", "hajj", "ibadah", "sabar"]
  },

  hajj_pilgrimage: {
    topic: "pilgrimage_mecca",
    synonyms: ["hajj", "pilgrimage", "umrah", "tawaf", "saee"],
    translations: {
      hindi: ["हज़", "तीर्थयात्रा", "उमरा"],
      urdu: ["حج", "عمرہ", "طواف", "سعی"],
      bengali: ["হজ", "উমরাহ", "তাওয়াফ"],
      roman_urdu: ["hajj", "umrah", "tawaf", "saee"],
      arabic: ["حَجّ", "عُمْرَة", "طَوَاف", "سَعْي"]
    },
    relatedTopics: ["kaaba", "ihram", "maktat", "umrah"]
  },

  zakkah: {
    topic: "obligatory_charity",
    synonyms: ["zakat", "zakah", "charity", "alms"],
    translations: {
      hindi: ["ज़कात", "दान"],
      urdu: ["زکوٰۃ", "خیرات"],
      bengali: ["যাকাত", "দান"],
      roman_urdu: ["zakat", "khairat"],
      arabic: ["زَكَاة", "صَدَقة", "بِرّ"]
    },
    relatedTopics: ["sadaqah", "maal", "fatra"]
  },

  // Islamic calendar and events
  ramadan: {
    topic: "ramadan_month",
    synonyms: ["ramadan", "ramazan", "month of fasting", "blessed month"],
    translations: {
      hindi: ["रमज़ान", "रमदान"],
      urdu: ["رمضان", "ماہ رمضان"],
      bengali: ["রমজান", "রমদান"],
      roman_urdu: ["ramazan", "mah-e-ramazan"],
      arabic: ["رَمَضَان", "شَهْرُ رَمَضَان"]
    },
    relatedTopics: ["sawm", "quran", "laylatul qadr", "iftar"]
  },

  laylatul_qadr: {
    topic: "night_of_power",
    synonyms: ["laylatul qadr", "laylat al qadr", "night of decree", "powerful night"],
    translations: {
      hindi: ["लैलतुल कद्र", "शब-e-कद्र"],
      urdu: ["لیلتہ القدر", "شب قدر"],
      bengali: ["লাইলাতুল কদর", "শবেকদর"],
      roman_urdu: ["laylatul qadr", "shab-e-qadr"],
      arabic: ["لَيْلَةُ الْقَدْر", "شَرْفُ لَيْلَة"]
    },
    relatedTopics: ["quran", "ramadan", "wahi"]
  },

  // Islamic terms continued
  qiyamah_day: {
    topic: "day_of_judgment",
    synonyms: ["qiyamah", "judgment day", "doomsday", "resurrection"],
    translations: {
      hindi: ["क़यामत", "मृत्यु"],
      urdu: ["قیامت", "یوم الحساب"],
      bengali: ["কিয়ামত", "বিচার দিবস"],
      roman_urdu: ["qiyamah", "yawm al hisab"],
      arabic: ["الْقِيَامَة", "يَوْم الْحِسَاب"]
    },
    relatedTopics: ["akhirah", "hisab", "mizan", "sirat"]
  },

  jannah_paradise: {
    topic: "paradise_heaven",
    synonyms: ["jannah", "paradise", "heaven", "janat", "behesht"],
    translations: {
      hindi: ["जन्नत", "स्वर्ग"],
      urdu: ["جنت", "بہشت"],
      bengali: ["জান্নাহ", "স্বর্গ"],
      roman_urdu: ["jannah", "behesht"],
      arabic: ["جَنَّة", "فِرْدَوس", "بَرْزَخ"]
    },
    relatedTopics: ["jahannam", "qiyamah", "husn", "jaza"]
  },

  jahannam_hell: {
    topic: "hell_hellfire",
    synonyms: ["jahannam", "hell", "hellfire", "dozakh", "nar"],
    translations: {
      hindi: ["जहन्नुम", "नर्क"],
      urdu: ["جہنم", "دوزخ"],
      bengali: ["জাহান্নাম", "নরক"],
      roman_urdu: ["jahannam", "dozakkh"],
      arabic: ["جَهَنَّم", "نَار", "سَقَر"]
    },
    relatedTopics: ["jannah", "azab", "qiyamah"]
  },

  // More virtues
  tawbah: {
    topic: "repentance",
    synonyms: ["tawbah", "repentance", "tuba", "tauba"],
    translations: {
      hindi: ["तौबा", "पश्चाताप"],
      urdu: ["توبہ", "رجوع"],
      bengali: ["তওবাহ", "অনুশোচনা"],
      roman_urdu: ["tawbah", "tauba"],
      arabic: ["تَوْبَة", "اسْتِغْفَار", "رُجُوع"]
    },
    relatedTopics: ["istighfar", "rahma", "dua", "sabr"]
  },

  istighfar_seeking: {
    topic: "seeking_forgiveness",
    synonyms: ["istighfar", "astaghfirullah", "seeking allah pardon", "forgiveness"],
    translations: {
      hindi: ["इस्तिग़फ़ार", "माफ़ी"],
      urdu: ["استغفار", "معافی"],
      bengali: ["ইস্তিগফার", "ক্ষমা"],
      roman_urdu: ["istighfar", "astaghfirullah"],
      arabic: ["اسْتِغْفَار", "أَسْتَغْفِرُاللَّه"]
    },
    relatedTopics: ["tawbah", "dua", "sabr", "rahma"]
  },

  tasbih: {
    topic: "glorification",
    synonyms: ["tasbih", "subhan allah", "glorifying allah", "exalted"],
    translations: {
      hindi: ["तसबीह", "सुबहानाल्लाह"],
      urdu: ["تسبیح", "سبحان اللہ"],
      bengali: ["তাসবীহ", "সুবহানাল্লাহ"],
      roman_urdu: ["tasbih", "subhan allah"],
      arabic: ["تَسْبِيح", "سُبْحَانَاللَّه"]
    },
    relatedTopics: ["tahmid", "takbir", "dhikr"]
  },

  tahmid: {
    topic: "praise",
    synonyms: ["tahmid", "alhamdulillah", "all praise to allah", "hamd"],
    translations: {
      hindi: ["तहमीद", "अल्हमदुलिल्लाह"],
      urdu: ["تحمید", "الحمداللہ"],
      bengali: ["তাহমীদ", "আলহামদুলিল্লাহ"],
      roman_urdu: ["tahmid", "alhamdulillah"],
      arabic: ["تَحْمِيد", "الْحَمْدُ لِلَّه"]
    },
    relatedTopics: ["tasbih", "shukr", "dhikr"]
  },

  takbir: {
    topic: "exaltation",
    synonyms: ["takbir", "allahu akbar", "allah is greatest", "allaho akbar"],
    translations: {
      hindi: ["तकबीर", "अल्लाहु अकबर"],
      urdu: ["تکبیر", "اللہ اکبر"],
      bengali: ["তাকবীর", "আল্লাহু আকবার"],
      roman_urdu: ["takbir", "allah hu akbar"],
      arabic: ["تَكْبِير", "اللَّهُ أَكْبَر"]
    },
    relatedTopics: ["tasbih", "tahmid", "adhan"]
  },

  // Islamic sciences
  tafsir: {
    topic: "quran_explanation",
    synonyms: ["tafsir", "quran commentary", "interpretation"],
    translations: {
      hindi: ["तफ़सीर", "क़ुरान की व्याख्या"],
      urdu: ["تفسیر", "قرآن کی تشریح"],
      bengali: ["তাফসীর", "কুরআন ব্যাখ্যা"],
      roman_urdu: ["tafsir", "quran ki sharah"],
      arabic: ["تَفْسِير", "بَيَان"]
    },
    relatedTopics: ["quran", "hukm", "fiqh"]
  },

  fiqh_knowledge: {
    topic: "islamic_jurisprudence",
    synonyms: ["fiqh", "jurisprudence", "islamic law understanding"],
    translations: {
      hindi: ["फ़िक़ह", "इस्लामी क़ानून"],
      urdu: ["فقہ", "فقہی احکام"],
      bengali: ["ফিকহ", "ইসলামী আইন"],
      roman_urdu: ["fiqh", "masla"],
      arabic: ["فِقْه", "عِلْم الْأَحْكَام"]
    },
    relatedTopics: ["shariah", "hukm", "sunnah"]
  },

  // Family and relationships
  nikah_marriage: {
    topic: "marriage_nikah",
    synonyms: ["nikah", "marriage", "wedding", "zawaj", "wazeefa"],
    translations: {
      hindi: ["निकाह", "विवाह"],
      urdu: ["نکاح", "شادی"],
      bengali: ["বিয়ে", "বিবাহ"],
      roman_urdu: ["nikah", "shadi"],
      arabic: ["نِكَاح", "زَوَاج"]
    },
    relatedTopics: ["mahr", "mehram", "walimah", "talaq"]
  },

  mehr_mahr: {
    topic: "dower_marriage_gift",
    synonyms: ["mehr", "mahr", "dower", "marriage gift"],
    translations: {
      hindi: ["मेहर", "महर"],
      urdu: ["مہر", "دولت"],
      bengali: ["মেহর", "বিয়ের উপহার"],
      roman_urdu: ["mehr", "dolat"],
      arabic: ["مَهْر", "صَدَاق"]
    },
    relatedTopics: ["nikah", "walimah", "adab"]
  },

  // Emotional and spiritual states
  khushu: {
    topic: "humble_submission",
    synonyms: ["khushu", "khushoo", "humility in prayer", "submission"],
    translations: {
      hindi: ["ख़ुशू", "विनम्रता"],
      urdu: ["خشوع", "عاجزی"],
      bengali: ["খুশু", "বিনয়"],
      roman_urdu: ["khushu", "ajizi"],
      arabic: ["خُشُوع", "إِخْلَاص"]
    },
    relatedTopics: ["salah", "tawadhu", "quran"]
  },

  khawf_fear: {
    topic: "fear_of_allah",
    synonyms: ["khawf", "fear allah", "reverence", "awe"],
    translations: {
      hindi: ["ख़ौफ़", "अल्लाह का डर"],
      urdu: ["خوف", "ڈر"],
      bengali: ["খওফ", "আল্লাহর ভয়"],
      roman_urdu: ["khawf", "dar"],
      arabic: ["خَوْف", "رَهْبَة", "إِرْعَاب"]
    },
    relatedTopics: ["taqwa", "tawakkul", "rahba"]
  },

  tawakkul_trust: {
    topic: "trust_allah",
    synonyms: ["tawakkul", "trust in allah", "reliance", "dependence"],
    translations: {
      hindi: ["तवक्कुल", "भरोसा"],
      urdu: ["توکل", "بھروسہ"],
      bengali: ["তাওয়াক্কুল", "ভরসা"],
      roman_urdu: ["tawakkul", "bharosa"],
      arabic: ["تَوَكُّل", "الْتَّوَكُّل عَلَى اللَّه"]
    },
    relatedTopics: ["sabr", "shukr", "qadar"]
  },

  riza_acceptance: {
    topic: "acceptance_divine_decree",
    synonyms: ["riza", "ridha", "pleasure", "acceptance", "qabool"],
    translations: {
      hindi: ["रिज़ा", "स्वीकृति"],
      urdu: ["رضا", "اطاعت"],
      bengali: ["রিযা", "গ্রহণ"],
      roman_urdu: ["riza", "qabool"],
      arabic: ["رِضَا", "الرِّضَا", "القَبول"]
    },
    relatedTopics: ["sabr", "tawakkul", "qadar"]
  },

  qanaa_contentment: {
    topic: "contentment",
    synonyms: ["qanaa", "contentment", "satisfaction", "qanaati"],
    translations: {
      hindi: ["क़ना", "संतोष"],
      urdu: ["قناعت", "راضی"],
      bengali: ["কনা", "তুষ্টি"],
      roman_urdu: ["qanaa", "razi"],
      arabic: ["قَنَاعَة", "الرِّضَا", "الشُّكْر"]
    },
    relatedTopics: ["shukr", "qanaa", "nafs"]
  },

  // ==================== NAMES OF ALLAH (Asma ul Husna) ====================
  arrahman_merciful: {
    topic: "the_merciful",
    synonyms: ["arrahman", "the merciful", "most merciful", "raheem"],
    translations: {
      hindi: ["अर्रहमान", "दयालु", "करुणाशील"],
      urdu: ["الرحمٰن", "مہربان", "رحم والا"],
      bengali: ["আর রহমান", "দয়ালু"],
      roman_urdu: ["arrahman", "mehrban", "rehmat wala"],
      arabic: ["الرَّحْمٰن", "ذو الرَّحْمَة"]
    },
    relatedTopics: ["arrahim", "rahma", "mercy"]
  },

  arrahim_compassionate: {
    topic: "the_compassionate",
    synonyms: ["arrahim", "the compassionate", "most compassionate", "raheem"],
    translations: {
      hindi: ["अर्रहीम", "अत्यंत दयालु"],
      urdu: ["الر حیم", "بہت رحم کرنے والا"],
      bengali: ["আর রহীম", "অতি দয়ালু"],
      roman_urdu: ["arrahim", "bahut meherban"],
      arabic: ["الرَّحِيم", "ذو الرَّحْمَة"]
    },
    relatedTopics: ["arrahman", "rahma", "ghafur"]
  },

  almalik_king: {
    topic: "the_king",
    synonyms: ["almalik", "the king", "sovereign", "malik"],
    translations: {
      hindi: ["अलमलिक", "बादशाह", "राजा"],
      urdu: ["المالک", "بادشاہ", "شہنشاہ"],
      bengali: ["আল মালিক", "রাজা"],
      roman_urdu: ["almalik", "badshah", "sultan"],
      arabic: ["الْمَلِك", "ذو الْمُلْك"]
    },
    relatedTopics: ["alquddus", "almalek", "sultan"]
  },

  alquddus_holy: {
    topic: "the_holy",
    synonyms: ["alquddus", "the holy", "pure", "sacred", "quddus"],
    translations: {
      hindi: ["अलकुद्दूस", "पवित्र", "शुद्ध"],
      urdu: ["القدوس", "پاک", "مقدس"],
      bengali: ["আল কুদ্দুস", "পবিত্র"],
      roman_urdu: ["alquddus", "pak", "muzahir"],
      arabic: ["الْقُدُّوس", "ذو الْقُدْس"]
    },
    relatedTopics: ["assalam", "alnur", "tahir"]
  },

  assalam_peace: {
    topic: "the_source_of_peace",
    synonyms: ["assalam", "peace", "salām", "salam"],
    translations: {
      hindi: ["अस्सलाम", "शांति", "अमन"],
      urdu: ["السلام", "امن", "سلامتی"],
      bengali: ["আস সালাম", "শান্তি"],
      roman_urdu: ["assalam", "aman", "salam"],
      arabic: ["السَّلَام", "ذو السَّلَام"]
    },
    relatedTopics: ["almuin", "aman", "salam"]
  },

  almuin_guiver: {
    topic: "the_guiver",
    synonyms: ["almuin", "the giver", "bestower", "muin"],
    translations: {
      hindi: ["अलमुईन", "दाता", "प्रदाता"],
      urdu: ["المؤمن", "دینے والا", "بخشنے والا"],
      bengali: ["আল মুঈন", "দাতা"],
      roman_urdu: ["almuin", "dene wala"],
      arabic: ["الْمُؤْمِن", "ذو الْإِيمَان"]
    },
    relatedTopics: ["alrazzak", "wahhab", "fazal"]
  },

  alrazzak_sustainer: {
    topic: "the_provider",
    synonyms: ["alrazzak", "the provider", "sustainer", "rizq"],
    translations: {
      hindi: ["अलरज़ाक", "रिज़क़ देने वाला", "जीविका दाता"],
      urdu: ["الرزاق", "روزی دینے والا"],
      bengali: ["আর রিজক", "জীবিকা দাতা"],
      roman_urdu: ["alrazzak", "rozii dene wala"],
      arabic: ["الرَّزَّاق", "ذو الرِّزْق"]
    },
    relatedTopics: ["almuin", "rizq", "kifayat"]
  },

  alhakim_wise: {
    topic: "the_wise",
    synonyms: ["alhakim", "the wise", "all-wise", "hukm"],
    translations: {
      hindi: ["अलहाकिम", "हुक्मत वाला", "बुद्धिमान"],
      urdu: ["الحکیم", "حکمت والا", "عقلمند"],
      bengali: ["আল হাকিম", "প্রজ্ঞ"],
      roman_urdu: ["alhakim", "hakeem", "aqalmand"],
      arabic: ["الْحَكِيم", "ذو الْحِكْمَة"]
    },
    relatedTopics: ["alaleem", "hikma", "qiyas"]
  },

  alaleem_knower: {
    topic: "the_allknowing",
    synonyms: ["alaleem", "the knower", "all-knowing", "aleem"],
    translations: {
      hindi: ["अलआलीम", "सर्वज्ञ", "ज्ञानी"],
      urdu: ["العالم", "جاننے والا", "علم والا"],
      bengali: ["আল আলীম", "সর্বজ্ঞ"],
      roman_urdu: ["alaleem", "har cheez janne wala"],
      arabic: ["الْعَلِيم", "ذو الْعِلْم"]
    },
    relatedTopics: ["alhakim", "ilm", "maarif"]
  },

  // ==================== ISLAMIC SCIENCES ====================
  tafsir_quran: {
    topic: "quran_interpretation",
    synonyms: ["tafsir", "quran interpretation", "commentary", "explanation"],
    translations: {
      hindi: ["तफ़सीर", "क़ुरान व्याख्या", "शबानी"],
      urdu: ["تفسیر", "قرآن کی تشریح"],
      bengali: ["তাফসীর", "কুরআন ব্যাখ্যা"],
      roman_urdu: ["tafsir", "quran ki sharah"],
      arabic: ["تَفْسِير", "بَيَان"]
    },
    relatedTopics: ["quran", "hukm", "fiqh", "maqasid"]
  },

  hadith_sciences: {
    topic: "hadith_studies",
    synonyms: ["hadith sciences", "uloom hadith", "hadith methodology", "riwaya"],
    translations: {
      hindi: ["हदीस विज्ञान", "हदीस शास्त्र"],
      urdu: ["علوم حدیث", "حدیث کی تعلیم"],
      bengali: ["হাদিস বিজ্ঞান", "হাদিস অধ্যয়ন"],
      roman_urdu: ["uloom hadith", "hadith ki shariah"],
      arabic: ["عُلُوم الْحَدِيث", "رِوَايَة"]
    },
    relatedTopics: ["quran", "sunnah", "sahabi", "imam"]
  },

  fiqh_islamic_law: {
    topic: "islamic_jurisprudence",
    synonyms: ["fiqh", "islamic law", "jurisprudence", "shariah law"],
    translations: {
      hindi: ["फ़िक़ह", "इस्लामी क़ानून", "शरई कानून"],
      urdu: ["فقہ", "شرعی احکام"],
      bengali: ["ফিকহ", "ইসলামী আইন"],
      roman_urdu: ["fiqh", "sharai hukm"],
      arabic: ["فِقْه", "شَرِيعَة"]
    },
    relatedTopics: ["shariah", "hukm", "sunnah", "qiyas"]
  },

  usul_fiqh: {
    topic: "principles_of_islamic_jurisprudence",
    synonyms: ["usul fiqh", "principles of jurisprudence", "legal theory"],
    translations: {
      hindi: ["उसूल फ़िक़ह", "फ़िक़ह के सिद्धांत"],
      urdu: ["اصول فقہ", "فقہ کے بنیادی اصول"],
      bengali: ["উসুল ফিকহ", "ফিকহের মূলনীতি"],
      roman_urdu: ["usul fiqh", "fiqh ke asasiyat"],
      arabic: ["أُصُول الْفِقْه", "قَوَاعِد"]
    },
    relatedTopics: ["fiqh", "qiyas", "ijma", "dalil"]
  },

  sirah_prophet_life: {
    topic: "prophet_biography",
    synonyms: ["sirah", "prophet biography", "life of muhammad", "seerah"],
    translations: {
      hindi: ["सीरत", "पैगंबर की जीवनी", "सीरत नबी"],
      urdu: ["سیرت", "نبی کریم کی زندگی"],
      bengali: ["সিরাত", "নবীর জীবনী"],
      roman_urdu: ["sirat", "nabi ki zindagi"],
      arabic: ["سِيرَة", "سِيَر"]
    },
    relatedTopics: ["muhammad", "hijra", "makkah", "madinah"]
  },

  aqeedah_beliefs: {
    topic: "Islamic_beliefs",
    synonyms: ["aqeedah", "beliefs", "doctrine", "creed", "imaan"],
    translations: {
      hindi: ["अक़ीदा", "विश्वास", "ईमान"],
      urdu: ["عقیدہ", "ایمان", "کudd"],
      bengali: ["আকিদা", "বিশ্বাস"],
      roman_urdu: ["aqeedah", "imaan", "yaqeen"],
      arabic: ["عَقِيدَة", "إِيمَان"]
    },
    relatedTopics: ["iman", "tawheed", "shirk", "kufr"]
  },

  kalam_theology: {
    topic: "islamic_theology",
    synonyms: ["kalam", "theology", "islamic theology", "aqaid"],
    translations: {
      hindi: ["कलाम", "इस्लामी दर्शन", "धर्मशास्त्र"],
      urdu: ["کلام", "اسلامی علم"],
      bengali: ["কালাম", "ইসলামী দর্শন"],
      roman_urdu: ["kalam", "deeni ilm"],
      arabic: ["كَلَام", "عِلْم الْأَدِيَان"]
    },
    relatedTopics: ["aqeedah", "fiqh", "hikma"]
  },

  tasawwuf_sufism: {
    topic: "sufism",
    synonyms: ["tasawwuf", "sufism", "spiritualism", "tasawuf"],
    translations: {
      hindi: ["तसव्वुफ़", "सूफ़ीवाद", "आध्यात्मिकता"],
      urdu: ["تصوف", "روحانیت"],
      bengali: ["তাসাউফ", "সূফিবাদ"],
      roman_urdu: ["tasawwuf", "ruhaniyat"],
      arabic: ["تَصَوُّف", "سُلُوك"]
    },
    relatedTopics: ["dhikr", "muraqaba", "tariqah", "sufi"]
  },

  // ==================== COMPANIONS & SCHOLARS ====================
  sahabi_companions: {
    topic: "prophet_companions",
    synonyms: ["sahabi", "companions", "sahabah", "people of the room"],
    translations: {
      hindi: ["सहाबी", "रशीदुन", "पैगंबर के साथी"],
      urdu: ["صحابہ", "رفقاء"],
      bengali: ["সাহাবি", "প্রিয়বন্ধু"],
      roman_urdu: ["sahabi", "rafiq"],
      arabic: ["صَحَابَة", "رُفَقَاء"]
    },
    relatedTopics: ["muhammad", "sirat", "tabiin", "ulema"]
  },

  tabiin_followers: {
    topic: "successor_generation",
    synonyms: ["tabiin", "successors", "followers of companions"],
    translations: {
      hindi: ["ताबेईन", "अगली पीढ़ी", "उत्तराधिकारी"],
      urdu: ["تابعین", "بعد کے لوگ"],
      bengali: ["তাবিঈন", "উত্তরাধিকারী"],
      roman_urdu: ["tabiin", "baad wale"],
      arabic: ["تَابِعُون", "أَتْبَاع"]
    },
    relatedTopics: ["sahabi", "ulema", "fuqaha"]
  },

  abu_bakr_siddiq: {
    topic: "first_caliph",
    synonyms: ["abu bakr", "siddiq", "first caliph", "abubakr"],
    translations: {
      hindi: ["अबू बकर", "सिद्दीक", "पहले खलीफ़ा"],
      urdu: ["ابوبکر", "صدیق"],
      bengali: ["আবু বকর", "সিদ্দিক"],
      roman_urdu: ["abu bakr", "siddiq"],
      arabic: ["أَبُو بَكْر", "الصِّدِّيق"]
    },
    relatedTopics: ["umar", "uthman", "ali", "khilafat"]
  },

  umar_ibn_khattab: {
    topic: "second_caliph",
    synonyms: ["umar", "ibn khattab", "second caliph", "farooq"],
    translations: {
      hindi: ["उमर इब्न खत्ताब", "फ़ारूक़"],
      urdu: ["عمر بن خطاب", "فاروق"],
      bengali: ["উমর ইবন খাত্তাব"],
      roman_urdu: ["umar", "farooq"],
      arabic: ["عُمَر بْن الْخَطَّاب", "الْفَارُوق"]
    },
    relatedTopics: ["abu_bakr", "uthman", "ali", "khilafat"]
  },

  uthman_dhun_nurayn: {
    topic: "third_caliph",
    synonyms: ["uthman", "dhun nurayn", "third caliph", "uzman"],
    translations: {
      hindi: ["उसमान", "ज़ुन नूरैन"],
      urdu: ["عثمان", "ذوالنورین"],
      bengali: ["উসমান", "যুল নুরাইন"],
      roman_urdu: ["uthman", "zun noorein"],
      arabic: ["عُثْمَان بْن عَفَّان", "ذُو النُّورَيْن"]
    },
    relatedTopics: ["abu_bakr", "umar", "ali", "quran"]
  },

  ali_ibn_abi_talib: {
    topic: "fourth_caliph",
    synonyms: ["ali", "ibn abi talib", "fourth caliph", "murtaza"],
    translations: {
      hindi: ["अली", "इब्न अबी तालिब", "चौथे खलीफ़ा"],
      urdu: ["علی", "ابی طالب کے بیٹے"],
      bengali: ["আলি", "ইবনে আবি তালিব"],
      roman_urdu: ["ali", "hazrat ali"],
      arabic: ["عَلِيّ بْن أَبِي طَالِب", "أَمِير الْمُؤْمِنِين"]
    },
    relatedTopics: ["muhammad", "quran", "fadak", "khilafat"]
  },

  // ==================== SPIRITUAL STATES & STATIONS ====================
  khawf_fear: {
    topic: "fear_of_allah",
    synonyms: ["khawf", "fear allah", "reverence", "terror", "fright"],
    translations: {
      hindi: ["ख़ौफ़", "डर", "भय"],
      urdu: ["خوف", "ڈر"],
      bengali: ["খওফ", "ভয়"],
      roman_urdu: ["khawf", "dar", "bhay"],
      arabic: ["خَوْف", "رَهْبَة"]
    },
    relatedTopics: ["taqwa", "khushu", "rahba"]
  },

  raja_hope: {
    topic: "hope_in_allah",
    synonyms: ["raja", "hope", "optimism", "trust", "birodh"],
    translations: {
      hindi: ["राजा", "आशा", "उम्मीद"],
      urdu: ["رجاء", "امید"],
      bengali: ["রাজা", "আশা"],
      roman_urdu: ["raja", "umeed", "asha"],
      arabic: ["رَجَاء", "أَمَل"]
    },
    relatedTopics: ["tawakkul", "yaqeen", "umid"]
  },

  mahabbah_love: {
    topic: "divine_love",
    synonyms: ["mahabbah", "love allah", "divine love", "ishq"],
    translations: {
      hindi: ["महब्बत", "प्यार", "प्रेम"],
      urdu: ["محبت", "پیار"],
      bengali: ["মহব্বত", "ভালোবাসা"],
      roman_urdu: ["mahabbah", "pyar", "muhabbat"],
      arabic: ["مَحَبَّة", "عِشْق"]
    },
    relatedTopics: ["walah", "qurb", "uns"]
  },

  yaqeen_certainty: {
    topic: "certainty_of_faith",
    synonyms: ["yaqeen", "certainty", "conviction", "firm belief"],
    translations: {
      hindi: ["यक़ीन", "निश्चय", "दृढ़ता"],
      urdu: ["یقین", "نشاط"],
      bengali: ["ইয়াকীন", "নিশ্চয়তা"],
      roman_urdu: ["yaqeen", "tasleem"],
      arabic: ["يَقِين", "بَصِيرَة"]
    },
    relatedTopics: ["iman", "sabr", "tawakkul"]
  },

  tawadhu_humility: {
    topic: "humility",
    synonyms: ["tawadhu", "humility", "humbleness", "tawazoo"],
    translations: {
      hindi: ["तवद्हु", "विनम्रता", "नम्रता"],
      urdu: ["تواضع", "عاجزی"],
      bengali: ["তাওয়াজ্জুহ", "বিনয়"],
      roman_urdu: ["tawadhu", "ajizi"],
      arabic: ["تَوَاضُع", "إِخْلَاص"]
    },
    relatedTopics: ["khushu", "adab", "sajdah"]
  },

  qurb_proximity: {
    topic: "proximity_to_allah",
    synonyms: ["qurb", "nearness", "closeness to allah", "qurb"],
    translations: {
      hindi: ["क़ुरब", "नज़दीकी", "पास"],
      urdu: ["قرب", "قریبی"],
      bengali: ["কুরব", "নিকটতা"],
      roman_urdu: ["qurb", "nazaki"],
      arabic: ["قُرْب", "نُزْدَة"]
    },
    relatedTopics: ["mahabbah", "walah", "dhikr"]
  },

  // ==================== WORSHIP PRACTICES ====================
  fardObligatory: {
    topic: "obligatory_acts",
    synonyms: ["fard", "obligatory", "wajib", "compulsory"],
    translations: {
      hindi: ["फ़र्ज़", "अनिवार्य", "واجب"],
      urdu: ["فرض", "واجب"],
      bengali: ["ফরজ", "কর্তব্য"],
      roman_urdu: ["fard", "anivaarya"],
      arabic: ["فَرْض", "وَاجِب"]
    },
    relatedTopics: ["sunnah", "nafl", "haram"]
  },

  sunnah_mustahab: {
    topic: "recommended_acts",
    synonyms: ["sunnah", "mustahab", "recommended", "nafil"],
    translations: {
      hindi: ["सुन्नत", "मुस्तहब", "इख्तियारी"],
      urdu: ["سنت", "مستحب"],
      bengali: ["সুন্নত", "মুस्तাহাব"],
      roman_urdu: ["sunnah", "mustahab"],
      arabic: ["سُنَّة", "مُسْتَحَبّ"]
    },
    relatedTopics: ["fard", "nafl", "makruh"]
  },

  nafl_voluntary: {
    topic: "voluntary_acts",
    synonyms: ["nafl", "voluntary", "optional worship", "tatawwu"],
    translations: {
      hindi: ["नफ़्ल", "ऐच्छिक", "स्वैच्छिक"],
      urdu: ["نفل", " voluntary"],
      bengali: ["নফল", "স্বেচ্ছাকৃত"],
      roman_urdu: ["nafl", "ichchha se"],
      arabic: ["نَفْل", "تَطَوُّع"]
    },
    relatedTopics: ["fard", "sunnah", "qurbani"]
  },

  qurbani_sacrifice: {
    topic: "sacrifice",
    synonyms: ["qurbani", "udhiyah", "sacrifice", "qurban"],
    translations: {
      hindi: ["क़ुर्बानी", "बलिदान", "कुरबान"],
      urdu: ["قربانی", "ذبح"],
      bengali: ["কুরবানি", "কোরবানি"],
      roman_urdu: ["qurbani", "balidaan"],
      arabic: ["قُرْبَان", "ذَبِيحَة"]
    },
    relatedTopics: ["eid_ul_adha", "ibrahim", "hady"]
  },

  umrah_minor_pilgrimage: {
    topic: "minor_pilgrimage",
    synonyms: ["umrah", "lesser pilgrimage", "visit to mecca"],
    translations: {
      hindi: ["उमरा", "छोटी हज़"],
      urdu: ["عمرہ", "چھوٹا حج"],
      bengali: ["উমরাহ", "ছোট হজ্জ"],
      roman_urdu: ["umrah", "chhota hajj"],
      arabic: ["عُمْرَة", "زِيَارَة"]
    },
    relatedTopics: ["hajj", "kaaba", "makkah"]
  },

  itikaf_seclusion: {
    topic: "spiritual_retreat",
    synonyms: ["itikaf", "seclusion", "spiritual retreat", "khalwa"],
    translations: {
      hindi: ["इतिक़ाफ़", "एकांत", "आत्मदर्शन"],
      urdu: ["اعتکاف", "تنہائی"],
      bengali: ["ইতিকাফ", "একাকীতা"],
      roman_urdu: ["itikaf", "akela"],
      arabic: ["اعْتِكَاف", "خَلْوَة"]
    },
    relatedTopics: ["ramadan", "salah", "dhikr"]
  },

  // ==================== ISLAMIC ETIQUETTE ====================
  adab_manners: {
    topic: "Islamic_manners",
    synonyms: ["adab", "manners", "etiquette", "polite behavior"],
    translations: {
      hindi: ["अदब", "शिष्टाचार", "आदत"],
      urdu: ["ادب", "سلامتی"],
      bengali: ["আদব", "শিষ্টাচার"],
      roman_urdu: ["adab", "shishtachaar"],
      arabic: ["أَدَب", "آدَاب"]
    },
    relatedTopics: ["akhlaq", "haya", "tawadhu"]
  },

  silat_rahim: {
    topic: "maintaining_family_ties",
    synonyms: ["silat rahim", "family ties", "kindness to relatives"],
    translations: {
      hindi: ["सिलात रहीम", "रिश्तेदारी", "कुटुम्ब"],
      urdu: ["صلۃ رحم", "تعلقات"],
      bengali: ["সিলাত রহিম", "আত্মীয়তা"],
      roman_urdu: ["silat rahim", "rishtedaari"],
      arabic: ["صِلَة الرَّحِم", "قَرَابَة"]
    },
    relatedTopics: ["birr", "family", "qurb"]
  },

  birr_waladain: {
    topic: "kindness_to_parents",
    synonyms: ["birr waladain", "honoring parents", "filial piety"],
    translations: {
      hindi: ["बिर्र वालिदैन", "माता-पिता की सेवा"],
      urdu: ["بر والدین", "ماں باپ کی خدمت"],
      bengali: ["বির পিতা", "মাতা-পিতার সেবা"],
      roman_urdu: ["birr waladain", "maa baap ki khidmat"],
      arabic: ["بِرّ الْوَالِدَيْن", "وَالِدَيْن"]
    },
    relatedTopics: ["silat", "family", "rahmah"]
  },

  taawoon_mutual_cooperation: {
    topic: "mutual_cooperation",
    synonyms: ["taawoon", "cooperation", "help", "assistance"],
    translations: {
      hindi: ["तावुन", "सहयोग", "मदद"],
      urdu: ["تعاون", "مدد"],
      bengali: ["তাওয়ান", "সহযোগিতা"],
      roman_urdu: ["taawoon", "madad"],
      arabic: ["تَعَاوُن", "مُسَاعَدَة"]
    },
    relatedTopics: ["ukhuwah", "ummah", "adl"]
  },

  // ==================== NEGATIVE TRAITS ====================
  kibr_pride: {
    topic: "arrogance",
    synonyms: ["kibr", "pride", "arrogance", "hubris", "takabbur"],
    translations: {
      hindi: ["क़ब्र", "अहंकार", "गर्व"],
      urdu: ["کبر", "غرور"],
      bengali: ["কিবর", "অহংকার"],
      roman_urdu: ["kibr", "garv"],
      arabic: ["كِبْر", "تَكَبُّر"]
    },
    relatedTopics: ["tawadhu", "riya", "nafs"]
  },

  hasad_envy: {
    topic: "envy",
    synonyms: ["hasad", "envy", "jealousy", "resentment"],
    translations: {
      hindi: ["हसद", "ईर्ष्या", "जलन"],
      urdu: ["حَسَد", "رشک"],
      bengali: ["হাসাদ", "ঈর্ষ্যা"],
      roman_urdu: ["hasad", "jaln"],
      arabic: ["حَسَد", "غِلّ"]
    },
    relatedTopics: ["riya", "nafs", "shukr"]
  },

  ghibah_backbiting: {
    topic: "backbiting",
    synonyms: ["ghibah", "backbiting", "slander", "tale-bearing"],
    translations: {
      hindi: ["ग़ीबत", "चुगला", "पीठ पीठ"],
      urdu: ["غیبت", "چغلی"],
      bengali: ["গিবাহ", "পাঁচকানি"],
      roman_urdu: ["ghibat", "chughli"],
      arabic: ["غِيبَة", "نَمِيمَة"]
    },
    relatedTopics: ["buhtan", "namimah", "adab"]
  },

  buhtan_false_accusation: {
    topic: "false_accusation",
    synonyms: ["buhtan", "defamation", "false accusation", "slander"],
    translations: {
      hindi: ["बुहतान", "मिथ्या आरोप"],
      urdu: ["بهتان", "جھوٹا الزام"],
      bengali: ["বুহতান", "মিথ্যা অভিযোগ"],
      roman_urdu: ["buhtan", "jhootha ilzam"],
      arabic: ["بُهْتَان", "تَهْمَة"]
    },
    relatedTopics: ["ghibah", "adl", "sidq"]
  },

  naamimah_tale_bearing: {
    topic: "tale_bearing",
    synonyms: ["naamimah", "tale-bearing", "reporting secrets"],
    translations: {
      hindi: ["नामीमा", "चुगली"],
      urdu: ["نمیمہ", "چغلی"],
      bengali: ["নামিমাহ", "গুপ্তচার"],
      roman_urdu: ["naamimah", "chughli"],
      arabic: ["نَمِيمَة", "غِيبَة"]
    },
    relatedTopics: ["ghibah", "buhtan", "sin"]
  },

  // ==================== ISLAMIC CALENDAR & EVENTS ====================
  hijri_calendar: {
    topic: "Islamic_calendar",
    synonyms: ["hijri", "islamic calendar", "lunar calendar", " hijra calendar"],
    translations: {
      hindi: ["हिजरी", "इस्लामी कैलेंडर"],
      urdu: ["ہجری", "اسلامی کیلنڈر"],
      bengali: ["হিজরি", "ইসলামি ক্যালেন্ডার"],
      roman_urdu: ["hijri", "islami calendar"],
      arabic: ["هِجْرِيّ", "تَقْوِيم"]
    },
    relatedTopics: ["ramadan", "hajj", "eid"]
  },

  eid_ul_fitr: {
    topic: "festival_of_breakfast",
    synonyms: ["eid ul fitr", "eid fitri", "festival of breaking fast"],
    translations: {
      hindi: ["ईद उल फितर", "ईद", "खुशी"],
      urdu: ["عیدالفطر", "خوشی"],
      bengali: ["ঈদুল ফিতর", "ঈদ"],
      roman_urdu: ["eid ul fitr", "khushi"],
      arabic: ["عِيد الْفِطْر", "عِيد"]
    },
    relatedTopics: ["ramadan", "sawm", "sadaqah"]
  },

  eid_ul_adha: {
    topic: "festival_of_sacrifice",
    synonyms: ["eid ul adha", "eid qurban", "festival of sacrifice"],
    translations: {
      hindi: ["ईद उल अज़हा", "बड़ी ईद"],
      urdu: ["عیدالاضحیٰ", "قربانی کی عید"],
      bengali: ["ঈদুল আজহা", "কোরবানির ঈদ"],
      roman_urdu: ["eid ul adha", "bari eid"],
      arabic: ["عِيد الْأَضْحَى", "يَوْم النَّحْر"]
    },
    relatedTopics: ["qurbani", "hajj", "makkah"]
  },

  ashura_fasting: {
    topic: "day_of_ashura",
    synonyms: ["ashura", "tenth of muharram", "day of mourning"],
    translations: {
      hindi: ["आशूरा", "मुहर्रम"],
      urdu: ["عاشورا", "دسویں محرم"],
      bengali: ["আশুরা", "মুহররম"],
      roman_urdu: ["ashura", "Muharram"],
      arabic: ["عَاشُورَاء", "يَوْم عَاشُورَاء"]
    },
    relatedTopics: ["muharram", "husain", "fasting"]
  },

  laylatul_qadr_night: {
    topic: "night_of_power",
    synonyms: ["laylatul qadr", "night of destiny", "shab-e-qadr"],
    translations: {
      hindi: ["लैलतुल क़द्र", "शबे क़द्र"],
      urdu: ["لیلتہ القدر", "شب قدر"],
      bengali: ["লাইলাতুল কদর", "শবে কদর"],
      roman_urdu: ["laylatul qadr", "shab-e-qadr"],
      arabic: ["لَيْلَة الْقَدْر", "شَرْف لَيْلَة"]
    },
    relatedTopics: ["ramadan", "quran", "wahi"]
  },

  // ==================== ISLAMIC GEOGRAPHY ====================
  makkah_mecca: {
    topic: "city_of_mecca",
    synonyms: ["makkah", "mecca", "bakka", "umm al-qura"],
    translations: {
      hindi: ["मक्का", "मक्काह"],
      urdu: ["مکہ", "بکہ"],
      bengali: ["মক্কা", "মক্কাহ"],
      roman_urdu: ["makkah", "bakkah"],
      arabic: ["مَكَّة", "بَكَّة", "أُم الْقُرَى"]
    },
    relatedTopics: ["kaaba", "haram", "hajj"]
  },

  madinah_medina: {
    topic: "city_of_medina",
    synonyms: ["madinah", "medina", "yatrib", "madina munawwarah"],
    translations: {
      hindi: ["मदीना", "मदीनाह"],
      urdu: ["مدینہ", "طیبہ"],
      bengali: ["মদিনা", "মদিনাহ"],
      roman_urdu: ["madinah", "madina"],
      arabic: ["الْمَدِينَة", "طَيْبَة"]
    },
    relatedTopics: ["masjid_an nabawi", "quran", "sunnah"]
  },

  masjidal_haram: {
    topic: "sacred_mosque",
    synonyms: ["masjid al-haram", "great mosque", "forbidden mosque"],
    translations: {
      hindi: ["मस्जिद अल हराम", "बड़ी मस्जिद"],
      urdu: ["مسجد الحرام", "بڑی مسجد"],
      bengali: ["মাসজিদ আল হারাম", "বড় মসজিদ"],
      roman_urdu: ["masjid al-haram", "bari masjed"],
      arabic: ["مَسْجِد الْحَرَام", "الْحَرَم"]
    },
    relatedTopics: ["makkah", "kaaba", "tawaf"]
  },

  masjidal_nabawi: {
    topic: "prophet_mosque",
    synonyms: ["masjid an-nabawi", "prophet mosque", "medina mosque"],
    translations: {
      hindi: ["मस्जिद नबवी", "पैगंबर की मस्जिद"],
      urdu: ["مسجدالنبی", "رسول کی مسجد"],
      bengali: ["মাসজিদ আন নববী", "নবীর মসজিদ"],
      roman_urdu: ["masjid an-nabawi", "rasool ki masjed"],
      arabic: ["مَسْجِد النَّبِي", "مَسْجِد الرَّسُول"]
    },
    relatedTopics: ["madinah", "rawda", "salah"]
  },

  arafat_pilgrimage: {
    topic: "plain_of_arafat",
    synonyms: ["arafat", "mount of mercy", "standing place"],
    translations: {
      hindi: ["अराफ़ात", "अराफा"],
      urdu: ["عرفات", "جبل الرحمۃ"],
      bengali: ["আরাফাত", "দয়ার পর্বত"],
      roman_urdu: ["arafat", "jabal-e-rahma"],
      arabic: ["عَرَفَات", "جَبَل الرَّحْمَة"]
    },
    relatedTopics: ["hajj", "wuqoof", "muzdalifah"]
  },

  // ==================== ISLAMIC DRESS & APPEARANCE ====================
  purdah_covering: {
    topic: "covering",
    synonyms: ["purdah", "covering", "seclusion", "hijab"],
    translations: {
      hindi: ["पर्दा", "आवरण"],
      urdu: ["پردہ", "چھپائی"],
      bengali: ["পর্দা", "আচ্ছাদন"],
      roman_urdu: ["purdah", "chhupai"],
      arabic: ["پَرْدَة", "حِجَاب"]
    },
    relatedTopics: ["hijab", "satr", "haya"]
  },

  satr_intimate_parts: {
    topic: "private_parts",
    synonyms: ["satr", "awrah", "private parts", "modesty"],
    translations: {
      hindi: ["सात्र", "गुप्त अंग"],
      urdu: ["سَatr", "عورت کے کپڑے"],
      bengali: ["সাত্র", "গোপন অঙ্গ"],
      roman_urdu: ["satr", "chhupana"],
      arabic: ["سَاتِر", "عَوْرَة"]
    },
    relatedTopics: ["hijab", "purdah", "adab"]
  },

  ihram_pilgrim_dress: {
    topic: "pilgrim_clothing",
    synonyms: ["ihram", "pilgrim dress", "sacred garments"],
    translations: {
      hindi: ["इहराम", "हज़ की कपड़े"],
      urdu: ["احرام", "حج کے کپڑے"],
      bengali: ["ইহরাম", "হজ্জের কাপড়"],
      roman_urdu: ["ihram", "hajj ke kapre"],
      arabic: ["إِحْرَام", "حُلَّة"]
    },
    relatedTopics: ["hajj", "makkah", "tawaf"]
  },

  taqiyah_cap: {
    topic: " Islamic_cap",
    synonyms: ["taqiyah", "kufi", "prayer cap", "topi"],
    translations: {
      hindi: ["तक़ीया", "टोपी"],
      urdu: ["ٹوپی", "کلاہ"],
      bengali: ["তাকিয়াহ", "টুপি"],
      roman_urdu: ["taqiyah", "topi"],
      arabic: ["قَلَنْسُوَة", "عِمَامَة"]
    },
    relatedTopics: ["salah", "hijab", "adab"]
  },

  // ==================== FOOD & DRINK ====================
  halaal_food: {
    topic: "permissible_food",
    synonyms: ["halaal food", "lawful food", "permissible meat"],
    translations: {
      hindi: ["हलाल भोजन", "वैध भोजन"],
      urdu: ["حلال کھانا", "جائز کھانے"],
      bengali: ["হালাল খাবার", "বৈধ খাদ্য"],
      roman_urdu: ["halaal khana", "jaiz khana"],
      arabic: ["حَلَال", "طَعَام"]
    },
    relatedTopics: ["haram", "dhabiha", "bismillah"]
  },

  haraam_food: {
    topic: "forbidden_food",
    synonyms: ["haraam food", "unlawful food", "prohibited"],
    translations: {
      hindi: ["हराम भोजन", "निषिद्ध भोजन"],
      urdu: ["حرام کھانا", "ممنوع کھانے"],
      bengali: ["হারাম খাবার", "নিষিদ্ধ খাদ্য"],
      roman_urdu: ["haraam khana", "mamnoo khana"],
      arabic: ["حَرَام", "مَمْنُوع"]
    },
    relatedTopics: ["halaal", "khamr", "carrion"]
  },

  khamr_intoxicants: {
    topic: "intoxicants",
    synonyms: ["khamr", "alcohol", "wine", "intoxicants"],
    translations: {
      hindi: ["ख़मर", "शराब", "मद्य"],
      urdu: ["خمر", "شراب"],
      bengali: ["খামর", "মদ্য"],
      roman_urdu: ["khamr", "sharaab"],
      arabic: ["خَمْر", "سُكْر"]
    },
    relatedTopics: ["haram", "najas", "tahara"]
  },

  dhabiha_slaughter: {
    topic: "Islamic_slaughter",
    synonyms: ["dhabiha", "halal slaughter", "Islamic way of slaughtering"],
    translations: {
      hindi: ["ज़बीहा", "हलाल कटाई"],
      urdu: ["ذبح", "حلال کاٹنا"],
      bengali: ["জাবিহা", "হালাল জবাই"],
      roman_urdu: ["dhabiha", "halaal kaatna"],
      arabic: ["ذَبِيحَة", "عِيد"]
    },
    relatedTopics: ["halaal", "bismillah", "tasmiya"]
  },

  najas_impurity: {
    topic: "impurity",
    synonyms: ["najas", "impurity", "unclean", "najasa"],
    translations: {
      hindi: ["नज़ासा", "अशुद्धि", "प्रदूषण"],
      urdu: ["نجاست", "گندگی"],
      bengali: ["নজাস", "অশুদ্ধি"],
      roman_urdu: ["najas", "gandagi"],
      arabic: ["نَجَاسَة", "نَجِر"]
    },
    relatedTopics: ["tahara", "wudu", "ghusl"]
  },

  tahara_purification: {
    topic: "purification",
    synonyms: ["tahara", "purification", "cleanliness", "taharat"],
    translations: {
      hindi: ["तहारा", "शुद्धि", "साफ़"],
      urdu: ["طہارت", "پاکیزگی"],
      bengali: ["তাহারাহ", "শুদ্ধি"],
      roman_urdu: ["tahara", "saaf"],
      arabic: ["طَهَارَة", "نَظَافَة"]
    },
    relatedTopics: ["wudu", "ghusl", "najas"]
  },

  ghusl_bath: {
    topic: "full_bath",
    synonyms: ["ghusl", "full bath", "ritual bathing", "janabah"],
    translations: {
      hindi: ["घुस्ल", "पूर्ण स्नान"],
      urdu: ["غسل", "بڑا نہانا"],
      bengali: ["গুসল", "সম্পূর্ণ স্নান"],
      roman_urdu: ["ghusl", "bada nahaana"],
      arabic: ["غُسْل", "تَطَهُّر"]
    },
    relatedTopics: ["wudu", "tahara", "hadath"]
  },

  // ==================== ISLAMIC BUSINESS & FINANCE ====================
  riba_usury: {
    topic: "usury",
    synonyms: ["riba", "usury", "interest", "usurious"],
    translations: {
      hindi: ["रिबा", "सूद", "ब्याज"],
      urdu: ["ربا", "سود"],
      bengali: ["রিবা", "সুদ"],
      roman_urdu: ["riba", "sood"],
      arabic: ["رِبَا", "فَرْض"]
    },
    relatedTopics: ["haram", "halal", "trade"]
  },

  gharar_uncertainty: {
    topic: "uncertainty",
    synonyms: ["gharar", "uncertainty", "risk", "gambling"],
    translations: {
      hindi: ["घरार", "अनिश्चितता"],
      urdu: ["غرر", "غیر یقینی"],
      bengali: ["ঘারার", "অনিশ্চয়তা"],
      roman_urdu: ["gharar", "iska"],
      arabic: ["غَرَر", "خَطَر"]
    },
    relatedTopics: ["haram", "trade", "jualah"]
  },

  sadaqah_charity: {
    topic: "charity",
    synonyms: ["sadaqah", "charity", "voluntary charity", "sadqa"],
    translations: {
      hindi: ["सदका", "दान", "चैरिटी"],
      urdu: ["صدقہ", "خیرات"],
      bengali: ["সাদাকাহ", "দান"],
      roman_urdu: ["sadaqah", "khairat"],
      arabic: ["صَدَقَة", "عَطِيَّة"]
    },
    relatedTopics: ["zakat", "infaq", "sawab"]
  },

  infaq_spending: {
    topic: "spending_in_allah_way",
    synonyms: ["infaq", "spending", "expenditure", "charity"],
    translations: {
      hindi: ["इनफ़ाक़", "ख़र्च", "व्यय"],
      urdu: ["انفاق", "خرچ"],
      bengali: ["ইনফাক", "ব্যয়"],
      roman_urdu: ["infaq", "kharcha"],
      arabic: ["إِنْفَاق", "صَرْف"]
    },
    relatedTopics: ["sadaqah", "zakat", "shukr"]
  },

  qard_hasana: {
    topic: "beautiful_loan",
    synonyms: ["qard hasana", "beautiful loan", "interest-free loan"],
    translations: {
      hindi: ["क़र्दे हसना", "ब्याज मुक्त कर्जा"],
      urdu: ["قرض حسنہ", "اچھا قرض"],
      bengali: ["কারদে হাসনা", "সুদমুক্ত ঋণ"],
      roman_urdu: ["qard hasana", "acha qarz"],
      arabic: ["قَرْض حَسَن", "إِحْسَان"]
    },
    relatedTopics: ["sadaqah", "taawoon", "amanah"]
  },

  // ==================== ISLAMIC EDUCATION ====================
  madrasa_islamic_school: {
    topic: "Islamic_school",
    synonyms: ["madrasa", "islamic school", "religious school"],
    translations: {
      hindi: ["मदरसा", "इस्लामी विद्यालय"],
      urdu: ["مدرسہ", "دینی مدرسہ"],
      bengali: ["মাদ্রাসা", "ইসলামী বিদ্যালয়"],
      roman_urdu: ["madrasa", "deeni school"],
      arabic: ["مَدْرَسَة", "مُعْهَد"]
    },
    relatedTopics: ["maktab", "ulema", "tafajjul"]
  },

  maktab_elementary: {
    topic: "elementary_school",
    synonyms: ["maktab", "elementary school", "primary school"],
    translations: {
      hindi: ["मक़तब", "प्राथमिक विद्यालय"],
      urdu: ["مکتب", "ابتدائی اسکول"],
      bengali: ["মাকতাব", "প্রাথমিক বিদ্যালয়"],
      roman_urdu: ["maktab", "pehla school"],
      arabic: ["مَكْتَب", "مَدْرَسَة"]
    },
    relatedTopics: ["madrasa", "quran", "hifz"]
  },

  hifz_quran_memorization: {
    topic: "quran_memorization",
    synonyms: ["hifz", "quran memorization", "memorizing quran"],
    translations: {
      hindi: ["हिफ़ज़", "क़ुरान कंठस्थ"],
      urdu: ["حفظ", "قرآن حفظ"],
      bengali: ["হিফজ", "কুরআন মুখস্থ"],
      roman_urdu: ["hifz", "quran khooh"],
      arabic: ["حِفْظ", "تَحْفِظ"]
    },
    relatedTopics: ["quran", "hafiz", "tilawa"]
  },

  hafiz_quran_memorizer: {
    topic: "quran_memorizer",
    synonyms: ["hafiz", "quran memorizer", "guardian of quran"],
    translations: {
      hindi: ["हाफ़िज़", "क़ुरान का कंठस्थ"],
      urdu: ["حافظ", "قرآن کا حافظ"],
      bengali: ["হাফিজ", "কুরআন হেফজ"],
      roman_urdu: ["hafiz", "quran chor"],
      arabic: ["حَافِظ", "حَافِظ الْقُرْآن"]
    },
    relatedTopics: ["hifz", "quran", "ulema"]
  },

  // ==================== ISLAMIC HEALTH & HEALING ====================
  ruqya_spiritual_healing: {
    topic: "spiritual_healing",
    synonyms: ["ruqya", "spiritual healing", "exorcism", "tawiz"],
    translations: {
      hindi: ["रुक़या", "आध्यात्मिक उपचार"],
      urdu: ["رقیہ", "روحانی علاج"],
      bengali: ["রুকইয়াহ", "আধ্যাত্মিক নিরাময়"],
      roman_urdu: ["ruqya", "rohani ilaj"],
      arabic: ["رُقْيَة", "عِزَاء"]
    },
    relatedTopics: ["shirk", "duas", "quran"]
  },

  tawiz_amulet: {
    topic: "amulet",
    synonyms: ["tawiz", "amulet", "talisman", "protective charm"],
    translations: {
      hindi: ["ताबीज़", "यंत्र", "काफ़"],
      urdu: ["تعویذ", "ٹونے"],
      bengali: ["তাওইজ", "মোহর"],
      roman_urdu: ["tawiz", "taweez"],
      arabic: ["تَعْوِيذ", "رُقْيَة"]
    },
    relatedTopics: ["ruqya", "shirk", "taqwa"]
  },

  shifa_healing: {
    topic: "healing",
    synonyms: ["shifa", "healing", "cure", "treatment"],
    translations: {
      hindi: ["शिफ़ा", "इलाज", "उपचार"],
      urdu: ["شفاء", "علاج"],
      bengali: ["শিফা", "আরোগ্য"],
      roman_urdu: ["shifa", "ilaaj"],
      arabic: ["شِفَاء", "عِلَاج"]
    },
    relatedTopics: ["duas", "quran", "tawakkul"]
  },

  // ==================== ISLAMIC FAMILY ====================
  mehr_dower: {
    topic: "marriage_dower",
    synonyms: ["mehr", "mahr", "dower", "bridal gift"],
    translations: {
      hindi: ["मेहर", "महर", "दहेज"],
      urdu: ["مہر", "دولت"],
      bengali: ["মেহর", "মোহর"],
      roman_urdu: ["mehr", "dolat"],
      arabic: ["مَهْر", "صَدَاق"]
    },
    relatedTopics: ["nikah", "walimah", "talaq"]
  },

  walimah_wedding_feast: {
    topic: "wedding_feast",
    synonyms: ["walimah", "wedding feast", "marriage celebration"],
    translations: {
      hindi: ["वलीमा", "शादी की दावत"],
      urdu: ["ولیمہ", "شادی کی دعوت"],
      bengali: ["ওয়ালিমা", "বিয়ের দাওয়াত"],
      roman_urdu: ["walimah", "shadi ki daawat"],
      arabic: ["وَلِيمَة", "عُرْس"]
    },
    relatedTopics: ["nikah", "mehr", "mahr"]
  },

  talaq_divorce: {
    topic: "divorce",
    synonyms: ["talaq", "divorce", "repudiation", "separation"],
    translations: {
      hindi: ["तलाक़", "विवाह विच्छेद"],
      urdu: ["طلاق", "جدائی"],
      bengali: ["তালাক", "বিবাহ বিচ্ছেদ"],
      roman_urdu: ["talaq", "judai"],
      arabic: ["طَلَاق", "فِرَاق"]
    },
    relatedTopics: ["nikah", "iddah", "khulu"]
  },

  iddah_waiting_period: {
    topic: "waiting_period",
    synonyms: ["iddah", "waiting period", "post-divorce waiting"],
    translations: {
      hindi: ["इद्दत", "प्रतीक्षा काल"],
      urdu: ["عدۃ", "انتظار کی مدت"],
      bengali: ["ইদ্দত", "অপেক্ষাকাল"],
      roman_urdu: ["iddah", "intezaar"],
      arabic: ["عِدَّة", "مُهْلَة"]
    },
    relatedTopics: ["talaq", "nikah", "tahara"]
  },

  khulu_divorce_initiated_by_wife: {
    topic: "wife_initiated_divorce",
    synonyms: ["khulu", "wife initiated divorce", "redemption"],
    translations: {
      hindi: ["ख़ुलू", "पत्नी द्वारा तलाक़"],
      urdu: ["خلع", "بیوی کی طلاق"],
      bengali: ["খুলু", "স্ত্রীর তালাক"],
      roman_urdu: ["khulu", "biwi ki talaq"],
      arabic: ["خُلْع", "بَدَل"]
    },
    relatedTopics: ["talaq", "mehr", "haq"]
  },

  mehram_non_mahram: {
    topic: "non_mahram",
    synonyms: ["mehram", "non-mahram", "unmarriageable"],
    translations: {
      hindi: ["महरम", "विवाह योग्य नहीं"],
      urdu: ["محرم", "غیر رشیدار"],
      bengali: ["মাহরাম", "বিবাহ অযোগ্য"],
      roman_urdu: ["mehram", "non-mahram"],
      arabic: ["مَحْرَم", "غَيْر مَحْرَم"]
    },
    relatedTopics: ["hijab", "purdah", "nikah"]
  },

  // ==================== MORE NAMES OF ALLAH (Asma ul Husna continued) ====================
  almalik_maliki: {
    topic: "king_of_kings",
    synonyms: ["almalik", "king of kings", "master"],
    translations: {
      hindi: ["अलमालिक", "राजाओं का राजा"],
      urdu: ["المالک", "بادشاہوں کا بادشاہ"],
      bengali: ["আল মালিক", "রাজাদের রাজা"],
      roman_urdu: ["almalik", "badshahon ka badshah"],
      arabic: ["الْمَلِك", "مَلِك الْمُلْك"]
    },
    relatedTopics: ["almalek", "alquddus", "sultan"]
  },

  alqaqqab_master: {
    topic: "the_clement",
    synonyms: ["alqahhar", "the dominant", "master", "alqahhar"],
    translations: {
      hindi: ["अलक़ाहिर", "प्रभुत्वशाली"],
      urdu: ["القاہر", "غالب"],
      bengali: ["আল কাহার", "প্রভুত্বশালী"],
      roman_urdu: ["alqahhar", "ghalib"],
      arabic: ["الْقَاهِر", "الْغَالِب"]
    },
    relatedTopics: ["aljabbar", "almalik", "qudra"]
  },

  aljabbar_compeller: {
    topic: "the_compeller",
    synonyms: ["aljabbar", "the compeller", "forceful"],
    translations: {
      hindi: ["अलजब्बार", "दबाव डालने वाला"],
      urdu: ["الجبار", "زور آور"],
      bengali: ["আল জাব্বার", "জোর দেওয়া"],
      roman_urdu: ["aljabbar", "zor awar"],
      arabic: ["الْجَبَّار", "ذُو الْقُوَّة"]
    },
    relatedTopics: ["alqahhar", "qudra", "jabar"]
  },

  almutakabbir_majesty: {
    topic: "the_possessor_of_greatness",
    synonyms: ["almutakabbir", "the great", "majesty"],
    translations: {
      hindi: ["अलमुतकब्बिर", "महान"],
      urdu: ["المتکبر", "عظیم"],
      bengali: ["আল মুতাকাব্বির", "মহান"],
      roman_urdu: ["almutakabbir", "azeem"],
      arabic: ["الْمُتَكَبِّر", "ذُو الْكِبْرِيَاء"]
    },
    relatedTopics: ["almalek", "kibr", "jalal"]
  },

  alkhaliq_creator: {
    topic: "the_creator",
    synonyms: ["alkhaliq", "the creator", "maker"],
    translations: {
      hindi: ["अलख़ालिक", "सृष्टिकर्ता"],
      urdu: ["الخالق", "بنانے والا"],
      bengali: ["আল খালিক", "স্রষ্টা"],
      roman_urdu: ["alkhaliq", "banaane wala"],
      arabic: ["الْخَالِق", "بَارِئ الْخَلْق"]
    },
    relatedTopics: ["bari", "khalaq", "abd"]
  },

  albari_maker: {
    topic: "the_maker",
    synonyms: ["albari", "the maker", "fashioner"],
    translations: {
      hindi: ["अलबारी", "निर्माता"],
      urdu: ["الباری", "بنانے والا"],
      bengali: ["আল বারি", "তৈরিকারক"],
      roman_urdu: ["albari", "banane wala"],
      arabic: ["الْبَارِئ", "مُصَوِّر"]
    },
    relatedTopics: ["alkhaliq", "musawwir", "khalaq"]
  },

  almusawwir_former: {
    topic: "the_fashioner",
    synonyms: ["almusawwir", "the fashioner", "shaper"],
    translations: {
      hindi: ["अलमुसव्विर", "आकार देने वाला"],
      urdu: ["المصور", "شکل دینے والا"],
      bengali: ["আল মুসাউয়্যির", "আকৃতি দেওয়া"],
      roman_urdu: ["almusawwir", "shakal dene wala"],
      arabic: ["الْمُصَوِّر", "مُشَكِّل"]
    },
    relatedTopics: ["albari", "alkhaliq", "taswir"]
  },

  alghaffar_forgiving: {
    topic: "the_ever_forgiving",
    synonyms: ["alghaffar", "the forgiving", "ever forgiving"],
    translations: {
      hindi: ["अलग़फ़्फ़ार", "बहुत क्षमा करने वाला"],
      urdu: ["الغفار", "بہت بخشنے والا"],
      bengali: ["আল গাফফার", "অসীম ক্ষমাশীল"],
      roman_urdu: ["alghaffar", "bahut bakhshne wala"],
      arabic: ["الْغَفَّار", "ذُو الْعَفْو"]
    },
    relatedTopics: ["ghufran", "tawbah", "maaf"]
  },

  alqahhar_dominant: {
    topic: "the_dominant",
    synonyms: ["alqahhar", "the dominant", "prevailing"],
    translations: {
      hindi: ["अलक़ाहिर", "प्रबल"],
      urdu: ["القاہر", "غالب"],
      bengali: ["আল কাহার", "প্রবল"],
      roman_urdu: ["alqahhar", "ghalib"],
      arabic: ["الْقَاهِر", "الْمُقْتَدِر"]
    },
    relatedTopics: ["aljabbar", "qudra", "ghalaba"]
  },

  alwahhab_bestower: {
    topic: "the_great_giver",
    synonyms: ["alwahhab", "the bestower", "great giver"],
    translations: {
      hindi: ["अलवह्हाब", "दाता-ए-आज़म"],
      urdu: ["الوھاب", "بڑے دینے والے"],
      bengali: ["আল ওয়াহহাব", "মহান দাতা"],
      roman_urdu: ["alwahhab", "bade dene wale"],
      arabic: ["الْوَھَّاب", "ذُو الْعَطَاء"]
    },
    relatedTopics: ["infaq", "sadaqah", "ata"]
  },

  alwadud_loving: {
    topic: "the_loving",
    synonyms: ["alwadud", "the loving", "most affectionate"],
    translations: {
      hindi: ["अलवदूद", "प्यार करने वाला"],
      urdu: ["الودود", "پیار کرنے والا"],
      bengali: ["আল ওয়াদুদ", "ভালোবাসা দেওয়া"],
      roman_urdu: ["alwadud", "pyar karne wala"],
      arabic: ["الْوَدُود", "ذُو الْمَحَبَّة"]
    },
    relatedTopics: ["mahabbah", "rahmah", "hubb"]
  },

  almajid_glorious: {
    topic: "the_most_glorious",
    synonyms: ["almajid", "the glorious", "noble"],
    translations: {
      hindi: ["अलमजीद", "शानदार"],
      urdu: ["المجید", "شاندار"],
      bengali: ["আল মাজিদ", "গৌরবময়"],
      roman_urdu: ["almajid", "shaandar"],
      arabic: ["الْمَجِيد", "ذُو الْجَلَال"]
    },
    relatedTopics: ["jalal", "ikram", "sharaf"]
  },

  albaith_raiser: {
    topic: "the_resurrector",
    synonyms: ["albaith", "the raiser", "resurrector"],
    translations: {
      hindi: ["अलबैथ", "जिलाने वाला"],
      urdu: ["الباعث", "اٹھانے والا"],
      bengali: ["আল বাইছ", "জাগ্রতকারী"],
      roman_urdu: ["albaith", "uthane wala"],
      arabic: ["الْبَاعِث", "مُحَیِ"]
    },
    relatedTopics: ["qiyamah", "maut", "hashr"]
  },

  alshahid_witness: {
    topic: "the_witness",
    synonyms: ["alshahid", "the witness", "observer"],
    translations: {
      hindi: ["अलशाहिद", "गवाह"],
      urdu: ["الشاہد", "گواہ"],
      bengali: ["আল শাহিদ", "সাক্ষী"],
      roman_urdu: ["alshahid", "gawah"],
      arabic: ["الشَّاهِد", "ذُو الشَّهَادَة"]
    },
    relatedTopics: ["shahada", "haqq", "ilm"]
  },

  alhaqq_truth: {
    topic: "the_truth",
    synonyms: ["alhaqq", "the truth", "real"],
    translations: {
      hindi: ["अलहक़्क़", "सच"],
      urdu: ["الحق", "سچ"],
      bengali: ["আল হাক", "সত্য"],
      roman_urdu: ["alhaqq", "sach"],
      arabic: ["الْحَقّ", "صِدْق"]
    },
    relatedTopics: ["haqq", "sidq", "batil"]
  },

  alwakil_trustee: {
    topic: "the_trustee",
    synonyms: ["alwakil", "the trustee", "guardian"],
    translations: {
      hindi: ["अलवकील", "न्यासी"],
      urdu: ["الوکیل", "وکیل"],
      bengali: ["আল ওয়াকিল", "অভিভাবক"],
      roman_urdu: ["alwakil", "wakeel"],
      arabic: ["الْوَكِيل", "حَفِيط"]
    },
    relatedTopics: ["tawfiq", "hami", "amaana"]
  },

  alghafor_forgiver: {
    topic: "the_forgiver",
    synonyms: ["alghafor", "the forgiver", "pardoner"],
    translations: {
      hindi: ["अलग़फ़ूर", "क्षमा करने वाला"],
      urdu: ["الغفور", "بخشنے والا"],
      bengali: ["আল গাফুর", "ক্ষমা করা"],
      roman_urdu: ["alghafor", "bakhshne wala"],
      arabic: ["الغَفُور", "ذُو الْعَفْو"]
    },
    relatedTopics: ["rahmah", "tawbah", "muskir"]
  },

  almujeeb_responsive: {
    topic: "the_responsive",
    synonyms: ["almujeeb", "the responsive", "answerer"],
    translations: {
      hindi: ["अलमुजीब", "जवाब देने वाला"],
      urdu: ["المجیب", "سننے والا"],
      bengali: ["আল মুজিব", "প্রতিক্রিয়াশীল"],
      roman_urdu: ["almujeeb", "sunne wala"],
      arabic: ["الْمُجِيب", "ذُو الْإِجَابَة"]
    },
    relatedTopics: ["duas", "sawab", "ijabat"]
  },

  alwasi_expanse: {
    topic: "the_vast",
    synonyms: ["alwasi", "the vast", "comprehensive"],
    translations: {
      hindi: ["अलवासी", "विस्तृत"],
      urdu: ["الوسیع", "وسیع"],
      bengali: ["আল ওয়াসি", "বিস্তৃত"],
      roman_urdu: ["alwasi", "wasee"],
      arabic: ["الْوَاسِع", "ذُو الْعَرْض"]
    },
    relatedTopics: ["kiram", "kabiir", "azeem"]
  },

  alhakiim_wise: {
    topic: "the_perfectly_wise",
    synonyms: ["alhakiim", "the wise", "wise"],
    translations: {
      hindi: ["अलहाकीम", "हुश्यार"],
      urdu: ["الحکیم", "حکمت والا"],
      bengali: ["আল হাকিম", "প্রজ্ঞ"],
      roman_urdu: ["alhakiim", "hakeem"],
      arabic: ["الْحَكِيم", "ذُو الْحِكْمَة"]
    },
    relatedTopics: ["hikma", "ilham", "khib"]
  },

  alwadood_loving: {
    topic: "the_most_loving",
    synonyms: ["alwadood", "the loving", "beloved"],
    translations: {
      hindi: ["अलवदूद", "प्यारा"],
      urdu: ["الودود", "پیارے"],
      bengali: ["আল ওয়াদুদ", "প্রিয়"],
      roman_urdu: ["alwadood", "pyare"],
      arabic: ["الْوَدُود", "ذُو الْمَحَبَّة"]
    },
    relatedTopics: ["mahabbah", "hubb", "walah"]
  },

  // ==================== MORE PROPHETS ====================
  shuayb_prophet: {
    topic: "prophet_shuayb",
    synonyms: ["shuayb", "jethro", "prophet shuayb"],
    translations: {
      hindi: ["शुऐब", "हज़रत शुऐब"],
      urdu: ["شعیب", "حضرت شعیب"],
      bengali: ["শুয়াইব", "হজরত শুয়াইব"],
      roman_urdu: ["shuayb", "hazrat shuayb"],
      arabic: ["شُعَيْب", "شُعَيْب عَلَيْهِ السَّلَام"]
    },
    relatedTopics: ["midian", "scales", "trade"]
  },

  hud_prophet: {
    topic: "prophet_hud",
    synonyms: ["hud", "prophet hud", "ever"],
    translations: {
      hindi: ["हूद", "हज़रत हूद"],
      urdu: ["ہود", "حضرت ہود"],
      bengali: ["হুদ", "হজরত হুদ"],
      roman_urdu: ["hud", "hazrat hud"],
      arabic: ["هُود", "هُود عَلَيْهِ السَّلَام"]
    },
    relatedTopics: ["ad", "thamu", "aikaaf"]
  },

  salih_prophet: {
    topic: "prophet_salih",
    synonyms: ["salih", "prophet salih", " Saleh"],
    translations: {
      hindi: ["सालिह", "हज़रत सालिह"],
      urdu: ["صالح", "حضرت صالح"],
      bengali: ["সালিহ", "হজরত সালিহ"],
      roman_urdu: ["salih", "hazrat salih"],
      arabic: ["صَالِح", "صَالِح عَلَيْهِ السَّلَام"]
    },
    relatedTopics: ["thamud", "shecamel", "hijr"]
  },

  lut_prophet: {
    topic: "prophet_lut",
    synonyms: ["lut", "lot", "prophet lut"],
    translations: {
      hindi: ["लूत", "हज़रत लूत"],
      urdu: ["لوط", "حضرت لوط"],
      bengali: ["লুত", "হজরত লুত"],
      roman_urdu: ["lut", "hazrat lut"],
      arabic: ["لُوط", "لُوط عَلَيْهِ السَّلَام"]
    },
    relatedTopics: ["sodom", "people", "hospitality"]
  },

  yunus_prophet: {
    topic: "prophet_yunus",
    synonyms: ["yunus", "jonah", "prophet yunus"],
    translations: {
      hindi: ["यूनुस", "हज़रत यूनुस"],
      urdu: ["یونس", "حضرت یونس"],
      bengali: ["ইউনুস", "হজরত ইউনুস"],
      roman_urdu: ["yunus", "hazrat yunus"],
      arabic: ["يُونُس", "يُونُس عَلَيْهِ السَّلَام"]
    },
    relatedTopics: ["whale", "fish", "ninweh"]
  },

  idris_prophet: {
    topic: "prophet_idris",
    synonyms: ["idris", "enoch", "prophet idris"],
    translations: {
      hindi: ["इदरीस", "हज़रत इदरीस"],
      urdu: ["ادریس", "حضرت ادریس"],
      bengali: ["ইদ্রিস", "হজরত ইদ্রিস"],
      roman_urdu: ["idris", "hazrat idris"],
      arabic: ["إدْرِيس", "إدْرِيس عَلَيْهِ السَّلَام"]
    },
    relatedTopics: ["patience", "babit", "hilyah"]
  },

  dhulkifl_prophet: {
    topic: "prophet_dhulkifl",
    synonyms: ["dhulkifl", "ezeekiel", "prophet dhulkifl"],
    translations: {
      hindi: ["ज़ुलक़िफ़ल", "हज़रत ज़ुलक़िफ़ल"],
      urdu: ["ذوالکفل", "حضرت ذوالکفل"],
      bengali: ["যুল কিফল", "হজরত যুল কিফল"],
      roman_urdu: ["dhulkifl", "hazrat dhulkifl"],
      arabic: ["ذُو الْكِفْل", "ذُو الْكِفْل عَلَيْهِ السَّلَام"]
    },
    relatedTopics: ["patience", "trial", "salih"]
  },

  // ==================== ANGELS ====================
  jibril_gabriel: {
    topic: "archangel_gabriel",
    synonyms: ["jibril", "gabriel", "archangel", "ruh alqudus"],
    translations: {
      hindi: ["जिब्रील", "हज़रत जिब्रील"],
      urdu: ["جبریل", "حضرت جبریل"],
      bengali: ["জিব্রিল", "হজরত জিব্রিল"],
      roman_urdu: ["jibril", "hazrat jibril"],
      arabic: ["جِبْرِيل", "رُوح الْقُدُس"]
    },
    relatedTopics: ["mikail", "israfil", "izraeel", "wahi"]
  },

  mikail_michael: {
    topic: "archangel_michael",
    synonyms: ["mikail", "michael", "archangel", "nour"],
    translations: {
      hindi: ["मीका'ईल", "हज़रत मीकाईल"],
      urdu: ["میکائیل", "حضرت میکائیل"],
      bengali: ["মিকাইল", "হজরত মিকাইল"],
      roman_urdu: ["mikail", "hazrat mikail"],
      arabic: ["مِيكَائِيل", "جَبْرَائِيل"]
    },
    relatedTopics: ["jibril", "israfil", "rizq"]
  },

  israfil_rafael: {
    topic: "archangel_israfil",
    synonyms: ["israfil", "raphael", "archangel", "sur"],
    translations: {
      hindi: ["इस्राफ़ील", "हज़रत इस्राफ़ील"],
      urdu: ["اسرافیل", "حضرت اسرافیل"],
      bengali: ["ইস্রাফিল", "হজরত ইস্রাফিল"],
      roman_urdu: ["israfil", "hazrat israfil"],
      arabic: ["إِسْرَافِيل", "مَلَك السَّاهُور"]
    },
    relatedTopics: ["jibril", "mikail", "surood"]
  },

  izraeel_azrael: {
    topic: "archangel_azrael",
    synonyms: ["izraeel", "azrael", "malak almaut", "angel of death"],
    translations: {
      hindi: ["इज़्राइल", "मलक-उल-मौत"],
      urdu: ["عزرائیل", "ملک الموت"],
      bengali: ["ইজ্রাইল", "মালাকুল মাউত"],
      roman_urdu: ["izraeel", "malak al-maut"],
      arabic: ["عِزْرَائِيل", "مَلَك الْمَوْت"]
    },
    relatedTopics: ["maut", "qiyamah", "hisab"]
  },

  munkar_nakir: {
    topic: "questioning_angels",
    synonyms: ["munkar", "nakir", "questioning angels", "tashbih"],
    translations: {
      hindi: ["मुंकर", "नकीर", "प्रश्न करने वाले फ़रिश्ते"],
      urdu: ["منکر", "نکیر", "پوچھنے والے فرشتے"],
      bengali: ["মুনকার", "নাকির", "প্রশ্নকারী ফেরেশতা"],
      roman_urdu: ["munkar", "nakir", "poochhne wale farishte"],
      arabic: ["مُنْكَر", "نُكِير", "سُؤَال"]
    },
    relatedTopics: ["qabar", "sual", "barzakh"]
  },

  kiraman_katibin: {
    topic: "recording_angels",
    synonyms: ["kiraman katibin", "noble recorders", "guardian angels"],
    translations: {
      hindi: ["किरामान क़ातिबीन", "रिकॉर्डिंग फ़रिश्ते"],
      urdu: ["کرامان کاتبین", "لکھنے والے فرشتے"],
      bengali: ["কিরামান কাতিবিন", "রেকর্ডিং ফেরেশতা"],
      roman_urdu: ["kiraman katibin", "likhne wale farishte"],
      arabic: ["كِرَامٌ كَاتِبُون", "حَفَظَة"]
    },
    relatedTopics: ["amana", "amal", "siah"]
  },

  // ==================== ISLAMIC BELIEFS & DOCTRINE ====================
  kufar_disbelief: {
    topic: "disbelief",
    synonyms: ["kufar", "disbelief", "unbelief", " infidelity"],
    translations: {
      hindi: ["कुफ़्र", "इनकार"],
      urdu: ["کفر", "انکار"],
      bengali: ["কুফর", "অস্বীকার"],
      roman_urdu: ["kufar", "inkaar"],
      arabic: ["كُفْر", "إِنْكَار"]
    },
    relatedTopics: ["shirk", "iman", "kufr"]
  },

  nifaq_hypocrisy: {
    topic: "hypocrisy",
    synonyms: ["nifaq", "hypocrisy", "munafiq", "two-faced"],
    translations: {
      hindi: ["नीफ़ाक़", "ढोंग"],
      urdu: ["نفاق", "دھوکہ"],
      bengali: ["নিফাক", "ভণ্ডামি"],
      roman_urdu: ["nifaq", "dhong"],
      arabic: ["نِفَاق", "رِيَاء"]
    },
    relatedTopics: ["sidq", "kadhb", "munaafiq"]
  },

  bidah_innovation: {
    topic: "religious_innovation",
    synonyms: ["bidah", "innovation", "heretical", " بدعة"],
    translations: {
      hindi: ["बिदअ", "नई चीज़"],
      urdu: ["بدعت", "نیا کام"],
      bengali: ["বিদআ", "উদ্ভাবন"],
      roman_urdu: ["bidah", "naya kaam"],
      arabic: ["بِدْعَة", "إِحْدَاث"]
    },
    relatedTopics: ["sunnah", "shirk", "haraam"]
  },

  taghut_false_gods: {
    topic: "false_gods",
    synonyms: ["taghut", "false gods", "idol", "satan"],
    translations: {
      hindi: ["ताग़ूत", "झूठे देवता"],
      urdu: ["طاغوت", "جھوٹے معبود"],
      bengali: ["তাগুত", "মিথ্যা দেবতা"],
      roman_urdu: ["taghut", "jhoothe devta"],
      arabic: ["طَاغُوت", "وَلِيّ"]
    },
    relatedTopics: ["shirk", "iblis", "shaytan"]
  },

  waswas_temptation: {
    topic: "whispering_temptation",
    synonyms: ["waswas", "whispering", "temptation", " الوسواس"],
    translations: {
      hindi: ["वस्वस", "भड़कावा"],
      urdu: ["وسوسہ", "بھڑکانا"],
      bengali: ["ওয়াসওয়াস", "প্রলোভন"],
      roman_urdu: ["waswas", "bharkana"],
      arabic: ["وَسْوَاس", "هَمْز"]
    },
    relatedTopics: ["shaytan", "nafs", "sabr"]
  },

  // ==================== ISLAMIC PRACTICES ====================
  dhikr_remembrance: {
    topic: "remembrance_of_allah",
    synonyms: ["dhikr", "zikr", "remembrance", " ذکر"],
    translations: {
      hindi: ["ज़िक्र", "स्मरण"],
      urdu: ["ذکر", "یاد"],
      bengali: ["যিকর", "স্মরণ"],
      roman_urdu: ["dhikr", "yaad"],
      arabic: ["ذِكْر", "تَذْكِر"]
    },
    relatedTopics: ["salah", "quran", "tasbih"]
  },

  tasbih_glorification: {
    topic: "glorification",
    synonyms: ["tasbih", "subhan allah", "glory to allah"],
    translations: {
      hindi: ["तसबीह", "सुबहान अल्लाह"],
      urdu: ["تسبیح", "سبحان اللہ"],
      bengali: ["তাসবীহ", "সুবহান আল্লাহ"],
      roman_urdu: ["tasbih", "subhan allah"],
      arabic: ["تَسْبِيح", "سُبْحَانَاللَّه"]
    },
    relatedTopics: ["tahmid", "takbir", "istighfar"]
  },

  tahmid_praise: {
    topic: "praise_of_allah",
    synonyms: ["tahmid", "alhamdulillah", "praise allah"],
    translations: {
      hindi: ["तहमीद", "अल्हमदुलिल्लाह"],
      urdu: ["تحمید", "الحمد للہ"],
      bengali: ["তাহমিদ", "আলহামদুলিল্লাহ"],
      roman_urdu: ["tahmid", "alhamdulillah"],
      arabic: ["تَحْمِيد", "الْحَمْدُ لِلَّه"]
    },
    relatedTopics: ["tasbih", "shukr", "hamd"]
  },

  takbir_exaltation: {
    topic: "exaltation_of_allah",
    synonyms: ["takbir", "allahu akbar", "allaah is greatest"],
    translations: {
      hindi: ["तकबीर", "अल्लाहु अकबर"],
      urdu: ["تکبیر", "اللہ اکبر"],
      bengali: ["তাকবীর", "আল্লাহু আকবার"],
      roman_urdu: ["takbir", "allah hu akbar"],
      arabic: ["تَكْبِير", "اللَّهُ أَكْبَر"]
    },
    relatedTopics: ["tasbih", "tahmid", "takhtir"]
  },

  istighfar_seekingforgiveness: {
    topic: "seeking_allah_forgiveness",
    synonyms: ["istighfar", "astaghfirullah", "i seek allah forgiveness"],
    translations: {
      hindi: ["इस्तिग़फ़ार", "अस्तग़फ़िरुल्लाह"],
      urdu: ["استغفار", "اَسْتَغْفِرُاللہ"],
      bengali: ["ইস্তিগফার", "আস্তাগফিরুল্লাহ"],
      roman_urdu: ["istighfar", "astaghfirullah"],
      arabic: ["اسْتِغْفَار", "أَسْتَغْفِرُاللَّه"]
    },
    relatedTopics: ["tawbah", "tahmid", "salah"]
  },

  hajj_akbar: {
    topic: "greater_pilgrimage",
    synonyms: ["hajj akbar", "greater hajj", "wuqoof arafat"],
    translations: {
      hindi: ["हज़ अकबर", "बड़ी हज़"],
      urdu: ["حج اکبر", "بڑا حج"],
      bengali: ["হজ্জ আকবর", "বড় হজ্জ"],
      roman_urdu: ["hajj akbar", "bari hajj"],
      arabic: ["حَجّ أَكْبَر", "عَرَفَة"]
    },
    relatedTopics: ["arafat", "wqoof", "muzdalifah"]
  },

  // ==================== ISLAMIC STATES & CONDITIONS ====================
  janabah_major_impurity: {
    topic: "major_impurity",
    synonyms: ["janabah", "major impurity", "sexual impurity"],
    translations: {
      hindi: ["जनाबा", "बड़ी अशुद्धि"],
      urdu: ["جنابت", "بڑی ناپاکی"],
      bengali: ["জানাবাহ", "বড় অশুদ্ধি"],
      roman_urdu: ["janabah", "bari napaki"],
      arabic: ["جَنَابَة", "حَدَث"]
    },
    relatedTopics: ["ghusl", "hadath", "tahara"]
  },

  hadath_impurity: {
    topic: "minor_impurity",
    synonyms: ["hadath", "minor impurity", "ritual impurity"],
    translations: {
      hindi: ["हदथ", "छोटी अशुद्धि"],
      urdu: ["حدیث", "چھوٹی ناپاکی"],
      bengali: ["হাদাথ", "ছোট অশুদ্ধি"],
      roman_urdu: ["hadath", "chhoti napaki"],
      arabic: ["حَدَث", "نَجَاسَة"]
    },
    relatedTopics: ["wudu", "tahara", "tayammum"]
  },

  tayammum_dry_ablution: {
    topic: "dry_ablution",
    synonyms: ["tayammum", "dry ablution", "dust cleansing"],
    translations: {
      hindi: ["तयम्मुम", "सूखा अब्देस्त"],
      urdu: ["تیمم", "خشک وضو"],
      bengali: ["তয়াম্মুম", "শুষ্ক অজু"],
      roman_urdu: ["tayammum", "khaq wuzu"],
      arabic: ["تَيَمُّم", "سُحُور"]
    },
    relatedTopics: ["wudu", "najas", "saeed"]
  },

  adhan_call_to_prayer: {
    topic: "call_to_prayer",
    synonyms: ["adhan", "call to prayer", "azaan", "azan"],
    translations: {
      hindi: ["अज़ान", "नमाज़ की आवाज़"],
      urdu: ["اذان", "نماز کی آواز"],
      bengali: ["আযান", "নামাজের ডাক"],
      roman_urdu: ["adhan", "namaz ki awaz"],
      arabic: ["أَذَان", "مُنَادَاة"]
    },
    relatedTopics: ["iqama", "salah", "jamaat"]
  },

  iqama_standing_prayer: {
    topic: "standing_for_prayer",
    synonyms: ["iqama", "standing for prayer", "iqaamah"],
    translations: {
      hindi: ["इक़ामत", "क़ायम"],
      urdu: ["اقامت", "قیام"],
      bengali: ["ইকামাহ", "দাঁড়ানো"],
      roman_urdu: ["iqama", "qayam"],
      arabic: ["إِقَامَة", "قِيَام"]
    },
    relatedTopics: ["adhan", "salah", "imam"]
  },

  // ==================== ISLAMIC RULINGS ====================
  halal_permissible: {
    topic: "permissible",
    synonyms: ["halal", "permissible", "lawful", " allowed"],
    translations: {
      hindi: ["हलाल", "वैध", "इजाज़त"],
      urdu: ["حلال", "جائز"],
      bengali: ["হালাল", "বৈধ"],
      roman_urdu: ["halal", "jaiz"],
      arabic: ["حَلَال", "جَائِز"]
    },
    relatedTopics: ["haram", "makruh", "fard"]
  },

  haram_forbidden: {
    topic: "forbidden",
    synonyms: ["haram", "forbidden", "prohibited", "unlawful"],
    translations: {
      hindi: ["हराम", "मना", "निषिद्ध"],
      urdu: ["حرام", "ممنوع"],
      bengali: ["হারাম", "নিষিদ্ধ"],
      roman_urdu: ["haram", "mamnoo"],
      arabic: ["حَرَام", "مَمْنُوع"]
    },
    relatedTopics: ["halal", "makruh", "sin"]
  },

  makruh_disliked: {
    topic: "disliked",
    synonyms: ["makruh", "disliked", "undesirable"],
    translations: {
      hindi: ["मकरूह", "नापसंद"],
      urdu: ["مکروہ", "ناپسندیدہ"],
      bengali: ["মাকরুহ", "অপছন্দ"],
      roman_urdu: ["makruh", "na-pasandid"],
      arabic: ["مَكْرُوه", "رِدّ"]
    },
    relatedTopics: ["haram", "halal", "sunnah"]
  },

  mustahab_recommended: {
    topic: "recommended",
    synonyms: ["mustahab", "recommended", "preferable"],
    translations: {
      hindi: ["मुस्तहब", "सिफ़ारिश"],
      urdu: ["مستحب", "سفارش"],
      bengali: ["মুস্তাহাব", "সুপারিশ"],
      roman_urdu: ["mustahab", "sifarish"],
      arabic: ["مُسْتَحَبّ", "رُخَص"]
    },
    relatedTopics: ["sunnah", "nafl", "fard"]
  },

  muwaqqat_temporary_marriage: {
    topic: "temporary_marriage",
    synonyms: ["mutah", "temporary marriage", "fixed time marriage"],
    translations: {
      hindi: ["मुताह", "अस्थायी शादी"],
      urdu: ["متعہ", "عارضی شادی"],
      bengali: ["মুতাহ", "সাময়িক বিয়ে"],
      roman_urdu: ["mutah", "mushkille shadi"],
      arabic: ["مُتْعَة", "زَوَاج مُؤَقَّت"]
    },
    relatedTopics: ["nikah", "mahr", "tahrim"]
  },

  // ==================== ISLAMIC JURISDICTION ====================
  hudood_limits: {
    topic: "limits_of_allah",
    synonyms: ["hudood", "limits of allah", "boundaries", "hudud"],
    translations: {
      hindi: ["हुदूद", "सीमाएं"],
      urdu: ["حدود", "حدود"],
      bengali: ["হুদুদ", "সীমানা"],
      roman_urdu: ["hudood", "seemayein"],
      arabic: ["حُدُود", "حَدّ"]
    },
    relatedTopics: ["qisas", "taazir", "hukm"]
  },

  qisas_retaliation: {
    topic: "retaliation",
    synonyms: ["qisas", "retaliation", "equitable retribution"],
    translations: {
      hindi: ["क़िसास", "बदला"],
      urdu: ["قصاص", "بدلا"],
      bengali: ["কিসাস", "প্রতিশোধ"],
      roman_urdu: ["qisas", "badla"],
      arabic: ["قِصَاص", "عِقَاب"]
    },
    relatedTopics: ["hudood", "diya", "taazir"]
  },

  diya_bloodmoney: {
    topic: "blood_money",
    synonyms: ["diya", "blood money", "compensation", "growing"],
    translations: {
      hindi: ["दिय", "रक्तदान"],
      urdu: ["دیت", "خون کی قیمت"],
      bengali: ["দিয়াহ", "রক্তের মূল্য"],
      roman_urdu: ["diya", "khoon ki keemat"],
      arabic: ["دِيَة", "أَرْش"]
    },
    relatedTopics: ["qisas", "hudood", "kaffara"]
  },

  kaffara_expiation: {
    topic: "expiation",
    synonyms: ["kaffara", "expiation", "atonement", "penalty"],
    translations: {
      hindi: ["क़फ़्फ़ारा", "प्रायश्चित"],
      urdu: ["کفارہ", "اکسانے"],
      bengali: ["কাফফারাহ", "প্রায়শ্চিত্ত"],
      roman_urdu: ["kaffara", "kaffara"],
      arabic: ["كَفَّارَة", "فِدْيَة"]
    },
    relatedTopics: ["sawm", "infaq", "tawbah"]
  },

  // ==================== ISLAMIC EDUCATION TERMS ====================
  mudarris_teacher: {
    topic: "teacher",
    synonyms: ["mudarris", "teacher", "instructor", "muallim"],
    translations: {
      hindi: ["मुदर्सिस", "शिक्षक"],
      urdu: ["مدرّس", "استاد"],
      bengali: ["মুদাররিস", "শিক্ষক"],
      roman_urdu: ["mudarris", "ustaad"],
      arabic: ["مُدَرِّس", "مُعَلِّم"]
    },
    relatedTopics: ["talib", "madrasa", "maktab"]
  },

  talib_student: {
    topic: "student",
    synonyms: ["talib", "student", "learner", "talib alilm"],
    translations: {
      hindi: ["तालिब", "विद्यार्थी"],
      urdu: ["طالب علم", "طالب"],
      bengali: ["তালিব", "ছাত্র"],
      roman_urdu: ["talib", "taalib"],
      arabic: ["طَالِب", "تِلْمِيذ"]
    },
    relatedTopics: ["mudarris", "madrasa", "ilm"]
  },

  darul_ulum_university: {
    topic: "islamic_university",
    synonyms: ["darul ulum", "islamic university", "house of knowledge"],
    translations: {
      hindi: ["दारुल उलूम", "इस्लामी विश्वविद्यालय"],
      urdu: ["دار العلوم", "اسلامی جامعہ"],
      bengali: ["দারুল উলুম", "ইসলামি বিশ্ববিদ্যালয়"],
      roman_urdu: ["darul ulum", "islami jamia"],
      arabic: ["دَار الْعُلُوم", "جَامِعَة"]
    },
    relatedTopics: ["madrasa", "mudarris", "alim"]
  },

  // ==================== ISLAMIC SPIRITUALITY ====================
  muraqaba_spiritual_retreat: {
    topic: "spiritual_meditation",
    synonyms: ["muraqaba", "meditation", "vigil", "spiritual practice"],
    translations: {
      hindi: ["मुराक़ाबा", "ध्यान"],
      urdu: ["مراقبہ", "نگرانی"],
      bengali: ["মুরাকাবাহ", "ধ্যান"],
      roman_urdu: ["muraqaba", "dhyana"],
      arabic: ["مُرَاقَبَة", "فِكْر"]
    },
    relatedTopics: ["tasawwuf", "dhikr", "khalwa"]
  },

  tariqah_spiritual_order: {
    topic: "spiritual_order",
    synonyms: ["tariqah", "sufi order", "spiritual path", "tareeqa"],
    translations: {
      hindi: ["तरीक़ा", "सूफ़ी मार्ग"],
      urdu: ["طریقہ", "سلسلہ"],
      bengali: ["তরিক্বাহ", "সূফি পথ"],
      roman_urdu: ["tariqah", "silsila"],
      arabic: ["طَرِيقَة", "سِلْسِلَة"]
    },
    relatedTopics: ["tasawwuf", "sufi", "murid"]
  },

  murabit_spiritual_warrior: {
    topic: "spiritual_warrior",
    synonyms: ["murabit", "garrison", "spiritual warrior"],
    translations: {
      hindi: ["मुराबित", "आध्यात्मिक योद्धा"],
      urdu: ["مرابط", "روحانی لڑاکا"],
      bengali: ["মুরাবিত", "আধ্যাত্মিক যোদ্ধা"],
      roman_urdu: ["murabit", "rohani laraka"],
      arabic: ["مُرَابِط", "مُجَاهِد"]
    },
    relatedTopics: ["jihad", "tariqah", "ghazwa"]
  },

  shaykh_islamic_scholar: {
    topic: "islamic_scholar",
    synonyms: ["shaykh", "sheikh", "islamic scholar", "elder"],
    translations: {
      hindi: ["शैख़", "उलेमा"],
      urdu: ["شیخ", "علماء"],
      bengali: ["শাইখ", "আলেম"],
      roman_urdu: ["shaykh", "alim"],
      arabic: ["شَيْخ", "عَالِم"]
    },
    relatedTopics: ["alim", "mufti", "hafiz"]
  },

  // ==================== ISLAMIC TIME & PERIODS ====================
  yawm_day: {
    topic: "day",
    synonyms: ["yawm", "day", "daily", "yaum"],
    translations: {
      hindi: ["यौम", "दिन"],
      urdu: ["یوم", "دن"],
      bengali: ["ইয়াউম", "দিন"],
      roman_urdu: ["yawm", "din"],
      arabic: ["يَوْم", "نَهَار"]
    },
    relatedTopics: ["layl", "sabah", "masaa"]
  },

  layl_night: {
    topic: "night",
    synonyms: ["layl", "night", "evening"],
    translations: {
      hindi: ["लैल", "रात"],
      urdu: ["لیل", "رات"],
      bengali: ["লাইল", "রাত"],
      roman_urdu: ["layl", "raat"],
      arabic: ["لَيْل", "ظُلْمَة"]
    },
    relatedTopics: ["yawm", "masaa", "subh"]
  },

  asr_afternoon: {
    topic: "afternoon_prayer_time",
    synonyms: ["asr", "afternoon", "late afternoon"],
    translations: {
      hindi: ["अस्र", "दोपहर"],
      urdu: ["عصر", "سہ پہر"],
      bengali: ["আসর", "দুপুর"],
      roman_urdu: ["asr", "dopahar"],
      arabic: ["عَصْر", "مَغِيب"]
    },
    relatedTopics: ["salah", "waqt", "namaz"]
  },

  zawal_noon: {
    topic: "noon",
    synonyms: ["zawal", "noon", "midday", "zavil"],
    translations: {
      hindi: ["ज़वाल", "दोपहर"],
      urdu: ["ظہور", "دوپہر"],
      bengali: ["যাওয়াল", "মধ্যাহ্ন"],
      roman_urdu: ["zawal", "dopahar"],
      arabic: ["ظُهْر", "مَطْرَف"]
    },
    relatedTopics: ["salah", "dhur", "waqt"]
  },

  maghrib_evening: {
    topic: "evening_prayer_time",
    synonyms: ["maghrib", "evening", "sunset"],
    translations: {
      hindi: ["मग़्रिब", "शाम"],
      urdu: ["مغرب", "شام"],
      bengali: ["মাগরিব", "সন্ধ্যা"],
      roman_urdu: ["maghrib", "shaam"],
      arabic: ["مَغْرِب", "غُرُوب"]
    },
    relatedTopics: ["isha", "salah", "aftab"]
  },

  isha_night_prayer: {
    topic: "night_prayer_time",
    synonyms: ["isha", "night prayer", "evening prayer"],
    translations: {
      hindi: ["इशा", "रात की नमाज़"],
      urdu: ["عشاء", "رات کی نماز"],
      bengali: ["ইশা", "রাতের নামাজ"],
      roman_urdu: ["isha", "raat ki namaz"],
      arabic: ["عِشَاء", "لَيْل"]
    },
    relatedTopics: ["maghrib", "salah", "sahar"]
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