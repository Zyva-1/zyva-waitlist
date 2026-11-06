import { CODE_TTL_MIN } from '@/lib/otp';

/** The verification email: plain text plus a simple HTML version with the code in bold. */
export function buildOtpEmail(code: string) {
  const subject = 'Your Verification Code';
  const text = `Your Zyva verification code is: ${code}\n\nIt expires in ${CODE_TTL_MIN} minutes. If you didn't ask for this, you can ignore this email.`;
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#111111;">
<p style="margin:0 0 16px;font-size:16px;">Your Zyva verification code is: <b style="font-size:18px;letter-spacing:1px;">${code}</b></p>
<p style="margin:0;font-size:13px;color:#666666;">It expires in ${CODE_TTL_MIN} minutes. If you didn't ask for this, you can ignore this email.</p>
</body></html>`;
  return { subject, text, html };
}
