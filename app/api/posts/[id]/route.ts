import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { posts, postReactions } from '@/db/schemas/posts';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Fetch reaction counts
    const reactions = await db
      .select({ reaction: postReactions.reaction, count: sql<number>`count(*)::int` })
      .from(postReactions)
      .where(eq(postReactions.postId, id))
      .groupBy(postReactions.reaction);

    return NextResponse.json({ post, reactions });
  } catch (err) {
    console.error('GET /api/posts/[id] error:', err);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { sessionId, reaction } = await req.json();

    if (!sessionId || !reaction) {
      return NextResponse.json({ error: 'sessionId and reaction required' }, { status: 400 });
    }

    const valid = ['resonate', 'moving', 'powerful', 'peaceful'];
    if (!valid.includes(reaction)) {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 });
    }

    // Upsert: one reaction per session per post (toggle off if same)
    const [existing] = await db
      .select()
      .from(postReactions)
      .where(and(eq(postReactions.postId, id), eq(postReactions.sessionId, sessionId)));

    if (existing) {
      if (existing.reaction === reaction) {
        // Same reaction → remove (toggle off)
        await db.delete(postReactions).where(eq(postReactions.id, existing.id));
        return NextResponse.json({ success: true, action: 'removed' });
      }
      // Different reaction → update
      await db.update(postReactions)
        .set({ reaction })
        .where(eq(postReactions.id, existing.id));
    } else {
      await db.insert(postReactions).values({ postId: id, sessionId, reaction });
    }

    return NextResponse.json({ success: true, action: 'saved' });
  } catch (err) {
    console.error('POST /api/posts/[id] react error:', err);
    return NextResponse.json({ error: 'Failed to save reaction' }, { status: 500 });
  }
}
