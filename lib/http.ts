import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

export const problem = (detail: string, status: number, extra: Record<string, unknown> = {}) => NextResponse.json({ ok: false, detail, ...extra }, { status });

export function ipHashOf(req: NextRequest): string {
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  return createHash('sha256').update(ip).digest('hex').slice(0, 32);
}
