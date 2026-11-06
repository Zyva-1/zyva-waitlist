import { NextResponse } from 'next/server';

/** Retired: email codes (OTP) are switched off for now. Sign-ups go to POST /api/waitlist. */
export const POST = () => NextResponse.json({ ok: false, detail: 'Email codes are not in use.' }, { status: 410 });
