import { describe, it, expect, afterAll } from 'vitest';
import { NextRequest } from 'next/server';
import { normalizeEmail, waitlistBody } from '@/lib/waitlist';

describe('input rules', () => {
  it('normalises case and whitespace so duplicates collapse', () => {
    expect(normalizeEmail('  Ada@Example.COM ')).toBe('ada@example.com');
  });
  it('rejects bad emails and odd ref codes', () => {
    for (const bad of ['nope', 'a@b', '@x.com', 'a b@x.com', '']) expect(waitlistBody.safeParse({ email: bad }).success).toBe(false);
    expect(waitlistBody.safeParse({ email: 'a@b.co' }).success).toBe(true);
    expect(waitlistBody.safeParse({ email: 'a@b.co', ref: 'x y!' }).success).toBe(false);
  });
});

// Needs a migrated Postgres: skipped unless DATABASE_URL is set.
const live = process.env.DATABASE_URL ? describe : describe.skip;
live('waitlist API (real database)', () => {
  let n = 0;
  const call = async (body: any, ip = '1.1.1.1') => {
    const mod = await import('@/app/api/waitlist/route');
    const res = await mod.POST(new NextRequest('http://x/api/waitlist', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json', 'x-forwarded-for': ip } }));
    return { status: res.status, body: await res.json() };
  };
  const fresh = () => `u${++n}-${Date.now()}@wl-test.io`;
  const q = async (sql: string, p: any[] = []) => (await (await import('@/lib/db')).pool().query(sql, p));
  afterAll(async () => { await q("DELETE FROM waitlist WHERE email_norm LIKE '%@wl-test.io'"); await (await import('@/lib/db')).pool().end(); });

  it('rejects a badly formatted email and stores nothing', async () => {
    const r = await call({ email: 'not-an-email' }, '10.0.0.1');
    expect(r.status).toBe(422);
  });
  it('adds a new email and returns its position', async () => {
    const e = fresh();
    const r = await call({ email: e }, '10.0.0.2');
    expect(r.status).toBe(200); expect(r.body.alreadyJoined).toBeUndefined(); expect(r.body.position).toBeGreaterThan(0);
    expect((await q('SELECT 1 FROM waitlist WHERE email_norm=$1', [e])).rowCount).toBe(1);
  });
  it('recognises an email already on the list (any case) and does not add it twice', async () => {
    const e = fresh();
    const a = await call({ email: e }, '10.0.0.3');
    const b = await call({ email: e.toUpperCase() }, '10.0.0.4');
    expect(b.body.alreadyJoined).toBe(true); expect(b.body.position).toBe(a.body.position);
    expect((await q('SELECT 1 FROM waitlist WHERE email_norm=$1', [e])).rowCount).toBe(1);
  });
  it('drops honeypot hits', async () => {
    const e = fresh(); await call({ email: e, website: 'spam.io' }, '10.0.0.5');
    expect((await q('SELECT 1 FROM waitlist WHERE email_norm=$1', [e])).rowCount).toBe(0);
  });
  it('caps sign-ups per IP per hour', async () => {
    let last = 200; for (let i = 0; i < 22; i++) last = (await call({ email: fresh() }, '10.0.0.9')).status;
    expect(last).toBe(429);
  });
  it('old code endpoints are retired', async () => {
    const m = await import('@/app/api/waitlist/start/route');
    expect((await m.POST()).status).toBe(410);
  });
});
