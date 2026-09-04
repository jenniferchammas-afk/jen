// src/lib/waitroseProducts.js
//
// Maps this app's canonical shopping-list ingredient keys (see
// canonicalKey() in shoppingList.js) to a specific real product on the
// Waitrose - Dubai Mall storefront on Deliveroo UAE (Jennifer's own saved
// address/store). Verified live on 4 Sep 2026 by searching each ingredient
// in that store — prices, pack sizes and stock can drift over time, so
// treat this as a strong starting point to confirm at checkout, not gospel.
// A couple of items (marked `note`) aren't stocked there and use the
// closest realistic substitute instead.
//
// `staple: true` = a pantry/spice/condiment item Mira likely already has
// on hand and only needs occasionally — shown in a muted "staple" tag on
// the shopping list. `staple: false` = a fresh/perishable "variable"
// ingredient worth buying every time — shown in a warmer "pick up" tag.
//
// `sold`:
//  - 'packed' — sold in a fixed pack (e.g. a 500g tray, a jar, a 2-pack).
//    `packSize`/`packUnit` describe one pack, so the shopping list can
//    round the recipes' total quantity up to "N x pack".
//  - 'loose'  — sold by weight off the shelf (e.g. loose onions, limes).
//    No pack rounding — the list just shows the needed weight next to the
//    product name, the way Jennifer's own example did ("1000g Spanish
//    Brown Onion").

export const WAITROSE_PRODUCTS = {
  // --- Proteins ---
  'chicken breast': { product: 'Al Khazna Fresh Chicken Breast', packSize: 500, packUnit: 'g', sold: 'packed', staple: false },
  'salmon fillet': { product: 'Scottish Salmon Fillet', packSize: 200, packUnit: 'g', sold: 'packed', staple: false },
  'flank steak': { product: 'FineFood Grass Fed Beef Rump Steak', packSize: 250, packUnit: 'g', sold: 'packed', staple: false, note: 'Closest local match — flank steak itself isn\'t stocked; rump steak stir-fries the same way.' },
  turkey: { product: 'Finefood Turkey Mince', packSize: 500, packUnit: 'g', sold: 'packed', staple: false },
  beef: { product: 'Fine Food Lean Beef Mince 11%', packSize: 500, packUnit: 'g', sold: 'packed', staple: false, note: '89% lean — closest packaged option to the 93%-lean called for.' },
  egg: { product: 'Al Jazira Large White Eggs', packSize: 6, packUnit: 'each', sold: 'packed', staple: false },
  'egg white': { product: 'Egg Station Liquid Egg White', packSize: 500, packUnit: 'ml', sold: 'packed', staple: false },

  // --- Dairy & cheese ---
  mozzarella: { product: 'Waitrose Essential Slice Mozzarella', packSize: 250, packUnit: 'g', sold: 'packed', staple: false },
  'cheddar cheese': { product: 'Waitrose Essentials Medium Cheddar', packSize: 350, packUnit: 'g', sold: 'packed', staple: false },
  'cottage cheese': { product: 'Waitrose Essential Cottage Cheese Natural', packSize: 300, packUnit: 'g', sold: 'packed', staple: false },
  'nonfat greek yogurt': { product: 'Waitrose Greek 0% Fat Yogurt', packSize: 500, packUnit: 'g', sold: 'packed', staple: false },

  // --- Fresh produce ---
  cauliflower: { product: 'Waitrose Cauliflower Head (~700g)', packSize: 1, packUnit: 'head', sold: 'packed', staple: false },
  lemon: { product: 'Lemon South Africa', packSize: null, packUnit: 'g', sold: 'loose', staple: false },
  lime: { product: 'Waitrose Loose Green Lime Seedless Brazil', packSize: null, packUnit: 'g', sold: 'loose', staple: false },
  'red bell pepper': { product: 'Levart Mixed Bell Pepper (Capsicum)', packSize: 400, packUnit: 'g', sold: 'packed', staple: false, note: 'Already a mixed red/green pack — usually covers the green bell pepper line below too, so check before doubling up.' },
  'green bell pepper': { product: 'Levart Mixed Bell Pepper (Capsicum)', packSize: 400, packUnit: 'g', sold: 'packed', staple: false, note: 'Comes in the same mixed pack as the red bell pepper above — you likely only need the one pack total.' },
  onion: { product: 'Spanish Brown Onion', packSize: null, packUnit: 'g', sold: 'loose', staple: false },
  'red onion': { product: 'Waitrose Loose Red Onion Spain', packSize: null, packUnit: 'g', sold: 'loose', staple: false },
  garlic: { product: 'Waitrose Loose Jumbo Garlic Spain', packSize: 10, packUnit: 'clove', sold: 'packed', staple: true, note: '1 bulb ≈ 10 cloves.' },
  lettuce: { product: 'Spanish Iceberg Lettuce - Fresh, Crisp, Whole Head', packSize: 1, packUnit: 'head', sold: 'packed', staple: false },
  broccoli: { product: 'Broccoli Holland', packSize: null, packUnit: 'g', sold: 'loose', staple: false },
  ginger: { product: 'Waitrose Fresh Ginger', packSize: null, packUnit: 'g', sold: 'loose', staple: true },
  potato: { product: 'Syrian Potatoes', packSize: null, packUnit: 'g', sold: 'loose', staple: false },
  'green bean': { product: 'Waitrose Trimmed Fine Green Beans Kenya', packSize: 200, packUnit: 'g', sold: 'packed', staple: false },
  tomato: { product: 'Waitrose Loose Tomato UAE', packSize: null, packUnit: 'g', sold: 'loose', staple: false },
  coriander: { product: 'Waitrose Fresh Coriander (Cilantro) Kenya', packSize: 100, packUnit: 'g', sold: 'packed', staple: false },
  spinach: { product: 'Fine Food Organic Baby Spinach', packSize: 100, packUnit: 'g', sold: 'packed', staple: false },
  banana: { product: 'Chiquita Banana Ecuador', packSize: null, packUnit: 'g', sold: 'loose', staple: false },
  berry: { product: 'Fine Food Fresh Mix Berries', packSize: 260, packUnit: 'g', sold: 'packed', staple: false },

  // --- Pantry, oils & condiments (mostly staples) ---
  tahini: { product: 'Waitrose Tahini', packSize: 300, packUnit: 'g', sold: 'packed', staple: true },
  'olive oil': { product: 'Rahma Extra Virgin Olive Oil', packSize: 500, packUnit: 'ml', sold: 'packed', staple: true },
  'sesame oil': { product: 'Waitrose Toasted Sesame Oil', packSize: 250, packUnit: 'ml', sold: 'packed', staple: true },
  'low sodium soy sauce': { product: 'Amoy Reduced Salt Soy Sauce', packSize: 150, packUnit: 'ml', sold: 'packed', staple: true },
  'garlic and herb marinade': { product: 'Waitrose Cooks\' Ingredients Garlic & Herb Marinade', packSize: 90, packUnit: 'g', sold: 'packed', staple: true },
  guacamole: { product: 'Fine Food Mild Guacamole', packSize: 200, packUnit: 'g', sold: 'packed', staple: false },
  'marinara sauce': { product: 'Pure Harvest Marinara Sauce', packSize: 450, packUnit: 'g', sold: 'packed', staple: true },
  'wheat pasta': { product: 'Waitrose Whole Wheat Penne Pasta', packSize: 500, packUnit: 'g', sold: 'packed', staple: true },
  breadcrumb: { product: 'Waitrose Cooks\' Ingredients Breadcrumbs', packSize: 125, packUnit: 'g', sold: 'packed', staple: true },
  mustard: { product: 'Waitrose Essential Dijon Mustard', packSize: 180, packUnit: 'g', sold: 'packed', staple: true },
  ketchup: { product: 'Heinz Tomato Ketchup', packSize: 342, packUnit: 'g', sold: 'packed', staple: true },
  pickle: { product: 'Waitrose Crisp & Sweet Cocktail Gherkins', packSize: 290, packUnit: 'g', sold: 'packed', staple: true },
  honey: { product: 'Waitrose Essentials Squeezy Honey', packSize: 454, packUnit: 'g', sold: 'packed', staple: true },
  walnut: { product: 'Waitrose Walnut Halves', packSize: 100, packUnit: 'g', sold: 'packed', staple: true },
  pecan: { product: 'Best Pecan Halves', packSize: 225, packUnit: 'g', sold: 'packed', staple: true },
  'hemp heart': { product: 'Hunter\'s Gourmet Organic Chia Seeds', packSize: 300, packUnit: 'g', sold: 'packed', staple: true, note: 'Hemp hearts aren\'t stocked at this store — chia seeds are a very close swap in banana bread.' },
  'vanilla extract': { product: 'Dr Oetker Select Vanilla Extract', packSize: 95, packUnit: 'ml', sold: 'packed', staple: true },
  'coconut oil': { product: 'Earth\'s Finest Virgin Coconut Oil', packSize: 200, packUnit: 'ml', sold: 'packed', staple: true },
  'coconut sugar': { product: 'Earth Goods Organic Coconut Sugar', packSize: 340, packUnit: 'g', sold: 'packed', staple: true },
  'all-purpose flour': { product: 'Al Baker All Purpose Flour', packSize: 1000, packUnit: 'g', sold: 'packed', staple: true },
  'baking soda': { product: 'Arm & Hammer Fridge-N-Freezer Baking Soda', packSize: 396.8, packUnit: 'g', sold: 'packed', staple: true },
  cinnamon: { product: 'Waitrose Cooks\' Ingredients Ground Cinnamon', packSize: 32, packUnit: 'g', sold: 'packed', staple: true },
  cumin: { product: 'Waitrose Cooks\' Ingredients Ground Cumin', packSize: 40, packUnit: 'g', sold: 'packed', staple: true },
  'chili powder': { product: 'Waitrose Cooks\' Ingredients Chilli Flakes', packSize: 27, packUnit: 'g', sold: 'packed', staple: true, note: 'Chilli flakes stand in for chili powder — closest spice-jar match at this store.' },
}

/** Converts a recipe quantity+unit to grams/ml where the unit is a plain weight/volume unit. Returns null for volumetric (tsp/tbsp/cup) or count-based (clove/head/medium/etc.) units, which aren't safe to convert. */
export function toBaseUnit(quantity, unit) {
  if (quantity === null || quantity === undefined || !unit) return null
  const u = unit.toLowerCase().trim()
  const factors = { g: 1, kg: 1000, ml: 1, l: 1000, oz: 28.3495, lb: 453.592 }
  if (factors[u] === undefined) return null
  return quantity * factors[u]
}
