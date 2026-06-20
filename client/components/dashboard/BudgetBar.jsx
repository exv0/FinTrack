'use client'

import styles from './BudgetBar.module.css'

export default function BudgetBar({ percentUsed = 68, daysRemaining = 12 }) {
  const color =
    percentUsed >= 90 ? 'var(--danger)' :
    percentUsed >= 60 ? 'var(--warning)' :
    'var(--success)'

  return (
    <div className={styles.bar}>
      <span className={styles.label}>Monthly budget:</span>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${Math.min(percentUsed, 100)}%`, background: color }}
        />
      </div>
      <span className={styles.percent} style={{ color }}>{percentUsed}%</span>
      <span className={styles.days}>{daysRemaining} days remaining</span>
    </div>
  )
}