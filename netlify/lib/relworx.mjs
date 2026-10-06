const BASE = 'https://payments.relworx.com/api/mobile-money';

const headers = () => ({
  Authorization: `Bearer ${process.env.RELWORX_API_KEY}`,
  Accept: 'application/vnd.relworx.v2',
  'Content-Type': 'application/json',
});

export const relworxConfigured = () =>
  Boolean(process.env.RELWORX_API_KEY && process.env.RELWORX_ACCOUNT_NO);

// Sends the Mobile Money prompt to the customer's phone.
export async function requestPayment({ reference, msisdn, amount, description }) {
  const res = await fetch(`${BASE}/request-payment`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      account_no: process.env.RELWORX_ACCOUNT_NO,
      reference,
      msisdn,
      currency: 'UGX',
      amount,
      description,
    }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok && data.success !== false, data };
}

// Asks Relworx directly for the real status of a payment (the source of truth).
export async function checkStatus(internalReferenceOrReference) {
  const url =
    `${BASE}/check-request-status?internal_reference=${encodeURIComponent(internalReferenceOrReference)}` +
    `&account_no=${encodeURIComponent(process.env.RELWORX_ACCOUNT_NO)}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(`Relworx status check failed (HTTP ${res.status})`);
  return res.json();
}
