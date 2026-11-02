// Stripe calls this after payment. Sends the order to you and a confirmation (with the terms) to the buyer.
import Stripe from 'stripe';
import { quote } from './_shared/quote.mjs';
import { sendMail, textToHtml } from './_shared/mail.mjs';
import { buyerConfirmation, ownerNotification } from './_shared/emails.mjs';
import { receiptStore, issueReceipt, receiptPdf } from './_shared/receipts.mjs';

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await req.text();
  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, req.headers.get('stripe-signature'), process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    console.error('Webhook signature check failed:', e.message);
    return new Response('Invalid signature', { status: 400 });
  }
  if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type)) return new Response('Ignored', { status: 200 });
  const s = event.data.object;
  if (s.payment_status !== 'paid') return new Response('Not paid yet', { status: 200 });

  const m = s.metadata || {};
  let names = {};
  try { names = quote(m); } catch { names = { title: m.print, title_cs: m.print, formatName: m.format, formatName_cs: m.format, zone: m.country, parcel: '', code: '' }; }
  const ship = s.collected_information?.shipping_details || s.shipping_details || {};
  const cust = s.customer_details || {};
  const d = new Date((s.created || Date.now() / 1000) * 1000);
  const order = {
    ...names, print: m.print, size: m.size, lang: m.lang === 'cs' ? 'cs' : 'en',
    number: `MR-${d.toISOString().slice(2, 10).replace(/-/g, '')}-${String(s.id).slice(-6).toUpperCase()}`,
    priceCents: s.amount_subtotal, shippingCents: s.total_details?.amount_shipping ?? (s.shipping_cost?.amount_total || 0), totalCents: s.amount_total,
    name: cust.name || ship.name || '', email: cust.email || '', phone: cust.phone || '',
    shipName: ship.name || cust.name || '', shipAddress: ship.address || cust.address || null,
    paymentIntent: s.payment_intent, livemode: event.livemode,
  };

  // Numbered receipt. Never blocks the order emails: if it fails, your email says so.
  let attachments = [];
  try {
    const paid = new Date((s.created || Date.now() / 1000) * 1000);
    const receipt = await issueReceipt(receiptStore(event.livemode), s.id, {
      year: paid.getUTCFullYear(), issuedAt: new Date().toISOString(), paidAt: paid.toISOString(), order: order.number,
      buyerName: cust.name || order.shipName, buyerEmail: order.email, buyerAddress: (cust.address && cust.address.line1) ? cust.address : order.shipAddress,
      item: order.title_cs && order.title_cs !== order.title ? `${order.title} / ${order.title_cs}` : order.title,
      itemDetail: `${order.formatName}${order.formatName_cs && order.formatName_cs !== order.formatName ? ' / ' + order.formatName_cs : ''}, ${order.size}`,
      priceCents: order.priceCents, shippingCents: order.shippingCents, totalCents: order.totalCents,
      shippingTo: order.shipAddress?.country || m.country, paymentMethod: 'online, Stripe', paymentId: String(s.payment_intent || s.id), livemode: !!event.livemode,
    });
    order.receiptNumber = receipt.number;
    attachments = [{ name: `doklad-${receipt.number}.pdf`, content: await receiptPdf(receipt) }];
  } catch (e) { order.receiptError = e.message; console.error('Receipt failed:', e.message); }

  const to = process.env.ORDER_EMAIL_TO || 'maximilianravique@gmail.com';
  let ownerOk = true;
  try { const n = ownerNotification(order); await sendMail({ to, subject: n.subject, text: n.text, html: textToHtml(n.text), replyTo: order.email || undefined, attachments }); }
  catch (e) { ownerOk = false; console.error('Owner email failed:', e.message); }
  if (order.email) {
    try { const c = buyerConfirmation(order, order.lang); await sendMail({ to: { email: order.email, name: order.name || undefined }, subject: c.subject, text: c.text, html: textToHtml(c.text), attachments }); }
    catch (e) { console.error('Buyer email failed:', e.message); }
  }
  // If the order email to you failed, ask Stripe to retry later so no order goes unnoticed.
  return new Response(ownerOk ? 'OK' : 'Owner email failed', { status: ownerOk ? 200 : 500 });
};

export const config = { path: '/api/stripe-webhook' };
