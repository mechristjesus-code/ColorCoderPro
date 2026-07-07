import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { posts } from '@/db/schemas/posts';
import { eq, desc, and, sql } from 'drizzle-orm';
import { detectMediaType, extractYouTubeId, getYouTubeThumbnail } from '@/lib/posts';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const typeFilter    = searchParams.get('type');
    const groupFilter   = searchParams.get('group');
    const emotionFilter = searchParams.get('emotion');
    const limitParam    = parseInt(searchParams.get('limit') ?? '20');
    const offsetParam   = parseInt(searchParams.get('offset') ?? '0');
    const limit  = Math.min(Math.max(1, limitParam),  50);
    const offset = Math.max(0, offsetParam);

    const conditions = [];
    if (typeFilter)    conditions.push(eq(posts.postType,     typeFilter));
    if (groupFilter)   conditions.push(eq(posts.colorGroupId, groupFilter));
    if (emotionFilter) conditions.push(
      sql`${posts.emotionTags} @> ${JSON.stringify([emotionFilter])}::jsonb`
    );

    const rows = await db
      .select()
      .from(posts)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ count: rows.length, posts: rows });
  } catch (err) {
    console.error('GET /api/posts error:', err);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId, displayName, postType, visibility,
      colorGroupId, colorHex, emotionTags,
      title, content, mediaUrl,
    } = body;

    if (!sessionId || !postType) {
      return NextResponse.json({ error: 'sessionId and postType required' }, { status: 400 });
    }

    // Auto-detect media type and thumbnail
    const mediaType    = mediaUrl ? detectMediaType(mediaUrl) : null;
    let thumbnailUrl: string | null = null;
    if (mediaType === 'youtube') {
      const vid = extractYouTubeId(mediaUrl);
      if (vid) thumbnailUrl = getYouTubeThumbnail(vid);
    }

    const [inserted] = await db.insert(posts).values({
      sessionId,
      displayName: displayName || null,
      postType,
      visibility: visibility || 'public',
      colorGroupId: colorGroupId || null,
      colorHex:     colorHex    || null,
      emotionTags:  emotionTags || [],
      title:        title   || null,
      content:      content || null,
      mediaUrl:     mediaUrl || null,
      mediaType:    mediaType || null,
      thumbnailUrl: thumbnailUrl || null,
    }).returning();

    return NextResponse.json({ success: true, post: inserted });
  } catch (err) {
    console.error('POST /api/posts error:', err);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
