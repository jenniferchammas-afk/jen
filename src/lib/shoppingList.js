// src/lib/shoppingList.js
//
// Merges ingredient lists from multiple selected recipes into one
// consolidated shopping list: same ingredient (after stripping common
// descriptors like "skinless"/"fresh"/"organic") + same unit gets summed,
// different units for the same ingredient are kept as separate lines
// (unit conversion is a rabbit hole we're deliberately skipping for v1).
// Each ingredient is also tagged with a rough grocery category so the
// list can be shown grouped the way you'd actually shop, plus (where we
// have a match) the real Waitrose product to add to the basket and
// whether it's a pantry "staple" Mira likely already has vs a "variable"
// fresh ingredient worth buying every time.

import { WAITROSE_PRODUCTS, toBaseUnit } from './waitroseProducts.js'

const UNIT_ALIASES = {
  g: 'g', gram: 'g', grams: 'g',
  kg: 'kg', kilogram: 'kg', kilograms: 'kg',
  ml: 'ml', milliliter: 'ml', milliliters: 'ml', millilitre: 'ml', millilitres: 'ml',
  l: 'l', liter: 'l', liters: 'l', litre: 'l', litres: 'l',
  tbsp: 'tbsp', tablespoon: 'tbsp', tablespoons: 'tbsp',
  tsp: 'tsp', teaspoon: 'tsp', teaspoons: 'tsp',
  cup: 'cup', cups: 'cup',
  oz: 'oz', ounce: 'oz', ounces: 'oz',
  lb: 'lb', lbs: 'lb', pound: 'lb', pounds: 'lb',
  clove: 'clove', cloves: 'clove',
  can: 'can', cans: 'can',
  pinch: 'pinch', pinches: 'pinch',
}

function normalizeUnit(unit) {
  if (!unit) return null
  const key = unit.trim().toLowerCase()
  return UNIT_ALIASES[key] || key
}

function titleCase(name) {
  return name.replace(/\b\w/g, (c) => c.toUpperCase())
}

// Descriptive words stripped out when deciding whether two ingredient names
// are "the same thing" for merging purposes — e.g. "skinless chicken breast"
// and "chicken breast" should be one shopping-list line, not two.
const QUALIFIER_WORDS = [
  'boneless', 'skinless', 'fresh', 'frozen', 'organic', 'free-range', 'free range',
  'extra large', 'large', 'small', 'medium', 'jumbo',
  'ripe', 'raw', 'cooked', 'chopped', 'diced', 'sliced', 'thinly sliced', 'minced',
  'ground', 'crushed', 'grated', 'shredded', 'whole', 'lean',
  'extra virgin', 'virgin', 'cold-pressed', 'cold pressed',
  'unsalted', 'salted', 'low-fat', 'low fat', 'full-fat', 'full fat',
  'skimmed', 'semi-skimmed', 'fat-free', 'fat free', 'reduced-fat', 'reduced fat',
  'baby', 'young', 'trimmed', 'peeled', 'seedless', 'pitted', 'plain', 'pure', 'thin', 'thick',
]

// Words where our naive "strip trailing s" pluralization rule would mangle
// the singular form (hummus -> hummu). Left as-is.
const SINGULARIZE_EXCEPTIONS = new Set(['hummus', 'asparagus', 'couscous', 'molasses'])

function stripQualifiers(name) {
  let result = ` ${name.toLowerCase()} `
  // longest phrases first so multi-word qualifiers match before their component words
  const sorted = [...QUALIFIER_WORDS].sort((a, b) => b.length - a.length)
  for (const q of sorted) {
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    result = result.replace(new RegExp(`\\b${escaped}\\b`, 'g'), ' ')
  }
  return result.replace(/\s+/g, ' ').trim()
}

function singularize(word) {
  if (SINGULARIZE_EXCEPTIONS.has(word)) return word
  if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y'
  if (/(oes|ches|shes|xes|sses)$/.test(word)) return word.slice(0, -2)
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) return word.slice(0, -1)
  return word
}

// The key used to decide two ingredients are "the same" for merging —
// deliberately fuzzier than a plain lowercase/trim. Also doubles as the
// lookup key into WAITROSE_PRODUCTS below.
function canonicalKey(name) {
  const stripped = stripQualifiers(name)
  return stripped.split(' ').filter(Boolean).map(singularize).join(' ')
}

// Rough grocery categories, checked in this order — more specific pantry/
// spice keywords are checked before broad produce ones so e.g. "avocado
// oil" lands in Pantry rather than Fruits & Vegetables (because of
// "avocado"). This is a heuristic, not a real product database — it'll
// occasionally misfile something, especially uncommon ingredients.
const CATEGORY_RULES = [
  {
    category: 'Pantry & Dry Goods',
    keywords: [
      'oil', 'vinegar', 'sauce', 'stock', 'broth', 'flour', 'sugar', 'salt',
      'cornstarch', 'corn starch', 'cornflour', 'honey', 'syrup', 'rice',
      'pasta', 'noodle', 'lentil', 'bean', 'chickpea', 'canned', 'tinned',
      'bouillon', 'baking powder', 'baking soda', 'yeast', 'breadcrumb',
      'ketchup', 'mustard', 'mayonnaise', 'jam', 'peanut butter', 'nut butter',
    ],
  },
  {
    category: 'Herbs & Spices',
    keywords: [
      'paprika', 'cumin', 'turmeric', 'cinnamon', 'nutmeg', 'clove', 'cayenne',
      'chili powder', 'chilli powder', 'oregano', 'dried basil', 'thyme',
      'rosemary', 'sage', 'dill', 'bay leaf', 'spice', 'seasoning', 'powder',
      'vanilla extract',
    ],
  },
  {
    category: 'Meat, Poultry & Fish',
    keywords: [
      'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'bacon', 'sausage',
      'mince', 'steak', 'fish', 'salmon', 'tuna', 'shrimp', 'prawn', 'cod',
      'tilapia', 'anchovy', 'seafood',
    ],
  },
  {
    category: 'Dairy & Eggs',
    keywords: ['milk', 'cheese', 'yogurt', 'yoghurt', 'butter', 'cream', 'egg'],
  },
  {
    category: 'Bakery',
    keywords: ['bread', 'bun', 'bagel', 'tortilla', 'naan', 'pita', 'baguette', 'roll'],
  },
  {
    category: 'Frozen',
    keywords: ['frozen'],
  },
  {
    category: 'Fruits & Vegetables',
    keywords: [
      'tomato', 'onion', 'garlic', 'potato', 'carrot', 'pepper', 'capsicum',
      'spinach', 'lettuce', 'cucumber', 'broccoli', 'courgette', 'zucchini',
      'apple', 'banana', 'lemon', 'lime', 'avocado', 'coriander', 'cilantro',
      'parsley', 'mint', 'basil', 'ginger', 'mushroom', 'celery', 'cabbage',
      'kale', 'berry', 'grape', 'orange', 'melon', 'pea', 'corn', 'squash',
      'pumpkin', 'fruit', 'vegetable', 'herb',
    ],
  },
  {
    category: 'Baking & Nuts',
    keywords: ['pecan', 'walnut', 'almond', 'hemp', 'chia', 'coconut'],
  },
]

const CATEGORY_DISPLAY_ORDER = [
  'Fruits & Vegetables',
  'Meat, Poultry & Fish',
  'Dairy & Eggs',
  'Bakery',
  'Frozen',
  'Pantry & Dry Goods',
  'Baking & Nuts',
  'Herbs & Spices',
  'Other',
]

function categorize(name) {
  const lower = name.toLowerCase()
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((k) => lower.includes(k))) return rule.category
  }
  return 'Other'
}

// Works out how many packs of the matched Waitrose product to add to the
// basket, when the recipe's unit lets us do that safely. Returns null when
// we can't (a volumetric unit like tsp/cup against a gram pack, etc.) — in
// that case the shopping list just shows the product name next to the
// recipe's own quantity instead of a pack count.
function packsNeeded(product, quantity, unit) {
  if (!product || product.sold !== 'packed' || quantity === null || !product.packSize) return null
  if (product.packUnit === 'g' || product.packUnit === 'ml') {
    const base = toBaseUnit(quantity, unit)
    if (base === null) return null
    return Math.ceil(base / product.packSize)
  }
  // count-based pack units: 'each', 'clove', 'head'...
  const u = (unit || '').toLowerCase()
  const matchesCountUnit = !unit ? product.packUnit === 'each' : u === product.packUnit || u.includes(product.packUnit)
  return matchesCountUnit ? Math.ceil(quantity / product.packSize) : null
}

/**
 * @param {Array<{title: string, servings?: number, multiplier?: number, ingredients: Array<{name: string, quantity: number|null, unit: string|null}>}>} recipes
 * @returns {Array<{key: string, displayName: string, category: string, lines: Array<{quantity: number|null, unit: string|null, sources: string[]}>}>}
 */
export function buildShoppingList(recipes) {
  const groups = new Map() // canonicalKey -> { displayName, category, lines: Map(unit -> {quantity, sources: Set}) }

  for (const recipe of recipes) {
    const multiplier = recipe.multiplier || 1
    for (const ing of recipe.ingredients || []) {
      if (!ing.name) continue
      const nameKey = canonicalKey(ing.name)
      const unitKey = normalizeUnit(ing.unit)
      const qty = typeof ing.quantity === 'number' ? ing.quantity * multiplier : null

      if (!groups.has(nameKey)) {
        groups.set(nameKey, {
          displayName: titleCase(ing.name.trim()),
          category: categorize(ing.name),
          waitrose: WAITROSE_PRODUCTS[nameKey] || null,
          lines: new Map(),
        })
      }
      const group = groups.get(nameKey)
      const lineKey = unitKey || '__no_unit__'
      if (!group.lines.has(lineKey)) {
        group.lines.set(lineKey, { quantity: qty, unit: unitKey, sources: new Set([recipe.title]) })
      } else {
        const line = group.lines.get(lineKey)
        line.quantity = qty !== null && line.quantity !== null ? line.quantity + qty : (line.quantity ?? qty)
        line.sources.add(recipe.title)
      }
    }
  }

  return Array.from(groups.entries())
    .map(([key, group]) => ({
      key,
      displayName: group.displayName,
      category: group.category,
      staple: group.waitrose ? group.waitrose.staple : null,
      lines: Array.from(group.lines.values()).map((line) => ({
        quantity: line.quantity,
        unit: line.unit,
        sources: Array.from(line.sources),
        waitrose: group.waitrose
          ? {
              product: group.waitrose.product,
              staple: group.waitrose.staple,
              sold: group.waitrose.sold,
              note: group.waitrose.note || null,
              packs: packsNeeded(group.waitrose, line.quantity, line.unit),
            }
          : null,
      })),
    }))
    .sort((a, b) => {
      const catDiff = CATEGORY_DISPLAY_ORDER.indexOf(a.category) - CATEGORY_DISPLAY_ORDER.indexOf(b.category)
      return catDiff !== 0 ? catDiff : a.displayName.localeCompare(b.displayName)
    })
}

/** Groups an already-built shopping list into [category, items][] pairs, in display order. */
export function groupByCategory(list) {
  const map = new Map()
  for (const item of list) {
    if (!map.has(item.category)) map.set(item.category, [])
    map.get(item.category).push(item)
  }
  return Array.from(map.entries())
}

export function shoppingListToText(list) {
  const lines = []
  for (const [category, items] of groupByCategory(list)) {
    lines.push(`${category}:`)
    for (const item of items) {
      for (const line of item.lines) {
        const qty = line.quantity !== null ? `${roundQty(line.quantity)}${line.unit ? line.unit : ''} ` : ''
        const w = line.waitrose
        const waitroseNote = w ? (w.packs ? ` — ${w.packs} x ${w.product}` : ` — ${w.product}`) : ''
        lines.push(`- ${qty}${item.displayName}${waitroseNote}`)
      }
    }
    lines.push('')
  }
  return lines.join('\n').trim()
}

function roundQty(n) {
  return Math.round(n * 100) / 100
}
