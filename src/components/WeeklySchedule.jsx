// src/components/WeeklySchedule.jsx
//
// The "Weekly Schedule" tab: pick a recipe (or Eat out, or ask Claude to
// generate a new one) for each day/meal slot, and see how the day's picks
// stack up against BOTH Jennifer's and Dino's daily macro targets, side
// by side, at once — no toggling between the two.

import { useMemo, useState } from 'react'
import { PEOPLE, DAYS, COOK_DAYS, MEALS, favoritesFor, EAT_OUT } from '../lib/mealPlanData.js'
import MacroBar from './MacroBar.jsx'

const EMPTY = ''
const EATOUT = 'eatout'
const GENERATE = 'generate'

// Used only to size the "Generate a new recipe" request — a blended
// midpoint of both people's per-meal budgets, since the dish itself is
// shared and portions are adjusted by eye afterwards.
const GENERATE_TARGET = {
  calories: Math.round((PEOPLE.jennifer.target.calories + PEOPLE.dino.target.calories) / 2 / 3),
  protein_g: Math.round((PEOPLE.jennifer.target.protein_g + PEOPLE.dino.target.protein_g) / 2 / 3),
  carbs_g: Math.round((PEOPLE.jennifer.target.carbs_g + PEOPLE.dino.target.carbs_g) / 2 / 3),
  fat_g: Math.round((PEOPLE.jennifer.target.fat_g + PEOPLE.dino.target.fat_g) / 2 / 3),
}

function emptySchedule() {
  const s = {}
  for (const day of DAYS) s[day] = { breakfast: EMPTY, lunch: EMPTY, dinner: EMPTY }
  return s
}

function findFavorite(meal, id) {
  return favoritesFor(meal).find((r) => r.id === id) || null
}

export default function WeeklySchedule({ onAddToShoppingList }) {
  const [schedule, setSchedule] = useState(emptySchedule)
  const [generated, setGenerated] = useState({}) // `${day}:${meal}` -> recipe | 'loading' | 'error'

  function cellKey(day, meal) {
    return `${day}:${meal}`
  }

  function recipeForCell(day, meal) {
    const value = schedule[day][meal]
    if (!value || value === EMPTY) return null
    if (value === EATOUT) return EAT_OUT
    if (value === GENERATE) {
      const g = generated[cellKey(day, meal)]
      return g && g !== 'loading' && g !== 'error' ? g : null
    }
    if (value.startsWith('fav:')) return findFavorite(meal, value.slice(4))
    return null
  }

  async function handleSelect(day, meal, value) {
    setSchedule((s) => ({ ...s, [day]: { ...s[day], [meal]: value } }))
    if (value !== GENERATE) return

    const key = cellKey(day, meal)
    setGenerated((g) => ({ ...g, [key]: 'loading' }))
    try {
      const res = await fetch('/api/suggest-recipes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...GENERATE_TARGET, mealType: meal, count: 1 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not generate a recipe')
      const recipe = data.recipes?.[0]
      setGenerated((g) => ({ ...g, [key]: recipe || 'error' }))
    } catch {
      setGenerated((g) => ({ ...g, [key]: 'error' }))
    }
  }

  const dayTotals = useMemo(() => {
    const totals = {}
    for (const day of DAYS) {
      const sum = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
      let hasUntracked = false
      for (const meal of MEALS) {
        const r = recipeForCell(day, meal)
        const m = r?.macros_per_serving
        if (!m || m.calories === null) {
          if (r) hasUntracked = true
          continue
        }
        sum.calories += m.calories
        sum.protein_g += m.protein_g
        sum.carbs_g += m.carbs_g
        sum.fat_g += m.fat_g
      }
      totals[day] = { ...sum, hasUntracked }
    }
    return totals
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule, generated])

  const weekTotal = useMemo(() => {
    const sum = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
    for (const day of DAYS) {
      sum.calories += dayTotals[day].calories
      sum.protein_g += dayTotals[day].protein_g
      sum.carbs_g += dayTotals[day].carbs_g
      sum.fat_g += dayTotals[day].fat_g
    }
    return sum
  }, [dayTotals])

  function addWeekToShoppingList() {
    const picked = new Map() // favorite id -> recipe
    for (const day of DAYS) {
      for (const meal of MEALS) {
        const value = schedule[day][meal]
        if (value && value.startsWith('fav:')) {
          const r = findFavorite(meal, value.slice(4))
          if (r) picked.set(r.id, r)
        }
      }
    }
    if (picked.size > 0) onAddToShoppingList(Array.from(picked.values()))
  }

  return (
    <div className="weekly-schedule">
      <div className="schedule-table">
        {DAYS.map((day) => {
          const isCookDay = COOK_DAYS.includes(day)
          const totals = dayTotals[day]
          return (
            <div className={`schedule-row ${isCookDay ? 'cook-day' : ''}`} key={day}>
              <div className="schedule-day">
                <strong>{day}</strong>
                {isCookDay && <span className="cook-tag">Mira cooks today</span>}
              </div>

              <div className="schedule-meals">
                {MEALS.map((meal) => (
                  <MealCell
                    key={meal}
                    day={day}
                    meal={meal}
                    value={schedule[day][meal]}
                    recipe={recipeForCell(day, meal)}
                    generatedState={generated[cellKey(day, meal)]}
                    onChange={(value) => handleSelect(day, meal, value)}
                  />
                ))}
              </div>

              <div className="schedule-totals">
                <div className="schedule-totals-people">
                  {Object.entries(PEOPLE).map(([key, p]) => (
                    <div className="person-totals" key={key}>
                      <p className="person-totals-name">{p.name}</p>
                      <MacroBar label="Protein" value={totals.protein_g} target={p.target.protein_g} />
                      <MacroBar label="Carbs" value={totals.carbs_g} target={p.target.carbs_g} />
                      <MacroBar label="Fat" value={totals.fat_g} target={p.target.fat_g} />
                    </div>
                  ))}
                </div>
                <p className="muted schedule-kcal">
                  {Math.round(totals.calories)} kcal
                  {totals.hasUntracked ? ' + eating out (untracked)' : ''}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="panel schedule-week-summary">
        <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <strong>Week total</strong>
            <p className="muted" style={{ margin: '4px 0 0' }}>
              {Math.round(weekTotal.calories)} kcal · {Math.round(weekTotal.protein_g)}g protein ·{' '}
              {Math.round(weekTotal.carbs_g)}g carbs · {Math.round(weekTotal.fat_g)}g fat
            </p>
            <p className="muted" style={{ margin: '4px 0 0', fontSize: 12 }}>
              Jennifer's 7-day target: {PEOPLE.jennifer.target.protein_g * 7}p · {PEOPLE.jennifer.target.carbs_g * 7}c ·{' '}
              {PEOPLE.jennifer.target.fat_g * 7}f &nbsp;|&nbsp; Dino's: {PEOPLE.dino.target.protein_g * 7}p ·{' '}
              {PEOPLE.dino.target.carbs_g * 7}c · {PEOPLE.dino.target.fat_g * 7}f
            </p>
          </div>
          <button onClick={addWeekToShoppingList}>Add this week's picks to shopping list</button>
        </div>
      </div>
    </div>
  )
}

function MealCell({ meal, value, recipe, generatedState, onChange }) {
  const options = favoritesFor(meal)
  const m = recipe?.macros_per_serving
  return (
    <div className="meal-cell">
      <label className="meal-cell-label">{meal}</label>
      <select value={value || EMPTY} onChange={(e) => onChange(e.target.value)}>
        <option value={EMPTY}>— choose —</option>
        {options.map((r) => (
          <option key={r.id} value={`fav:${r.id}`}>
            {r.title}
          </option>
        ))}
        <option value={EATOUT}>Eat out</option>
        <option value={GENERATE}>Generate a new recipe…</option>
      </select>

      {value === GENERATE && generatedState === 'loading' && <p className="muted meal-cell-note">Asking Claude…</p>}
      {value === GENERATE && generatedState === 'error' && <p className="error meal-cell-note">Couldn't generate one — try again.</p>}
      {recipe && recipe.id !== 'eatout' && m?.calories !== null && m?.calories !== undefined && (
        <p className="muted meal-cell-note">
          {recipe.title !== undefined && value === GENERATE ? `${recipe.title} — ` : ''}
          {Math.round(m.calories)} kcal · {m.protein_g}p · {m.carbs_g}c · {m.fat_g}f
        </p>
      )}
      {value === EATOUT && <p className="muted meal-cell-note">Not tracked</p>}
    </div>
  )
}
