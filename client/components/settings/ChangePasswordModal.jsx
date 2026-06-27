'use client'

import { useState } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import styles from './AccountModal.module.css'

function getStrength(pw) {
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}
const STRENGTH_LABEL = ['', 'Too weak', 'Could be stronger', 'Almost there', 'Strong password ✓']
const STRENGTH_COLOR = ['', 'var(--danger)', 'var(--warning)', '#FBBF24', 'var(--success)']

export default function ChangePasswordModal({ onClose, onSave }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const strength = getStrength(form.newPassword)

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.currentPassword) {
      setError('Please enter your current password.')
      return
    }
    if (form.newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords don't match.")
      return
    }

    setLoading(true)
    try {
      await onSave({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      setSuccess(true)
      setTimeout(onClose, 1400)
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not change password. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Change password</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}>✓</div>
            <p className={styles.successText}>Password updated successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className={styles.errorBanner}>{error}</div>}

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="currentPassword">Current password</label>
              <div className={styles.inputWrap}>
                <input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  value={form.currentPassword}
                  onChange={handleChange('currentPassword')}
                  className={styles.inputPadRight}
                  autoFocus
                  autoComplete="current-password"
                />
                <button type="button" className={styles.pwToggle} onClick={() => setShowCurrent(v => !v)} aria-label="Toggle visibility">
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="newPassword">New password</label>
              <div className={styles.inputWrap}>
                <input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  value={form.newPassword}
                  onChange={handleChange('newPassword')}
                  className={styles.inputPadRight}
                  autoComplete="new-password"
                />
                <button type="button" className={styles.pwToggle} onClick={() => setShowNew(v => !v)} aria-label="Toggle visibility">
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.newPassword && (
                <div className={styles.strengthWrap}>
                  <div className={styles.strengthBar}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={styles.strengthSeg} style={{ background: i <= strength ? STRENGTH_COLOR[strength] : 'var(--border)' }} />
                    ))}
                  </div>
                  <span className={styles.strengthLabel} style={{ color: STRENGTH_COLOR[strength] }}>
                    {STRENGTH_LABEL[strength]}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="confirmPassword">Confirm new password</label>
              <input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange('confirmPassword')}
                className={styles.input}
                autoComplete="new-password"
              />
            </div>

            <div className={styles.buttonRow}>
              <button type="button" className={styles.btnGhost} onClick={onClose}>Cancel</button>
              <button type="submit" className={styles.btnPrimary} disabled={loading}>
                {loading ? <span className={styles.spinner} /> : 'Update password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}