import nodemailer from 'nodemailer';

/**
 * Email sending. Two providers, picked from your env:
 *  - SMTP (any mailbox: Gmail app password, Zoho, cPanel mail, Brevo, ...): set SMTP_HOST (+ SMTP_PORT, SMTP_USER, SMTP_PASS)
 *  - Resend API: set RESEND_API_KEY
 * SMTP wins if both are set. EMAIL_FROM is the sender, e.g.  Zyva <you@yourdomain.com>
 */
export const emailConfigured = () => !!(process.env.SMTP_HOST || process.env.RESEND_API_KEY);

const from = () => process.env.EMAIL_FROM || process.env.SMTP_USER || 'Zyva <onboarding@resend.dev>';

let transport: nodemailer.Transporter | null = null;
function smtp() {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT || 465);
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465, // 465 = TLS from the start; 587 upgrades with STARTTLS
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
  }
  return transport;
}

/** Sends one email. Returns false (and logs why) if it fails; never throws. */
export async function sendEmail(to: string, subject: string, text: string, html?: string): Promise<boolean> {
  try {
    if (process.env.SMTP_HOST) {
      await smtp().sendMail({ from: from(), to, subject, text, html });
      return true;
    }
    const key = process.env.RESEND_API_KEY;
    if (!key) return false;
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: from(), to, subject, text, html }),
    });
    if (!r.ok) console.error('[email] Resend rejected the message:', r.status, await r.text().catch(() => ''));
    return r.ok;
  } catch (e: any) {
    console.error('[email] send failed:', e?.message ?? e);
    return false;
  }
}
