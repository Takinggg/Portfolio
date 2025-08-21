import tls from 'tls';
import net from 'net';
import { Buffer } from 'buffer';

function b64(s: string){ return Buffer.from(s,'utf8').toString('base64'); }

export async function sendMail(opts: { to: string; subject: string; html: string; from: string; attachments?: { filename: string; content: Buffer|string; contentType?: string }[] }){
  const host = process.env.SMTP_HOST!; const port = Number(process.env.SMTP_PORT||465);
  const secure = String(process.env.SMTP_SECURE||'true')==='true';
  const user = process.env.SMTP_USER!; const pass = process.env.SMTP_PASS!;

  const socket = await new Promise<tls.TLSSocket|net.Socket>((resolve, reject)=>{
    const s = secure ? tls.connect({ host, port }, ()=>resolve(s)) : net.connect({ host, port }, ()=>resolve(s));
    s.once('error', reject);
  });
  const reader = socket as any;
  function cmd(line: string){ return new Promise<void>((res, rej)=>{ socket.write(line+"\r\n"); reader.once('data', (d: Buffer)=>{ const t=d.toString(); if (/^[45]/.test(t)) rej(new Error(t)); else res(); }); }); }

  await new Promise(r=> reader.once('data', ()=>r(null))); // banner
  await cmd(`EHLO localhost`);
  await cmd(`AUTH LOGIN`); await cmd(b64(user)); await cmd(b64(pass));
  await cmd(`MAIL FROM:<${opts.from.match(/<([^>]+)>/)?.[1] || opts.from}>`);
  await cmd(`RCPT TO:<${opts.to}>`);
  await cmd(`DATA`);

  const boundary = 'b_'+Math.random().toString(36).slice(2);
  const headers = [
    `From: ${opts.from}`,
    `To: ${opts.to}`,
    `Subject: ${opts.subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`
  ].join('\r\n');

  let body = `--${boundary}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${opts.html}\r\n`;
  for (const a of (opts.attachments||[])){
    const ct = a.contentType || 'application/octet-stream';
    const data = typeof a.content==='string' ? Buffer.from(a.content,'utf8') : a.content;
    body += `--${boundary}\r\nContent-Type: ${ct}\r\nContent-Transfer-Encoding: base64\r\nContent-Disposition: attachment; filename="${a.filename}"\r\n\r\n${data.toString('base64')}\r\n`;
  }
  body += `--${boundary}--`;

  socket.write(headers+"\r\n\r\n"+body+"\r\n.\r\n");
  await new Promise((res, rej)=> reader.once('data', (d:Buffer)=>/^[25]/.test(d.toString())?res(null):rej(new Error(d.toString()))));
  socket.end('QUIT\r\n');
}