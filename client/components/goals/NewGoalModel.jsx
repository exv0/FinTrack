'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import styles from './GoalModal.module.css'

export default function NewGoalModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', targetAmount: '', deadline: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Goal name is required.'); return }
    if (!form.targetAmount || Number(form.targetAmount) <= 0) {
      setError('Target amount must be greater than zero.')
      return
    }

    setLoading(true)
    try {
      await onCreate({
        name: form.name.trim(),
        targetAmount: Number(form.targetAmount),
        deadline: form.deadline || undefined,
      })
      onClose()
    } catch {
      setError('Could not create goal. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Create new goal</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className={styles.errorBanner}>{error}</div>}

          <label className={styles.label} htmlFor="goalName">Goal name</label>
          <input
            id="goalName"
            type="text"
            placeholder="e.g. Trip to Pokhara"
            value={form.name}
            onChange={handleChange('name')}
            className={styles.input}
            autoFocus
          />

          <label className={styles.label} htmlFor="targetAmount">Target amount (NPR)</label>
          <input
            id="targetAmount"
            type="number"
            min="1"
            placeholder="e.g. 20000"
            value={form.targetAmount}
            onChange={handleChange('targetAmount')}
            className={styles.input}
          />

          <label className={styles.label} htmlFor="deadline">Target date (optional)</label>
          <input
            id="deadline"
            type="date"
            value={form.deadline}
            onChange={handleChange('deadline')}
            className={styles.input}
          />

          <div className={styles.buttonRow}>
            <button type="button" className={styles.btnGhost} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : 'Create goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}