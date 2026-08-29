export default function RecipeCard({ recipe, profiles, onToggle, onMultiplierChange, onOwnerChange, onRemove }) {
  const m = recipe.macros_per_serving || {}
  return (
    <div className={`recipe-card ${recipe.selected ? 'selected' : ''}`}>
      <div className="recipe-card-header">
        <label className="checkbox-row">
          <input type="checkbox" checked={!!recipe.selected} onChange={() => onToggle(recipe.id)} />
          <strong>{recipe.title}</strong>
        </label>
        <button className="link-btn" onClick={() => onRemove(recipe.id)} title="Remove">
          ✕
        </button>
      </div>

      <p className="macros">
        {m.calories ?? '?'} kcal · {m.protein_g ?? '?'}g protein · {m.carbs_g ?? '?'}g carbs · {m.fat_g ?? '?'}g fat
        {m.estimated ? ' (estimated)' : ''} per serving
      </p>

      {recipe.instructions_summary && <p className="summary">{recipe.instructions_summary}</p>}

      <details>
        <summary>{recipe.ingredients?.length || 0} ingredients</summary>
        <ul>
          {recipe.ingredients?.map((ing, i) => (
            <li key={i}>
              {ing.quantity ? `${ing.quantity}${ing.unit ? ' ' + ing.unit : ''} ` : ''}
              {ing.name}
            </li>
          ))}
        </ul>
      </details>

      <div className="row wrap">
        <label className="multiplier-label">
          Servings to make:
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={recipe.multiplier}
            onChange={(e) => onMultiplierChange(recipe.id, Number(e.target.value))}
          />
        </label>
        {profiles && onOwnerChange && (
          <label className="multiplier-label">
            For:
            <select value={recipe.owner} onChange={(e) => onOwnerChange(recipe.id, e.target.value)}>
              {profiles.map((p) => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
          </label>
        )}
        {recipe.source_url && (
          <a href={recipe.source_url} target="_blank" rel="noreferrer" className="source-link">
            View source
          </a>
        )}
      </div>
    </div>
  )
}
