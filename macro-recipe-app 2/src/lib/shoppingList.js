// src/lib/shoppingList.js
//
// Merges ingredient lists from multiple selected recipes into one
// consolidated shopping list: same ingredient + same unit gets summed,
// different units for the same ingredient are kept as separate lines
// (unit conversion is a rabbit hole we're deliberately skipping for v1).

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

function normalizeName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

function titleCase(name) {
  return name.replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * @param {Array<{title: string, servings?: number, multiplier?: number, ingredients: Array<{name: string, quantity: number|null, unit: string|null}>}>} recipes
 * @returns {Array<{key: string, displayName: string, lines: Array<{quantity: number|null, unit: string|null, sources: string[]}>}>}
 */
export function buildShoppingList(recipes) {
  const groups = new Map() // normalizedName -> { displayName, lines: Map(unit -> {quantity, sources: Set}) }

  for (const recipe of recipes) {
    const multiplier = recipe.multiplier || 1
    for (const ing of recipe.ingredients || []) {
      if (!ing.name) continue
      const nameKey = normalizeName(ing.name)
      const unitKey = normalizeUnit(ing.unit)
      const qty = typeof ing.quantity === 'number' ? ing.quantity * multiplier : null

      if (!groups.has(nameKey)) {
        groups.set(nameKey, { displayName: titleCase(ing.name.trim()), lines: new Map() })
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

  return Array.from(groups.entries()).map(([key, group]) => ({
    key,
    displayName: group.displayName,
    lines: Array.from(group.lines.values()).map((line) => ({
      quantity: line.quantity,
      unit: line.unit,
      sources: Array.from(line.sources),
    })),
  })).sort((a, b) => a.displayName.localeCompare(b.displayName))
}

export function shoppingListToText(list) {
  return list
    .map((item) =>
      item.lines
        .map((line) => {
          const qty = line.quantity !== null ? `${roundQty(line.quantity)}${line.unit ? line.unit : ''} ` : ''
          return `- ${qty}${item.displayName}`
        })
        .join('\n')
    )
    .join('\n')
}

function roundQty(n) {
  return Math.round(n * 100) / 100
}
