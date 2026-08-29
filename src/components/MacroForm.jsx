import { useState } from 'react'

export default function MacroForm({ onRecipes }) {
  const [form, setForm] = useState({
    calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
    mealType: '',
    count: 6,
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/suggest-recipes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          calories: form.calories ? Number(form.calories) : null,
          protein_g: form.protein_g ? Number(form.protein_g) : null,
          carbs_g: form.carbs_g ? Number(form.carbs_g) : null,
          fat_g: form.fat_g ? Number(form.fat_g) : null,
          mealType: form.mealType || null,
          count: Number(form.count) || 6,
          notes: form.notes || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      onRecipes(data.recipes)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel">
      <label>Target macros (per serving)</label>
      <div className="row wrap">
        <input type="number" placeholder="Calories" value={form.calories} onChange={(e) => update('calories', e.target.value)} />
        <input type="number" placeholder="Protein (g)" value={form.protein_g} onChange={(e) => update('protein_g', e.target.value)} />
        <input type="number" placeholder="Carbs (g)" value={form.carbs_g} onChange={(e) => update('carbs_g', e.target.value)} />
        <input type="number" placeholder="Fat (g)" value={form.fat_g} onChange={(e) => update('fat_g', e.target.value)} />
      </div>
      <div className="row wrap">
        <select value={form.mealType} onChange={(e) => update('mealType', e.target.value)}>
          <option value="">Any meal type</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>
        <input
          type="number"
          min="1"
          max="12"
          value={form.count}
          onChange={(e) => update('count', e.target.value)}
          title="How many suggestions"
        />
        <input
          type="text"
          placeholder="Preferences (e.g. no pork, high fibre)"
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Thinking of recipes…' : 'Suggest recipes'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  )
}
