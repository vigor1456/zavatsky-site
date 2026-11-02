// POST /api/checkout {print, format, size, country, lang} -> { url } of a Stripe Checkout page.
import Stripe from 'stripe';
import catalog from './_shared/catalog.json' with { type: 'json' };
import { quote, QuoteError } from './_shared/quote.mjs';

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });
  if (!catalog.checkout_enabled) return json(403, { error: 'Online checkout is not enabled' });
  if (!process.env.STRIPE_SECRET_KEY) return json(500, { error: 'Payments are not configured' });

  let input;
  try { input = await req.json(); } catch { return json(400, { error: 'Invalid request' }); }
  const lang = input.lang === 'cs' ? 'cs' : 'en';
  let q;
  try { q = quote(input); } catch (e) { return json(400, { error: e instanceof QuoteError ? e.message : 'Invalid request' }); }

  const origin = new URL(req.url).origin;
  const cs = lang === 'cs';
  const meta = { print: q.print, format: q.format, size: q.size, country: q.country, lang };
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: lang,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: q.priceCents,
          product_data: {
            name: `${cs ? q.title_cs : q.title}, ${cs ? q.formatName_cs : q.formatName}, ${q.size}`,
            ...(q.image ? { images: [origin + q.image] } : {}),
          },
        },
      }],
      shipping_address_collection: { allowed_countries: [q.country] },
      shipping_options: [{
        shipping_rate_data: {
          type: 'fixed_amount',
          display_name: cs ? 'Sledovaná zásilka DPD' : 'Tracked delivery (DPD)',
          fixed_amount: { amount: q.shippingCents, currency: 'eur' },
          delivery_estimate: { minimum: { unit: 'business_day', value: 5 }, maximum: { unit: 'business_day', value: 12 } },
        },
      }],
      phone_number_collection: { enabled: true },
      consent_collection: { terms_of_service: 'required' },
      custom_text: {
        terms_of_service_acceptance: { message: cs
          ? 'Souhlasím s [obchodními podmínkami](https://zavatsky.photo/terms) a beru na vědomí [poučení o odstoupení od smlouvy](https://zavatsky.photo/withdrawal).'
          : 'I agree to the [Terms of sale](https://zavatsky.photo/terms) and have read the [information on withdrawal](https://zavatsky.photo/withdrawal).' },
      },
      metadata: meta,
      payment_intent_data: { description: `${q.title}, ${q.formatName}, ${q.size} to ${q.country}`, metadata: meta },
      success_url: `${origin}/order-thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/prints#${q.print}`,
    });
    return json(200, { url: session.url });
  } catch (e) {
    console.error('Stripe checkout error:', e.message);
    return json(502, { error: 'Payment page could not be opened. Please try again, or write to me.' });
  }
};

export const config = { path: '/api/checkout' };
