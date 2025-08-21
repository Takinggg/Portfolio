import { readJSON, writeJSON } from './fsdb';
const WINDOW = 60_000; // 60s
const LIMITS: Record<string, number> = { 'contact': 5, 'availability': 20, 'book': 10 };
let state: Record<string, { windowStart: number; count: number }> = {};

export async function rateLimit(bucket: 'contact'|'availability'|'book', key: string){
  if (Object.keys(state).length===0) state = await readJSON('ratelimit.json', {});
  const now = Date.now();
  const win = Math.floor(now / WINDOW) * WINDOW;
  const k = `${bucket}:${key}:${win}`;
  const cur = state[k] || { windowStart: win, count: 0 };
  cur.count += 1; state[k] = cur;
  if (Math.random()<0.1) await writeJSON('ratelimit.json', state); // flush opportuniste
  return cur.count <= (LIMITS[bucket]||10);
}