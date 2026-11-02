// POST /api/form: the enquiry and withdrawal forms send their data here (in parallel with Netlify Forms,
// which keeps a copy and notifies you). This function sends the emails through Brevo.
import { getStore } from '@netlify/blobs';
import { sendMail, textToHtml } from './_shared/mail.mjs';
import { withdrawalAck, enquiryOwner, enquiryAck } from './_shared/emails.mjs';

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LIMIT = 5; // submissions per hour from one connection

async function tooMany(ip) {
  if (!ip) return false;
  try {
    const store = globalThis.__throttleStore || getStore({ name: 'form-throttle' });
    const key = `${new Date().toISOString().slice(0, 13)}/${ip.replace(/[^0-9a-f.:]/gi, '')}`;
    const n = ((await store.get(key, { type: 'json' }))?.n || 0) + 1;
    await store.setJSON(key, { n });
    return n > LIMIT;
  } catch { return false; } // never block a genuine enquiry because the counter is unavailable
}

export default async (req, context) => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });
  const host = new URL(req.url).host;
  const from = req.headers.get('origin') || req.headers.get('referer') || '';
  if (from && new URL(from).host !== host) return json(403, { error: 'Forbidden' });

  let d;
  try { d = await req.json(); } catch { return json(400, { error: 'Invalid request' }); }
  if (d.website) return json(200, { ok: true }); // spam trap filled: pretend success, send nothing
  const kind = d['form-name'];
  if (!['enquiry', 'withdrawal'].includes(kind)) return json(400, { error: 'Unknown form' });
  for (const k of Object.keys(d)) d[k] = String(d[k] ?? '').slice(0, k === 'note' ? 4000 : 300).trim();
  if (!EMAIL.test(d.email)) return json(400, { error: 'Please enter a valid email address.' });
  if (await tooMany(context?.ip || req.headers.get('x-nf-client-connection-ip'))) return json(429, { error: 'Too many submissions, please try again later or email me directly.' });

  const lang = kind === 'enquiry' ? (d.lang === 'en' ? 'en' : 'cs') : (d.lang === 'cs' ? 'cs' : 'en');
  try {
    if (kind === 'enquiry') {
      const to = process.env.ENQUIRY_EMAIL_TO || 'zavatsky.v@seznam.cz';
      const o = enquiryOwner(d);
      await sendMail({ to, subject: o.subject, text: o.text, html: textToHtml(o.text), replyTo: d.email });
      const a = enquiryAck(d, lang);
      await sendMail({ to: { email: d.email, name: d.name || undefined }, subject: a.subject, text: a.text, html: textToHtml(a.text), replyTo: to });
    } else {
      const ack = withdrawalAck(d, lang);
      await sendMail({ to: { email: d.email, name: d.name || undefined }, subject: ack.subject, text: ack.text, html: textToHtml(ack.text) });
      const to = process.env.ORDER_EMAIL_TO || 'maximilianravique@gmail.com';
      await sendMail({ to, subject: `Withdrawal received: ${d.order || '?'} (${d.name || '?'})`, text: `Withdrawal submitted on the website.\n\nName: ${d.name}\nOrder: ${d.order}\nPrints: ${d.items || 'whole order'}\nEmail: ${d.email}\n\nThe buyer received this acknowledgement:\n\n${ack.text}`, replyTo: d.email });
    }
  } catch (e) {
    console.error(`Form email failed (${kind}):`, e.message);
    return json(502, { error: 'email' });
  }
  return json(200, { ok: true });
};

export const config = { path: '/api/form' };
