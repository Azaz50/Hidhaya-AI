import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import Fuse from 'fuse.js';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

// ── Types ────────────────────────────────────────────────────────────────────

interface QuranVerse {
  chapter: number;
  verse: number;
  text: string;
  EnglishTarjuma?: string;
  HindiTarjuma?: string;
  UrduTarjuma?: string;
  BengaliTarjuma?: string;
  RomanUrduTarjuma?: string;
}

interface HadithEntry {
  id: number;
  idInBook: number;
  chapterId: number;
  bookId: number;
  arabic: string;
  english?: { narrator: string; text: string };
  Hindi?: { narrator: string; text: string };
  Urdu?: { narrator: string; text: string };
  Bengali?: { narrator: string; text: string };
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
  hadiths: HadithEntry[];
}

interface DuaEntry {
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

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface QuranRef {
  chapter: number;
  verse: number;
  text: string;
  translation: string;
}

interface HadithRef {
  id: number;
  book: string;
  text: string;
  narrator: string;
}

interface DuaRef {
  title: string;
  arabic: string;
  translation: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Map user-facing language name to the JSON field key used in translations */
function getTranslationKey(language: string): string {
  const map: Record<string, string> = {
    English: 'EnglishTarjuma',
    Hindi: 'HindiTarjuma',
    Urdu: 'UrduTarjuma',
    Bengali: 'BengaliTarjuma',
    RomanUrdu: 'RomanUrduTarjuma',
  };
  return map[language] || 'EnglishTarjuma';
}

function getHadithTranslationField(language: string): 'english' | 'Hindi' | 'Urdu' | 'Bengali' {
  const map: Record<string, 'english' | 'Hindi' | 'Urdu' | 'Bengali'> = {
    English: 'english',
    Hindi: 'Hindi',
    Urdu: 'Urdu',
    Bengali: 'Bengali',
  };
  return map[language] || 'english';
}

function getDuaTranslationField(language: string): 'english' | 'hindi' | 'urdu' | 'bengali' {
  const map: Record<string, 'english' | 'hindi' | 'urdu' | 'bengali'> = {
    English: 'english',
    Hindi: 'hindi',
    Urdu: 'urdu',
    Bengali: 'bengali',
  };
  return map[language] || 'english';
}

// ── Data loading (cached per process) ────────────────────────────────────────

let quranCache: QuranVerse[] | null = null;
let hadithCache: { book: string; hadiths: HadithEntry[] }[] | null = null;
let duaCache: DuaEntry[] | null = null;

function loadQuranData(): QuranVerse[] {
  if (quranCache) return quranCache;

  const filePath = path.join(process.cwd(), 'src/data/quran/quran.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const chapters: Record<string, QuranVerse[]> = JSON.parse(raw);

  const all: QuranVerse[] = [];
  for (const verses of Object.values(chapters)) {
    all.push(...verses);
  }
  quranCache = all;
  return all;
}

function loadHadithData(): { book: string; hadiths: HadithEntry[] }[] {
  if (hadithCache) return hadithCache;

  const dir = path.join(process.cwd(), 'src/data/hadith');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));

  const result: { book: string; hadiths: HadithEntry[] }[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    const data: HadithFile = JSON.parse(raw);
    result.push({
      book: data.metadata.english.title,
      hadiths: data.hadiths,
    });
  }
  hadithCache = result;
  return result;
}

function loadDuaData(): DuaEntry[] {
  if (duaCache) return duaCache;

  const filePath = path.join(process.cwd(), 'src/data/duas/duas.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data: { duas: DuaEntry[] } = JSON.parse(raw);
  duaCache = data.duas;
  return data.duas;
}

// ── Search helpers ───────────────────────────────────────────────────────────

function searchQuran(question: string, language: string): QuranRef[] {
  const allVerses = loadQuranData();
  const translationKey = getTranslationKey(language);

  // Fuse.js fuzzy search with ignoreLocation for whole-text matching
  const fuse = new Fuse(allVerses, {
    keys: [
      { name: translationKey, weight: 0.6 },
      { name: 'text', weight: 0.2 },
      { name: 'EnglishTarjuma', weight: 0.2 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
    includeScore: true,
  });

  let results = fuse.search(question, { limit: 5 });

  // Fallback: keyword-based search if fuse returns nothing
  if (results.length === 0) {
    const keywords = question.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const keywordMatches = allVerses.filter((v) => {
      const trans = ((v as Record<string, unknown>)[translationKey] as string) || v.EnglishTarjuma || '';
      return keywords.some((kw) => trans.toLowerCase().includes(kw));
    });
    results = keywordMatches.slice(0, 5).map((item) => ({ item, score: 0.5 }));
  }

  return results.map((r) => ({
    chapter: r.item.chapter,
    verse: r.item.verse,
    text: r.item.text,
    translation: (r.item as Record<string, unknown>)[translationKey] as string || r.item.EnglishTarjuma || '',
  }));
}

function searchHadith(question: string, language: string): HadithRef[] {
  const hadithBooks = loadHadithData();
  const translationField = getHadithTranslationField(language);
  const refs: HadithRef[] = [];

  for (const { book, hadiths } of hadithBooks) {
    // Build a searchable list with a combined text field
    const searchable = hadiths.map((h) => ({
      ...h,
      searchableText: `${h.english?.text || ''} ${h.Hindi?.text || ''} ${h.Urdu?.text || ''} ${h.Bengali?.text || ''}`,
    }));

    const fuse = new Fuse(searchable, {
      keys: [
        { name: 'searchableText', weight: 0.7 },
        { name: 'arabic', weight: 0.3 },
      ],
      threshold: 0.4,
      ignoreLocation: true,
      includeScore: true,
    });

    let results = fuse.search(question, { limit: 3 });

    // Fallback: keyword-based search
    if (results.length === 0) {
      const keywords = question.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
      const keywordMatches = searchable.filter((h) =>
        keywords.some((kw) => h.searchableText.toLowerCase().includes(kw))
      );
      results = keywordMatches.slice(0, 3).map((item) => ({ item, score: 0.5 }));
    }

    for (const r of results) {
      const t = r.item[translationField] || r.item.english;
      refs.push({
        id: r.item.id,
        book,
        text: t?.text || '',
        narrator: t?.narrator || '',
      });
    }
  }

  return refs;
}

function searchDuas(question: string, language: string): DuaRef[] {
  const allDuas = loadDuaData();
  const translationField = getDuaTranslationField(language);

  const fuse = new Fuse(allDuas, {
    keys: [
      { name: 'english', weight: 0.4 },
      { name: 'title', weight: 0.3 },
      { name: 'category', weight: 0.2 },
      { name: 'arabic', weight: 0.1 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
    includeScore: true,
  });

  let results = fuse.search(question, { limit: 3 });

  // Fallback: keyword-based search
  if (results.length === 0) {
    const keywords = question.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const keywordMatches = allDuas.filter((d) =>
      keywords.some(
        (kw) =>
          d.english.toLowerCase().includes(kw) ||
          d.title.toLowerCase().includes(kw) ||
          d.category.toLowerCase().includes(kw)
      )
    );
    results = keywordMatches.slice(0, 3).map((item) => ({ item, score: 0.5 }));
  }

  return results.map((r) => ({
    title: r.item.title,
    arabic: r.item.arabic,
    translation: r.item[translationField] || r.item.english,
  }));
}

// ── System prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(language: string, mode: string): string {
  const modeInstruction =
    mode === 'beginner'
      ? 'Use very simple language and avoid scholarly terms.'
      : mode === 'kids'
        ? 'Use child-friendly language, short sentences, and encouraging tone.'
        : '';

  return `You are an Islamic AI assistant named Hidayah AI.

RULES:
- Answer ONLY using the provided Quran verses and authentic Hadith references.
- NEVER create your own Islamic rulings or fatwas.
- If information is insufficient, say: "Please consult a qualified Islamic scholar for this matter."
- Explain in simple and respectful language.
- ALWAYS provide source references (Quran chapter:verse, Hadith book and number).
- Structure your response clearly with sections: Quran References, Hadith References, Simple Explanation, Practical Tips.
- Use the language specified by the user for your response. The user's language is: ${language}.
- ${modeInstruction}

You must strictly follow these rules in every response.`;
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      question,
      language = 'English',
      mode = 'standard',
      chatHistory = [],
    }: {
      question?: string;
      language?: string;
      mode?: string;
      chatHistory?: ChatMessage[];
    } = body;

    // Validate required fields
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'A valid question is required.' },
        { status: 400 }
      );
    }

    // 1. Search Quran data
    const quranReferences = searchQuran(question, language);

    // 2. Search Hadith data
    const hadithReferences = searchHadith(question, language);

    // 3. Search Duas
    const duaReferences = searchDuas(question, language);

    // 4. Build context for LLM
    let contextBlock = '';
    if (quranReferences.length > 0) {
      contextBlock += '--- QURAN VERSES ---\n';
      for (const ref of quranReferences) {
        contextBlock += `Quran ${ref.chapter}:${ref.verse}\nArabic: ${ref.text}\nTranslation: ${ref.translation}\n\n`;
      }
    }

    if (hadithReferences.length > 0) {
      contextBlock += '--- HADITH REFERENCES ---\n';
      for (const ref of hadithReferences) {
        contextBlock += `${ref.book}, Hadith #${ref.id}\nNarrator: ${ref.narrator}\nText: ${ref.text}\n\n`;
      }
    }

    if (duaReferences.length > 0) {
      contextBlock += '--- DUAS ---\n';
      for (const ref of duaReferences) {
        contextBlock += `${ref.title}\nArabic: ${ref.arabic}\nTranslation: ${ref.translation}\n\n`;
      }
    }

    if (!contextBlock) {
      contextBlock = 'No specific Quran verses, Hadith, or Duas were found matching the query. Please answer generally but still follow the rules about not creating fatwas.';
    }

    // 5. Build messages for LLM
    const systemPrompt = buildSystemPrompt(language, mode);

    const messages: Array<{ role: 'assistant' | 'user'; content: string }> = [
      { role: 'assistant', content: systemPrompt },
      // Include chat history for context
      ...chatHistory.map((msg: ChatMessage) => ({
        role: msg.role as 'assistant' | 'user',
        content: msg.content,
      })),
      // Final user message with context
      {
        role: 'user',
        content: `Based on the following Islamic references, please answer my question.

REFERENCES:
${contextBlock}

MY QUESTION: ${question}`,
      },
    ];

    // 6. Call LLM
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: 'disabled' },
    });

    const answer =
      completion.choices?.[0]?.message?.content ||
      'I apologize, but I was unable to generate a response. Please try again.';

    // 7. Save chat to database
    try {
      await db.chat.create({
        data: {
          question,
          answer,
          language,
          mode,
        },
      });
    } catch (dbError) {
      // Log but don't fail the request if DB save fails
      console.error('Failed to save chat to database:', dbError);
    }

    // 8. Return response
    return NextResponse.json({
      answer,
      quranReferences,
      hadithReferences,
      duaReferences,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request.' },
      { status: 500 }
    );
  }
}
