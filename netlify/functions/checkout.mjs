import { randomBytes } from 'node:crypto';
import { CATALOG, SHIPPING_FEE } from '../lib/catalog.mjs';
import { orderStore, json } from '../lib/store.mjs';
import { requestPayment, relworxConfigured } from '../lib/relworx.mjs';

export const config = { path: '/api/checkout', method: 'POST' };

// 0770123456 / 770123456 / 256770123456 / +256 770 123 456  ->  +256770123456
function normalizeUgPhone(raw) {
  let d = String(raw || '').replace(/[\s\-()]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  if (d.startsWith('256')) d = d.slice(3);
  else if (d.startsWith('0')) d = d.slice(1);
  return /^(7\d|39)\d{7}$/.test(d) ? `+256${d}` : null; // MTN & Airtel ranges (07x / 039)
}

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!relworxConfigured()) {
    console.error('RELWORX_API_KEY / RELWORX_ACCOUNT_NO env vars are not set');
    return json({ error: 'Payments are not configured yet. Please try again later.' }, 500);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  // ---- validate input ----
  const name = String(body.customer_name || '').trim();
  const address = String(body.delivery_address || '').trim();
  const phone = normalizeUgPhone(body.phone);
  const rawItems = Array.isArray(body.items) ? body.items : [];

  if (name.length < 2 || name.length > 100) return json({ error: 'Please enter your full name.' }, 400);
  if (address.length < 5 || address.length > 300) return json({ error: 'Please enter a delivery address.' }, 400);
  if (!phone) return json({ error: 'Enter a valid MTN or Airtel number, e.g. 0770 123456.' }, 400);
  if (!rawItems.length || rawItems.length > 50) return json({ error: 'Your cart is empty.' }, 400);

  // ---- price the cart on the SERVER ----
  const items = [];
  let count = 0;
  let subtotal = 0;
  for (const it of rawItems) {
    const entry = CATALOG[Number(it.id)];
    const qty = Number(it.qty);
    if (!entry || !Number.isInteger(qty) || qty < 1 || qty > 20) {
      return json({ error: 'Your cart has an invalid item. Please refresh and try again.' }, 400);
    }
    items.push({ id: Number(it.id), name: entry[0], price: entry[1], qty });
    count += qty;
    subtotal += entry[1] * qty;
  }
  const shipping = count === 1 ? SHIPPING_FEE : 0;
  const total = subtotal + shipping;

  // ---- create the order BEFORE asking for payment, so the webhook can always find it ----
  const id = `T2G-${randomBytes(8).toString('hex')}`; // 20 chars (Relworx allows 8-36)
  const store = orderStore();
  const order = {
    id,
    status: 'Pending',
    currency: 'UGX',
    items,
    subtotal,
    shipping,
    total,
    customer_name: name,
    delivery_address: address,
    phone,
    internal_reference: null,
    createdAt: new Date().toISOString(),
  };
  await store.setJSON(id, order);

  // ---- ask Relworx to prompt the customer's phone ----
  let result;
  try {
    result = await requestPayment({
      reference: id,
      msisdn: phone,
      amount: total,
      description: `Teez2Go order ${id}`,
    });
  } catch (err) {
    console.error('Relworx request failed:', err);
    order.status = 'Failed';
    order.note = 'Could not reach Relworx';
    await store.setJSON(id, order);
    return json({ error: 'Could not reach the payment service. Please try again.' }, 502);
  }

  if (!result.ok) {
    console.error('Relworx rejected payment request:', JSON.stringify(result.data));
    order.status = 'Failed';
    order.note = result.data?.message || 'Relworx rejected the request';
    await store.setJSON(id, order);
    return json({ error: result.data?.message || 'Could not start the payment. Please check your number and try again.' }, 502);
  }

  order.internal_reference = result.data.internal_reference || null;
  await store.setJSON(id, order);

  return json({ orderId: id, amount: total, phone, status: 'Pending' }, 201);
};
