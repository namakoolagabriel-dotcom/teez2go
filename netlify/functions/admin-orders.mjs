import { timingSafeEqual } from 'node:crypto';
import { orderStore, json } from '../lib/store.mjs';

export const config = { path: '/api/admin/orders', method: 'GET' };

const safeEqual = (a, b) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

// View orders:  GET /api/admin/orders?status=Paid   with header  Authorization: Bearer <ADMIN_TOKEN>
// (or ?token=<ADMIN_TOKEN> so you can open it in a browser)
export default async (req) => {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return json({ error: 'ADMIN_TOKEN is not set' }, 500);

  const url = new URL(req.url);
  const supplied =
    (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '') || url.searchParams.get('token') || '';
  if (!safeEqual(supplied, adminToken)) return json({ error: 'Unauthorized' }, 401);

  const store = orderStore();
  const { blobs } = await store.list();
  const orders = (await Promise.all(blobs.map((b) => store.get(b.key, { type: 'json' })))).filter(Boolean);

  const wanted = url.searchParams.get('status');
  const result = orders
    .filter((o) => !wanted || o.status.toLowerCase() === wanted.toLowerCase())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return json({ count: result.length, orders: result });
};
