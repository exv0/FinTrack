'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import styles from './CategoryRankCard.module.css'

export default function CategoryRankCard({
  rank, emoji, name, spent, limit, changePct, unusual = false, transactions = [],
}) {
  const [open, setOpen] = useState(false)
  const pct = Math.min(Math.round((spent / limit) * 100), 100)
  const color =
    pct >= 90 ? 'var(--danger)' :
    pct >= 60 ? 'var(--warning)' :
    'var(--success)'

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.rank}>#{rank}</span>
        <div className={styles.iconWrap}>{emoji}</div>
        <span className={styles.name}>{name}</span>

        {typeof changePct === 'number' && (
          <span className={`${styles.changeBadge} ${changePct > 0 ? styles.up : styles.down}`}>
            {changePct > 0 ? '↑' : '↓'} {Math.abs(changePct)}%
          </span>
        )}
      </div>

      <div className={styles.amountRow}>
        <span className={styles.amount}>
          NPR {spent.toLocaleString('en-US')}{' '}
          <span className={styles.limit}>of {limit.toLocaleString('en-US')}</span>
        </span>
        {unusual && <span className={styles.unusualPill}>Unusual spend detected</span>}
      </div>

      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%`, background: color }} />
      </div>

      {transactions.length > 0 && (
        <>
          <button
            type="button"
            className={styles.expandBtn}
            onClick={() => setOpen(v => !v)}
          >
            {open ? 'Hide transactions' : 'Tap to expand'}
            <ChevronDown
              size={13}
              style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s ease' }}
            />
          </button>

          <div className={`${styles.expandBody} ${open ? styles.expandOpen : ''}`}>
            {transactions.map((t, i) => (
              <div key={i} className={styles.txnRow}>
                <span className={styles.txnName}>{t.name}</span>
                <span className={styles.txnAmount}>NPR {t.amount.toLocaleString('en-US')}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}