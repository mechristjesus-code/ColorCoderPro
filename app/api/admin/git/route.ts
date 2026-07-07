// GET  /api/admin/git        → git status + recent log
// POST /api/admin/git        → run git operation
// Body: { op: 'status'|'diff'|'log'|'add'|'commit'|'push'|'pull', args?: string }

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { checkAdminAuth } from '@/lib/adminAuth';

const execAsync = promisify(exec);
const CWD = '/home/ubuntu/workspace/project';

async function run(cmd: string) {
  try {
    const { stdout, stderr } = await execAsync(cmd, { cwd: CWD, timeout: 20000 });
    return { out: stdout.trim(), err: stderr.trim(), ok: true };
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string; message?: string };
    return { out: (err.stdout ?? '').trim(), err: (err.stderr ?? err.message ?? '').trim(), ok: false };
  }
}

export async function GET(req: NextRequest) {
  const authError = checkAdminAuth(req);
  if (authError) return authError;

  const [status, log, branch] = await Promise.all([
    run('git status --short'),
    run('git log --oneline -10'),
    run('git branch --show-current'),
  ]);

  return NextResponse.json({
    branch: branch.out,
    status: status.out,
    log: log.out,
  });
}

export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req);
  if (authError) return authError;

  const { op, args = '' } = await req.json();

  const allowed: Record<string, string> = {
    status:  'git status',
    diff:    'git diff',
    log:     'git log --oneline -20',
    add:     `git add ${args || '.'}`,
    commit:  `git commit -m "${(args || 'Admin commit').replace(/"/g, "'")}"`,
    push:    'git push origin main',
    pull:    'git pull origin main',
    stash:   'git stash',
  };

  if (!allowed[op]) {
    return NextResponse.json({ error: `Unknown op: ${op}` }, { status: 400 });
  }

  const result = await run(allowed[op]);
  return NextResponse.json({ op, command: allowed[op], ...result });
}
