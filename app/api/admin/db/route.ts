// POST /api/admin/db
// Runs a raw SQL query against the project database.
// Body: { sql: string, params?: unknown[] }
// Returns: { rows, rowCount, duration, fields }
// READ-ONLY guard: blocks INSERT/UPDATE/DELETE/DROP/TRUNCATE unless force:true

import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/adminAuth';
import postgres from 'postgres';

const WRITE_OPS = /^\s*(INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE|GRANT|REVOKE)\s/i;

export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req);
  if (authError) return authError;

  const url = process.env.DATABASE_URL;
  if (!url) return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 500 });

  try {
    const { sql: rawSql, params = [], force = false } = await req.json();
    if (!rawSql || typeof rawSql !== 'string') {
      return NextResponse.json({ error: 'sql is required' }, { status: 400 });
    }

    if (WRITE_OPS.test(rawSql) && !force) {
      return NextResponse.json({
        error: 'Write operation blocked. Pass force:true to allow.',
        hint: 'Read-only mode is on by default for safety.',
      }, { status: 403 });
    }

    const client = postgres(url, { prepare: false, max: 1 });
    const start = Date.now();

    try {
      const rows = await client.unsafe(rawSql, params as never[]);
      const duration = Date.now() - start;
      await client.end();

      return NextResponse.json({
        rows: Array.from(rows),
        rowCount: rows.length,
        duration,
        sql: rawSql,
      });
    } catch (qErr: unknown) {
      await client.end();
      const e = qErr as { message?: string };
      return NextResponse.json({ error: e.message ?? 'Query failed' }, { status: 400 });
    }
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ error: e.message ?? 'Internal error' }, { status: 500 });
  }
}
