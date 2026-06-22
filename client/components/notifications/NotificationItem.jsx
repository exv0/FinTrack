import styles from './NotificationItem.module.css'

export default function NotificationItem({ notification, onDismiss, onAction }) {
  const { icon, title, body, timestamp, read, actionLabel } = notification

  return (
    <div className={`${styles.item} ${read ? styles.read : styles.unread}`}>
      <span className={`${styles.dot} ${read ? styles.dotHollow : styles.dotFilled}`} />

      <div className={styles.iconWrap}>{icon}</div>

      <div className={styles.middle}>
        <div className={styles.topLine}>
          <span className={styles.title} style={{ fontWeight: read ? 500 : 700 }}>{title}</span>
          <span className={styles.timestamp}>{timestamp}</span>
        </div>
        <p className={styles.body}>{body}</p>

        <div className={styles.actions}>
          {actionLabel && (
            <button className={styles.actionBtn} onClick={() => onAction?.(notification)}>
              {actionLabel}
            </button>
          )}
          <button className={styles.dismissBtn} onClick={() => onDismiss?.(notification.id)}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}