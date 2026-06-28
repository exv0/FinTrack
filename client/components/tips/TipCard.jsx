import { Lock, Bookmark } from 'lucide-react'
import styles from './TipCard.module.css'

export default function TipCard({
  tag, title, body, readTime, locked, unlockHint, onRead, saved = false, onToggleSave,
}) {
  return (
    <div className={styles.card}>
      <div className={`${styles.content} ${locked ? styles.blurred : ''}`}>
        <div className={styles.topRow}>
          <span className={styles.tag}>{tag}</span>
          {!locked && onToggleSave && (
            <button
              className={`${styles.saveIconBtn} ${saved ? styles.saveIconActive : ''}`}
              onClick={onToggleSave}
              aria-label={saved ? 'Unsave this tip' : 'Save this tip'}
              title={saved ? 'Saved' : 'Save for later'}
            >
              <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.body}>{body}</p>
        <div className={styles.footer}>
          <span className={styles.readTime}>{readTime}</span>
          <button className={styles.readBtn} onClick={onRead} disabled={locked}>
            Read more →
          </button>
        </div>
      </div>

      {locked && (
        <div className={styles.overlay}>
          <Lock size={20} className={styles.lockIcon} />
          <span className={styles.lockText}>{unlockHint}</span>
        </div>
      )}
    </div>
  )
}