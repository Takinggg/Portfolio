// Heures d'ouverture dans availability.json: { MON:[ [540,1020] ], TUE:[...], ... } en minutes local time.
import { readJSON } from './fsdb';

export async function computeSlots({ fromISO, toISO, durationMin, tz = process.env.TZ_EUROPE || 'Europe/Paris' }:{ fromISO: string; toISO: string; durationMin: number; tz?: string; }){
  const open = await readJSON<Record<string, number[][]>>('availability.json', {});
  const exceptions = new Set((await readJSON<string[]>('exceptions.json', [])).map(s=>s.slice(0,10)));

  const slots: string[] = [];
  const from = new Date(fromISO); const to = new Date(toISO);
  for (let d = new Date(from); d < to; d = new Date(d.getTime()+86400000)){
    const y = d.getUTCFullYear(); const m = d.getUTCMonth(); const day = d.getUTCDate();
    const dateKey = d.toISOString().slice(0,10);
    if (exceptions.has(dateKey)) continue;
    const weekday = ['SUN','MON','TUE','WED','THU','FRI','SAT'][new Date(Date.UTC(y,m,day)).getUTCDay()];
    const ranges = open[weekday] || [];
    for (const [startMin,endMin] of ranges){
      for (let t = startMin; t + durationMin <= endMin; t += durationMin){
        const utc = localToUtc(y,m,day, Math.floor(t/60), t%60, tz);
        if (utc >= from && new Date(utc.getTime()+durationMin*60000) <= to){ slots.push(utc.toISOString()); }
      }
    }
  }
  return slots;
}

function localToUtc(y:number,m:number,d:number,h:number,min:number,tz:string){
  // Recherche binaire d'un instant UTC dont l'affichage dans tz correspond au local souhaité
  let lo = Date.UTC(y,m,d,h,min)-5*3600_000, hi = Date.UTC(y,m,d,h,min)+5*3600_000;
  const target = `${pad(y)}-${pad(m+1)}-${pad(d)} ${pad(h)}:${pad(min)}`;
  for (let i=0;i<20;i++){
    const mid = new Date((lo+hi)/2);
    const s = fmtInTZ(mid,tz);
    if (s < target) lo = mid.getTime(); else hi = mid.getTime();
  }
  return new Date(hi);
}
function pad(n:number){ return String(n).padStart(2,'0'); }
function fmtInTZ(d: Date, tz: string){
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: tz, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hour12:false }).formatToParts(d);
  const get = (t:string)=> parts.find(p=>p.type===t)?.value || '';
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}`;
}