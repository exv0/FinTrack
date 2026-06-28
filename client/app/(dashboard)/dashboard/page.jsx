'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLocale } from '@/context/LocaleContext'
import { transactionsApi, budgetsApi } from '@/lib/api'
import BudgetBar from '@/components/dashboard/BudgetBar'
import StatCard from '@/components/dashboard/StatCard'
import CategoryRow from '@/components/dashboard/CategoryRow'
import TransactionRow from '@/components/dashboard/TransactionRow'
import styles from './dashboard.module.css'

// Emoji fallback for categories without a custom icon yet
const CATEGORY_EMOJI = {
  'Food & Dining': '🍴',
  'Transport': '🚗',
  'Bills & Utilities': '⚡',
  'Entertainment': '🎉',
  'Education': '📚',
  'Health': '🏥',
  'Shopping': '🛍',
  'Salary': '💼',
}

function daysRemainingInMonth() {
  const now = new Date()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return lastDay - now.getDate()
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { money } = useLocale()
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const now = new Date()
        const month = now.getMonth() + 1
        const year  = now.getFullYear()

        const [txnRes, budgetRes] = await Promise.all([
          transactionsApi.list({ month, year }),
          budgetsApi.withSpend({ month, year }),
        ])

        setTransactions(txnRes.data)
        setBudgets(budgetRes.data)
      } catch (err) {
        setError('Could not load dashboard data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    load()

    // Refresh dashboard data whenever a new transaction is logged from the Topbar
    window.addEventListener('fintrack:transaction-logged', load)
    return () => window.removeEventListener('fintrack:transaction-logged', load)
  }, [])

  const { income, totalSpent, budgetUsedPct, safeToSpendToday } = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0) || user?.monthlyIncome || 0

    const totalSpent = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const budgetUsedPct = income > 0 ? Math.round((totalSpent / income) * 100) : 0
    const remainingDays = daysRemainingInMonth() || 1
    const safeToSpendToday = Math.max(Math.round((income - totalSpent) / remainingDays), 0)

    return { income, totalSpent, budgetUsedPct, safeToSpendToday }
  }, [transactions, user])

  const recentTransactions = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3),
    [transactions]
  )

  const topCategory = useMemo(() => {
    return [...budgets].sort((a, b) => b.percentUsed - a.percentUsed)[0]
  }, [budgets])

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <span className={styles.loadingText}>Loading your dashboard…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorWrap}>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <>
      <BudgetBar percentUsed={budgetUsedPct} daysRemaining={daysRemainingInMonth()} />

      <div className={`${styles.wrap} fade-up`}>
        {/* Row 1 — 4 stat cards */}
        <div className={styles.statRow}>
          <StatCard
            label="Monthly income"
            value={money(income)}
            subLabel="This month"
          />
          <StatCard
            label="Total spent"
            value={money(totalSpent)}
            subLabel="This month"
          />
          <StatCard
            label="Budget used"
            value={`${budgetUsedPct}%`}
            progress={budgetUsedPct}
            progressColor={budgetUsedPct >= 90 ? 'var(--danger)' : budgetUsedPct >= 60 ? 'var(--warning)' : 'var(--success)'}
          />
          <StatCard
            dark
            label="Safe to spend today"
            value={money(safeToSpendToday)}
            subLabel={`${daysRemainingInMonth()} days remaining`}
          />
        </div>

        {/* Row 2 — 2 columns */}
        <div className={styles.row2}>
          {/* Left — category breakdown */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Budget by category</h2>
              <button className={styles.ghostBtn} onClick={() => router.push('/spending')}>View all</button>
            </div>
            <div>
              {budgets.length === 0 ? (
                <p className={styles.emptyText}>No budgets set yet. Add one to start tracking.</p>
              ) : (
                budgets.map(b => (
                  <CategoryRow
                    key={b._id}
                    emoji={CATEGORY_EMOJI[b.category] || '💰'}
                    name={b.category}
                    spent={b.spent}
                    limit={b.limit}
                    danger={b.percentUsed >= 90}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right column */}
          <div className={styles.rightCol}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Recent transactions</h2>
                <button className={styles.ghostBtn} onClick={() => router.push('/transactions')}>See all</button>
              </div>
              <div>
                {recentTransactions.length === 0 ? (
                  <p className={styles.emptyText}>No transactions logged yet.</p>
                ) : (
                  recentTransactions.map(t => (
                    <TransactionRow
                      key={t._id}
                      emoji={CATEGORY_EMOJI[t.category] || '💰'}
                      name={t.merchant || t.category}
                      category={t.category}
                      amount={t.amount}
                      isIncome={t.type === 'income'}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Insight alert — only show if a category is close to its limit */}
            {topCategory && topCategory.percentUsed >= 80 && (
              <div className={styles.insightCard}>
                <span className={styles.insightTitle}>
                  ⚠️ {topCategory.category} at {topCategory.percentUsed}% — heads up!
                </span>
                <p className={styles.insightBody}>
                  You&apos;re close to your {topCategory.category} limit this month.
                  Consider reviewing upcoming spending before it pushes you over budget.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}