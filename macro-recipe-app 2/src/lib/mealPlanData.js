// src/lib/mealPlanData.js
//
// Static data backing the Weekly Schedule tab: the two people's daily
// macro targets, the batch-cook days, and the preloaded favorite recipes
// (3 breakfasts + 6 lunch/dinner mains) that show up as picker options
// alongside "Eat out" and "Generate a new recipe".
//
// Recipe shape matches what extract-recipe / suggest-recipes return, so
// these slot into the exact same RecipeCard / shopping-list machinery.

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
    title: 'High-Protein Banana Bread',
    servings: 8,
    ingredients: [
      { name: 'banana', quantity: 2, unit: 'medium' },
      { name: 'milk', quantity: 1, unit: 'cup' },
      { name: 'self rising flour', quantity: 2, unit: 'cup' },
      { name: 'almond flour', quantity: 0.5, unit: 'cup' },
      { name: 'protein powder', quantity: 0.25, unit: 'cup' },
    ],
    macros_per_serving: { calories: 196, protein_g: 25, carbs_g: 21, fat_g: 5, estimated: false },
    instructions_summary: 'Mix wet and dry ingredients separately, combine, and bake as a loaf. Macros are per slice.',
    source_url: 'https://thebigmansworld.com/protein-banana-bread/',
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

// The 6 lunch/dinner favorites. Macros are per-serving estimates, built up
// from standard ingredient nutrition the same way the site's AI estimates
// an un-labelled recipe — flagged "estimated" for the same reason.
export const MAINS = [
  {
    id: 'main-salmon-quinoa',
    title: 'Grilled Salmon with Quinoa & Tahini Cauliflower',
    servings: 4,
    ingredients: [
      { name: 'salmon fillet', quantity: 600, unit: 'g' },
      { name: 'quinoa', quantity: 1.5, unit: 'cup' },
      { name: 'cauliflower', quantity: 1, unit: 'large head' },
      { name: 'tahini', quantity: 3, unit: 'tbsp' },
      { name: 'olive oil', quantity: 2, unit: 'tbsp' },
      { name: 'lemon', quantity: 1, unit: null },
      { name: 'garlic', quantity: 2, unit: 'clove' },
    ],
    macros_per_serving: { calories: 696, protein_g: 46.6, carbs_g: 49, fat_g: 36, estimated: true },
    instructions_summary: 'Grill the salmon, roast the cauliflower with olive oil then toss in tahini-lemon dressing, serve over cooked quinoa.',
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
      { name: 'cumin', quantity: 2, unit: 'tsp' },
      { name: 'chili powder', quantity: 1, unit: 'tsp' },
    ],
    macros_per_serving: { calories: 285, protein_g: 29, carbs_g: 13, fat_g: 12, estimated: true },
    instructions_summary: 'Sauté spiced chicken strips with peppers and onion, serve in lettuce cups topped with guacamole.',
    source_url: null,
  },
  {
    id: 'main-beef-broccoli',
    title: 'Beef Strips, Broccoli & Ginger with Jasmine Rice',
    servings: 4,
    ingredients: [
      { name: 'flank steak', quantity: 1, unit: 'lb' },
      { name: 'broccoli', quantity: 1, unit: 'large head' },
      { name: 'ginger', quantity: 1, unit: 'inch piece' },
      { name: 'garlic', quantity: 5, unit: 'clove' },
      { name: 'low sodium soy sauce', quantity: 0.33, unit: 'cup' },
      { name: 'sesame oil', quantity: 1, unit: 'tbsp' },
      { name: 'jasmine rice', quantity: 600, unit: 'g cooked' },
    ],
    macros_per_serving: { calories: 510, protein_g: 36, carbs_g: 67, fat_g: 13, estimated: true },
    instructions_summary: 'Sear beef strips, stir-fry with broccoli, garlic and ginger in a soy-sesame sauce, serve over jasmine rice.',
    source_url: 'https://www.skinnytaste.com/broccoli-beef/',
  },
  {
    id: 'main-herb-chicken',
    title: 'Grilled Herb Chicken with Potatoes & Veg',
    servings: 4,
    ingredients: [
      { name: 'chicken breast', quantity: 600, unit: 'g' },
      { name: 'potatoes', quantity: 600, unit: 'g' },
      { name: 'green beans', quantity: 400, unit: 'g' },
      { name: 'olive oil', quantity: 2, unit: 'tbsp' },
      { name: 'garlic and herb marinade', quantity: 3, unit: 'oz' },
    ],
    macros_per_serving: { calories: 490, protein_g: 51, carbs_g: 37, fat_g: 14, estimated: true },
    instructions_summary: 'Marinate chicken in garlic and herbs, grill, and roast potatoes and green beans alongside.',
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
      { name: 'whole wheat pasta', quantity: 600, unit: 'g cooked' },
      { name: 'parmesan', quantity: 4, unit: 'tbsp' },
    ],
    macros_per_serving: { calories: 530, protein_g: 40, carbs_g: 57, fat_g: 12, estimated: true },
    instructions_summary: 'Form and brown turkey meatballs, simmer in marinara, serve over whole wheat pasta.',
    source_url: null,
  },
  {
    id: 'main-chicken-parm',
    title: 'One-Pot Chicken Parmesan',
    servings: 4,
    ingredients: [
      { name: 'chicken breast', quantity: 600, unit: 'g' },
      { name: 'marinara sauce', quantity: 400, unit: 'g' },
      { name: 'mozzarella', quantity: 120, unit: 'g' },
      { name: 'whole wheat pasta', quantity: 400, unit: 'g cooked' },
      { name: 'parmesan', quantity: 4, unit: 'tbsp' },
    ],
    macros_per_serving: { calories: 500, protein_g: 60, carbs_g: 35, fat_g: 13, estimated: true },
    instructions_summary: 'Sear chicken, simmer in marinara with pasta in the same pot, top with mozzarella and parmesan to melt.',
    source_url: null,
  },
]

export const EAT_OUT = {
  id: 'eatout',
  title: 'Eat out',
  servings: 1,
  ingredients: [],
  macros_per_serving: { calories: null, protein_g: null, carbs_g: null, fat_g: null, estimated: true },
  instructions_summary: 'Not tracked — logged as a placeholder so the day still shows the rest of your macros.',
  source_url: null,
}

export function favoritesFor(meal) {
  return meal === 'breakfast' ? BREAKFASTS : MAINS
}
