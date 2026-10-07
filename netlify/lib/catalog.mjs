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
  10: ['Cross Print Sweats', 45000],
  11: ['Metal Logo Sweats', 45000],
  12: ['Black Tribal Sweats', 45000],
  13: ['Grey Tribal Sweats', 45000],
  14: ['Faded Black Barrel Jorts', 45000],
  15: ['Raw Denim Jorts', 45000],
  16: ['Washed Blue Jorts', 45000],
  17: ['Silver Floral Belt', 20000],
  18: ['Dragon Buckle Belt', 20000],
  19: ['Cross Buckle Belt', 20000],
  20: ['USA New York Polo', 40000],
};

// Multi-buy discount (any mix of items): buy 3+ save UGX 10,000, buy 2 save UGX 5,000.
// Delivery is free on every order. Must match TIERS in public/index.html.
export const MULTIBUY_TIERS = [[3, 10000], [2, 5000]];
export const discountFor = (count) => (MULTIBUY_TIERS.find(([n]) => count >= n) || [0, 0])[1];
