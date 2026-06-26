'use client'

import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { useLocale } from '@/context/LocaleContext'
import styles from './GoalCard.module.css'

const MILESTONES = [25, 50, 75, 100]

function estimateCompletion(targetAmount, savedAmount, deadline) {
  if (savedAmount <= 0 || !deadline) return null
  const remaining = targetAmount - savedAmount
  if (remaining <= 0) return 'Goal reached! 🎉'

  const now = new Date()
  const end = new Date(deadline)
  const weeksLeft = Math.max(Math.ceil((end - now) / (1000 * 60 * 60 * 24 * 7)), 1)
  return end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function suggestedWeeklySaving(targetAmount, savedAmount, deadline) {
  if (!deadline) return null
  const remaining = targetAmount - savedAmount
  if (remaining <= 0) return 0

  const now = new Date()
  const end = new Date(deadline)
  const weeksLeft = Math.max(Math.ceil((end - now) / (1000 * 60 * 60 * 24 * 7)), 1)
  return Math.ceil(remaining / weeksLeft)
}

export default function GoalCard({ goal, onAddFunds, onEdit }) {
  const { money } = useLocale()
  const { name, targetAmount, savedAmount, deadline, streakWeeks, photo, completed } = goal
  const pct = Math.min(Math.round((savedAmount / targetAmount) * 100), 100)
  const weeklySuggestion = suggestedWeeklySaving(targetAmount, savedAmount, deadline)
  const estCompletion = estimateCompletion(targetAmount, savedAmount, deadline)

  return (
    <div className={styles.card}>
      {/* Photo area */}
      <div className={styles.photoArea} style={photo ? { backgroundImage: `url(${photo})` } : {}}>
        {!photo && <span className={styles.photoPlaceholder}>📷</span>}
        {completed && <span className={styles.completedBadge}>✓ Completed</span>}
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{name}</h3>
        <span className={styles.targetLine}>
          Target: {money(targetAmount)}
          {deadline && ` · Due ${new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
        </span>

        {/* Progress bar with milestone ticks */}
        <div className={styles.progressWrap}>
          <div className={styles.milestoneTicks}>
            {MILESTONES.map(m => (
              <span
                key={m}
                className={styles.tick}
                style={{ left: `${m}%` }}
              />
            ))}
          </div>
          <div className={styles.track}>
            <div className={styles.fill} style={{ width: `${pct}%` }} />
          </div>
          <div className={styles.milestoneLabels}>
            {MILESTONES.map(m => (
              <span key={m} className={`${styles.milestoneLabel} ${pct >= m ? styles.milestoneReached : ''}`}>
                {m}%{pct >= m ? ' ✓' : ''}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.savedLine}>
          <span className={styles.savedAmount}>{money(savedAmount)}</span>
          <span className={styles.savedPct}>{pct}% saved</span>
        </div>

        {streakWeeks > 0 && (
          <span className={styles.streakPill}>🔥 {streakWeeks}-week streak</span>
        )}

        {weeklySuggestion > 0 && !completed && (
          <div className={styles.suggestionCard}>
            💡 Save {money(weeklySuggestion)}/week to hit goal
          </div>
        )}

        {estCompletion && !completed && (
          <span className={styles.estLine}>Est. done: {estCompletion}</span>
        )}

        <div className={styles.actions}>
          <button className={styles.btnGhost} onClick={() => onEdit?.(goal)}>
            <Pencil size={13} /> Edit
          </button>
          <button className={styles.btnPrimary} onClick={() => onAddFunds?.(goal)} disabled={completed}>
            <Plus size={13} /> Add funds
          </button>
        </div>
      </div>
    </div>
  )
}