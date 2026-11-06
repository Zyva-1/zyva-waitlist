// Applies migrations/*.sql in order, once each.
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

// Load .env.local / .env so `npm run migrate` can see DATABASE_URL (Next.js only does this for the app itself).
for (const f of ['.env.local', '.env']) {
  const p = path.join(process.cwd(), f);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    if (line.trim().startsWith('#')) continue;
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL is empty. Put your connection string in .env.local'); process.exit(1); }
if (/USER:PASSWORD/.test(url)) { console.error('DATABASE_URL still has the placeholder from .env.example. Replace it with your real connection string.'); process.exit(1); }

const client = new pg.Client({ connectionString: url });
await client.connect();
await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())');
const dir = path.join(process.cwd(), 'migrations');
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.sql')).sort()) {
  if ((await client.query('SELECT 1 FROM schema_migrations WHERE name=$1', [f])).rowCount) continue;
  console.log('applying', f);
  try {
    await client.query('BEGIN');
    await client.query(fs.readFileSync(path.join(dir, f), 'utf8'));
    await client.query('INSERT INTO schema_migrations(name) VALUES ($1)', [f]);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('failed', f, e.message);
    process.exit(1);
  }
}
await client.end();
console.log('migrations up to date');
