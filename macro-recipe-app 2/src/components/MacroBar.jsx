// src/components/MacroBar.jsx
//
// One labelled progress bar for a single macro (protein/carbs/fat/kcal):
// current amount vs. a target, colored green up to 100% and amber past it.

export default function MacroBar({ label, value, target, unit = 'g' }) {
  const pct = target ? Math.min(150, Math.round((value / target) * 100)) : 0
  const over = target ? value > target * 1.05 : false
  return (
    <div className="macro-bar">
      <div className="macro-bar-labels">
        <span>{label}</span>
        <span className="macro-bar-figures">
          {round(value)}
          {unit} <span className="muted">/ {round(target)}{unit}</span>
        </span>
      </div>
      <div className="macro-bar-track">
        <div
          className={`macro-bar-fill ${over ? 'over' : ''}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  )
}

function round(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '0'
  return Math.round(n * 10) / 10
}
