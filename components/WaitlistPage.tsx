'use client';
import { useEffect, useState } from 'react';

/**
 * Accent colour of the flowing ribbons. Default is the Zyva brand colour.
 * To bring back the original gold, set NEXT_PUBLIC_WAITLIST_THEME=gold in .env.local and restart.
 */
const PALETTES = {
  brand: { edge: '#6f87f0', base: '#a2b4fc', light: '#b4c2ff', mid: '#a2b4fc', hi: '#dde4ff' },
  gold: { edge: '#ff7a1a', base: '#ff8a2a', light: '#ffb36b', mid: '#ff9a45', hi: '#ffc58a' },
};
const P = process.env.NEXT_PUBLIC_WAITLIST_THEME === 'gold' ? PALETTES.gold : PALETTES.brand;

const SOCIAL = {
  x: process.env.NEXT_PUBLIC_SOCIAL_X || '#',
  telegram: process.env.NEXT_PUBLIC_SOCIAL_TELEGRAM || '#',
};

type Stage = 'email' | 'done';

export function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [ref, setRef] = useState('');
  const [stage, setStage] = useState<Stage>('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [existing, setExisting] = useState(false);
  useEffect(() => { try { setRef(new URLSearchParams(location.search).get('ref') ?? ''); } catch { /* ignore */ } }, []);
  async function call(path: string, body: object) {
    const r = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    return { ok: r.ok, j };
  }

  async function join(e?: React.FormEvent) {
    e?.preventDefault();
    if (busy) return;
    const clean = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)) { setError('Enter a valid email address.'); return; }
    setBusy(true); setError('');
    try {
      const { ok, j } = await call('/api/waitlist', { email: clean, website, ref: ref || undefined });
      if (!ok) { setError(j.detail || 'Something went wrong. Please try again.'); return; }
      setExisting(!!j.alreadyJoined); setStage('done');
    } catch { setError('Network problem. Check your connection and try again.'); } finally { setBusy(false); }
  }

  return (
    <main className="wl">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" />
      <style>{CSS}</style>

      {/* Background: soft slate bloom + flowing orange ribbons */}
      <div className="wl-bg" aria-hidden>
        <svg viewBox="0 0 1200 820" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="or" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={P.edge} stopOpacity="0" /><stop offset=".25" stopColor={P.base} /><stop offset=".7" stopColor={P.light} /><stop offset="1" stopColor={P.edge} stopOpacity="0" /></linearGradient>
            <radialGradient id="slate" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#3a4358" /><stop offset="1" stopColor="#3a4358" stopOpacity="0" /></radialGradient>
            <radialGradient id="steel" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#b9c3da" /><stop offset="1" stopColor="#b9c3da" stopOpacity="0" /></radialGradient>
            <radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor={P.base} /><stop offset="1" stopColor={P.base} stopOpacity="0" /></radialGradient>
            <filter id="b40" filterUnits="userSpaceOnUse" x="-300" y="-300" width="1800" height="1400"><feGaussianBlur stdDeviation="40" /></filter>
            <filter id="b14" filterUnits="userSpaceOnUse" x="-300" y="-300" width="1800" height="1400"><feGaussianBlur stdDeviation="14" /></filter>
            <filter id="b5" filterUnits="userSpaceOnUse" x="-300" y="-300" width="1800" height="1400"><feGaussianBlur stdDeviation="5" /></filter>
            <filter id="b1" filterUnits="userSpaceOnUse" x="-300" y="-300" width="1800" height="1400"><feGaussianBlur stdDeviation="1.2" /></filter>
          </defs>
          <ellipse cx="560" cy="300" rx="600" ry="260" fill="url(#slate)" filter="url(#b40)" opacity="1" />
          <ellipse cx="360" cy="420" rx="260" ry="150" fill="url(#slate)" filter="url(#b40)" opacity=".8" />
          <ellipse cx="520" cy="215" rx="150" ry="60" fill="url(#steel)" filter="url(#b14)" opacity=".7" transform="rotate(-14 520 215)" />
          <ellipse cx="860" cy="360" rx="190" ry="90" fill="url(#steel)" filter="url(#b40)" opacity=".5" />
          <ellipse cx="660" cy="235" rx="150" ry="70" fill="url(#glow)" filter="url(#b40)" opacity=".8" />
          <g fill="none" strokeLinecap="round">
            <path d="M120 300 C 300 200, 480 190, 640 250 S 960 330, 1100 400" stroke="url(#or)" strokeWidth="30" filter="url(#b14)" opacity=".65" />
            <path d="M150 312 C 320 230, 480 225, 620 275" stroke="#05060a" strokeWidth="26" opacity=".55" filter="url(#b5)" />
            <path d="M40 340 C 260 190, 520 200, 700 270 S 1000 330, 1160 420" stroke="url(#or)" strokeWidth="4" filter="url(#b1)" opacity=".9" />
            <path d="M120 300 C 300 230, 470 250, 600 300 S 800 380, 930 470" stroke="url(#or)" strokeWidth="14" filter="url(#b5)" opacity=".85" />
            <path d="M330 440 C 450 330, 620 330, 760 380 S 1010 520, 1130 560" stroke="url(#or)" strokeWidth="3" filter="url(#b1)" opacity=".9" />
            <path d="M-20 520 C 160 330, 330 300, 470 330" stroke={P.light} strokeOpacity=".5" strokeWidth="3" filter="url(#b1)" />
            <ellipse cx="650" cy="268" rx="200" ry="62" transform="rotate(-8 650 268)" fill="none" stroke={P.base} strokeWidth="16" filter="url(#b14)" opacity=".75" />
            <ellipse cx="650" cy="268" rx="200" ry="62" transform="rotate(-8 650 268)" fill="none" stroke={P.hi} strokeWidth="2.5" filter="url(#b1)" opacity=".9" />
            <path d="M560 160 C 640 120, 760 150, 800 230" stroke={P.base} strokeWidth="10" filter="url(#b5)" opacity=".7" />
            <path d="M780 420 C 900 440, 1020 500, 1100 580" stroke={P.mid} strokeWidth="2" filter="url(#b1)" opacity=".8" />
          </g>
        </svg>
        <div className="wl-vignette" />
      </div>

      <div className="wl-content">
        <span className="wl-badge">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/favicon.png" alt="" width={16} height={16} />Waitlist</span>
        <h1 className="wl-title">Coming <span className="wl-soon">soon!</span></h1>

        <section className="wl-card" aria-labelledby="wl-h">
          {stage === 'done' ? (
            <div role="status" className="wl-done">
              <h2 id="wl-h">{existing ? "You're already on the list!" : "You're on the list!"}</h2>
              <p>{existing ? <><b>{email.trim()}</b> is already registered, so there&apos;s nothing more to do. </> : ''}We&apos;ll let you know as soon as Zyva opens.</p>
              {existing ? <p className="wl-links"><button type="button" onClick={() => { setStage('email'); setExisting(false); setEmail(''); }}>Use a different email</button></p> : null}
            </div>
          ) : (
            <>
              <h2 id="wl-h">Join our waitlist!</h2>
              <p>Sign up to get early access to Zyva and the latest updates straight to your inbox.</p>
              <form onSubmit={join} noValidate className="wl-form">
                <label htmlFor="wl-email" className="sr">Email address</label>
                <input id="wl-email" type="email" inputMode="email" autoComplete="email" required placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!error} aria-describedby="wl-msg" />
                <input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} className="wl-hp" aria-hidden />
                <button type="submit" disabled={busy}>{busy ? 'Joining…' : 'Join Waitlist'}</button>
              </form>
              <p id="wl-msg" role="alert" className="wl-err">{error}</p>
            </>
          )}
        </section>

        <ul className="wl-social" aria-label="Social links">
          <li><a href={SOCIAL.x} target="_blank" rel="noreferrer" aria-label="X"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z" /></svg></a></li>
          <li><a href={SOCIAL.telegram} target="_blank" rel="noreferrer" aria-label="Telegram"><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.3 18.7 19.5c-.2 1.1-.9 1.4-1.8.9l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.3 13 1.5 11.500c-1-.3-1-1 .2-1.500L20.400 2.800c.9-.3 1.600.2 1.500 1.500z"/></svg></a></li>
        </ul>
      </div>

      <div className="wl-giant" aria-hidden>Waitlist</div>
      <p className="wl-foot">©2026 Zyva <i>•</i> Social crypto trading <i>•</i> <a href="https://zyva.app" rel="noreferrer">zyva.app</a></p>
    </main>
  );
}

const CSS = `
.wl{position:relative;height:100svh;min-height:620px;overflow:hidden;background:#000;color:#fff;font-family:'Poppins',system-ui,sans-serif;display:flex;flex-direction:column;align-items:center}
.wl *{box-sizing:border-box}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.wl-bg{position:absolute;inset:0;z-index:0}
.wl-bg svg{width:100%;height:100%;display:block}
.wl-vignette{position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 30%,transparent 35%,rgba(0,0,0,.85) 100%),linear-gradient(180deg,transparent 55%,#000 92%)}
.wl-content{position:relative;z-index:2;width:100%;display:flex;flex-direction:column;align-items:center;padding:clamp(56px,13vh,130px) 20px 0}
.wl-badge{display:inline-flex;align-items:center;gap:8px;padding:8px 18px;border-radius:999px;border:1px solid rgba(255,255,255,.28);background:rgba(255,255,255,.1);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);font-size:13px;font-weight:400;letter-spacing:.01em}
.wl-badge img{border-radius:4px}
.wl-title{margin:clamp(14px,3vh,28px) 0 0;font-weight:600;font-size:clamp(46px,9.2vw,96px);line-height:1.02;letter-spacing:-.065em;text-align:center;color:#fff;text-wrap:balance;position:relative;z-index:1}
.wl-soon{background:linear-gradient(180deg,#fff 10%,#9a9ca6 95%);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent}
.wl-card{position:relative;width:min(566px,100%);margin-top:clamp(-6px,-.6vw,-2px);padding:clamp(28px,5vw,44px) clamp(20px,5vw,56px) clamp(26px,4.4vw,40px);border-radius:clamp(28px,5vw,40px);text-align:center;border:1px solid rgba(255,255,255,.24);background:linear-gradient(180deg,rgba(150,165,195,.16) 0%,rgba(40,48,66,.28) 100%);backdrop-filter:blur(30px) saturate(1.1);-webkit-backdrop-filter:blur(26px) saturate(1.2);box-shadow:inset 0 1px 0 rgba(255,255,255,.25),inset 0 -1px 0 rgba(255,255,255,.06),0 30px 80px -30px rgba(0,0,0,.8)}
.wl-card h2{margin:0;font-weight:400;font-size:clamp(22px,3.4vw,28px);letter-spacing:-.01em}
.wl-card p{margin:14px auto 0;max-width:34ch;font-weight:300;font-size:clamp(13px,1.9vw,14.5px);line-height:1.55;color:rgba(255,255,255,.82)}
.wl-form{margin-top:clamp(22px,4vw,32px);display:flex;gap:12px;justify-content:center}
.wl-form input[type=email]{flex:1 1 auto;min-width:0;max-width:300px;height:46px;padding:0 20px;border-radius:999px;border:1px solid rgba(255,255,255,.45);background:rgba(0,0,0,.45);color:#fff;font:inherit;font-size:14px;outline:none;transition:border-color .2s,box-shadow .2s}
.wl-form input[type=email]::placeholder{color:rgba(255,255,255,.4)}
.wl-form input[type=email]:focus-visible{border-color:#fff;box-shadow:0 0 0 3px rgba(255,255,255,.18)}
.wl-form button{flex:0 0 auto;height:46px;padding:0 24px;border-radius:999px;border:0;background:#fff;color:#000;font:inherit;font-size:14px;font-weight:500;cursor:pointer;box-shadow:0 8px 30px -4px rgba(255,255,255,.4);transition:transform .15s,box-shadow .2s,opacity .2s}
.wl-form button:hover{box-shadow:0 10px 36px -2px rgba(255,255,255,.6)}
.wl-form button:active{transform:scale(.97)}
.wl-form button:focus-visible{outline:2px solid #fff;outline-offset:3px}
.wl-form button:disabled{opacity:.6;cursor:progress}
.wl-hp{position:absolute!important;left:-9999px;width:1px;height:1px;opacity:0}
.wl-card .wl-err{min-height:20px;margin:12px auto 0;font-size:13px;color:#ffb4a8}
.wl-done{padding:8px 0}
.wl-card p b{font-weight:500;color:#fff;word-break:break-all}
.wl-form input.wl-code{flex:1 1 auto;min-width:0;max-width:220px;height:50px;padding:0 0 0 .5em;border-radius:999px;border:1px solid rgba(255,255,255,.45);background:rgba(0,0,0,.45);color:#fff;font:inherit;font-size:22px;font-weight:500;letter-spacing:.5em;text-align:center;outline:none;font-variant-numeric:tabular-nums}
.wl-form input.wl-code::placeholder{color:rgba(255,255,255,.25)}
.wl-form input.wl-code:focus-visible{border-color:#fff;box-shadow:0 0 0 3px rgba(255,255,255,.18)}
.wl-card .wl-links{display:flex;flex-wrap:wrap;gap:8px 12px;justify-content:center;align-items:center;margin-top:6px;font-size:13px}
.wl-links button{background:none;border:0;padding:4px 2px;color:rgba(255,255,255,.85);font:inherit;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
.wl-links button:disabled{color:rgba(255,255,255,.4);cursor:default;text-decoration:none}
.wl-links button:focus-visible{outline:2px solid #fff;outline-offset:2px;border-radius:4px}
.wl-done p b{font-weight:600;color:#fff}
.wl-social{list-style:none;margin:18px 0 0;padding:0;display:flex;gap:4px}
.wl-social a{display:flex;width:38px;height:38px;align-items:center;justify-content:center;border-radius:10px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.07);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);color:#fff;transition:background .2s}
.wl-social a:hover{background:rgba(255,255,255,.18)}
.wl-social a:focus-visible{outline:2px solid #fff;outline-offset:2px}
.wl-giant{position:absolute;left:50%;bottom:0;z-index:1;transform:translate(-50%,36%);font-weight:600;font-size:clamp(84px,24.5vw,380px);line-height:1;letter-spacing:-.04em;white-space:nowrap;padding:0 .08em;color:transparent;-webkit-text-stroke:1.5px rgba(255,255,255,.26);background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,0) 70%);-webkit-background-clip:text;background-clip:text;user-select:none;pointer-events:none;-webkit-mask-image:linear-gradient(180deg,#000 30%,transparent 100%);mask-image:linear-gradient(180deg,#000 30%,transparent 100%)}
.wl-foot{position:absolute;z-index:3;bottom:16px;left:0;right:0;margin:0;padding:0 16px;text-align:center;font-size:12px;font-weight:300;color:rgba(255,255,255,.7)}
.wl-foot i{font-style:normal;margin:0 10px;opacity:.6}
.wl-foot a{color:#fff;font-weight:400;text-decoration:none}
.wl-foot a:hover{text-decoration:underline}
@media (max-width:640px){
  .wl{height:auto;min-height:100svh;min-height:100dvh;justify-content:flex-start}
  .wl-bg svg{height:62%;width:100%}
  .wl-vignette{background:radial-gradient(130% 70% at 50% 25%,transparent 30%,rgba(0,0,0,.8) 100%),linear-gradient(180deg,transparent 40%,#000 78%)}
  .wl-content{padding:clamp(48px,11svh,96px) 18px 0;min-height:calc(100svh - 150px)}
  .wl-badge{font-size:13px;padding:7px 16px}
  .wl-title{margin-top:22px;font-size:clamp(40px,12.4vw,60px);letter-spacing:-.05em;white-space:nowrap}
  .wl-card{margin-top:22px;width:100%;max-width:440px;padding:28px 20px 24px;border-radius:28px}
  .wl-card h2{font-size:24px}
  .wl-card p{font-size:14px;max-width:30ch}
  .wl-form{flex-direction:column;align-items:stretch;gap:10px;margin-top:22px}
  .wl-form input[type=email],.wl-form button,.wl-form input.wl-code{max-width:none;width:100%;height:50px;font-size:16px}
  .wl-form input.wl-code{font-size:24px}
  .wl-social{margin-top:22px}
  .wl-social a{width:42px;height:42px}
  .wl-giant{position:relative;left:auto;bottom:auto;transform:none;margin-top:auto;height:clamp(60px,18vw,110px);overflow:hidden;font-size:clamp(84px,27vw,170px);line-height:1;align-self:center;display:flex;align-items:flex-start;justify-content:center;width:100%;-webkit-mask-image:linear-gradient(180deg,#000 20%,transparent 95%);mask-image:linear-gradient(180deg,#000 20%,transparent 95%)}
  .wl-foot{position:relative;bottom:auto;z-index:3;padding:14px 20px calc(18px + env(safe-area-inset-bottom));line-height:1.9;font-size:12px}
  .wl-foot i{display:none}
  .wl-foot a{display:block}
}
@media (max-width:640px) and (max-height:700px){.wl-content{padding-top:36px}}
@media (prefers-reduced-motion:no-preference){
  .wl-card,.wl-title,.wl-badge,.wl-social{animation:wl-in .8s cubic-bezier(.2,.7,.2,1) both}
  .wl-title{animation-delay:.08s}.wl-card{animation-delay:.16s}.wl-social{animation-delay:.28s}
  @keyframes wl-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
}
`;
