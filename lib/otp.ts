import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { waitlistBody } from '@/lib/waitlist';

export const CODE_TTL_MIN = 10;
export const MAX_ATTEMPTS = 5;
export const RESEND_COOLDOWN_S = 60;
export const MAX_CODES_PER_EMAIL_HOUR = 5;
export const MAX_CODES_PER_IP_HOUR = 10;

export const startBody = waitlistBody;
export const verifyBody = z.object({
  email: z.string().trim().min(3).max(254).email('Enter a valid email address'),
  code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code'),
  ref: z.string().trim().max(40).regex(/^[A-Za-z0-9_-]*$/).optional(),
});

/** Cryptographically random 6 digits, zero-padded ("004217"). */
export const generateCode = () => String(randomInt(0, 1_000_000)).padStart(6, '0');

function secret(): string {
  const s = process.env.WAITLIST_CODE_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === 'production') throw new Error('WAITLIST_CODE_SECRET is not set');
  return 'dev-only-secret-change-me';
}

/** Keyed hash, so a leaked database can't be used to read or brute-force live codes. */
export const hashCode = (emailNorm: string, code: string) => createHmac('sha256', secret()).update(`${emailNorm}:${code}`).digest('hex');

export function codesMatch(emailNorm: string, code: string, storedHash: string): boolean {
  const a = Buffer.from(hashCode(emailNorm, code), 'hex');
  const b = Buffer.from(storedHash, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}
