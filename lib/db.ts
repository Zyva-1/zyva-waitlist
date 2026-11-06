import { Pool } from 'pg';

const g = globalThis as unknown as { __wlPool?: Pool };

export function pool(): Pool {
  if (!g.__wlPool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set');
    g.__wlPool = new Pool({ connectionString: url, max: 5 });
  }
  return g.__wlPool;
}
