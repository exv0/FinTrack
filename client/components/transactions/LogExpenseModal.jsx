'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { budgetsApi } from '@/lib/api'
import BudgetAlertModal from './BudgetAlertModal'
import styles from './LogExpenseModal.module.css'

const CATEGORIES = [
  'Food & Dining', 'Transport', 'Bills & Utilities', 'Entertainment',
  'Education', 'Health', 'Shopping', 'Salary', 'Other',
]

// Only warn once a category would cross this threshold after the new transaction
const WARNING_THRESHOLD = 90

export default function LogExpenseModal({ onClose, onCreate, defaultType = 'expense' }) {
  const [form, setForm] = useState({
    type: defaultType, amount: '', category: defaultType === 'income' ? 'Salary' : 'Food & Dining', merchant: '', note: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pendingAlert, setPendingAlert] = useState(null) // { category, amount, currentSpend, limit }

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    if (error) setError('')
  }

  const submitTransaction = async (payload) => {
    setLoading(true)
    try {
      await onCreate(payload)
      onClose()
    } catch {
      setError('Could not log this transaction. Please try again.')
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const amountNum = Number(form.amount)
    if (!amountNum || amountNum <= 0) {
      setError('Amount must be greater than zero.')
      return
    }

    const payload = {
      type: form.type,
      amount: amountNum,
      category: form.category,
      merchant: form.merchant.trim(),
      note: form.note.trim(),
    }

    // Only check budget thresholds for expenses, not income
    if (form.type === 'expense') {
      try {
        const now = new Date()
        const { data: budgets } = await budgetsApi.withSpend({
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        })
        const matching = budgets.find(b => b.category === form.category)

        if (matching) {
          const resultingPct = Math.round(((matching.spent + amountNum) / matching.limit) * 100)
          if (resultingPct >= WARNING_THRESHOLD) {
            setPendingAlert({
              category: form.category,
              amount: amountNum,
              currentSpend: matching.spent,
              limit: matching.limit,
              payload,
            })
            return // wait for user confirmation in the alert modal
          }
        }
      } catch {
        // If the budget check fails, don't block logging — fail open
      }
    }

    submitTransaction(payload)
  }

  const handleConfirmOverLimit = () => {
    submitTransaction(pendingAlert.payload)
    setPendingAlert(null)
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <h2 className={styles.title}>Log a transaction</h2>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className={styles.errorBanner}>{error}</div>}

            <div className={styles.typeToggle}>
              <button
                type="button"
                className={`${styles.typeBtn} ${form.type === 'expense' ? styles.typeActive : ''}`}
                onClick={() => setForm(f => ({ ...f, type: 'expense' }))}
              >
                Expense
              </button>
              <button
                type="button"
                className={`${styles.typeBtn} ${form.type === 'income' ? styles.typeActiveIncome : ''}`}
                onClick={() => setForm(f => ({ ...f, type: 'income' }))}
              >
                Income
              </button>
            </div>

            <label className={styles.label} htmlFor="amount">Amount (NPR)</label>
            <input
              id="amount" type="number" min="1" placeholder="e.g. 500"
              value={form.amount} onChange={handleChange('amount')}
              className={styles.input} autoFocus
            />

            <label className={styles.label} htmlFor="category">Category</label>
            <select
              id="category" value={form.category} onChange={handleChange('category')}
              className={styles.select}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <label className={styles.label} htmlFor="merchant">Merchant / source (optional)</label>
            <input
              id="merchant" type="text" placeholder="e.g. Himalayan Java"
              value={form.merchant} onChange={handleChange('merchant')}
              className={styles.input}
            />

            <div className={styles.buttonRow}>
              <button type="button" className={styles.btnGhost} onClick={onClose}>Cancel</button>
              <button type="submit" className={styles.btnPrimary} disabled={loading}>
                {loading ? <span className={styles.spinner} /> : 'Log transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {pendingAlert && (
        <BudgetAlertModal
          category={pendingAlert.category}
          amount={pendingAlert.amount}
          currentSpend={pendingAlert.currentSpend}
          limit={pendingAlert.limit}
          loading={loading}
          onCancel={() => setPendingAlert(null)}
          onConfirm={handleConfirmOverLimit}
        />
      )}
    </>
  )
}