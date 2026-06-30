import styles from './LoadingState.module.css'

/**
 * Consistent loading indicator used across all data-fetching pages.
 * Use `inline` for compact spaces (e.g. inside a card), or the default
 * full-height centered version for whole-page loading.
 */
export default function LoadingState({ label = 'Loading…', inline = false }) {
  return (
    <div className={inline ? styles.inlineWrap : styles.wrap}>
      <span className={styles.spinner} />
      <span className={styles.label}>{label}</span>
    </div>
  )
}