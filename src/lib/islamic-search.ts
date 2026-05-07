import Fuse from 'fuse.js';
import quranData from '@/data/quran/quran.json';
import bukhariData from '@/data/hadith/bukhari.json';
import muslimData from '@/data/hadith/muslim.json';
import duasData from '@/data/duas/duas.json';

// ─── Types ───────────────────────────────────────────────────────────────────

interface QuranVerse {
  chapter: number;
  verse: number;
  text: string;
  HindiTarjuma: string;
  UrduTarjuma: string;
  EnglishTarjuma: string;
  BengaliTarjuma: string;
  RomanUrduTarjuma: string;
}

interface HadithTranslation {
  narrator: string;
  text: string;
}

interface Hadith {
  id: number;
  idInBook: number;
  chapterId: number;
  bookId: number;
  arabic: string;
  english: HadithTranslation;
  Hindi: HadithTranslation;
  Urdu: HadithTranslation;
  Bengali: HadithTranslation;
}

interface HadithFile {
  id: number;
  metadata: {
    id: number;
    length?: number;
    arabic: { title: string; author: string };
    english: { title: string; author: string };
  };
  chapters: { id: number; bookId: number; arabic: string; english: string }[];
  hadiths: Hadith[];
}

interface Dua {
  id: number;
  title: string;
  titleArabic: string;
  arabic: string;
  english: string;
  hindi: string;
  urdu: string;
  bengali: string;
  reference: string;
  category: string;
}

// ─── Return Types ────────────────────────────────────────────────────────────

export interface QuranSearchResult {
  chapter: number;
  verse: number;
  text: string;
  translation: string;
  language: string;
  score?: number;
}

export interface HadithSearchResult {
  id: number;
  bookName: string;
  chapterName: string;
  arabic: string;
  text: string;
  narrator: string;
  language: string;
  reference: string;
  score?: number;
}

export interface DuaSearchResult {
  id: number;
  title: string;
  titleArabic: string;
  arabic: string;
  translation: string;
  language: string;
  reference: string;
  category: string;
  score?: number;
}

export interface DailyFeed {
  verse: {
    text: string;
    translation: string;
    reference: string;
  };
  hadith: {
    text: string;
    narrator: string;
    reference: string;
  };
  dua: {
    arabic: string;
    translation: string;
    reference: string;
  };
  reminder: string;
}

// ─── Language Mapping ────────────────────────────────────────────────────────

type Language = 'English' | 'Hindi' | 'Urdu' | 'Bengali' | 'Roman Urdu';

const QURAN_LANGUAGE_MAP: Record<string, keyof QuranVerse> = {
  English: 'EnglishTarjuma',
  Hindi: 'HindiTarjuma',
  Urdu: 'UrduTarjuma',
  Bengali: 'BengaliTarjuma',
  'Roman Urdu': 'RomanUrduTarjuma',
};

const HADITH_LANGUAGE_MAP: Record<string, keyof Hadith> = {
  English: 'english',
  Hindi: 'Hindi',
  Urdu: 'Urdu',
  Bengali: 'Bengali',
};

const DUA_LANGUAGE_MAP: Record<string, keyof Dua> = {
  English: 'english',
  Hindi: 'hindi',
  Urdu: 'urdu',
  Bengali: 'bengali',
};

// ─── Helper: Flatten Quran Data ─────────────────────────────────────────────

interface FlatQuranVerse extends QuranVerse {
  _translationKey: string;
  _translationValue: string;
}

function flattenQuranData(language: string = 'English'): FlatQuranVerse[] {
  const translationKey = QURAN_LANGUAGE_MAP[language] || 'EnglishTarjuma';
  const verses: FlatQuranVerse[] = [];

  for (const chapterKey of Object.keys(quranData)) {
    const chapterVerses = (quranData as Record<string, QuranVerse[]>)[chapterKey];
    if (!Array.isArray(chapterVerses)) continue;

    for (const verse of chapterVerses) {
      verses.push({
        ...verse,
        _translationKey: translationKey,
        _translationValue: (verse[translationKey] as string) || '',
      });
    }
  }

  return verses;
}

// ─── Helper: Flatten Hadith Data ────────────────────────────────────────────

interface FlatHadith {
  id: number;
  idInBook: number;
  chapterId: number;
  bookId: number;
  arabic: string;
  bookName: string;
  chapterName: string;
  _translationObj: HadithTranslation;
  _language: string;
}

function flattenHadithData(language: string = 'English'): FlatHadith[] {
  const translationKey = HADITH_LANGUAGE_MAP[language] || 'english';
  const hadithFiles: HadithFile[] = [bukhariData as unknown as HadithFile, muslimData as unknown as HadithFile];
  const results: FlatHadith[] = [];

  for (const file of hadithFiles) {
    const bookName = file.metadata?.english?.title || 'Unknown';
    const chaptersMap = new Map<number, string>();
    for (const chapter of file.chapters || []) {
      chaptersMap.set(chapter.id, chapter.english || '');
    }

    for (const hadith of file.hadiths || []) {
      const translationObj = (hadith[translationKey] as HadithTranslation) || hadith.english || { narrator: '', text: '' };
      results.push({
        id: hadith.id,
        idInBook: hadith.idInBook,
        chapterId: hadith.chapterId,
        bookId: hadith.bookId,
        arabic: hadith.arabic || '',
        bookName,
        chapterName: chaptersMap.get(hadith.chapterId) || '',
        _translationObj: translationObj,
        _language: language,
      });
    }
  }

  return results;
}

// ─── Helper: Flatten Dua Data ───────────────────────────────────────────────

interface FlatDua extends Dua {
  _translationValue: string;
  _language: string;
}

function flattenDuaData(language: string = 'English'): FlatDua[] {
  const translationKey = DUA_LANGUAGE_MAP[language] || 'english';
  const duas = duasData.duas || [];

  return duas.map((dua: Dua) => ({
    ...dua,
    _translationValue: (dua[translationKey] as string) || dua.english || '',
    _language: language,
  }));
}

// ─── 1. searchQuran ─────────────────────────────────────────────────────────

export function searchQuran(query: string, language: string = 'English'): QuranSearchResult[] {
  if (!query.trim()) return [];

  const translationKey = QURAN_LANGUAGE_MAP[language] || 'EnglishTarjuma';
  const flatVerses = flattenQuranData(language);

  const fuse = new Fuse(flatVerses, {
    threshold: 0.4,
    includeScore: true,
    keys: [
      { name: 'text', weight: 0.5 },           // Arabic text
      { name: '_translationValue', weight: 0.5 }, // Selected language translation
    ],
  });

  const results = fuse.search(query, { limit: 10 });

  return results.map((result) => ({
    chapter: result.item.chapter,
    verse: result.item.verse,
    text: result.item.text,
    translation: (result.item[translationKey] as string) || '',
    language,
    score: result.score,
  }));
}

// ─── 2. searchHadith ────────────────────────────────────────────────────────

export function searchHadith(query: string, language: string = 'English'): HadithSearchResult[] {
  if (!query.trim()) return [];

  const flatHadiths = flattenHadithData(language);

  const fuse = new Fuse(flatHadiths, {
    threshold: 0.4,
    includeScore: true,
    keys: [
      { name: 'arabic', weight: 0.4 },                   // Arabic text
      { name: '_translationObj.text', weight: 0.4 },     // Translation text
      { name: '_translationObj.narrator', weight: 0.2 }, // Narrator
    ],
  });

  const results = fuse.search(query, { limit: 10 });

  return results.map((result) => ({
    id: result.item.id,
    bookName: result.item.bookName,
    chapterName: result.item.chapterName,
    arabic: result.item.arabic,
    text: result.item._translationObj?.text || '',
    narrator: result.item._translationObj?.narrator || '',
    language: result.item._language,
    reference: `${result.item.bookName}, Hadith #${result.item.id}`,
    score: result.score,
  }));
}

// ─── 3. searchDuas ──────────────────────────────────────────────────────────

export function searchDuas(query: string, language: string = 'English'): DuaSearchResult[] {
  if (!query.trim()) return [];

  const translationKey = DUA_LANGUAGE_MAP[language] || 'english';
  const flatDuas = flattenDuaData(language);

  const fuse = new Fuse(flatDuas, {
    threshold: 0.4,
    includeScore: true,
    keys: [
      { name: 'arabic', weight: 0.3 },           // Arabic text
      { name: '_translationValue', weight: 0.3 }, // Translation
      { name: 'title', weight: 0.25 },            // Title
      { name: 'category', weight: 0.15 },         // Category
    ],
  });

  const results = fuse.search(query, { limit: 10 });

  return results.map((result) => ({
    id: result.item.id,
    title: result.item.title,
    titleArabic: result.item.titleArabic,
    arabic: result.item.arabic,
    translation: (result.item[translationKey] as string) || result.item.english || '',
    language,
    reference: result.item.reference,
    category: result.item.category,
    score: result.score,
  }));
}

// ─── 4. getDailyFeed ────────────────────────────────────────────────────────

const REMINDERS: string[] = [
  'Remember: With hardship comes ease. (Quran 94:6)',
  'The best among you are those who have the best manners. (Sahih Bukhari)',
  'Allah does not burden a soul beyond that it can bear. (Quran 2:286)',
  'Seek knowledge from the cradle to the grave.',
  'The strongest among you is the one who controls his anger. (Sahih Bukhari)',
  'A kind word is a form of charity. (Sahih Muslim)',
  'Whoever believes in Allah and the Last Day, let him speak good or remain silent. (Sahih Bukhari)',
  'Verily, in the remembrance of Allah do hearts find rest. (Quran 13:28)',
  'The world is a prison for the believer and a paradise for the disbeliever. (Sahih Muslim)',
  'Be in this world as though you were a stranger or a traveler. (Sahih Bukhari)',
  'None of you truly believes until he loves for his brother what he loves for himself. (Sahih Bukhari)',
  'The most beloved deed to Allah is the most regular and constant, even if it is small. (Sahih Bukhari)',
  'Patience is the key to relief. (Sahih Muslim)',
  'Whoever is grateful, truly his gratitude is for himself. (Quran 31:12)',
  'Make things easy and do not make them difficult. (Sahih Bukhari)',
];

export function getDailyFeed(): DailyFeed {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Collect all Quran verses
  const allVerses: QuranVerse[] = [];
  for (const chapterKey of Object.keys(quranData)) {
    const chapterVerses = (quranData as Record<string, QuranVerse[]>)[chapterKey];
    if (Array.isArray(chapterVerses)) {
      allVerses.push(...chapterVerses);
    }
  }

  // Collect all hadiths
  const hadithFiles: HadithFile[] = [bukhariData as unknown as HadithFile, muslimData as unknown as HadithFile];
  const allHadiths: (Hadith & { bookName: string; chapterName: string })[] = [];
  for (const file of hadithFiles) {
    const bookName = file.metadata?.english?.title || 'Unknown';
    const chaptersMap = new Map<number, string>();
    for (const chapter of file.chapters || []) {
      chaptersMap.set(chapter.id, chapter.english || '');
    }
    for (const hadith of file.hadiths || []) {
      allHadiths.push({
        ...hadith,
        bookName,
        chapterName: chaptersMap.get(hadith.chapterId) || '',
      });
    }
  }

  // Collect all duas
  const allDuas: Dua[] = duasData.duas || [];

  // Seeded selection using day of year
  const verseIdx = dayOfYear % Math.max(allVerses.length, 1);
  const hadithIdx = dayOfYear % Math.max(allHadiths.length, 1);
  const duaIdx = dayOfYear % Math.max(allDuas.length, 1);
  const reminderIdx = dayOfYear % REMINDERS.length;

  const selectedVerse = allVerses[verseIdx];
  const selectedHadith = allHadiths[hadithIdx];
  const selectedDua = allDuas[duaIdx];

  return {
    verse: {
      text: selectedVerse?.text || '',
      translation: selectedVerse?.EnglishTarjuma || '',
      reference: selectedVerse
        ? `Quran ${selectedVerse.chapter}:${selectedVerse.verse}`
        : '',
    },
    hadith: {
      text: selectedHadith?.english?.text || '',
      narrator: selectedHadith?.english?.narrator || '',
      reference: selectedHadith
        ? `${selectedHadith.bookName}, Hadith #${selectedHadith.id}`
        : '',
    },
    dua: {
      arabic: selectedDua?.arabic || '',
      translation: selectedDua?.english || '',
      reference: selectedDua?.reference || '',
    },
    reminder: REMINDERS[reminderIdx],
  };
}

// ─── 5. getQuranVerse ───────────────────────────────────────────────────────

export interface QuranVerseDetail {
  chapter: number;
  verse: number;
  text: string;
  translations: {
    english: string;
    hindi: string;
    urdu: string;
    bengali: string;
    romanUrdu: string;
  };
  reference: string;
}

export function getQuranVerse(chapter: number, verse: number): QuranVerseDetail | null {
  const chapterVerses = (quranData as Record<string, QuranVerse[]>)[String(chapter)];
  if (!chapterVerses) return null;

  const found = chapterVerses.find((v) => v.verse === verse);
  if (!found) return null;

  return {
    chapter: found.chapter,
    verse: found.verse,
    text: found.text,
    translations: {
      english: found.EnglishTarjuma || '',
      hindi: found.HindiTarjuma || '',
      urdu: found.UrduTarjuma || '',
      bengali: found.BengaliTarjuma || '',
      romanUrdu: found.RomanUrduTarjuma || '',
    },
    reference: `Quran ${found.chapter}:${found.verse}`,
  };
}

// ─── 6. getHadithById ───────────────────────────────────────────────────────

export interface HadithDetail {
  id: number;
  idInBook: number;
  bookName: string;
  chapterName: string;
  arabic: string;
  translations: {
    english: HadithTranslation;
    hindi: HadithTranslation;
    urdu: HadithTranslation;
    bengali: HadithTranslation;
  };
  reference: string;
}

export function getHadithById(bookName: string, id: number): HadithDetail | null {
  const hadithFiles: HadithFile[] = [bukhariData as unknown as HadithFile, muslimData as unknown as HadithFile];

  for (const file of hadithFiles) {
    const currentBookName = file.metadata?.english?.title || '';
    // Match by book name (case-insensitive partial match)
    if (!currentBookName.toLowerCase().includes(bookName.toLowerCase())) continue;

    const chaptersMap = new Map<number, string>();
    for (const chapter of file.chapters || []) {
      chaptersMap.set(chapter.id, chapter.english || '');
    }

    const hadith = file.hadiths?.find((h) => h.id === id);
    if (!hadith) continue;

    return {
      id: hadith.id,
      idInBook: hadith.idInBook,
      bookName: currentBookName,
      chapterName: chaptersMap.get(hadith.chapterId) || '',
      arabic: hadith.arabic || '',
      translations: {
        english: hadith.english || { narrator: '', text: '' },
        hindi: hadith.Hindi || { narrator: '', text: '' },
        urdu: hadith.Urdu || { narrator: '', text: '' },
        bengali: hadith.Bengali || { narrator: '', text: '' },
      },
      reference: `${currentBookName}, Hadith #${hadith.id}`,
    };
  }

  return null;
}
