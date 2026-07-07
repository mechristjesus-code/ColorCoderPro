// GET  /api/admin/files?path=relative/path  → list dir or read file
// POST /api/admin/files                      → write file
// Body for POST: { path: string, content: string }

import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/adminAuth';
import fs from 'fs';
import path from 'path';

const ROOT = '/home/ubuntu/workspace/project';

function safePath(rel: string): string {
  const resolved = path.resolve(ROOT, rel.replace(/^\//, ''));
  if (!resolved.startsWith(ROOT)) throw new Error('Path escape not allowed');
  return resolved;
}

export async function GET(req: NextRequest) {
  const authError = checkAdminAuth(req);
  if (authError) return authError;

  const rel = new URL(req.url).searchParams.get('path') ?? '';

  try {
    const abs = safePath(rel);
    const stat = fs.statSync(abs);

    if (stat.isDirectory()) {
      const entries = fs.readdirSync(abs).map(name => {
        const full = path.join(abs, name);
        const s = fs.statSync(full);
        return {
          name,
          type: s.isDirectory() ? 'dir' : 'file',
          size: s.size,
          modified: s.mtime.toISOString(),
          path: path.relative(ROOT, full),
        };
      }).sort((a, b) => {
        if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      return NextResponse.json({ type: 'dir', path: rel || '/', entries });
    }

    // File — return content (limit 500 KB)
    if (stat.size > 512 * 1024) {
      return NextResponse.json({ error: 'File too large to display (>512 KB)' }, { status: 413 });
    }
    const content = fs.readFileSync(abs, 'utf-8');
    return NextResponse.json({ type: 'file', path: rel, content, size: stat.size });
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ error: e.message ?? 'Not found' }, { status: 404 });
  }
}

export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req);
  if (authError) return authError;

  try {
    const { path: rel, content } = await req.json();
    if (!rel || content === undefined) {
      return NextResponse.json({ error: 'path and content required' }, { status: 400 });
    }
    const abs = safePath(rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, 'utf-8');
    return NextResponse.json({ success: true, path: rel, size: Buffer.byteLength(content) });
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ error: e.message ?? 'Write failed' }, { status: 500 });
  }
}
