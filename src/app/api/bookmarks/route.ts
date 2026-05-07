import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const bookmarks = await db.bookmark.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({
      bookmarks: bookmarks.map((b) => ({
        ...b,
        metadata: b.metadata ? JSON.parse(b.metadata) : null,
      })),
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, reference, content, metadata } = body;

    if (!type || !reference || !content) {
      return NextResponse.json(
        { error: 'type, reference, and content are required' },
        { status: 400 }
      );
    }

    const bookmark = await db.bookmark.create({
      data: {
        type,
        reference,
        content,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return NextResponse.json({
      bookmark: {
        ...bookmark,
        metadata: bookmark.metadata ? JSON.parse(bookmark.metadata) : null,
      },
    });
  } catch (error) {
    console.error('Create bookmark error:', error);
    return NextResponse.json({ error: 'Failed to create bookmark' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await db.bookmark.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete bookmark error:', error);
    return NextResponse.json({ error: 'Failed to delete bookmark' }, { status: 500 });
  }
}
