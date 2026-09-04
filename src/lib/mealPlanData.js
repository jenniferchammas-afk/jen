// src/lib/mealPlanData.js
//
// Static data backing the Weekly Schedule tab: the two people's daily
// macro targets, the batch-cook days, and the preloaded favorite recipes
// (3 breakfasts + 7 lunch/dinner mains) that show up as picker options
// alongside "Eat out" and "Generate a new recipe".
//
// Recipe shape matches what extract-recipe / suggest-recipes return, so
// these slot into the exact same RecipeCard / shopping-list machinery.
//
// Design note on the mains: each one is built as ONE lean protein + mostly
// non-starchy veg + a SINGLE measured fat source (not oil-in-the-pan plus
// a sauce plus cheese plus nuts all stacked on top of each other), and
// carbs come from vegetables rather than a full rice/pasta serving baked
// in by default. That's what keeps two of them combined (a normal lunch +
// dinner day) from blowing past a ~50g fat / ~100g carb daily budget —
// add rice, potato or extra pasta on the side yourself if you want more,
// per the notes on the carb-hungrier dishes below.

export const PEOPLE = {
  jennifer: {
    name: 'Jennifer',
    target: { calories: 1306, protein_g: 114, carbs_g: 100, fat_g: 50 },
  },
  dino: {
    name: 'Dino',
    target: { calories: 2085, protein_g: 175, carbs_g: 200, fat_g: 65 },
  },
}

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// Mira's batch-cook days — she cooks two dishes each of these mornings.
export const COOK_DAYS = ['Monday', 'Wednesday']

export const MEALS = ['breakfast', 'lunch', 'dinner']

export const BREAKFASTS = [
  {
    id: 'bf-omelet',
    title: 'High-Protein Omelet',
    servings: 1,
    ingredients: [
      { name: 'egg', quantity: 1, unit: null },
      { name: 'egg whites', quantity: 0.5, unit: 'cup' },
      { name: 'spinach', quantity: 2, unit: 'tbsp' },
      { name: 'red bell pepper', quantity: 2, unit: 'tbsp' },
      { name: 'red onion', quantity: 1, unit: 'tbsp' },
      { name: 'cheddar cheese', quantity: 0.33, unit: 'cup' },
    ],
    macros_per_serving: { calories: 262, protein_g: 30, carbs_g: 6, fat_g: 11, estimated: false },
    instructions_summary: 'Beat egg and egg whites with vegetables, cook in a nonstick pan, fold with cheese.',
    source_url: 'https://www.skinnytaste.com/high-protein-omelet/',
  },
  {
    id: 'bf-banana-bread',
    title: 'Cottage Cheese Banana Bread',
    servings: 12,
    ingredients: [
      { name: 'banana', quantity: 3, unit: 'medium' },
      { name: 'coconut sugar', quantity: 90, unit: 'g' },
      { name: 'coconut oil', quantity: 90, unit: 'ml' },
      { name: 'egg', quantity: 2, unit: null },
      { name: 'cottage cheese', quantity: 150, unit: 'g' },
      { name: 'hemp hearts', quantity: 4, unit: 'tbsp' },
      { name: 'vanilla extract', quantity: 1, unit: 'tsp' },
      { name: 'all-purpose flour', quantity: 210, unit: 'g' },
      { name: 'baking soda', quantity: 1, unit: 'tsp' },
      { name: 'ground cinnamon', quantity: 1, unit: 'tsp' },
      { name: 'pecans', quantity: 2, unit: 'tbsp' },
    ],
    macros_per_serving: { calories: 235, protein_g: 5, carbs_g: 29, fat_g: 11, estimated: false },
    instructions_summary:
      'From "The Energy Upgrade" 15 Meals Recipe Pack. Mash the bananas and beat with the coconut sugar, coconut oil, eggs, cottage cheese, hemp hearts and vanilla until smooth. In a separate bowl whisk the flour, baking soda and cinnamon, then fold into the wet mixture. Pour into a lined loaf tin, scatter the chopped pecans on top, and bake at 175°C (350°F) for 55–60 minutes, until a skewer comes out clean. Macros are per slice (makes 12).',
    source_url: null,
  },
  {
    id: 'bf-yogurt',
    title: 'Greek Yoghurt with Berries',
    servings: 1,
    ingredients: [
      { name: 'nonfat plain Greek yogurt', quantity: 6, unit: 'oz' },
      { name: 'berries', quantity: 0.5, unit: 'cup' },
      { name: 'walnuts', quantity: 1, unit: 'tbsp' },
      { name: 'honey', quantity: 1, unit: 'tbsp' },
    ],
    macros_per_serving: { calories: 250, protein_g: 19.5, carbs_g: 35.5, fat_g: 4.5, estimated: false },
    instructions_summary: 'Top yoghurt with berries, walnuts and a drizzle of honey.',
    source_url: 'https://www.skinnytaste.com/greek-yogurt-with-berries-nuts-and/',
  },
]

// The 7 lunch/dinner favorites — redesigned lean: one protein, one measured
// fat source, carbs mostly from vegetables. Macros are per-serving
// estimates built from standard ingredient nutrition, flagged "estimated"
// the same way the site flags any AI-estimated (non-lab-tested) recipe.
export const MAINS = [
  {
    id: 'main-salmon-quinoa',
    title: 'Grilled Salmon with Tahini Cauliflower',
    servings: 4,
    ingredients: [
      { name: 'salmon fillet', quantity: 480, unit: 'g' },
      { name: 'cauliflower', quantity: 1, unit: 'large head' },
      { name: 'tahini', quantity: 4, unit: 'tsp' },
      { name: 'olive oil', quantity: 4, unit: 'tsp' },
      { name: 'lemon', quantity: 1, unit: null },
      { name: 'garlic', quantity: 2, unit: 'clove' },
    ],
    macros_per_serving: { calories: 365, protein_g: 31, carbs_g: 11, fat_g: 23, estimated: true },
    instructions_summary:
      'Grill the salmon, roast the cauliflower with a little olive oil, then finish with a thin tahini-lemon drizzle. Salmon carries most of the fat here — a naturally fatty fish, not an added-oil problem — so it pairs best with a leaner dish the same day. Add cooked quinoa or rice on the side for more carbs.',
    source_url: null,
  },
  {
    id: 'main-fajitas',
    title: 'Low-Carb Chicken Fajitas & Guacamole',
    servings: 4,
    ingredients: [
      { name: 'chicken breast', quantity: 600, unit: 'g' },
      { name: 'red bell pepper', quantity: 1, unit: null },
      { name: 'green bell pepper', quantity: 1, unit: null },
      { name: 'onion', quantity: 1, unit: 'medium' },
      { name: 'lime', quantity: 2, unit: null },
      { name: 'olive oil', quantity: 2, unit: 'tsp' },
      { name: 'lettuce', quantity: 1, unit: 'head' },
      { name: 'guacamole', quantity: 120, unit: 'g' },
      { name: 'coriander', quantity: 15, unit: 'g' },
      { name: 'cumin', quantity: 2, unit: 'tsp' },
      { name: 'chili powder', quantity: 1, unit: 'tsp' },
    ],
    macros_per_serving: { calories: 285, protein_g: 29, carbs_g: 13, fat_g: 12, estimated: true },
    instructions_summary: 'Sauté spiced chicken strips with peppers and onion, serve in lettuce cups topped with guacamole and a scatter of fresh coriander — the avocado is the only added fat.',
    source_url: null,
  },
  {
    id: 'main-beef-broccoli',
    title: 'Beef Strips, Broccoli & Ginger',
    servings: 4,
    ingredients: [
      { name: 'flank steak', quantity: 1, unit: 'lb' },
      { name: 'broccoli', quantity: 1, unit: 'large head' },
      { name: 'ginger', quantity: 1, unit: 'inch piece' },
      { name: 'garlic', quantity: 5, unit: 'clove' },
      { name: 'low sodium soy sauce', quantity: 0.33, unit: 'cup' },
      { name: 'sesame oil', quantity: 1, unit: 'tbsp' },
    ],
    macros_per_serving: { calories: 315, protein_g: 32, carbs_g: 24.5, fat_g: 12.5, estimated: true },
    instructions_summary:
      'Sear beef strips, stir-fry with broccoli, garlic and ginger in a soy-sesame sauce. Add ~150g cooked jasmine rice per serving if you want a bigger carb portion (Dino) — it stacks another ~40g carb on top.',
    source_url: 'https://www.skinnytaste.com/broccoli-beef/',
  },
  {
    id: 'main-herb-chicken',
    title: 'Grilled Herb Chicken with Potatoes & Veg',
    servings: 4,
    ingredients: [
      { name: 'chicken breast', quantity: 600, unit: 'g' },
      { name: 'potatoes', quantity: 400, unit: 'g' },
      { name: 'green beans', quantity: 600, unit: 'g' },
      { name: 'olive oil', quantity: 4, unit: 'tsp' },
      { name: 'garlic and herb marinade', quantity: 3, unit: 'oz' },
    ],
    macros_per_serving: { calories: 450, protein_g: 51.5, carbs_g: 30.5, fat_g: 12.4, estimated: true },
    instructions_summary: 'Marinate chicken in garlic and herbs, grill, and roast a modest portion of potatoes with plenty of green beans alongside.',
    source_url: 'https://www.skinnytaste.com/grilled-garlic-and-herb-chicken-and-veggies/',
  },
  {
    id: 'main-bolognese',
    title: 'Meatball Bolognese',
    servings: 4,
    ingredients: [
      { name: 'ground turkey', quantity: 1, unit: 'lb' },
      { name: 'breadcrumbs', quantity: 0.25, unit: 'cup' },
      { name: 'egg', quantity: 1, unit: null },
      { name: 'marinara sauce', quantity: 600, unit: 'g' },
      { name: 'whole wheat pasta', quantity: 240, unit: 'g cooked' },
    ],
    macros_per_serving: { calories: 420, protein_g: 35, carbs_g: 34, fat_g: 11, estimated: true },
    instructions_summary:
      'Form and brown turkey meatballs, simmer in marinara, serve over a modest portion of whole wheat pasta (about 60g cooked per serving). Swap in zucchini noodles instead of pasta to cut the carbs further.',
    source_url: null,
  },
  {
    id: 'main-chicken-parm',
    title: 'One-Pot Chicken Parmesan',
    servings: 4,
    ingredients: [
      { name: 'chicken breast', quantity: 600, unit: 'g' },
      { name: 'marinara sauce', quantity: 400, unit: 'g' },
      { name: 'mozzarella', quantity: 80, unit: 'g' },
      { name: 'whole wheat pasta', quantity: 240, unit: 'g cooked' },
    ],
    macros_per_serving: { calories: 426, protein_g: 56, carbs_g: 25, fat_g: 11, estimated: true },
    instructions_summary: 'Sear chicken, simmer in marinara with a light portion of pasta in the same pot, top with mozzarella to melt.',
    source_url: null,
  },
  {
    id: 'main-lettuce-burgers',
    title: 'Lettuce Burgers',
    servings: 4,
    ingredients: [
      { name: 'lean ground beef', quantity: 800, unit: 'g' },
      { name: 'lettuce', quantity: 1, unit: 'head' },
      { name: 'tomato', quantity: 1, unit: null },
      { name: 'red onion', quantity: 0.5, unit: null },
      { name: 'pickles', quantity: 8, unit: 'slices' },
      { name: 'mustard', quantity: 4, unit: 'tsp' },
      { name: 'ketchup', quantity: 4, unit: 'tsp' },
    ],
    macros_per_serving: { calories: 375, protein_g: 48.5, carbs_g: 7, fat_g: 16, estimated: true },
    instructions_summary:
      'Grill lean (93%) beef patties, wrap in whole lettuce leaves instead of a bun, and build up with tomato, red onion, pickles, mustard and ketchup. Add a slice of cheese for Dino\'s portion if he wants more fat/calories.',
    source_url: null,
  },
]

export const EAT_OUT = {
  id: 'eatout',
  title: 'Eat out',
  servings: 1,
  ingredients: [],
  macros_per_serving: { calories: null, protein_g: null, carbs_g: null, fat_g: null, estimated: true },
  instructions_summary:
    "Counted as hitting your own per-meal macro target rather than a specific tracked dish, so the day's bars still fill up correctly — Jennifer's and Dino's eat-out macros are each based on their own targets, not a shared number.",
  source_url: null,
}

export function favoritesFor(meal) {
  return meal === 'breakfast' ? BREAKFASTS : MAINS
}
