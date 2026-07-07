// Admin authentication helper — used by all /api/admin/* routes
// Password is set via ADMIN_PASSWORD env var (default: ColorAdmin144)
// Pass as Bearer token or X-Admin-Password header

import { NextRequest, NextResponse } from 'next/server';

export function checkAdminAuth(req: NextRequest): NextResponse | null {
  const password = process.env.ADMIN_PASSWORD || 'ColorAdmin144';

  const authHeader = req.headers.get('authorization') ?? '';
  const pwHeader   = req.headers.get('x-admin-password') ?? '';

  const provided =
    authHeader.startsWith('Bearer ') ? authHeader.slice(7) : pwHeader;

  if (provided !== password) {
    return NextResponse.json(
      { error: 'Unauthorized — invalid admin password' },
      { status: 401 }
    );
  }
  return null; // auth passed
}

export const ADMIN_PASS_KEY = 'colorAdminToken';
