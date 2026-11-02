// Sends email through Brevo's transactional API. Keys come from Netlify environment variables.
export async function sendMail({ to, subject, text, html, replyTo }) {
  const key = process.env.BREVO_API_KEY;
  if (!key) throw new Error('BREVO_API_KEY is not set');
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': key, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: process.env.MAIL_FROM_NAME || 'Maximilian Ravique', email: process.env.MAIL_FROM || 'orders@zavatsky.photo' },
      to: (Array.isArray(to) ? to : [to]).map((t) => (typeof t === 'string' ? { email: t } : t)),
      replyTo: { email: replyTo || process.env.ORDER_EMAIL_TO || 'maximilianravique@gmail.com' },
      subject, textContent: text, htmlContent: html,
    }),
  });
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`);
  return res.json();
}

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const textToHtml = (t) => `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a">${esc(t).replace(/\n/g, '<br>')}</div>`;
