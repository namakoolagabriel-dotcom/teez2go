// Server-side price list. The server NEVER trusts prices sent from the browser.
// Keep this in sync with the product list (const P) in public/index.html.
export const CATALOG = {
  1: ['Core Tee', 40000],
  2: ['Box Tee', 40000],
  3: ['Pocket Tee', 40000],
  4: ['Longline Tee', 40000],
  5: ['Ringer Tee', 40000],
  6: ['Acid Wash Tee', 40000],
  7: ['Night Shift Graphic Tee', 40000],
  8: ['Corner Store Graphic Tee', 40000],
  9: ['Cropped Boxy Tee', 40000],
  10: ['Fleece Joggers', 50000],
  11: ['Wide-Leg Sweats', 50000],
  12: ['Cargo Sweats', 50000],
  13: ['Cuffed Terry Sweats', 50000],
  14: ['Baggy Denim Jorts', 50000],
  15: ['Cargo Jorts', 50000],
  16: ['Terry Jorts', 50000],
  17: ['Web Belt', 20000],
  18: ['Chain Belt', 20000],
  19: ['Leather Belt', 20000],
};

// Same rule as the storefront: shipping applies only when the cart has exactly 1 item.
export const SHIPPING_FEE = 10000;
