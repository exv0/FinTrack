import styles from './CategoryRow.module.css'

export default function CategoryRow({ emoji, name, spent, limit, changePct, danger = false }) {
  const pct = Math.min(Math.round((spent / limit) * 100), 100)
  const color =
    danger || pct >= 90 ? 'var(--danger)' :
    pct >= 60 ? 'var(--warning)' :
    'var(--success)'

  return (
    <div className={styles.row}>
      <div className={styles.iconWrap}>{emoji}</div>

      <div className={styles.middle}>
        <div className={styles.topLine}>
          <span className={styles.name}>{name}</span>
          {typeof changePct === 'number' && (
            <span className={`${styles.badge} ${changePct > 0 ? styles.badgeUp : styles.badgeDown}`}>
              {changePct > 0 ? '↑' : '↓'} {Math.abs(changePct)}%
            </span>
          )}
        </div>
        <div className={styles.track}>
          <div className={styles.fill} style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>

      <span className={styles.amount}>
        NPR {spent.toLocaleString('en-US')} <span className={styles.limit}>/ {limit.toLocaleString('en-US')}</span>
      </span>
    </div>
  )
}