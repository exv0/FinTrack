'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import StepProgress from '@/components/onboarding/StepProgress'
import styles from './categories.module.css'

const CATEGORIES = [
  { id: 'food',          label: 'Food & Dining',     emoji: '🍴' },
  { id: 'transport',     label: 'Transport',         emoji: '🚗' },
  { id: 'bills',         label: 'Bills & Utilities', emoji: '⚡' },
  { id: 'entertainment', label: 'Entertainment',     emoji: '🎉' },
  { id: 'education',     label: 'Education',         emoji: '📚' },
  { id: 'health',        label: 'Health',            emoji: '🏥' },
  { id: 'shopping',      label: 'Shopping',          emoji: '🛍' },
  { id: 'custom',        label: 'Custom',            emoji: '➕', isCustom: true },
]

export default function OnboardingCategoriesPage() {
  const router = useRouter()
  const { updateUser } = useAuth()
  const [selected, setSelected] = useState([])

  const toggle = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const handleNext = () => {
    updateUser({ selectedCategories: selected })
    router.push('/onboarding/ready')
  }

  const handleBack = () => router.push('/onboarding/income')

  return (
    <div className={styles.card}>
      <StepProgress step={2} total={3} />
      <span className={styles.stepLabel}>Step 2 of 3 — Customise your budget</span>

      <h1 className={styles.title}>Which categories do you spend on?</h1>
      <p className={styles.body}>
        Select all that apply. You can adjust limits at any time.
      </p>

      {/* Category grid */}
      <div className={styles.grid}>
        {CATEGORIES.map(({ id, label, emoji, isCustom }) => {
          const isSelected = selected.includes(id)
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className={`${styles.tile} ${isSelected ? styles.tileSelected : ''} ${isCustom ? styles.tileCustom : ''}`}
            >
              <span className={styles.tileEmoji}>{emoji}</span>
              <span className={styles.tileLabel}>{label}</span>
              <span className={`${styles.checkDot} ${isSelected ? styles.checkDotFilled : ''}`}>
                {isSelected && (
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3.5 3.5L13 5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
            </button>
          )
        })}
      </div>

      <span className={styles.counter}>{selected.length} selected</span>

      {/* Buttons */}
      <div className={styles.buttonRow}>
        <button type="button" className={styles.btnGhost} onClick={handleBack}>
          ← Back
        </button>
        <button type="button" className={styles.btnPrimary} onClick={handleNext}>
          Next: Set limits →
        </button>
      </div>
    </div>
  )
}