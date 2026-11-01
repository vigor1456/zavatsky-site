// Email texts for orders and withdrawals, in English and Czech.
import { termsText } from '../../../src/lib/terms.js';

const SELLER = 'Third Place Labs s.r.o., Školská 660/3, 110 00 Praha 1, IČO 24501212';
const eur = (cents) => '€' + (cents / 100).toFixed(cents % 100 ? 2 : 0);
const addr = (a) => a ? [a.line1, a.line2, `${a.postal_code || ''} ${a.city || ''}`.trim(), a.state, a.country].filter(Boolean).join(', ') : '';

export function buyerConfirmation(o, lang = 'en') {
  const cs = lang === 'cs';
  const lines = cs ? [
    `Dobrý den${o.name ? ' ' + o.name : ''},`, '',
    `děkuji za objednávku č. ${o.number}. Platba proběhla v pořádku a tisk teď připravím.`, '',
    `Tisk: ${o.title_cs}`, `Formát: ${o.formatName_cs}, ${o.size}`,
    `Cena: ${eur(o.priceCents)}`, `Doprava (${o.zone}): ${eur(o.shippingCents)}`, `Celkem zaplaceno: ${eur(o.totalCents)}`, '',
    `Doručovací adresa: ${o.shipName || o.name}, ${addr(o.shipAddress)}`, '',
    'Tisk vyrobí laboratoř uměleckého tisku v Česku, zkontroluji ho a odešlu sledovanou zásilkou, obvykle do 5 až 10 pracovních dnů. Číslo pro sledování vám pošlu e-mailem.', '',
    'Jako spotřebitel můžete od smlouvy odstoupit do 14 dnů od převzetí: https://zavatsky.photo/withdrawal', '',
    'S pozdravem', 'Maximilian Ravique', SELLER, 'Prodávající není plátcem DPH.', '',
    '———', '', termsText('cs'),
  ] : [
    `Hello${o.name ? ' ' + o.name : ''},`, '',
    `Thank you for your order no. ${o.number}. Your payment has been received and I'll now prepare your print.`, '',
    `Print: ${o.title}`, `Format: ${o.formatName}, ${o.size}`,
    `Price: ${eur(o.priceCents)}`, `Shipping (${o.zone}): ${eur(o.shippingCents)}`, `Total paid: ${eur(o.totalCents)}`, '',
    `Delivery address: ${o.shipName || o.name}, ${addr(o.shipAddress)}`, '',
    "Your print will be made by a fine-art print lab in Czechia, checked by me and sent by tracked shipping, usually within 5 to 10 working days. I'll email you the tracking number.", '',
    'As a consumer, you may withdraw from the contract within 14 days of receiving the print: https://zavatsky.photo/withdrawal', '',
    'Best regards,', 'Maximilian Ravique', SELLER, 'The seller is not a VAT payer.', '',
    '———', '', 'Below are the terms of sale that apply to your order.', '', termsText('en'),
  ];
  return { subject: cs ? `Potvrzení objednávky č. ${o.number}` : `Order confirmation no. ${o.number}`, text: lines.join('\n') };
}

export function ownerNotification(o) {
  const text = [
    `NEW ORDER ${o.number}`, '',
    `Print: ${o.title} (${o.print})`, `Format: ${o.formatName}, ${o.size}`, `Lab product: ${o.code || '-'}`, `Parcel: ${o.parcel}`, '',
    `Price ${eur(o.priceCents)} + shipping ${eur(o.shippingCents)} (${o.zone}) = ${eur(o.totalCents)} paid`, '',
    `Ship to: ${o.shipName || o.name}`, `Address: ${addr(o.shipAddress)}`, `Phone: ${o.phone || '-'}`, `Email: ${o.email || '-'}`, `Language: ${o.lang}`, '',
    `Stripe: https://dashboard.stripe.com/${o.livemode ? '' : 'test/'}payments/${o.paymentIntent || ''}`,
  ].join('\n');
  return { subject: `New print order ${o.number}: ${o.title}, ${o.size}`, text };
}

export function withdrawalAck(d, lang = 'en') {
  const cs = lang === 'cs';
  const when = new Date().toLocaleString(cs ? 'cs-CZ' : 'en-GB', { timeZone: 'Europe/Prague' });
  const text = (cs ? [
    `Dobrý den${d.name ? ' ' + d.name : ''},`, '',
    `potvrzuji přijetí vašeho odstoupení od smlouvy (${when}).`, '',
    `Objednávka: ${d.order || '-'}`, `Tisky: ${d.items || 'celá objednávka'}`, '',
    'Tisk prosím vraťte dobře zabalený do 14 dnů na adresu: Third Place Labs s.r.o., Školská 660/3, 110 00 Praha 1. Peníze vám vrátím do 14 dnů od přijetí odstoupení, stejným platebním prostředkem, nejpozději však po obdržení tisku nebo dokladu o jeho odeslání.', '',
    'S pozdravem', 'Maximilian Ravique', SELLER,
  ] : [
    `Hello${d.name ? ' ' + d.name : ''},`, '',
    `This confirms that your withdrawal from the contract has been received (${when}).`, '',
    `Order: ${d.order || '-'}`, `Prints: ${d.items || 'whole order'}`, '',
    'Please return the print, well packed, within 14 days to: Third Place Labs s.r.o., Školská 660/3, 110 00 Praha 1, Czech Republic. I will refund you within 14 days of receiving your withdrawal, using the same payment method, once the print has arrived or you have shown that you sent it.', '',
    'Best regards,', 'Maximilian Ravique', SELLER,
  ]).join('\n');
  return { subject: cs ? 'Potvrzení přijetí odstoupení od smlouvy' : 'Withdrawal received', text };
}
