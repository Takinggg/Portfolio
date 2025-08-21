import { promises as fs } from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd(), 'var', 'data');
async function ensure(){ await fs.mkdir(ROOT, { recursive: true }); }

export async function appendJSONL(file: string, obj: any){
  await ensure();
  const p = path.join(ROOT, file);
  await fs.appendFile(p, JSON.stringify(obj)+"\n", 'utf8');
}

export async function readJSONL<T=any>(file: string): Promise<T[]>{
  await ensure();
  const p = path.join(ROOT, file);
  try { const txt = await fs.readFile(p, 'utf8'); return txt.split(/\n+/).filter(Boolean).map(l=>JSON.parse(l)); }
  catch { return []; }
}

export async function writeJSON(file: string, data: any){ await ensure(); await fs.writeFile(path.join(ROOT, file), JSON.stringify(data,null,2), 'utf8'); }
export async function readJSON<T=any>(file: string, fallback: any): Promise<T>{
  await ensure();
  try { return JSON.parse(await fs.readFile(path.join(ROOT,file),'utf8')); } catch { return fallback; }
}