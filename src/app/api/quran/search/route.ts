import { NextRequest, NextResponse } from 'next/server';
import Fuse from 'fuse.js';
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

const languageFieldMap: Record<string, keyof QuranVerse> = {
  English: 'EnglishTarjuma',
  Hindi: 'HindiTarjuma',
  Urdu: 'UrduTarjuma',
  Bengali: 'BengaliTarjuma',
  'Roman Urdu': 'RomanUrduTarjuma',
};

let cachedQuranData: QuranData | null = null;

function getQuranData(): QuranData {
  if (cachedQuranData) return cachedQuranData;
  const filePath = path.join(process.cwd(), 'src/data/quran/quran.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  cachedQuranData = JSON.parse(raw);
  return cachedQuranData!;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const language = searchParams.get('language') || 'English';

    if (!query.trim()) {
      return NextResponse.json({ results: [] });
    }

    const quranData = getQuranData();
    const translationField = languageFieldMap[language] || 'EnglishTarjuma';

    // Flatten all verses
    const allVerses: Array<QuranVerse & { reference: string }> = [];
    for (const chapterKey of Object.keys(quranData)) {
      for (const verse of quranData[chapterKey]) {
        allVerses.push({
          ...verse,
          reference: `${verse.chapter}:${verse.verse}`,
        });
      }
    }

    // Search using Fuse.js
    const fuse = new Fuse(allVerses, {
      keys: [
        { name: 'text', weight: 0.4 },
        { name: translationField, weight: 0.6 },
      ],
      threshold: 0.4,
      includeScore: true,
      ignoreLocation: true,
    });

    const fuseResults = fuse.search(query);
    const results = fuseResults.slice(0, 10).map((r) => ({
      chapter: r.item.chapter,
      verse: r.item.verse,
      text: r.item.text,
      translation: r.item[translationField] as string,
      reference: r.item.reference,
    }));

    // Fallback keyword search
    if (results.length === 0) {
      const lowerQuery = query.toLowerCase();
      const keywordResults = allVerses.filter(
        (v) =>
          v.text.includes(query) ||
          (v[translationField] as string).toLowerCase().includes(lowerQuery)
      );
      keywordResults.slice(0, 10).forEach((v) => {
        results.push({
          chapter: v.chapter,
          verse: v.verse,
          text: v.text,
          translation: v[translationField] as string,
          reference: v.reference,
        });
      });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Quran search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
