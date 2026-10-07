# Teez2Go – Relworx Mobile Money checkout (Netlify Functions)

## Layout
```
public/index.html                  storefront (patched checkout)
netlify/functions/checkout.mjs     POST /api/checkout          creates order + sends Mobile Money prompt
netlify/functions/relworx-webhook.mjs  POST /api/webhooks/relworx   Relworx -> marks order Paid / Failed
netlify/functions/order-status.mjs GET  /api/order-status?id=  storefront polls this
netlify/functions/admin-orders.mjs GET  /api/admin/orders      you view orders (needs ADMIN_TOKEN)
netlify/lib/catalog.mjs            server-side prices + discount tiers (keep in sync with const P and TIERS in index.html)
```

## Deploy (must be Git or Netlify CLI – NOT drag-and-drop)
Functions need `npm install` (for @netlify/blobs), which drag-and-drop deploys don't run.
1. Push this folder to a GitHub repo and connect it in Netlify (Add new site > Import), or run `npx netlify deploy --prod`.
2. Netlify > Site configuration > Environment variables, add:
   - `RELWORX_ACCOUNT_NO`  = your Relworx account number
   - `RELWORX_API_KEY`     = your NEW Relworx API key (rotate the one that was shared in chat!)
   - `ADMIN_TOKEN`         = long random string
3. Relworx dashboard > your business account > Settings > Webhook URL:
   `https://YOUR-SITE.netlify.app/api/webhooks/relworx`
4. Redeploy after setting env vars.

## Test
- Place a real order for the cheapest item (a belt, UGX 20,000, delivery is free) from your own phone.
- Approve on the phone; the page should flip to "Payment received!".
- View orders: `https://YOUR-SITE.netlify.app/api/admin/orders?status=Paid&token=YOUR_ADMIN_TOKEN`

## How payment safety works
- Prices and the multi-buy discount (2 items -5,000 / 3+ items -10,000, free delivery) are recomputed on the server; the browser's total is only a sanity check.
- The webhook is only a trigger. Before marking Paid, the server asks Relworx directly
  (check-request-status) and verifies status AND amount == order total. A forged webhook can't mark an order Paid.
- Order statuses: Pending, Paid, Failed, Review (money received but amount didn't match: check manually).
