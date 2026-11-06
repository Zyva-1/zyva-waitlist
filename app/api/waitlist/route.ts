import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { pool } from '@/lib/db';
import { normalizeEmail, waitlistBody } from '@/lib/waitlist';
import { ipHashOf, problem } from '@/lib/http';

export const dynamic = 'force-dynamic';

const MAX_PER_IP_HOUR = 20;

/** Check the email format, see if it is already on the list, otherwise add it. No email codes (OTP) for now. */
export async function POST(req: NextRequest) {
  try {
    const b = waitlistBody.parse(await req.json().catch(() => ({})));
    if (b.website) return NextResponse.json({ ok: true, position: 1 }); // honeypot: bot, pretend success

    const norm = normalizeEmail(b.email);
    const db = pool();
    const pos = (id: number) => db.query('SELECT count(*)::int AS n FROM waitlist WHERE id <= $1', [id]).then((r) => r.rows[0].n as number);

    const ex = (await db.query('SELECT id FROM waitlist WHERE email_norm=$1', [norm])).rows[0];
    if (ex) return NextResponse.json({ ok: true, alreadyJoined: true, position: await pos(ex.id) });

    const ipHash = ipHashOf(req);
    const recent = (await db.query("SELECT count(*)::int AS n FROM waitlist WHERE ip_hash=$1 AND created_at > now() - interval '1 hour'", [ipHash])).rows[0].n;
    if (recent >= MAX_PER_IP_HOUR) return problem('Too many sign-ups from this connection. Try again later.', 429);

    const me = (await db.query(
      `INSERT INTO waitlist (email, email_norm, ref, source, ip_hash, user_agent)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (email_norm) DO UPDATE SET email_norm = EXCLUDED.email_norm
       RETURNING id`,
      [b.email.trim(), norm, b.ref || null, req.headers.get('referer')?.slice(0, 200) ?? null, ipHash, req.headers.get('user-agent')?.slice(0, 300) ?? null])).rows[0];
    return NextResponse.json({ ok: true, position: await pos(me.id) });
  } catch (e) {
    if (e instanceof ZodError) return problem(e.issues.map((i) => i.message).join('; '), 422);
    console.error('[waitlist]', e);
    return problem('Something went wrong. Please try again.', 500);
  }
}
