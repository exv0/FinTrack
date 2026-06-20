import styles from './SplitComparison.module.css'

const COLORS = {
  needs:   '#4F46E5',
  wants:   '#D97706',
  savings: '#16A34A',
}

function SplitBar({ needs, wants, savings, dashed = false }) {
  return (
    <div className={`${styles.bar} ${dashed ? styles.dashed : ''}`}>
      <div className={styles.segment} style={{ width: `${needs}%`, background: COLORS.needs }} />
      <div className={styles.segment} style={{ width: `${wants}%`, background: COLORS.wants }} />
      <div className={styles.segment} style={{ width: `${savings}%`, background: COLORS.savings }} />
    </div>
  )
}

export default function SplitComparison({ actual, target = { needs: 50, wants: 30, savings: 20 } }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <span className={styles.rowLabel}>Your actual</span>
        <SplitBar {...actual} />
      </div>
      <div className={styles.row}>
        <span className={styles.rowLabel}>50/30/20 target</span>
        <SplitBar {...target} dashed />
      </div>

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.dot} style={{ background: COLORS.needs }} /> Needs {actual.needs}%
        </span>
        <span className={styles.legendItem}>
          <span className={styles.dot} style={{ background: COLORS.wants }} /> Wants {actual.wants}%
        </span>
        <span className={styles.legendItem}>
          <span className={styles.dot} style={{ background: COLORS.savings }} /> Savings {actual.savings}%
        </span>
      </div>
    </div>
  )
}