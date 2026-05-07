import { NextRequest, NextResponse } from 'next/server';
import Fuse from 'fuse.js';
import fs from 'fs';
import path from 'path';

interface HadithData {
  id: number;
  metadata: {
    id: number;
    english: { title: string; author: string };
    arabic: { title: string; author: string };
  };
  chapters: Array<{ id: number; bookId: number; english: string; arabic: string }>;
  hadiths: Array<{
    id: number;
    idInBook: number;
    chapterId: number;
    bookId: number;
    arabic: string;
    english?: { narrator: string; text: string };
    Hindi?: { narrator: string; text: string };
    Urdu?: { narrator: string; text: string };
    Bengali?: { narrator: string; text: string };
  }>;
}

type LangKey = 'english' | 'Hindi' | 'Urdu' | 'Bengali';

interface FlatHadith {
  id: number;
  bookName: string;
  chapterName: string;
  arabic: string;
  text: string;
  narrator: string;
  reference: string;
  /** Cached translations for all languages, keyed by language key */
  translations: Partial<Record<LangKey, { text: string; narrator: string }>>;
}

const languageKeyMap: Record<string, LangKey> = {
  English: 'english',
  Hindi: 'Hindi',
  Urdu: 'Urdu',
  Bengali: 'Bengali',
};

let cachedHadithFiles: FlatHadith[] | null = null;

function getHadithData(): FlatHadith[] {
  if (cachedHadithFiles) return cachedHadithFiles;

  const hadithDir = path.join(process.cwd(), 'src/data/hadith');
  const allHadiths: FlatHadith[] = [];

  if (!fs.existsSync(hadithDir)) {
    return allHadiths;
  }

  const files = fs.readdirSync(hadithDir).filter((f) => f.endsWith('.json'));

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(hadithDir, file), 'utf-8');
      const data: HadithData = JSON.parse(raw);
      const bookName = data.metadata?.english?.title || file.replace('.json', '');
      const chapterMap = new Map(data.chapters?.map((c) => [c.id, c.english] as const) || []);

      for (const h of data.hadiths || []) {
        const chapterName = chapterMap.get(h.chapterId) || '';

        // Build translations cache with all available languages
        const translations: FlatHadith['translations'] = {};

        if (h.english) {
          translations.english = { text: h.english.text || '', narrator: h.english.narrator || '' };
        }
        if (h.Hindi) {
          translations.Hindi = { text: h.Hindi.text || '', narrator: h.Hindi.narrator || '' };
        }
        if (h.Urdu) {
          translations.Urdu = { text: h.Urdu.text || '', narrator: h.Urdu.narrator || '' };
        }
        if (h.Bengali) {
          translations.Bengali = { text: h.Bengali.text || '', narrator: h.Bengali.narrator || '' };
        }

        allHadiths.push({
          id: h.id,
          bookName,
          chapterName,
          arabic: h.arabic || '',
          text: h.english?.text || '',
          narrator: h.english?.narrator || '',
          reference: `${bookName} #${h.idInBook || h.id}`,
          translations,
        });
      }
    } catch (e) {
      console.error(`Error reading hadith file ${file}:`, e);
    }
  }

  cachedHadithFiles = allHadiths;
  return allHadiths;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const language = searchParams.get('language') || 'English';

    if (!query.trim()) {
      return NextResponse.json({ results: [] });
    }

    const allHadiths = getHadithData();
    const langKey = languageKeyMap[language] || 'english';

    // Build searchable items using cached language data — no disk re-reading
    const searchItems = allHadiths.map((h) => {
      const langTranslation = h.translations[langKey];
      const langText = langTranslation?.text || h.text;
      const langNarrator = langTranslation?.narrator || h.narrator;

      return { ...h, langText, langNarrator };
    });

    const fuse = new Fuse(searchItems, {
      keys: [
        { name: 'arabic', weight: 0.2 },
        { name: 'text', weight: 0.3 },
        { name: 'langText', weight: 0.3 },
        { name: 'narrator', weight: 0.1 },
        { name: 'chapterName', weight: 0.1 },
      ],
      threshold: 0.4,
      includeScore: true,
      ignoreLocation: true,
    });

    const fuseResults = fuse.search(query);
    const results = fuseResults.slice(0, 10).map((r) => ({
      id: r.item.id,
      bookName: r.item.bookName,
      chapterName: r.item.chapterName,
      arabic: r.item.arabic,
      text: r.item.langText || r.item.text,
      narrator: r.item.langNarrator || r.item.narrator,
      reference: r.item.reference,
    }));

    // Fallback keyword search using cached language data
    if (results.length === 0) {
      const lowerQuery = query.toLowerCase();
      const fallback = allHadiths.filter((h) => {
        const langTranslation = h.translations[langKey];
        const langText = langTranslation?.text || h.text;
        return (
          h.arabic.includes(query) ||
          h.text.toLowerCase().includes(lowerQuery) ||
          langText.toLowerCase().includes(lowerQuery) ||
          h.chapterName.toLowerCase().includes(lowerQuery)
        );
      });
      fallback.slice(0, 10).forEach((h) => {
        const langTranslation = h.translations[langKey];
        results.push({
          id: h.id,
          bookName: h.bookName,
          chapterName: h.chapterName,
          arabic: h.arabic,
          text: langTranslation?.text || h.text,
          narrator: langTranslation?.narrator || h.narrator,
          reference: h.reference,
        });
      });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Hadith search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
