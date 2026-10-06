import { getStore } from '@netlify/blobs';

export const orderStore = () => getStore({ name: 'orders', consistency: 'strong' });

export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
