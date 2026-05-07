import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: 'Hidayah AI',
    version: '1.0.0',
    description: 'AI-powered Islamic guidance platform',
    endpoints: {
      chat: '/api/chat/ask',
      quranSearch: '/api/quran/search',
      hadithSearch: '/api/hadith/search',
      duasSearch: '/api/duas/search',
      bookmarks: '/api/bookmarks',
      dailyFeed: '/api/daily-feed',
      chatHistory: '/api/chat/history',
    },
  });
}
