# Zyva Waitlist

A standalone pre-launch waitlist (Next.js + Postgres). Separate from the Zyva product: its own folder, database and deployment.

## Run it
1. Create an empty Postgres database (for example `zyva_waitlist`).
2. `cp .env.example .env.local` and set `DATABASE_URL`.
3. `npm install`
4. `npm run migrate`  (creates the `waitlist` table)
5. `npm run dev`  then open http://localhost:3000

## Useful
- See sign-ups: `select id, email, created_at from waitlist order by id;`
- Let someone in: `update waitlist set invited_at = now() where email_norm = 'them@example.com';`
- Export: `\copy (select email, created_at from waitlist order by id) to 'waitlist.csv' csv header`
- Tests: `npm test` (set `DATABASE_URL` to also run the database tests)
- Production: `npm run build && npm start`, or deploy to Vercel with the same env vars.
