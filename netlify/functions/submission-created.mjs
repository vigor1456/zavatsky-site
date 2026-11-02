// Runs automatically when a Netlify form is submitted. For withdrawals, sends the legally required
// acknowledgement to the buyer by email (a durable medium), and a copy to you.
import { sendMail, textToHtml } from './_shared/mail.mjs';
import { withdrawalAck, enquiryOwner, enquiryAck } from './_shared/emails.mjs';

export const handler = async (event) => {
  let payload;
  try { payload = JSON.parse(event.body).payload; } catch { return { statusCode: 400, body: 'Bad payload' }; }
  if (payload?.form_name === 'enquiry') return handleEnquiry(payload.data || {});
  if (payload?.form_name !== 'withdrawal') return { statusCode: 200, body: 'Ignored' };
  const d = payload.data || {};
  const lang = d.lang === 'cs' ? 'cs' : 'en';
  const ack = withdrawalAck(d, lang);
  try {
    if (d.email) await sendMail({ to: { email: d.email, name: d.name || undefined }, subject: ack.subject, text: ack.text, html: textToHtml(ack.text) });
    const to = process.env.ORDER_EMAIL_TO || 'maximilianravique@gmail.com';
    await sendMail({ to, subject: `Withdrawal received: ${d.order || '?'} (${d.name || '?'})`, text: `Withdrawal submitted on the website.\n\nName: ${d.name}\nOrder: ${d.order}\nPrints: ${d.items || 'whole order'}\nEmail: ${d.email}\n\nThe buyer received this acknowledgement:\n\n${ack.text}`, replyTo: d.email || undefined });
  } catch (e) {
    console.error('Withdrawal email failed:', e.message);
    return { statusCode: 500, body: 'Email failed' };
  }
  return { statusCode: 200, body: 'OK' };
};

// Commercial enquiries: the details to you (reply goes straight to the client) and a confirmation to the client.
async function handleEnquiry(d) {
  const lang = d.lang === 'en' ? 'en' : 'cs';
  const to = process.env.ENQUIRY_EMAIL_TO || 'zavatsky.v@seznam.cz';
  try {
    const o = enquiryOwner(d);
    await sendMail({ to, subject: o.subject, text: o.text, html: textToHtml(o.text), replyTo: d.email || undefined });
    if (d.email) { const a = enquiryAck(d, lang); await sendMail({ to: { email: d.email, name: d.name || undefined }, subject: a.subject, text: a.text, html: textToHtml(a.text), replyTo: to }); }
  } catch (e) { console.error('Enquiry email failed:', e.message); return { statusCode: 500, body: 'Email failed' }; }
  return { statusCode: 200, body: 'OK' };
}
