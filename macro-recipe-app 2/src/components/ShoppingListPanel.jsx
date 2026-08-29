import { useState } from 'react'
import { shoppingListToText } from '../lib/shoppingList.js'

export default function ShoppingListPanel({ tabs }) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.key || 'combined')
  const current = tabs.find((t) => t.key === activeTab) || tabs[0]

  return (
    <div className="panel shopping-list">
      <h2>Shopping list</h2>
      <div className="shopping-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={activeTab === t.key ? 'active' : ''}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}{t.list.length > 0 ? ` (${t.list.length})` : ''}
          </button>
        ))}
      </div>
      <ShoppingListView list={current.list} />
    </div>
  )
}

function ShoppingListView({ list }) {
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
    return <p className="muted">Select recipes above to build this list.</p>
  }

  return (
    <div>
      <div className="row" style={{ justifyContent: 'flex-end', marginBottom: 8 }}>
        <button onClick={handleCopy}>{copied ? 'Copied!' : 'Copy list'}</button>
      </div>
      <ul>
        {list.map((item) => (
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
      <textarea readOnly value={text} rows={Math.min(list.length + 2, 16)} />
    </div>
  )
}

function roundDisplay(n) {
  return Math.round(n * 100) / 100
}
