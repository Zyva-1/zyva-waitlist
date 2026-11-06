import { z } from 'zod';

export const normalizeEmail = (e: string) => e.trim().toLowerCase();

export const waitlistBody = z.object({
  email: z.string().trim().min(3).max(254).email('Enter a valid email address'),
  ref: z.string().trim().max(40).regex(/^[A-Za-z0-9_-]*$/).optional(),
  website: z.string().max(200).optional(), // honeypot: real users leave this empty
});
