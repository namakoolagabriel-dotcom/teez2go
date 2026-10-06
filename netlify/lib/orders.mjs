// Applies a VERIFIED Relworx result to an order. Safe to call repeatedly (idempotent).
export async function settleOrder(store, order, remote) {
  if (order.status !== 'Pending') return order;

  const st = String(remote.status || '').toLowerCase();

  if (st === 'success') {
    const amountOk = Number(remote.amount) === order.total;
    const currencyOk = !remote.currency || remote.currency === 'UGX';
    if (!amountOk || !currencyOk) {
      // Money arrived but doesn't match the order: flag for manual review, never auto-mark Paid.
      order.status = 'Review';
      order.note = `Amount/currency mismatch: got ${remote.amount} ${remote.currency}, expected ${order.total} UGX`;
    } else {
      order.status = 'Paid';
      order.paidAt = remote.completed_at || new Date().toISOString();
      order.provider = remote.provider || null;
    }
  } else if (st === 'failed') {
    order.status = 'Failed';
    order.failedAt = new Date().toISOString();
  } else {
    return order; // still pending
  }

  await store.setJSON(order.id, order);
  return order;
}
