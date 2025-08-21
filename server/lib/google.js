import { readJSON, writeJSON } from './fsdb.js';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';

export async function getAccessToken(){
  const file = 'oauth.json';
  const oauth = await readJSON(file, {});
  const now = Date.now();
  if (oauth.access_token && oauth.expiry && oauth.expiry - 60_000 > now) return oauth.access_token;
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    grant_type: 'refresh_token'
  });
  const r = await fetch(TOKEN_URL, { method:'POST', headers:{'content-type':'application/x-www-form-urlencoded'}, body: params });
  const j = await r.json();
  const expiry = now + (j.expires_in*1000||3600_000);
  await writeJSON(file, { ...oauth, access_token: j.access_token, expiry });
  return j.access_token;
}

export async function calendarFreeBusy({ fromISO, toISO }){
  const token = await getAccessToken();
  const r = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method:'POST', headers:{ 'authorization': `Bearer ${token}`, 'content-type':'application/json' },
    body: JSON.stringify({ timeMin: fromISO, timeMax: toISO, items: [{ id: 'primary' }] })
  });
  const j = await r.json();
  return (j.calendars?.primary?.busy || []);
}

export async function calendarInsertEvent({ summary, startISO, endISO, attendees }){
  const token = await getAccessToken();
  const r = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method:'POST', headers:{ 'authorization': `Bearer ${token}`, 'content-type':'application/json' },
    body: JSON.stringify({ summary, start:{ dateTime: startISO }, end:{ dateTime: endISO }, attendees })
  });
  const j = await r.json();
  if (!r.ok) throw new Error('Calendar insert failed: '+JSON.stringify(j));
  return j.id;
}