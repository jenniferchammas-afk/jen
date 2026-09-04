import { useMemo, useState } from 'react'
import LinkForm from './components/LinkForm.jsx'
import MacroForm from './components/MacroForm.jsx'
import RecipeCard from './components/RecipeCard.jsx'
import ShoppingListPanel from './components/ShoppingListPanel.jsx'
import WeeklySchedule from './components/WeeklySchedule.jsx'
import { buildShoppingList } from './lib/shoppingList.js'
import './App.css'

let nextId = 1

export default function App() {
  const [mode, setMode] = useState('link') // 'link' | 'browse' | 'schedule'
  const [recipes, setRecipes] = useState([])

  function addRecipe(recipe, selected = true) {
    setRecipes((rs) => [...rs, { ...recipe, id: nextId++, selected, desiredServings: recipe.servings || 1 }])
  }

  function addRecipes(newRecipes, selected = false) {
    setRecipes((rs) => [
      ...rs,
      // Weekly Schedule passes its own computed desiredServings (how many
      // real portions the week's picks need, given how often a dish is
      // scheduled and each person's macro-matched portion size) — respect
      // that instead of resetting to the recipe's own default serving count.
      ...newRecipes.map((r) => ({ ...r, id: nextId++, selected, desiredServings: r.desiredServings ?? (r.servings || 1) })),
    ])
  }

  function toggleRecipe(id) {
    setRecipes((rs) => rs.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r)))
  }

  function setDesiredServings(id, value) {
    setRecipes((rs) => rs.map((r) => (r.id === id ? { ...r, desiredServings: value } : r)))
  }

  function removeRecipe(id) {
    setRecipes((rs) => rs.filter((r) => r.id !== id))
  }

  const selectedRecipes = useMemo(() => recipes.filter((r) => r.selected), [recipes])

  const shoppingList = useMemo(
    () =>
      buildShoppingList(
        selectedRecipes.map((r) => ({
          ...r,
          // scale ingredient quantities: how many servings we want vs. how many the recipe naturally makes
          multiplier: (r.desiredServings || 1) / (r.servings || 1),
        }))
      ),
    [selectedRecipes]
  )

  return (
    <div className="app">
      <header>
        <h1>Macro Recipe Shopper</h1>
        <p className="muted">Find recipes, build a shopping list, then take it to Waitrose on Deliveroo.</p>
      </header>

      <div className="mode-toggle">
        <button className={mode === 'link' ? 'active' : ''} onClick={() => setMode('link')}>
          Paste a recipe link
        </button>
        <button className={mode === 'browse' ? 'active' : ''} onClick={() => setMode('browse')}>
          Browse by macros
        </button>
        <button className={mode === 'schedule' ? 'active' : ''} onClick={() => setMode('schedule')}>
          Weekly schedule
        </button>
      </div>

      {mode === 'link' && <LinkForm onRecipe={(r) => addRecipe(r, true)} />}
      {mode === 'browse' && <MacroForm onRecipes={addRecipes} />}
      {mode === 'schedule' && <WeeklySchedule onAddToShoppingList={(rs) => addRecipes(rs, true)} />}

      {recipes.length > 0 && (
        <section>
          <h2>Recipes ({recipes.length})</h2>
          <div className="recipe-grid">
            {recipes.map((r) => (
              <RecipeCard
                key={r.id}
                recipe={r}
                onToggle={toggleRecipe}
                onServingsChange={setDesiredServings}
                onRemove={removeRecipe}
              />
            ))}
          </div>
        </section>
      )}

      <ShoppingListPanel list={shoppingList} />

      <footer className="muted">
        <p>
          Next step once this list looks right: use it to build your basket on the{' '}
          <a href="https://deliveroo.ae" target="_blank" rel="noreferrer">
            Deliveroo UAE
          </a>{' '}
          Waitrose store. That part isn't automated yet — see the README for the plan.
        </p>
      </footer>
    </div>
  )
}
