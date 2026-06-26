'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Download } from 'lucide-react'
import { transactionsApi, budgetsApi } from '@/lib/api'
import DonutChart from '@/components/spending/DonutChart'
import CategoryRankCard from '@/components/spending/CategoryRankCard'
import styles from './spending.module.css'

const PERIODS = ['This month', 'Last month', '3 months']

const CATEGORY_COLORS = {
  'Food & Dining':      '#4F46E5',
  'Transport':          '#16A34A',
  'Bills & Utilities':  '#D97706',
  'Shopping':           '#DC2626',
  'Entertainment':      '#9333EA',
  'Education':          '#0EA5E9',
  'Health':             '#EC4899',
}
const CATEGORY_EMOJI = {
  'Food & Dining': '🍴',
  'Transport': '🚗',
  'Bills & Utilities': '⚡',
  'Shopping': '🛍',
  'Entertainment': '🎉',
  'Education': '📚',
  'Health': '🏥',
}

function getMonthYearForPeriod(period) {
  const now = new Date()
  if (period === 'Last month') {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return { month: d.getMonth() + 1, year: d.getFullYear() }
  }
  // 'This month' and '3 months' both anchor on current month;
  // 3-month aggregation handled separately if needed later
  return { month: now.getMonth() + 1, year: now.getFullYear() }
}

export default function SpendingPage() {
  const [period, setPeriod] = useState('This month')
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [comparison, setComparison] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const { month, year } = getMonthYearForPeriod(period)
        const [txnRes, budgetRes, comparisonRes] = await Promise.all([
          transactionsApi.list({ type: 'expense', month, year }),
          budgetsApi.withSpend({ month, year }),
          transactionsApi.categoryComparison({ month, year }),
        ])
        setTransactions(txnRes.data)
        setBudgets(budgetRes.data)
        setComparison(comparisonRes.data)
      } catch {
        setError('Could not load spending data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [period])

  // Group expenses by category for the donut chart
  const donutData = useMemo(() => {
    const totals = {}
    transactions.forEach(t => {
      totals[t.category] = (totals[t.category] || 0) + t.amount
    })
    const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0) || 1
    return Object.entries(totals)
      .map(([name, value]) => ({
        name,
        value,
        pct: Math.round((value / grandTotal) * 100),
        color: CATEGORY_COLORS[name] || '#9CA3AF',
      }))
      .sort((a, b) => b.value - a.value)
  }, [transactions])

  const donutTotal = donutData.reduce((sum, d) => sum + d.value, 0)

  // Ranked categories — merge budget limits, real MoM comparison, and actual
  // transactions (for the expand-on-tap list) into one structure per category.
  const rankedCategories = useMemo(() => {
    return donutData.map((d, i) => {
      const budget = budgets.find(b => b.category === d.name)
      const comparisonEntry = comparison.find(c => c.category === d.name)
      const categoryTxns = transactions
        .filter(t => t.category === d.name)
        .map(t => ({ name: t.merchant || t.category, amount: t.amount }))

      return {
        rank: i + 1,
        emoji: CATEGORY_EMOJI[d.name] || '💰',
        name: d.name,
        spent: d.value,
        limit: budget?.limit || d.value,
        changePct: comparisonEntry?.changePct ?? null,
        unusual: budget ? budget.percentUsed >= 90 : false,
        transactions: categoryTxns,
      }
    })
  }, [donutData, budgets, comparison, transactions])

  const topCategory = donutData[0]

  return (
    <div className="fade-up">
      {/* Top bar row */}
      <div className={styles.topRow}>
        <div className={styles.pillGroup}>
          {PERIODS.map(p => (
            <button
              key={p}
              className={`${styles.pill} ${period === p ? styles.pillActive : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <button className={styles.exportBtn}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {loading ? (
        <p className={styles.loadingText}>Loading spending data…</p>
      ) : error ? (
        <p className={styles.errorText}>{error}</p>
      ) : transactions.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No expenses logged for this period yet.</p>
        </div>
      ) : (
        <div className={styles.layout}>
          {/* Left column */}
          <div className={styles.leftCol}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Spending overview</h2>
              <DonutChart data={donutData} total={donutTotal} />
            </div>

            {topCategory && (
              <div className={styles.narrativeCard}>
                <span className={styles.narrativeLabel}>📖 Your money went to…</span>
                <p className={styles.narrativeText}>
                  This period you spent mostly on <strong>{topCategory.name} ({topCategory.pct}%)</strong>.
                </p>
                <button className={styles.narrativeLink}>Read full summary →</button>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className={styles.rightCol}>
            <div className={styles.rightHeader}>
              <h2 className={styles.cardTitle}>Category ranking (highest → lowest)</h2>
              <button className={styles.addBtn}>
                <Plus size={14} /> Add category
              </button>
            </div>

            {rankedCategories.map(cat => (
              <CategoryRankCard key={cat.rank} {...cat} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}