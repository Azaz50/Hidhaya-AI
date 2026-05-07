import { NextRequest, NextResponse } from 'next/server';
import Fuse from 'fuse.js';
import fs from 'fs';
import path from 'path';

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

interface DuasData {
  duas: Dua[];
}

const languageFieldMap: Record<string, keyof Dua> = {
  English: 'english',
  Hindi: 'hindi',
  Urdu: 'urdu',
  Bengali: 'bengali',
};

let cachedDuas: DuasData | null = null;

function getDuasData(): DuasData {
  if (cachedDuas) return cachedDuas;
  const filePath = path.join(process.cwd(), 'src/data/duas/duas.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  cachedDuas = JSON.parse(raw);
  return cachedDuas!;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const language = searchParams.get('language') || 'English';

    if (!query.trim()) {
      return NextResponse.json({ results: [] });
    }

    const data = getDuasData();
    const translationField = languageFieldMap[language] || 'english';

    const fuse = new Fuse(data.duas, {
      keys: [
        { name: 'arabic', weight: 0.2 },
        { name: translationField, weight: 0.4 },
        { name: 'title', weight: 0.2 },
        { name: 'category', weight: 0.2 },
      ],
      threshold: 0.4,
      includeScore: true,
      ignoreLocation: true,
    });

    const fuseResults = fuse.search(query);
    const results = fuseResults.slice(0, 10).map((r) => ({
      id: r.item.id,
      title: r.item.title,
      titleArabic: r.item.titleArabic,
      arabic: r.item.arabic,
      translation: r.item[translationField] as string,
      reference: r.item.reference,
      category: r.item.category,
    }));

    // Fallback keyword search
    if (results.length === 0) {
      const lowerQuery = query.toLowerCase();
      const fallback = data.duas.filter(
        (d) =>
          d.arabic.includes(query) ||
          d.english.toLowerCase().includes(lowerQuery) ||
          d.title.toLowerCase().includes(lowerQuery) ||
          d.category.toLowerCase().includes(lowerQuery)
      );
      fallback.slice(0, 10).forEach((d) => {
        results.push({
          id: d.id,
          title: d.title,
          titleArabic: d.titleArabic,
          arabic: d.arabic,
          translation: d[translationField] as string,
          reference: d.reference,
          category: d.category,
        });
      });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Duas search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
