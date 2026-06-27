'use client'

import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import styles from './DeleteAccountModal.module.css'

const CONFIRM_PHRASE = 'DELETE'

export default function DeleteAccountModal({ userEmail, onClose, onConfirm }) {
  const [password, setPassword] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = password.length > 0 && confirmText === CONFIRM_PHRASE

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password) {
      setError('Please enter your password to confirm.')
      return
    }
    if (confirmText !== CONFIRM_PHRASE) {
      setError(`Please type ${CONFIRM_PHRASE} to confirm.`)
      return
    }

    setLoading(true)
    try {
      await onConfirm(password)
      // onConfirm handles logging out + redirecting — no need to close manually
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not delete account. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleWrap}>
            <AlertTriangle size={20} className={styles.warnIcon} />
            <h2 className={styles.title}>Delete your account</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <p className={styles.body}>
          This will permanently delete <strong>{userEmail}</strong> and all associated
          transactions, budgets, and savings goals. <strong>This cannot be undone.</strong>
        </p>

        <form onSubmit={handleSubmit}>
          {error && <div className={styles.errorBanner}>{error}</div>}

          <label className={styles.label} htmlFor="password">Confirm your password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (error) setError('') }}
            className={styles.input}
            autoFocus
            autoComplete="current-password"
          />

          <label className={styles.label} htmlFor="confirmText">
            Type <strong>{CONFIRM_PHRASE}</strong> to confirm
          </label>
          <input
            id="confirmText"
            type="text"
            value={confirmText}
            onChange={(e) => { setConfirmText(e.target.value); if (error) setError('') }}
            className={styles.input}
            placeholder={CONFIRM_PHRASE}
          />

          <div className={styles.buttonRow}>
            <button type="button" className={styles.btnGhost} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.btnDanger} disabled={!canSubmit || loading}>
              {loading ? <span className={styles.spinner} /> : 'Permanently delete account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}