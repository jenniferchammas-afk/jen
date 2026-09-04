import { useState } from 'react'
import { shoppingListToText, groupByCategory } from '../lib/shoppingList.js'

export default function ShoppingListPanel({ list }) {
  const [copied, setCopied] = useState(false)
  const text = shoppingListToText(list)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard API can fail without permissions; the textarea below is the fallback
    }
  }

  if (list.length === 0) {
    return (
      <div className="panel shopping-list">
        <h2>Shopping list</h2>
        <p className="muted">Select recipes above to build your list.</p>
      </div>
    )
  }

  return (
    <div className="panel shopping-list">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2>Shopping list</h2>
        <button onClick={handleCopy}>{copied ? 'Copied!' : 'Copy list'}</button>
      </div>

      <div className="shopping-legend">
        <span className="ingredient-tag staple">Staple</span> probably already in the kitchen —
        <span className="ingredient-tag variable">Pick up</span> fresh/variable, worth buying every time.
      </div>

      {groupByCategory(list).map(([category, items]) => (
        <div className="category-group" key={category}>
          <h3 className="category-heading">{category}</h3>
          <ul>
            {items.map((item) => (
              <li key={item.key}>
                <div className="ingredient-line">
                  <strong>{item.displayName}</strong>
                  {item.staple !== null && (
                    <span className={`ingredient-tag ${item.staple ? 'staple' : 'variable'}`}>
                      {item.staple ? 'Staple' : 'Pick up'}
                    </span>
                  )}
                </div>
                {item.lines.map((line, i) => (
                  <div key={i} className="line-detail">
                    {line.quantity !== null ? `${roundDisplay(line.quantity)}${line.unit ? line.unit : ''}` : 'amount not specified'}
                    {' '}
                    <span className="muted">({line.sources.join(', ')})</span>
                    {line.waitrose && (
                      <span className="waitrose-match">
                        {' → '}
                        {line.waitrose.packs ? `${line.waitrose.packs} x ` : ''}
                        {line.waitrose.product}
                        {line.waitrose.note && <span className="waitrose-note"> — {line.waitrose.note}</span>}
                      </span>
                    )}
                  </div>
                ))}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <textarea readOnly value={text} rows={Math.min(list.length + 2, 16)} />
    </div>
  )
}

function roundDisplay(n) {
  return Math.round(n * 100) / 100
}
