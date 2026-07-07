// Stateful shell session API — designed for Termux scripting & automation
//
// POST /api/admin/shell  { action: 'create' }
//   → { sessionId, created, expires, cwd }
//
// POST /api/admin/shell  { action: 'exec', sessionId, command }
//   → { sessionId, stdout, stderr, exitCode, duration, cwd }
//
// POST /api/admin/shell  { action: 'cd', sessionId, path }
//   → { sessionId, cwd }
//
// POST /api/admin/shell  { action: 'destroy', sessionId }
//   → { success }
//
// GET  /api/admin/shell?sessionId=xxx
//   → { sessionId, cwd, history (last 20), created, expires }
//
// Sessions expire after 30 minutes of inactivity.
// Termux usage example:
//   SID=$(curl -s -X POST https://your-app.com/api/admin/shell \
//     -H "x-admin-password: ColorAdmin144" \
//     -H "Content-Type: application/json" \
//     -d '{"action":"create"}' | jq -r .sessionId)
//   curl -s -X POST https://your-app.com/api/admin/shell \
//     -H "x-admin-password: ColorAdmin144" \
//     -H "Content-Type: application/json" \
//     -d "{\"action\":\"exec\",\"sessionId\":\"$SID\",\"command\":\"git status\"}"

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { checkAdminAuth } from '@/lib/adminAuth';

const execAsync = promisify(exec);
const PROJECT_ROOT = '/home/ubuntu/workspace/project';
const SESSION_TTL  = 30 * 60 * 1000; // 30 minutes
const BLOCKED = ['rm -rf /', 'mkfs', ':(){:|:&};:'];

// In-memory session store (resets on server restart — intentional)
interface Session {
  id: string;
  cwd: string;
  created: number;
  lastActive: number;
  history: { cmd: string; exitCode: number; ts: number }[];
}
const sessions = new Map<string, Session>();

function newSessionId() {
  return `sh_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function pruneExpired() {
  const now = Date.now();
  for (const [id, s] of sessions) {
    if (now - s.lastActive > SESSION_TTL) sessions.delete(id);
  }
}

function sessionInfo(s: Session) {
  return {
    sessionId: s.id,
    cwd:       s.cwd,
    created:   s.created,
    expires:   s.lastActive + SESSION_TTL,
    history:   s.history.slice(-20),
  };
}

export async function GET(req: NextRequest) {
  const authError = checkAdminAuth(req);
  if (authError) return authError;

  pruneExpired();
  const sessionId = new URL(req.url).searchParams.get('sessionId') ?? '';

  if (!sessionId) {
    return NextResponse.json({
      activeSessions: sessions.size,
      sessions: [...sessions.values()].map(s => ({
        id: s.id, cwd: s.cwd, created: s.created, lastActive: s.lastActive,
        commandCount: s.history.length,
      })),
    });
  }

  const s = sessions.get(sessionId);
  if (!s) return NextResponse.json({ error: 'Session not found or expired' }, { status: 404 });
  return NextResponse.json(sessionInfo(s));
}

export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req);
  if (authError) return authError;

  pruneExpired();

  let body: Record<string, string>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { action, sessionId, command, path: cdPath } = body;

  // ── CREATE ────────────────────────────────────────────────────────────────
  if (action === 'create') {
    const id = newSessionId();
    sessions.set(id, { id, cwd: PROJECT_ROOT, created: Date.now(), lastActive: Date.now(), history: [] });
    return NextResponse.json({ sessionId: id, cwd: PROJECT_ROOT, created: Date.now(), expires: Date.now() + SESSION_TTL });
  }

  // ── All other actions need a valid session ────────────────────────────────
  const session = sessions.get(sessionId ?? '');
  if (!session) return NextResponse.json({ error: 'Session not found. Create one first with action:create' }, { status: 404 });
  session.lastActive = Date.now();

  // ── CD ────────────────────────────────────────────────────────────────────
  if (action === 'cd') {
    if (!cdPath) return NextResponse.json({ error: 'path required' }, { status: 400 });
    const target = cdPath.startsWith('/') ? cdPath : `${session.cwd}/${cdPath}`;
    try {
      const { stdout } = await execAsync(`cd "${target}" && pwd`, { cwd: session.cwd });
      session.cwd = stdout.trim();
      return NextResponse.json({ sessionId, cwd: session.cwd });
    } catch {
      return NextResponse.json({ error: `cd: no such directory: ${cdPath}`, cwd: session.cwd }, { status: 400 });
    }
  }

  // ── EXEC ──────────────────────────────────────────────────────────────────
  if (action === 'exec') {
    if (!command) return NextResponse.json({ error: 'command required' }, { status: 400 });
    for (const b of BLOCKED) {
      if (command.includes(b)) return NextResponse.json({ error: `Blocked: ${b}` }, { status: 403 });
    }
    const start = Date.now();
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: session.cwd, timeout: 30000,
        env: { ...process.env, FORCE_COLOR: '0' },
      });
      const duration = Date.now() - start;
      session.history.push({ cmd: command, exitCode: 0, ts: Date.now() });
      if (session.history.length > 200) session.history = session.history.slice(-200);
      return NextResponse.json({ sessionId, stdout: stdout.trim(), stderr: stderr.trim(), exitCode: 0, duration, cwd: session.cwd });
    } catch (e: unknown) {
      const err = e as { stdout?: string; stderr?: string; code?: number; message?: string };
      const duration = Date.now() - start;
      session.history.push({ cmd: command, exitCode: err.code ?? 1, ts: Date.now() });
      return NextResponse.json({ sessionId, stdout: (err.stdout ?? '').trim(), stderr: (err.stderr ?? err.message ?? '').trim(), exitCode: err.code ?? 1, duration, cwd: session.cwd });
    }
  }

  // ── DESTROY ───────────────────────────────────────────────────────────────
  if (action === 'destroy') {
    sessions.delete(sessionId ?? '');
    return NextResponse.json({ success: true, message: 'Session destroyed' });
  }

  return NextResponse.json({ error: `Unknown action: ${action}. Use: create | exec | cd | destroy` }, { status: 400 });
}
