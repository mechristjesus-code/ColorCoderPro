// POST /api/admin/stream
// Streams command output as newline-delimited JSON events.
// Works with: curl -N, Termux, any HTTP client that supports streaming.
//
// Usage from Termux / curl:
//   curl -N -s -X POST https://your-app.com/api/admin/stream \
//     -H "x-admin-password: ColorAdmin144" \
//     -H "Content-Type: application/json" \
//     -d '{"command":"git log --oneline -5"}'
//
// Each line of output is one JSON object:
//   {"type":"stdout","data":"line content\n","ts":1234567890}
//   {"type":"stderr","data":"error text\n","ts":1234567890}
//   {"type":"exit","code":0,"duration":342,"ts":1234567890}
//   {"type":"error","message":"...","ts":1234567890}

import { NextRequest } from 'next/server';
import { spawn } from 'child_process';
import { checkAdminAuth } from '@/lib/adminAuth';

const PROJECT_ROOT = '/home/ubuntu/workspace/project';
const BLOCKED = ['rm -rf /', 'mkfs', ':(){:|:&};:'];

export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req);
  if (authError) return authError;

  let command: string, cwd: string;
  try {
    const body = await req.json();
    command = body.command ?? '';
    cwd     = body.cwd ?? PROJECT_ROOT;
  } catch {
    return new Response(JSON.stringify({ type: 'error', message: 'Invalid JSON body' }) + '\n', { status: 400 });
  }

  if (!command.trim()) {
    return new Response(JSON.stringify({ type: 'error', message: 'command is required' }) + '\n', { status: 400 });
  }

  for (const b of BLOCKED) {
    if (command.includes(b)) {
      return new Response(JSON.stringify({ type: 'error', message: `Blocked: ${b}` }) + '\n', { status: 403 });
    }
  }

  const start = Date.now();

  // Build a ReadableStream that spawns the process and forwards output
  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();

      const emit = (obj: object) => {
        try { controller.enqueue(enc.encode(JSON.stringify(obj) + '\n')); } catch {}
      };

      const child = spawn('bash', ['-c', command], {
        cwd,
        env: { ...process.env, FORCE_COLOR: '0', TERM: 'dumb' },
        timeout: 60000,
      });

      child.stdout.on('data', (chunk: Buffer) => {
        emit({ type: 'stdout', data: chunk.toString(), ts: Date.now() });
      });

      child.stderr.on('data', (chunk: Buffer) => {
        emit({ type: 'stderr', data: chunk.toString(), ts: Date.now() });
      });

      child.on('close', (code) => {
        emit({ type: 'exit', code: code ?? 0, duration: Date.now() - start, ts: Date.now() });
        try { controller.close(); } catch {}
      });

      child.on('error', (err) => {
        emit({ type: 'error', message: err.message, ts: Date.now() });
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
