// Server-side price list. The server NEVER trusts prices sent from the browser.
// Keep names AND prices in sync with the product list (const P) in public/index.html.
export const CATALOG = {
  1: ['Epic PVP Tee', 40000],
  2: ['Enfants Tee', 40000],
  3: ['Stone Age Tee', 40000],
  4: ['Stop Begin Tee', 40000],
  5: ['Toy Boy Tee', 40000],
  6: ['Saint World Wide Tee', 40000],
  7: ['Stafdrone Tee', 40000],
  8: ['Shadow Light Tee', 40000],
  9: ['Startlove Tee', 40000],
  10: ['Cross Print Sweats', 50000],
  11: ['Metal Logo Sweats', 50000],
  12: ['Black Tribal Sweats', 50000],
  13: ['Grey Tribal Sweats', 50000],
  14: ['Faded Black Barrel Jorts', 50000],
  15: ['Raw Denim Jorts', 50000],
  16: ['Washed Blue Jorts', 50000],
  17: ['Silver Floral Belt', 20000],
  18: ['Dragon Buckle Belt', 20000],
  19: ['Cross Buckle Belt', 20000],
  20: ['USA New York Polo', 40000],
};

// Same rule as the storefront: shipping applies only when the cart has exactly 1 item.
export const SHIPPING_FEE = 10000;
