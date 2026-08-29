import { useMemo, useState } from 'react'
import LinkForm from './components/LinkForm.jsx'
import MacroForm from './components/MacroForm.jsx'
import RecipeCard from './components/RecipeCard.jsx'
import ShoppingListPanel from './components/ShoppingListPanel.jsx'
import { buildShoppingList } from './lib/shoppingList.js'
import './App.css'

let nextId = 1

const PROFILES = [
  { key: 'jennifer', label: 'Jennifer' },
  { key: 'dino', label: 'Dino' },
]

export default function App() {
  const [mode, setMode] = useState('link') // 'link' | 'browse'
  const [activeProfile, setActiveProfile] = useState('jennifer')
  const [recipes, setRecipes] = useState([])

  function addRecipe(recipe, selected = true) {
    setRecipes((rs) => [...rs, { ...recipe, id: nextId++, selected, multiplier: 1, owner: activeProfile }])
  }

  function addRecipes(newRecipes) {
    setRecipes((rs) => [
      ...rs,
      ...newRecipes.map((r) => ({ ...r, id: nextId++, selected: false, multiplier: 1, owner: activeProfile })),
    ])
  }

  function toggleRecipe(id) {
    setRecipes((rs) => rs.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r)))
  }

  function setMultiplier(id, value) {
    setRecipes((rs) => rs.map((r) => (r.id === id ? { ...r, multiplier: value } : r)))
  }

  function setOwner(id, owner) {
    setRecipes((rs) => rs.map((r) => (r.id === id ? { ...r, owner } : r)))
  }

  function removeRecipe(id) {
    setRecipes((rs) => rs.filter((r) => r.id !== id))
  }

  const selectedRecipes = useMemo(() => recipes.filter((r) => r.selected), [recipes])

  const shoppingTabs = useMemo(
    () => [
      { key: 'combined', label: 'Combined', list: buildShoppingList(selectedRecipes) },
      ...PROFILES.map((p) => ({
        key: p.key,
        label: p.label,
        list: buildShoppingList(selectedRecipes.filter((r) => r.owner === p.key)),
      })),
    ],
    [selectedRecipes]
  )

  return (
    <div className="app">
      <header>
        <h1>Macro Recipe Shopper</h1>
        <p className="muted">Find recipes, build a shopping list, then take it to Waitrose on Deliveroo.</p>
      </header>

      <div className="profile-toggle">
        <span className="muted" style={{ marginRight: 8 }}>Adding recipes for:</span>
        {PROFILES.map((p) => (
          <button
            key={p.key}
            className={activeProfile === p.key ? 'active' : ''}
            onClick={() => setActiveProfile(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mode-toggle">
        <button className={mode === 'link' ? 'active' : ''} onClick={() => setMode('link')}>
          Paste a recipe link
        </button>
        <button className={mode === 'browse' ? 'active' : ''} onClick={() => setMode('browse')}>
          Browse by macros
        </button>
      </div>

      {mode === 'link' ? (
        <LinkForm onRecipe={(r) => addRecipe(r, true)} />
      ) : (
        <MacroForm onRecipes={addRecipes} />
      )}

      {recipes.length > 0 && (
        <section>
          {PROFILES.map((p) => {
            const ownedRecipes = recipes.filter((r) => r.owner === p.key)
            if (ownedRecipes.length === 0) return null
            return (
              <div key={p.key} className="profile-section">
                <h2>{p.label}'s recipes ({ownedRecipes.length})</h2>
                <div className="recipe-grid">
                  {ownedRecipes.map((r) => (
                    <RecipeCard
                      key={r.id}
                      recipe={r}
                      profiles={PROFILES}
                      onToggle={toggleRecipe}
                      onMultiplierChange={setMultiplier}
                      onOwnerChange={setOwner}
                      onRemove={removeRecipe}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </section>
      )}

      <ShoppingListPanel tabs={shoppingTabs} />

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
