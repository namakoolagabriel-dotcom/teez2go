import { orderStore, json } from '../lib/store.mjs';
import { checkStatus } from '../lib/relworx.mjs';
import { settleOrder } from '../lib/orders.mjs';

export const config = { path: '/api/webhooks/relworx', method: 'POST' };

// Relworx calls this when a payment goes from pending -> success/failed.
// We DON'T trust the webhook body on its own (anyone can POST to a public URL).
// We use it only as a "go check this order" signal, then ask Relworx directly
// for the real status and amount before marking anything Paid.
export default async (req) => {
  let payload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const reference = payload?.customer_reference; // = our order id (T2G-...)
  if (!reference || typeof reference !== 'string') return json({ error: 'Missing customer_reference' }, 400);

  const store = orderStore();
  const order = await store.get(reference, { type: 'json' });
  if (!order) return json({ ok: true, ignored: 'unknown reference' }); // 200 so Relworx stops retrying

  if (order.status !== 'Pending') return json({ ok: true, status: order.status }); // already handled

  let remote;
  try {
    remote = await checkStatus(order.internal_reference || order.id);
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return json({ error: 'Could not verify payment yet' }, 503); // non-200 => Relworx retries
  }

  const updated = await settleOrder(store, order, remote);

  // Webhook claimed success but Relworx still says pending: ask Relworx to retry later.
  if (String(payload.status).toLowerCase() === 'success' && updated.status === 'Pending') {
    return json({ error: 'Payment not confirmed yet' }, 503);
  }
  return json({ ok: true, status: updated.status });
};
