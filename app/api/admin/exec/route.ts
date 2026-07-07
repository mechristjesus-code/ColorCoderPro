// POST /api/admin/exec
// Runs a shell command in the project directory and streams stdout + stderr.
// Body: { command: string, cwd?: string }
// Returns: { stdout, stderr, exitCode, duration }

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { checkAdminAuth } from '@/lib/adminAuth';

const execAsync = promisify(exec);
const PROJECT_ROOT = '/home/ubuntu/workspace/project';

// Commands that are never allowed regardless of auth
const BLOCKED = ['rm -rf /', 'mkfs', 'dd if=', ':(){:|:&};:'];

export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req);
  if (authError) return authError;

  try {
    const { command, cwd } = await req.json();
    if (!command || typeof command !== 'string') {
      return NextResponse.json({ error: 'command is required' }, { status: 400 });
    }

    for (const blocked of BLOCKED) {
      if (command.includes(blocked)) {
        return NextResponse.json({ error: `Command blocked: ${blocked}` }, { status: 403 });
      }
    }

    const workdir = cwd ?? PROJECT_ROOT;
    const start = Date.now();

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: workdir,
        timeout: 30000,
        env: { ...process.env, FORCE_COLOR: '0' },
      });
      return NextResponse.json({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: 0,
        duration: Date.now() - start,
        command,
        cwd: workdir,
      });
    } catch (err: unknown) {
      const e = err as { stdout?: string; stderr?: string; code?: number; message?: string };
      return NextResponse.json({
        stdout: (e.stdout ?? '').trim(),
        stderr: (e.stderr ?? e.message ?? '').trim(),
        exitCode: e.code ?? 1,
        duration: Date.now() - start,
        command,
        cwd: workdir,
      });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Internal error', detail: String(err) }, { status: 500 });
  }
}
