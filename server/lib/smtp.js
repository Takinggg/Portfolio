import tls from 'tls';
import net from 'net';
import { Buffer } from 'buffer';

function b64(s){ return Buffer.from(s,'utf8').toString('base64'); }

function validateSMTPConfig() {
  const required = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing SMTP environment variables: ${missing.join(', ')}`);
  }
}

function debugLog(message, data = null) {
  if (process.env.SMTP_DEBUG === 'true') {
    console.log(`[SMTP DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
}

export async function sendMail(opts){
  // Validate configuration early
  validateSMTPConfig();
  
  const host = process.env.SMTP_HOST; const port = Number(process.env.SMTP_PORT||465);
  const secure = String(process.env.SMTP_SECURE||'true')==='true';
  const user = process.env.SMTP_USER; const pass = process.env.SMTP_PASS;

  debugLog('Connecting to SMTP server', { host, port, secure, user: user.substring(0, 3) + '***' });

  const socket = await new Promise((resolve, reject)=>{
    const s = secure ? tls.connect({ host, port }, ()=>resolve(s)) : net.connect({ host, port }, ()=>resolve(s));
    s.once('error', reject);
  });
  const reader = socket;
  
  // Enhanced command function to handle multi-line responses
  function cmd(line){ 
    return new Promise((res, rej)=>{ 
      debugLog('Sending SMTP command', { command: line.replace(/AUTH LOGIN|[A-Za-z0-9+\/=]{20,}/g, '[HIDDEN]') });
      socket.write(line+"\r\n"); 
      
      let responseData = '';
      const onData = (d) => {
        responseData += d.toString();
        debugLog('Received SMTP response', { response: responseData.trim() });
        
        // Check if this is the final line of a multi-line response
        // Final line format: "250 message" (space after code)
        // Continuation line format: "250-message" (dash after code)
        const lines = responseData.split('\r\n');
        const lastLine = lines[lines.length - 2] || lines[lines.length - 1]; // -2 because last might be empty
        
        if (lastLine && /^\d{3} /.test(lastLine)) {
          // Final line found
          reader.removeListener('data', onData);
          if (/^[45]/.test(lastLine)) {
            rej(new Error(responseData.trim()));
          } else {
            res();
          }
        }
        // If no final line yet, continue listening for more data
      };
      
      reader.on('data', onData);
    }); 
  }

  await new Promise(r=> reader.once('data', (d)=>{
    debugLog('Received SMTP banner', { banner: d.toString().trim() });
    r(null);
  })); // banner
  
  await cmd(`EHLO localhost`);
  await cmd(`AUTH LOGIN`); await cmd(b64(user)); await cmd(b64(pass));
  await cmd(`MAIL FROM:<${opts.from.match(/<([^>]+)>/)?.[1] || opts.from}>`);
  await cmd(`RCPT TO:<${opts.to}>`);
  await cmd(`DATA`);

  const boundary = 'b_'+Math.random().toString(36).slice(2);
  const messageId = `<${Date.now()}.${Math.random().toString(36).slice(2)}@${process.env.SMTP_HOST || 'localhost'}>`;
  
  const headers = [
    `From: ${opts.from}`,
    `To: ${opts.to}`,
    `Subject: ${opts.subject}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: ${messageId}`,
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

  debugLog('Sending email data', { 
    to: opts.to, 
    subject: opts.subject, 
    messageId,
    bodyLength: body.length 
  });

  socket.write(headers+"\r\n\r\n"+body+"\r\n.\r\n");
  await new Promise((res, rej)=> reader.once('data', (d)=>{
    const response = d.toString();
    debugLog('Final SMTP response', { response: response.trim() });
    /^[25]/.test(response)?res(null):rej(new Error(response))
  }));
  socket.end('QUIT\r\n');
  
  debugLog('Email sent successfully');
}