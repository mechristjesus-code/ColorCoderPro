import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { surveyResponses } from '@/db/schemas/survey';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { answers, sessionId, primaryColorGroup, emotionalTone, lightnessPref, saturationPref, palette } = body;

    if (!answers || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [inserted] = await db.insert(surveyResponses).values({
      sessionId,
      answers,
      primaryColorGroup,
      emotionalTone,
      lightnessPref,
      saturationPref,
      palette: palette ?? [],
    }).returning({ id: surveyResponses.id });

    return NextResponse.json({ success: true, id: inserted.id });
  } catch (err) {
    console.error('Survey save error:', err);
    return NextResponse.json({ error: 'Failed to save response' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const responses = await db.select({
      id: surveyResponses.id,
      primaryColorGroup: surveyResponses.primaryColorGroup,
      emotionalTone: surveyResponses.emotionalTone,
      lightnessPref: surveyResponses.lightnessPref,
      saturationPref: surveyResponses.saturationPref,
      createdAt: surveyResponses.createdAt,
    }).from(surveyResponses);

    return NextResponse.json({ count: responses.length, responses });
  } catch (err) {
    console.error('Survey fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
  }
}
