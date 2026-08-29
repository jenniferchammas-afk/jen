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
      {groupByCategory(list).map(([category, items]) => (
        <div className="category-group" key={category}>
          <h3 className="category-heading">{category}</h3>
          <ul>
            {items.map((item) => (
              <li key={item.key}>
                <strong>{item.displayName}</strong>
                {item.lines.map((line, i) => (
                  <span key={i} className="line-detail">
                    {' — '}
                    {line.quantity !== null ? `${roundDisplay(line.quantity)}${line.unit ? line.unit : ''}` : 'amount not specified'}
                    {' '}
                    <span className="muted">({line.sources.join(', ')})</span>
                  </span>
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
