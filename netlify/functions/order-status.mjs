import { orderStore, json } from '../lib/store.mjs';
import { checkStatus } from '../lib/relworx.mjs';
import { settleOrder } from '../lib/orders.mjs';

export const config = { path: '/api/order-status', method: 'GET' };

// The storefront polls this after the Mobile Money prompt is sent.
// Returns ONLY the status (the order id is a random, unguessable token).
// If the webhook hasn't arrived yet, it double-checks with Relworx itself.
export default async (req) => {
  const id = new URL(req.url).searchParams.get('id') || '';
  if (!/^T2G-[a-f0-9]{16}$/.test(id)) return json({ error: 'Invalid order id' }, 400);

  const store = orderStore();
  let order = await store.get(id, { type: 'json' });
  if (!order) return json({ error: 'Order not found' }, 404);

  if (order.status === 'Pending' && order.internal_reference) {
    try {
      const remote = await checkStatus(order.internal_reference);
      order = await settleOrder(store, order, remote);
    } catch (err) {
      console.error('Status fallback check failed:', err); // fine, webhook will still settle it
    }
  }

  return json({ orderId: order.id, status: order.status });
};
