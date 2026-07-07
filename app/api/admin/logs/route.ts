// GET /api/admin/logs?lines=100&file=stderr
// Returns recent dev server logs

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { checkAdminAuth } from '@/lib/adminAuth';

const execAsync = promisify(exec);

export async function GET(req: NextRequest) {
  const authError = checkAdminAuth(req);
  if (authError) return authError;

  const params = new URL(req.url).searchParams;
  const lines = Math.min(parseInt(params.get('lines') ?? '100'), 500);
  const file  = params.get('file') === 'stdout' ? 'stdout' : 'stderr';
  const logPath = `/var/log/supervisor/dev-server.${file}.log`;

  try {
    const { stdout } = await execAsync(`tail -n ${lines} ${logPath} 2>/dev/null || echo "(log file not found)"`, { timeout: 5000 });
    return NextResponse.json({ file: logPath, lines: stdout.trim().split('\n'), count: lines });
  } catch {
    return NextResponse.json({ file: logPath, lines: ['(could not read log file)'], count: 0 });
  }
}
