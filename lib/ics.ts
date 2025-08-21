export function buildICS({ title, start, end }: { title: string; start: Date; end: Date }){
  const pad = (n:number)=> String(n).padStart(2,'0');
  const fmt = (d: Date)=> `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@portfolio`;
  return [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Portfolio//RX//FR','CALSCALE:GREGORIAN','METHOD:PUBLISH',
    'BEGIN:VEVENT',`UID:${uid}`,`DTSTAMP:${fmt(new Date())}`,`DTSTART:${fmt(start)}`,`DTEND:${fmt(end)}`,`SUMMARY:${title}`,'END:VEVENT','END:VCALENDAR'
  ].join('\r\n');
}