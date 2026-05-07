import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

type QuranData = Record<string, QuranVerse[]>;

interface HadithData {
  hadiths: Array<{
    id: number;
    arabic: string;
    english?: { narrator: string; text: string };
  }>;
  metadata: {
    english: { title: string };
  };
}

interface DuasData {
  duas: Array<{
    id: number;
    title: string;
    arabic: string;
    english: string;
    reference: string;
    category: string;
  }>;
}

let cachedData: {
  quran: QuranData | null;
  hadiths: HadithData[];
  duas: DuasData | null;
} = {
  quran: null,
  hadiths: [],
  duas: null,
};

function loadData() {
  if (cachedData.quran && cachedData.duas) return;

  try {
    const quranPath = path.join(process.cwd(), 'src/data/quran/quran.json');
    if (fs.existsSync(quranPath)) {
      cachedData.quran = JSON.parse(fs.readFileSync(quranPath, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading Quran data:', e);
  }

  try {
    const hadithDir = path.join(process.cwd(), 'src/data/hadith');
    if (fs.existsSync(hadithDir)) {
      const files = fs.readdirSync(hadithDir).filter((f) => f.endsWith('.json'));
      for (const file of files) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(hadithDir, file), 'utf-8'));
          cachedData.hadiths.push(data);
        } catch {}
      }
    }
  } catch (e) {
    console.error('Error loading Hadith data:', e);
  }

  try {
    const duasPath = path.join(process.cwd(), 'src/data/duas/duas.json');
    if (fs.existsSync(duasPath)) {
      cachedData.duas = JSON.parse(fs.readFileSync(duasPath, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading Duas data:', e);
  }
}

const reminders = [
  "Remember to say Bismillah before every action today.",
  "Try to pray all five daily prayers on time today.",
  "Send salawat (Durood) upon the Prophet Muhammad (ﷺ) today.",
  "Give charity, even if it's just a smile.",
  "Recite Surah Al-Kahf on this blessed day.",
  "Make dua for your parents and loved ones today.",
  "Practice gratitude — thank Allah for three blessings today.",
  "Seek forgiveness (Istighfar) at least 100 times today.",
  "Read at least one page of the Quran today.",
  "Be extra kind to your neighbors today.",
  "Control your anger and respond with patience today.",
  "Help someone in need, even in a small way.",
  "Reflect on the beauty of Allah's creation around you.",
  "Make time for Dhikr — SubhanAllah, Alhamdulillah, Allahu Akbar.",
  "Forgive someone who has wronged you, for Allah loves those who forgive.",
];

export async function GET() {
  try {
    loadData();

    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor(
      (now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Pick verse of the day
    let verse = { text: '', translation: '', reference: '1:1' };
    if (cachedData.quran) {
      const allVerses: Array<QuranVerse & { ref: string }> = [];
      for (const key of Object.keys(cachedData.quran)) {
        for (const v of cachedData.quran[key]) {
          allVerses.push({ ...v, ref: `${v.chapter}:${v.verse}` });
        }
      }
      if (allVerses.length > 0) {
        const selected = allVerses[dayOfYear % allVerses.length];
        verse = {
          text: selected.text,
          translation: selected.EnglishTarjuma,
          reference: selected.ref,
        };
      }
    }

    // Pick hadith of the day
    let hadith = { text: '', narrator: '', reference: '', book: '' };
    const allHadiths: Array<{
      text: string;
      narrator: string;
      reference: string;
      book: string;
    }> = [];
    for (const hd of cachedData.hadiths) {
      const bookName = hd.metadata?.english?.title || '';
      for (const h of hd.hadiths || []) {
        allHadiths.push({
          text: h.english?.text || '',
          narrator: h.english?.narrator || '',
          reference: `${bookName} #${h.id}`,
          book: bookName,
        });
      }
    }
    if (allHadiths.length > 0) {
      const selected = allHadiths[dayOfYear % allHadiths.length];
      hadith = selected;
    }

    // Pick dua of the day
    let dua = { arabic: '', translation: '', reference: '' };
    if (cachedData.duas && cachedData.duas.duas.length > 0) {
      const selected = cachedData.duas.duas[dayOfYear % cachedData.duas.duas.length];
      dua = {
        arabic: selected.arabic,
        translation: selected.english,
        reference: selected.reference,
      };
    }

    // Pick reminder of the day
    const reminder = reminders[dayOfYear % reminders.length];

    return NextResponse.json({
      verse,
      hadith,
      dua,
      reminder,
    });
  } catch (error) {
    console.error('Daily feed error:', error);
    return NextResponse.json({ error: 'Failed to get daily feed' }, { status: 500 });
  }
}
