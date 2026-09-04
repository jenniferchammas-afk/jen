// src/components/WeeklySchedule.jsx
//
// The "Weekly Schedule" tab: pick a recipe (or Eat out, or ask Claude to
// generate a new one) for each day/meal slot, and see how the day's picks
// stack up against BOTH Jennifer's and Dino's daily macro targets, side
// by side, at once — no toggling between the two.
//
// "Eat out" isn't left untracked: it's counted as each person hitting
// their own per-meal macro target for that slot, so the day's bars still
// fill up sensibly even on a night nobody's eating a tracked recipe.

import { useMemo, useState } from 'react'
import { PEOPLE, DAYS, COOK_DAYS, MEALS, favoritesFor, EAT_OUT } from '../lib/mealPlanData.js'
import MacroBar from './MacroBar.jsx'

const EMPTY = ''
const EATOUT = 'eatout'
const GENERATE = 'generate'
const PERSON_KEYS = Object.keys(PEOPLE)

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

function emptyMacros() {
  return { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
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

  // Per-person daily totals. A shared recipe's macros count once for each
  // person (they're both eating the same dish); "Eat out" instead adds
  // that person's own per-meal target (their daily target ÷ 3), since
  // there's no shared dish to attribute macros from.
  const dayTotals = useMemo(() => {
    const totals = {}
    for (const day of DAYS) {
      const perPerson = {}
      for (const key of PERSON_KEYS) perPerson[key] = emptyMacros()

      for (const meal of MEALS) {
        const r = recipeForCell(day, meal)
        if (!r) continue

        if (r.id === 'eatout') {
          for (const key of PERSON_KEYS) {
            const t = PEOPLE[key].target
            perPerson[key].calories += t.calories / 3
            perPerson[key].protein_g += t.protein_g / 3
            perPerson[key].carbs_g += t.carbs_g / 3
            perPerson[key].fat_g += t.fat_g / 3
          }
          continue
        }

        const m = r.macros_per_serving
        if (!m || m.calories === null || m.calories === undefined) continue
        for (const key of PERSON_KEYS) {
          perPerson[key].calories += m.calories
          perPerson[key].protein_g += m.protein_g
          perPerson[key].carbs_g += m.carbs_g
          perPerson[key].fat_g += m.fat_g
        }
      }
      totals[day] = perPerson
    }
    return totals
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule, generated])

  const weekTotal = useMemo(() => {
    const sum = {}
    for (const key of PERSON_KEYS) sum[key] = emptyMacros()
    for (const day of DAYS) {
      for (const key of PERSON_KEYS) {
        sum[key].calories += dayTotals[day][key].calories
        sum[key].protein_g += dayTotals[day][key].protein_g
        sum[key].carbs_g += dayTotals[day][key].carbs_g
        sum[key].fat_g += dayTotals[day][key].fat_g
      }
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
                  {PERSON_KEYS.map((key) => (
                    <div className="person-totals" key={key}>
                      <p className="person-totals-name">{PEOPLE[key].name}</p>
                      <p className="muted schedule-kcal">{Math.round(totals[key].calories)} kcal</p>
                      <MacroBar label="Protein" value={totals[key].protein_g} target={PEOPLE[key].target.protein_g} />
                      <MacroBar label="Carbs" value={totals[key].carbs_g} target={PEOPLE[key].target.carbs_g} />
                      <MacroBar label="Fat" value={totals[key].fat_g} target={PEOPLE[key].target.fat_g} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="panel schedule-week-summary">
        <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div className="week-summary-people">
            <strong>Week total</strong>
            {PERSON_KEYS.map((key) => {
              const t = PEOPLE[key].target
              const w = weekTotal[key]
              return (
                <p className="muted" style={{ margin: '4px 0 0' }} key={key}>
                  <strong className="week-summary-name">{PEOPLE[key].name}:</strong> {Math.round(w.calories)} kcal ·{' '}
                  {Math.round(w.protein_g)}g protein · {Math.round(w.carbs_g)}g carbs · {Math.round(w.fat_g)}g fat{' '}
                  (target: {t.calories * 7} kcal · {t.protein_g * 7}g · {t.carbs_g * 7}g · {t.fat_g * 7}g)
                </p>
              )
            })}
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
      {value === EATOUT && <p className="muted meal-cell-note">Counted at each person's own per-meal target</p>}
    </div>
  )
}
